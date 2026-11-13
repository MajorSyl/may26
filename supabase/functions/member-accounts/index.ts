import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { json, preflight } from "../_shared/cors.ts";

// Retired: part of the old Rotary-ID + PIN member login system, fully
// removed from the app. Kept as a stub (no delete-function API is available
// here) so the endpoint can never authenticate or change anything again.
Deno.serve((req: Request) => {
  if (req.method === "OPTIONS") return preflight(req);
  return json(req, { error: "This function has been retired along with the Rotary-ID + PIN member login system." }, 410);
});
