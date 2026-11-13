import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { json, preflight } from "../_shared/cors.ts";

// Public by design (anonymous visitors log page views), so everything the
// browser sends is treated as untrusted:
//  - CORS only for rcfsunset.org (see _shared/cors.ts);
//  - page names must match the app's own naming scheme;
//  - free-text fields are length-capped;
//  - the member id is never taken from the request body -- it is only set
//    when the request carries a valid signed-in session token;
//  - errors are logged server-side and never echoed back.
// City/country come from the real client IP via ipapi.co (best effort).
const PAGE_RE = /^[A-Za-z0-9_-]{1,100}$/;
const clip = (v: unknown, max: number): string | null => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return preflight(req);
  if (req.method !== "POST") return json(req, { error: "Method not allowed" }, 405);

  try {
    const body = await req.json().catch(() => null);
    const page = typeof body?.page === "string" ? body.page : "";
    if (!PAGE_RE.test(page)) return json(req, { error: "Invalid request" }, 400);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Signed-in visitors send their session token; anonymous ones send the
    // public key, which is not a user token and yields no user.
    let userId: string | null = null;
    const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    if (token.startsWith("eyJ")) {
      const { data } = await createClient(SUPABASE_URL, ANON_KEY).auth.getUser(token);
      userId = data?.user?.id ?? null;
    }

    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim();
    let city: string | null = null;
    let country: string | null = null;
    if (ip && ip !== "127.0.0.1") {
      try {
        const geoRes = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, { signal: AbortSignal.timeout(3000) });
        if (geoRes.ok) {
          const geo = await geoRes.json();
          if (!geo.error) {
            city = clip(geo.city, 100);
            country = clip(geo.country_name, 100);
          }
        }
      } catch {
        // Geolocation is best-effort.
      }
    }

    const { error } = await createClient(SUPABASE_URL, SERVICE_ROLE_KEY).from("page_views").insert({
      page,
      visitor_id: clip(body?.visitorId, 64),
      user_id: userId,
      city,
      country,
      device: clip(body?.device, 32),
      browser: clip(body?.browser, 300),
      user_agent: clip(req.headers.get("user-agent"), 300) || ""
    });
    if (error) {
      console.error("log-page-view insert failed:", error.message);
      return json(req, { error: "Could not record the page view." }, 500);
    }
    return json(req, { success: true });
  } catch (err) {
    console.error("log-page-view error:", err);
    return json(req, { error: "Could not record the page view." }, 500);
  }
});
