import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, SupabaseClient } from "jsr:@supabase/supabase-js@2";

// Mirrors the latest Instagram and Facebook posts into social_posts. Run
// hourly by pg_cron and on demand from Admin -> Social Feed; never called
// by the public site, so the Graph API never affects page loads.
//
// Each post's image (a video's thumbnail for Reels) is copied into the
// public site-images bucket: Meta's CDN links expire after a few days and
// often refuse to load on other sites. Posts removed from the account are
// removed here too, so the website mirrors what's actually published.

const BUCKET = "site-images";
const LIMIT = 12;

type Row = {
  platform: "instagram" | "facebook";
  post_id: string;
  caption: string | null;
  media_url: string | null;
  permalink: string;
  media_type: string | null;
  posted_at: string | null;
};

async function storeImage(supabase: SupabaseClient, platform: string, postId: string, sourceUrl: string): Promise<string | null> {
  const res = await fetch(sourceUrl);
  if (!res.ok) return null;
  const contentType = res.headers.get("content-type") || "image/jpeg";
  if (!contentType.startsWith("image/")) return null;
  const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
  const path = `social/${platform}/${postId}.${ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, new Uint8Array(await res.arrayBuffer()), { contentType, upsert: true, cacheControl: "604800" });
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

async function mirror(supabase: SupabaseClient, platform: "instagram" | "facebook", rows: (Row & { image_source: string | null })[]) {
  const { data: existing } = await supabase.from("social_posts").select("post_id, image_url").eq("platform", platform);
  const stored = new Map((existing || []).map((e: { post_id: string; image_url: string | null }) => [e.post_id, e.image_url]));

  const upserts = [];
  for (const { image_source, ...row } of rows) {
    let image_url = stored.get(row.post_id) || null;
    if (!image_url && image_source) {
      try {
        image_url = await storeImage(supabase, platform, row.post_id, image_source);
      } catch (err) {
        console.error(`Could not store ${platform} image ${row.post_id}:`, err);
      }
    }
    upserts.push({ ...row, image_url, cached_at: new Date().toISOString() });
  }

  if (upserts.length > 0) {
    const { error } = await supabase.from("social_posts").upsert(upserts, { onConflict: "platform,post_id" });
    if (error) throw error;

    const keep = new Set(upserts.map((u) => u.post_id));
    const removed = (existing || []).filter((e: { post_id: string }) => !keep.has(e.post_id));
    if (removed.length > 0) {
      await supabase.from("social_posts").delete().eq("platform", platform).in("post_id", removed.map((r: { post_id: string }) => r.post_id));
      const paths = removed
        .map((r: { image_url: string | null }) => r.image_url?.split(`/${BUCKET}/`)[1])
        .filter((p: string | undefined): p is string => !!p);
      if (paths.length > 0) await supabase.storage.from(BUCKET).remove(paths);
    }
  }
  return upserts.length;
}

Deno.serve(async (_req: Request) => {
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { data: config, error: configErr } = await supabase.from("social_config").select("*").eq("id", "default").single();
  if (configErr || !config) {
    return new Response(JSON.stringify({ error: "Could not load social_config" }), { status: 500 });
  }

  const results: Record<string, { ok: boolean; count?: number; error?: string }> = {};

  // ---- Instagram (Instagram API with Instagram Login) ----
  if (config.instagram_access_token) {
    try {
      const account = config.instagram_account_id || "me";
      const url =
        `https://graph.instagram.com/v21.0/${encodeURIComponent(account)}/media` +
        `?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=${LIMIT}` +
        `&access_token=${encodeURIComponent(config.instagram_access_token)}`;
      const json = await (await fetch(url)).json();
      if (json.error) throw new Error(json.error.message || "Instagram API error");

      const rows = (json.data || []).map((p: any) => ({
        platform: "instagram" as const,
        post_id: p.id,
        caption: p.caption || null,
        media_url: p.media_url || null,
        permalink: p.permalink,
        media_type: p.media_type || null,
        posted_at: p.timestamp || null,
        image_source: p.media_type === "VIDEO" ? p.thumbnail_url || null : p.media_url || null
      }));
      results.instagram = { ok: true, count: await mirror(supabase, "instagram", rows) };
    } catch (err) {
      results.instagram = { ok: false, error: String(err instanceof Error ? err.message : err) };
    }
  } else {
    results.instagram = { ok: false, error: "Not configured" };
  }

  // ---- Facebook (Page) ----
  if (config.facebook_access_token && config.facebook_page_id) {
    try {
      const url =
        `https://graph.facebook.com/v21.0/${encodeURIComponent(config.facebook_page_id)}/posts` +
        `?fields=id,message,full_picture,permalink_url,created_time&limit=${LIMIT}` +
        `&access_token=${encodeURIComponent(config.facebook_access_token)}`;
      const json = await (await fetch(url)).json();
      if (json.error) throw new Error(json.error.message || "Facebook API error");

      const rows = (json.data || []).map((p: any) => ({
        platform: "facebook" as const,
        post_id: p.id,
        caption: p.message || null,
        media_url: p.full_picture || null,
        permalink: p.permalink_url,
        media_type: p.full_picture ? "IMAGE" : "TEXT",
        posted_at: p.created_time || null,
        image_source: p.full_picture || null
      }));
      results.facebook = { ok: true, count: await mirror(supabase, "facebook", rows) };
    } catch (err) {
      results.facebook = { ok: false, error: String(err instanceof Error ? err.message : err) };
    }
  } else {
    results.facebook = { ok: false, error: "Not configured" };
  }

  const anyError = Object.values(results).find((r) => !r.ok && r.error !== "Not configured");
  const bothUnconfigured = results.instagram.error === "Not configured" && results.facebook.error === "Not configured";

  await supabase
    .from("social_config")
    .update({
      last_synced_at: new Date().toISOString(),
      last_sync_error: bothUnconfigured ? "Not configured yet" : anyError ? JSON.stringify(results) : null
    })
    .eq("id", "default");

  return new Response(JSON.stringify({ results }), { status: 200, headers: { "Content-Type": "application/json" } });
});
