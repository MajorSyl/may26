import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { json, preflight } from "../_shared/cors.ts";
import { isCronOrOfficer } from "../_shared/auth.ts";

// Refreshes the long-lived Instagram + Facebook tokens before they expire
// (~60 days). Run daily by pg_cron -- refreshing daily against a 60-day
// token is deliberately overkill margin, so a single missed run is never a
// problem. Instagram's refresh endpoint requires the current token to be at
// least 24h old, which is always true on a daily schedule. Facebook Page
// tokens minted from a long-lived User token conventionally don't expire,
// but the fb_exchange_token call is a safe extension attempt either way,
// and its result (or lack of an expiry) is recorded in social_config.
//
// Callers must be the scheduled job (Vault secret) or a signed-in officer
// who manages the social feed; anything else gets 401.
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return preflight(req);
  if (req.method !== "POST") return json(req, { error: "Method not allowed" }, 405);

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  if (!(await isCronOrOfficer(req, supabase, ["admin", "president", "secretary", "media"]))) {
    return json(req, { error: "Unauthorized" }, 401);
  }

  const { data: config, error: configErr } = await supabase.from("social_config").select("*").eq("id", "default").single();
  if (configErr || !config) return json(req, { error: "Could not load social_config" }, 500);

  const update: Record<string, unknown> = { last_refresh_attempt_at: new Date().toISOString() };
  const errors: string[] = [];

  // ---- Instagram: GET graph.instagram.com/refresh_access_token ----
  if (config.instagram_access_token) {
    try {
      const url = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(config.instagram_access_token)}`;
      const res = await fetch(url);
      const body = await res.json();
      if (body.error) throw new Error(body.error.message || "Instagram refresh error");
      if (!body.access_token) throw new Error("Instagram refresh did not return a token");
      update.instagram_access_token = body.access_token;
      update.instagram_token_expires_at = new Date(Date.now() + (body.expires_in || 5184000) * 1000).toISOString();
    } catch (err) {
      errors.push(`instagram: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // ---- Facebook: exchange for a fresh long-lived token ----
  if (config.facebook_access_token && config.meta_app_id && config.meta_app_secret) {
    try {
      const url =
        `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token` +
        `&client_id=${encodeURIComponent(config.meta_app_id)}&client_secret=${encodeURIComponent(config.meta_app_secret)}` +
        `&fb_exchange_token=${encodeURIComponent(config.facebook_access_token)}`;
      const res = await fetch(url);
      const body = await res.json();
      if (body.error) throw new Error(body.error.message || "Facebook refresh error");
      if (!body.access_token) throw new Error("Facebook refresh did not return a token");
      update.facebook_access_token = body.access_token;
      // Facebook omits expires_in for a token that doesn't expire -- record
      // that honestly instead of guessing an expiry.
      update.facebook_token_expires_at = body.expires_in ? new Date(Date.now() + body.expires_in * 1000).toISOString() : null;
    } catch (err) {
      errors.push(`facebook: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  update.last_refresh_error = errors.length > 0 ? errors.join("; ") : null;
  await supabase.from("social_config").update(update).eq("id", "default");

  return json(req, { success: errors.length === 0, errors });
});
