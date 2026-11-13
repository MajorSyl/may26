import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Stripe webhook receiver: marks a donation completed once payment
// actually succeeds (never trust the client-side redirect alone).
// Server-to-server only, so it sends no CORS headers. Requires
// STRIPE_WEBHOOK_SECRET. Signature check follows Stripe's scheme: HMAC-SHA256
// over "{timestamp}.{rawBody}", any matching v1 signature accepted (Stripe
// sends several while a secret is being rotated), compared in constant time,
// and rejected when the timestamp is more than 5 minutes off (replay guard).
const TOLERANCE_SECONDS = 300;

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function verifyStripeSignature(rawBody: string, sigHeader: string, secret: string): Promise<boolean> {
  let timestamp = "";
  const signatures: string[] = [];
  for (const part of sigHeader.split(",")) {
    const [k, v] = part.split("=", 2).map((s) => s?.trim());
    if (k === "t") timestamp = v || "";
    if (k === "v1" && v) signatures.push(v);
  }
  const ts = Number(timestamp);
  if (!timestamp || !Number.isFinite(ts) || signatures.length === 0) return false;
  if (Math.abs(Date.now() / 1000 - ts) > TOLERANCE_SECONDS) return false;

  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signed = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${rawBody}`));
  const expected = Array.from(new Uint8Array(signed)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return signatures.some((s) => timingSafeEqual(s, expected));
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });

  const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  if (!STRIPE_WEBHOOK_SECRET) return new Response(JSON.stringify({ error: "Webhook not configured" }), { status: 503 });

  const rawBody = await req.text();
  const valid = await verifyStripeSignature(rawBody, req.headers.get("stripe-signature") || "", STRIPE_WEBHOOK_SECRET);
  if (!valid) return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });

  const event = JSON.parse(rawBody);
  if (event.type === "checkout.session.completed") {
    const sessionId = String(event.data?.object?.id || "");
    if (sessionId) {
      await fetch(`${SUPABASE_URL}/rest/v1/donations?provider_session_id=eq.${encodeURIComponent(sessionId)}`, {
        method: "PATCH",
        headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed", completed_at: new Date().toISOString() })
      });
    }
  }
  return new Response(JSON.stringify({ received: true }), { status: 200, headers: { "Content-Type": "application/json" } });
});
