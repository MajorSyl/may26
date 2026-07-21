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
// reachable from the browser. Every action except self_delete is
// re-verified as belonging to an admin (via the `admins` table) before it
// runs, independent of verify_jwt (which only confirms the request carries
// *some* valid session). self_delete is intentionally available to any
// authenticated member and only ever acts on the caller's own row (looked
// up by their verified auth id, never a client-supplied uid).
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

    const body = await req.json().catch(() => ({}));
    const action = body?.action;

    // Self-service account deletion (App Store guideline 5.1.1(v): apps
    // that support account creation must also support in-app account
    // deletion). Any authenticated member may delete their own account, so
    // this runs before the admin-only gate below. It clears the
    // self-entered profile fields (bio, avatar, contact info) and deletes
    // the auth account; the roster identity itself (name, role, committee)
    // is a club-administered record kept independent of app access.
    // Deleting the auth account automatically clears auth_user_id (ON
    // DELETE SET NULL) and cascades away all of this member's chat
    // messages, reactions, timeline posts and comments (ON DELETE CASCADE
    // on sender_id/author_id -- see schema.sql).
    if (action === "self_delete") {
      const { data: rosterRow, error: rosterErr } = await adminClient
        .from("users")
        .select("uid, auth_user_id")
        .eq("auth_user_id", callerId)
        .maybeSingle();

      if (rosterErr || !rosterRow) {
        return json({ error: "No linked account found for this session" }, 404);
      }

      await adminClient.from("users").update({ bio: null, avatarurl: null }).eq("uid", rosterRow.uid);
      await adminClient.from("member_contact_info").delete().eq("uid", rosterRow.uid);

      // Remove any photos this member uploaded to the shared storage
      // bucket (submissions and timeline posts are stored under
      // `<authUserId>/submissions/...` and `<authUserId>/timeline/...` --
      // see Dashboard.tsx / MemberTimeline.tsx). Best-effort: a failure
      // here shouldn't block the account deletion itself.
      for (const folder of ["submissions", "timeline"]) {
        const { data: files } = await adminClient.storage.from("member-uploads").list(`${callerId}/${folder}`);
        if (files && files.length > 0) {
          const paths = files.map((f) => `${callerId}/${folder}/${f.name}`);
          await adminClient.storage.from("member-uploads").remove(paths);
        }
      }

      const { error: delErr } = await adminClient.auth.admin.deleteUser(callerId);
      if (delErr) {
        return json({ error: "Failed to delete account: " + delErr.message }, 500);
      }

      return json({ success: true });
    }

    // Every action below requires the caller to be an admin.
    const { data: adminRow } = await adminClient
      .from("admins")
      .select("user_id")
      .eq("user_id", callerId)
      .maybeSingle();

    if (!adminRow) {
      return json({ error: "Forbidden: admin access required" }, 403);
    }

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
