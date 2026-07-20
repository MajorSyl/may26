import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// PUBLIC / UNAUTHENTICATED by design (verify_jwt: false) -- a member who
// hasn't logged in yet has no JWT to present. This function is the entire
// security boundary for member login: it looks up the Rotary ID, enforces
// a per-Rotary-ID lockout after repeated bad PINs, and only then attempts
// the real Supabase Auth sign-in. It never reveals whether a Rotary ID
// exists -- every failure path returns the same generic message.

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;
const GENERIC_ERROR = "Invalid Rotary ID or PIN.";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function deriveEmail(rotaryId: string): string {
  return `${rotaryId.toLowerCase()}@members.rcfs.internal`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const rotaryId = String(body?.rotaryId || "").trim().toUpperCase();
    const pin = String(body?.pin || "");

    if (!rotaryId || !/^\d{6}$/.test(pin)) {
      return json({ error: GENERIC_ERROR }, 400);
    }

    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: member, error: lookupErr } = await adminClient
      .from("users")
      .select("uid, auth_user_id, failed_pin_attempts, pin_locked_until")
      .eq("rotary_id", rotaryId)
      .maybeSingle();

    // Same generic error whether the Rotary ID doesn't exist or has no
    // linked login yet -- don't let a caller distinguish the two.
    if (lookupErr || !member || !member.auth_user_id) {
      return json({ error: GENERIC_ERROR }, 401);
    }

    if (member.pin_locked_until && new Date(member.pin_locked_until).getTime() > Date.now()) {
      const minutesLeft = Math.ceil((new Date(member.pin_locked_until).getTime() - Date.now()) / 60000);
      return json({ error: `Too many attempts. Try again in ${minutesLeft} minute${minutesLeft === 1 ? '' : 's'}.` }, 429);
    }

    // Use an anon-scoped client for the actual credential check -- this is
    // a real Supabase Auth sign-in, just proxied through here so we can
    // enforce the Rotary-ID-first + lockout semantics around it.
    const authClient = createClient(SUPABASE_URL, ANON_KEY);
    const email = deriveEmail(rotaryId);
    const { data: signInData, error: signInErr } = await authClient.auth.signInWithPassword({ email, password: pin });

    if (signInErr || !signInData.session) {
      const attempts = (member.failed_pin_attempts || 0) + 1;
      const update: Record<string, unknown> = { failed_pin_attempts: attempts };
      if (attempts >= MAX_ATTEMPTS) {
        update.pin_locked_until = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000).toISOString();
      }
      // Bookkeeping only -- the caller doesn't need to wait on this to see
      // their error, and waitUntil keeps it running after the response is
      // sent instead of adding a full round trip to every failed attempt.
      EdgeRuntime.waitUntil(adminClient.from("users").update(update).eq("uid", member.uid));

      if (attempts >= MAX_ATTEMPTS) {
        return json({ error: `Too many attempts. Try again in ${LOCKOUT_MINUTES} minutes.` }, 429);
      }
      return json({ error: GENERIC_ERROR }, 401);
    }

    // Success: clear the lockout state in the background -- same reasoning,
    // the client already has its tokens and doesn't need to wait for this.
    EdgeRuntime.waitUntil(adminClient.from("users").update({ failed_pin_attempts: 0, pin_locked_until: null }).eq("uid", member.uid));

    return json({
      success: true,
      access_token: signInData.session.access_token,
      refresh_token: signInData.session.refresh_token
    });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : GENERIC_ERROR }, 500);
  }
});
