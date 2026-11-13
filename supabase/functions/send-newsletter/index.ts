import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Sends an announcement email to the subscriber list for three kinds of
// content: a new project, a new event, or an admin-authored PDF newsletter
// issue (kind: 'pdf', recordId -> newsletter_issues.id). Requires the
// RESEND_API_KEY secret -- no-ops with a clear error until it's set.
// Idempotent per (kind, recordId) via the newsletter_sends unique
// constraint, so a retry/double-call never double-sends.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const SITE_URL = "https://www.rcfsunset.org";
const REPLY_TO = "rcfspublicimage@gmail.com";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const button = (href: string, label: string) =>
  `<a href="${esc(href)}" style="display:inline-block;background:#17458F;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:bold">${esc(label)}</a>`;

const footer = `
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0 16px" />
  <p style="font-size:12px;color:#64748b;line-height:1.6">
    Rotary Club of Freetown-Sunset &middot; <a href="${SITE_URL}/newsletter" style="color:#17458F">All newsletter issues</a><br />
    You are receiving this as a member or subscriber of the club. To unsubscribe, simply reply to this email or write to ${REPLY_TO}.
  </p>`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing Authorization header" }, 401);
    const callerClient = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: authHeader } } });
    const { data: userData } = await callerClient.auth.getUser();
    if (!userData?.user) return json({ error: "Invalid session" }, 401);

    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const { data: adminRow } = await adminClient.from("admins").select("role").eq("user_id", userData.user.id).maybeSingle();
    if (!adminRow) return json({ error: "Forbidden: officer access required" }, 403);

    const body = await req.json().catch(() => ({}));
    const kind = body.kind;
    const recordId = String(body.recordId || "");
    if (kind !== "project" && kind !== "event" && kind !== "pdf") {
      return json({ error: "kind must be 'project', 'event', or 'pdf'" }, 400);
    }
    if (!recordId) return json({ error: "recordId is required" }, 400);

    const table = kind === "project" ? "projects" : kind === "event" ? "events" : "newsletter_issues";
    const { data: record } = await adminClient.from(table).select("*").eq("id", recordId).maybeSingle();
    if (!record) return json({ error: "Record not found" }, 404);

    if (!RESEND_API_KEY) {
      return json({ error: "Newsletter sending is not configured yet (no email provider key set)." }, 503);
    }

    const { data: subs } = await adminClient.from("newsletter_subscribers").select("email");
    const { data: members } = await adminClient.from("profiles").select("email").in("membership_status", ["approved", "guest"]);
    const emails = Array.from(
      new Set(
        [...(subs || []).map((s: any) => s.email), ...(members || []).map((m: any) => m.email)]
          .filter(Boolean)
          .map((e: string) => e.trim().toLowerCase())
      )
    );

    if (emails.length === 0) {
      await adminClient.from("newsletter_sends").upsert({ kind, record_id: recordId, recipient_count: 0, status: "sent" });
      return json({ success: true, recipientCount: 0 });
    }

    let subject: string;
    let html: string;

    if (kind === "pdf") {
      const title = String(record.title || "").trim();
      subject = `Newsletter: ${title}`;
      const introHtml = record.message
        ? `<p style="color:#334155;line-height:1.6;white-space:pre-wrap">${esc(String(record.message).trim())}</p>`
        : "";
      html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#0F1E4D">
          <p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#C8901A;font-weight:bold;margin:0 0 8px">Rotary Club of Freetown-Sunset Newsletter</p>
          <h2 style="color:#0F1E4D;margin:0 0 12px">${esc(title)}</h2>
          ${introHtml}
          <p style="margin:20px 0">${button(record.pdf_url, "Read the newsletter (PDF)")}</p>
          <p style="color:#334155">Past issues are on our website: <a href="${SITE_URL}/newsletter" style="color:#17458F">rcfsunset.org/newsletter</a></p>
          ${footer}
        </div>`;
    } else {
      const title = kind === "project" ? record.title : record.title || record.name;
      const description = record.description || "";
      subject = kind === "project" ? `New Project: ${title}` : `New Event: ${title}`;
      html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#0F1E4D">
          <h2 style="color:#0F1E4D">${esc(subject)}</h2>
          <p style="color:#334155;line-height:1.6">${esc(description)}</p>
          <p>${button(SITE_URL, "View on our website")}</p>
          ${footer}
        </div>`;
    }

    // Resend's batch endpoint takes at most 100 emails per call.
    for (let i = 0; i < emails.length; i += 100) {
      const resp = await fetch("https://api.resend.com/emails/batch", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify(
          emails.slice(i, i + 100).map((to) => ({ from: "Rotary Club of Freetown-Sunset <updates@rcfsunset.org>", reply_to: REPLY_TO, to, subject, html }))
        )
      });
      if (!resp.ok) {
        const errText = await resp.text();
        await adminClient.from("newsletter_sends").upsert({ kind, record_id: recordId, recipient_count: i, status: "failed", error: errText.slice(0, 500) });
        return json({ error: "Failed to send newsletter" }, 502);
      }
    }

    await adminClient.from("newsletter_sends").upsert({ kind, record_id: recordId, recipient_count: emails.length, status: "sent" });
    return json({ success: true, recipientCount: emails.length });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Unexpected error" }, 500);
  }
});
