import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { json as jsonFor, preflight } from "../_shared/cors.ts";

// Creates a Stripe Checkout Session for a one-time donation, optionally
// tied to a project. Requires the STRIPE_SECRET_KEY Edge Function secret
// -- returns a clear 'not configured' error until it's set. SITE_URL
// controls the success/cancel redirect target. Public by design, so every
// field is validated and Stripe's own error text is never echoed back.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PROJECT_ID_RE = /^[A-Za-z0-9_-]{1,100}$/;
const MAX_CENTS = 1_000_000; // $10,000 per checkout

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return preflight(req);
  const json = (body: unknown, status = 200) => jsonFor(req, body, status);
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
  if (!STRIPE_SECRET_KEY) return json({ error: "Donations are not configured yet. Please try again later." }, 503);

  try {
    const body = await req.json().catch(() => ({}));
    const amountCents = Math.round(Number(body.amountCents));
    const projectId: string | null = typeof body.projectId === "string" && body.projectId ? body.projectId : null;
    const donorEmail: string | null = typeof body.donorEmail === "string" && body.donorEmail.trim() ? body.donorEmail.trim().slice(0, 254) : null;
    const siteUrl = Deno.env.get("SITE_URL") || "https://www.rcfsunset.org";

    if (!Number.isFinite(amountCents) || amountCents < 100 || amountCents > MAX_CENTS) {
      return json({ error: "Enter a donation amount between $1 and $10,000." }, 400);
    }
    if (projectId && !PROJECT_ID_RE.test(projectId)) return json({ error: "Invalid project." }, 400);
    if (donorEmail && !EMAIL_RE.test(donorEmail)) return json({ error: "Enter a valid email address." }, 400);

    const params = new URLSearchParams();
    params.set("mode", "payment");
    params.set("success_url", `${siteUrl}/?donation=success`);
    params.set("cancel_url", `${siteUrl}/?donation=cancelled`);
    params.set("line_items[0][price_data][currency]", "usd");
    params.set("line_items[0][price_data][product_data][name]", projectId ? `Donation - Project ${projectId}` : "Donation to RCFS");
    params.set("line_items[0][price_data][unit_amount]", String(amountCents));
    params.set("line_items[0][quantity]", "1");
    if (donorEmail) params.set("customer_email", donorEmail);
    if (projectId) params.set("metadata[project_id]", projectId);
    params.set("metadata[donor_email]", donorEmail || "");

    const resp = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString()
    });
    const session = await resp.json();
    if (!resp.ok) {
      console.error("Stripe checkout error:", session?.error?.message);
      return json({ error: "Could not start checkout. Please try again later." }, 502);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    await fetch(`${SUPABASE_URL}/rest/v1/donations`, {
      method: "POST",
      headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        project_id: projectId,
        donor_email: donorEmail,
        amount_cents: amountCents,
        currency: "usd",
        provider: "stripe",
        provider_session_id: session.id,
        status: "pending"
      })
    });

    return json({ url: session.url });
  } catch (err) {
    console.error("create-donation-checkout error:", err);
    return json({ error: "Unexpected error. Please try again." }, 500);
  }
});
