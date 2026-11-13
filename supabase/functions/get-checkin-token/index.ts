import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { json as jsonFor, preflight } from "../_shared/cors.ts";

// Officer-only: mints a short-lived random check-in code for an event and
// stores it server-side (checkin_tokens has no client-reachable RLS policy
// at all -- only this function and attendance-check-in touch it via the
// service role). The officer's screen re-calls this roughly every 30-45s
// to rotate the code shown on the projector/QR.
const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no ambiguous 0/O/1/I/L
function randomCode(len = 8): string {
  let out = "";
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  for (let i = 0; i < len; i++) out += CODE_CHARS[bytes[i] % CODE_CHARS.length];
  return out;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return preflight(req);
  const json = (body: unknown, status = 200) => jsonFor(req, body, status);

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing Authorization header" }, 401);
    const callerClient = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: authHeader } } });
    const { data: userData } = await callerClient.auth.getUser();
    if (!userData?.user) return json({ error: "Invalid session" }, 401);

    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const { data: adminRow } = await adminClient.from("admins").select("role").eq("user_id", userData.user.id).maybeSingle();
    if (!adminRow || !["admin", "president", "secretary"].includes(adminRow.role)) {
      return json({ error: "Forbidden" }, 403);
    }

    const body = await req.json().catch(() => ({}));
    const eventId = String(body.eventId || "");
    if (!eventId) return json({ error: "eventId is required" }, 400);

    const { data: event } = await adminClient.from("events").select("id, attendance_tracking_enabled").eq("id", eventId).maybeSingle();
    if (!event) return json({ error: "Event not found" }, 404);
    if (!event.attendance_tracking_enabled) return json({ error: "Attendance tracking is not enabled for this event" }, 400);

    const code = randomCode();
    const expiresAt = new Date(Date.now() + 45_000).toISOString();
    const { error: insErr } = await adminClient.from("checkin_tokens").insert({ event_id: eventId, code, expires_at: expiresAt });
    if (insErr) return json({ error: "Could not generate code" }, 500);

    // Best-effort cleanup of stale rows (not required for correctness).
    adminClient.from("checkin_tokens").delete().lt("expires_at", new Date(Date.now() - 5 * 60_000).toISOString()).then(() => {});

    return json({ code, expiresAt });
  } catch (err) {
    console.error("get-checkin-token error:", err);
    return json({ error: "Unexpected error. Please try again." }, 500);
  }
});
