// Explicit CORS allow-list for every browser-facing edge function.
// Production origins, plus this project's own Vercel preview deployments
// (scoped to the majorsyls-projects team and the may26 project only).
// Requests from any other origin get no Access-Control-Allow-Origin header,
// so browsers block them. Native apps send no Origin and are unaffected.
const ALLOWED_ORIGINS = new Set(["https://www.rcfsunset.org", "https://rcfsunset.org"]);
const PREVIEW_ORIGIN = /^https:\/\/may26-[a-z0-9-]+-majorsyls-projects\.vercel\.app$/;

export function isAllowedOrigin(origin: string | null): boolean {
  return !!origin && (ALLOWED_ORIGINS.has(origin) || PREVIEW_ORIGIN.test(origin));
}

export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin");
  const headers: Record<string, string> = { Vary: "Origin" };
  if (isAllowedOrigin(origin)) {
    headers["Access-Control-Allow-Origin"] = origin!;
    headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "authorization, x-client-info, apikey, content-type";
    headers["Access-Control-Max-Age"] = "86400";
  }
  return headers;
}

// Preflight: 204 for allowed origins, 403 (no CORS headers) otherwise.
export function preflight(req: Request): Response {
  const headers = corsHeaders(req);
  return new Response(null, { status: headers["Access-Control-Allow-Origin"] ? 204 : 403, headers });
}

export function json(req: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders(req), "Content-Type": "application/json" } });
}
