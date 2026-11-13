import { createClient, SupabaseClient } from "jsr:@supabase/supabase-js@2";

// Resolves the signed-in user behind a request's bearer token, or null.
// The public (publishable/anon) key is not a user token and yields null.
export async function getCaller(req: Request): Promise<{ id: string } | null> {
  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token.startsWith("eyJ")) return null;
  const { data } = await createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!).auth.getUser(token);
  return data?.user ? { id: data.user.id } : null;
}

export async function callerRole(admin: SupabaseClient, userId: string): Promise<string | null> {
  const { data } = await admin.from("admins").select("role").eq("user_id", userId).maybeSingle();
  return data?.role ?? null;
}

// Allows the scheduled pg_cron job (x-cron-secret, checked against Vault
// inside the database so the value never leaves it) or a signed-in officer
// whose role is in `roles`.
export async function isCronOrOfficer(req: Request, admin: SupabaseClient, roles: string[]): Promise<boolean> {
  const secret = req.headers.get("x-cron-secret");
  if (secret) {
    const { data, error } = await admin.rpc("verify_cron_secret", { p_secret: secret });
    return !error && data === true;
  }
  const caller = await getCaller(req);
  if (!caller) return false;
  const role = await callerRole(admin, caller.id);
  return !!role && roles.includes(role);
}
