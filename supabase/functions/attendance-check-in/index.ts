import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { json as jsonFor, preflight } from "../_shared/cors.ts";

// Verifies a scanned/typed check-in code + the member's GPS position
// server-side, then records attendance. Deliberately returns the same
// generic message for an invalid code and an expired one -- no hint to
// someone probing which case they hit. Distance math and confidence
// scoring never happen client-side; only the raw lat/lng/accuracy readings
// are client-supplied, as any GPS-based check-in has to accept.
function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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
    const memberId = userData.user.id;

    const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const body = await req.json().catch(() => ({}));
    const code = String(body.code || "").trim().toUpperCase().slice(0, 16);
    const lat = Number(body.lat);
    const lng = Number(body.lng);
    const accuracy = Number(body.accuracy) || 999;
    if (!code) return json({ error: "A check-in code is required." }, 400);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      return json({ error: "Location is required to check in. Please allow location access and try again." }, 400);
    }

    // Rate limit: cap attempts (successful or not) per member across the
    // last 60 seconds, regardless of event.
    const since = new Date(Date.now() - 60_000).toISOString();
    const { count: recentAttempts } = await db
      .from("attendance_attempts")
      .select("id", { count: "exact", head: true })
      .eq("member_id", memberId)
      .gte("attempted_at", since);
    if ((recentAttempts || 0) >= 6) {
      return json({ error: "Too many attempts. Please wait a moment and try again." }, 429);
    }

    const { data: tokenRow } = await db.from("checkin_tokens").select("event_id, expires_at").eq("code", code).maybeSingle();
    if (!tokenRow || new Date(tokenRow.expires_at).getTime() < Date.now()) {
      await db.from("attendance_attempts").insert({ event_id: tokenRow?.event_id || null, member_id: memberId, reason: "invalid_or_expired_code" });
      return json({ error: "That code isn't valid. Ask the organizer for the current code and try again." }, 400);
    }
    const eventId = tokenRow.event_id;

    const { data: event } = await db
      .from("events")
      .select("id, title, attendance_tracking_enabled, venue_lat, venue_lng, venue_radius_m")
      .eq("id", eventId)
      .maybeSingle();
    if (!event || !event.attendance_tracking_enabled || event.venue_lat == null || event.venue_lng == null) {
      await db.from("attendance_attempts").insert({ event_id: eventId, member_id: memberId, reason: "tracking_not_configured" });
      return json({ error: "Attendance tracking isn't available for this event right now." }, 400);
    }

    const { data: existing } = await db.from("attendance_records").select("id").eq("event_id", eventId).eq("member_id", memberId).maybeSingle();
    if (existing) return json({ success: true, alreadyCheckedIn: true, eventTitle: event.title });

    const distance = haversineMeters(lat, lng, event.venue_lat, event.venue_lng);
    const radius = event.venue_radius_m || 100;
    const effectiveRadius = radius + Math.min(accuracy, 100);

    if (distance > effectiveRadius) {
      await db.from("attendance_attempts").insert({ event_id: eventId, member_id: memberId, reason: "out_of_range", distance_m: distance });
      return json({ error: "You don't appear to be at the venue. Move closer and try again." }, 400);
    }

    const confidence = distance <= radius ? "high" : "low";
    const { error: insErr } = await db.from("attendance_records").insert({
      event_id: eventId,
      member_id: memberId,
      method: "qr",
      location_lat: lat,
      location_lng: lng,
      distance_m: distance,
      gps_accuracy_m: accuracy,
      confidence
    });
    if (insErr) {
      // Unique-violation race (double-tap) reads as already-checked-in, not an error.
      if (String(insErr.message || "").includes("duplicate")) {
        return json({ success: true, alreadyCheckedIn: true, eventTitle: event.title });
      }
      return json({ error: "Could not record attendance. Please try again." }, 500);
    }

    return json({ success: true, confidence, eventTitle: event.title });
  } catch (err) {
    console.error("attendance-check-in error:", err);
    return json({ error: "Unexpected error. Please try again." }, 500);
  }
});
