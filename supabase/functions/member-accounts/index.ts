import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Auto-injected by the Supabase Edge Functions runtime for every project.
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

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

function isValidPin(pin: unknown): pin is string {
  return typeof pin === "string" && /^\d{6}$/.test(pin);
}

// This function performs privileged Supabase Auth admin operations
// (creating a login, resetting a PIN, deleting a user's auth account) that
// require the service_role key. That key is only ever read here,
// server-side, from an Edge Function secret -- it is never sent to or
// reachable from the browser. Every request is re-verified as belonging to
// an admin (via the `admins` table) before any privileged action runs,
// independent of verify_jwt (which only confirms the request carries *some*
// valid session).
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Missing Authorization header" }, 401);
    }

    // Scoped to the caller's own JWT -- used only to verify who is calling.
    const callerClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await callerClient.auth.getUser();
    if (userErr || !userData?.user) {
      return json({ error: "Invalid session" }, 401);
    }
    const callerId = userData.user.id;

    // Privileged client for the admin check and the actual admin actions.
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: adminRow } = await adminClient
      .from("admins")
      .select("user_id")
      .eq("user_id", callerId)
      .maybeSingle();

    if (!adminRow) {
      return json({ error: "Forbidden: admin access required" }, 403);
    }

    const body = await req.json().catch(() => ({}));
    const action = body?.action;

    // Creates a login for a roster member who doesn't have one yet, using
    // their existing Rotary ID and an admin-provided (or admin-generated)
    // initial 6-digit PIN. No email round-trip: the member is told their
    // Rotary ID + PIN through an offline channel and can change the PIN
    // once logged in.
    if (action === "create_login") {
      const { uid, pin } = body;
      if (!uid || !isValidPin(pin)) {
        return json({ error: "uid and a 6-digit pin are required" }, 400);
      }

      const { data: rosterRow, error: rosterErr } = await adminClient
        .from("users")
        .select("uid, rotary_id, auth_user_id")
        .eq("uid", uid)
        .maybeSingle();

      if (rosterErr || !rosterRow) {
        return json({ error: "Roster member not found" }, 404);
      }
      if (!rosterRow.rotary_id) {
        return json({ error: "This member has no Rotary ID assigned yet" }, 400);
      }
      if (rosterRow.auth_user_id) {
        return json({ error: "This member already has a login" }, 409);
      }

      const { data: createData, error: createErr } = await adminClient.auth.admin.createUser({
        email: deriveEmail(rosterRow.rotary_id),
        password: pin,
        email_confirm: true
      });
      if (createErr || !createData?.user) {
        return json({ error: createErr?.message || "Failed to create login" }, 500);
      }

      const { error: linkErr } = await adminClient
        .from("users")
        .update({ auth_user_id: createData.user.id, failed_pin_attempts: 0, pin_locked_until: null })
        .eq("uid", uid);

      if (linkErr) {
        return json({ error: "Login created, but failed to link account: " + linkErr.message }, 500);
      }

      return json({ success: true, rotaryId: rosterRow.rotary_id });
    }

    // Resets a member's PIN (e.g. they forgot it -- there's no email-based
    // recovery since login has no email surface). The admin communicates
    // the new PIN to the member offline; they should change it on next login.
    if (action === "reset_pin") {
      const { uid, pin } = body;
      if (!uid || !isValidPin(pin)) {
        return json({ error: "uid and a 6-digit pin are required" }, 400);
      }

      const { data: rosterRow, error: rosterErr } = await adminClient
        .from("users")
        .select("uid, auth_user_id")
        .eq("uid", uid)
        .maybeSingle();

      if (rosterErr || !rosterRow || !rosterRow.auth_user_id) {
        return json({ error: "This member has no login to reset" }, 404);
      }

      const { error: updateErr } = await adminClient.auth.admin.updateUserById(rosterRow.auth_user_id, { password: pin });
      if (updateErr) {
        return json({ error: updateErr.message || "Failed to reset PIN" }, 500);
      }

      await adminClient.from("users").update({ failed_pin_attempts: 0, pin_locked_until: null }).eq("uid", uid);

      return json({ success: true });
    }

    if (action === "revoke") {
      const { uid } = body;
      if (!uid) {
        return json({ error: "uid is required" }, 400);
      }

      const { data: rosterRow, error: rosterErr } = await adminClient
        .from("users")
        .select("uid, auth_user_id")
        .eq("uid", uid)
        .maybeSingle();

      if (rosterErr || !rosterRow) {
        return json({ error: "Roster member not found" }, 404);
      }

      if (rosterRow.auth_user_id) {
        if (rosterRow.auth_user_id === callerId) {
          return json({ error: "You cannot revoke your own account through this action" }, 400);
        }
        const { error: delErr } = await adminClient.auth.admin.deleteUser(rosterRow.auth_user_id);
        if (delErr) {
          return json({ error: "Failed to delete auth account: " + delErr.message }, 500);
        }
      }

      return json({ success: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Unexpected error" }, 500);
  }
});
