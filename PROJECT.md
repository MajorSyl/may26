# RCFS — Rotary Club of Freetown Sunset App

The official app for the Rotary Club of Freetown Sunset, Sierra Leone (Rotary District 9101). One React Native (Expo, TypeScript) codebase targets **iOS, Android, and web** simultaneously, backed by Supabase (Postgres + Auth + Storage + Edge Functions).

- **Web**: deployed to Vercel at **www.rcfsunset.org**
- **Android**: built via EAS and re-hosted as a permanent GitHub Release APK — free, direct download, no Play Store listing
- **iOS**: not yet built (needs a paid Apple Developer account; EAS is configured but only builds Android today)

`mobile-rn/` is the **entire** codebase — there is no separate web app and no Capacitor wrapper.

---

## Tech stack

| Layer | Technology |
|---|---|
| App framework | Expo SDK 52 (managed workflow, no `android/`/`ios/` folders in the repo) |
| Language | TypeScript |
| UI | React Native + `react-native-web`, styled with NativeWind (Tailwind for RN) |
| Navigation | React Navigation (native-stack + bottom-tabs; responsive left rail on tablet/desktop) |
| Backend | Supabase — Postgres with Row Level Security, Supabase Auth, Storage, Edge Functions |
| Web build | `expo export --platform web` → static `dist/` → Vercel |
| Web hosting | Vercel (static, with a hand-rolled service worker for update propagation — see below) |
| Android build | EAS Build (`eas.json` `preview` profile), triggered by GitHub Actions on every push to `main` that touches `mobile-rn/**` |
| Android hosting | Re-published as a GitHub Release asset (`android-latest` tag), updated in place every successful build |
| Charts/QR/scanning | Hand-rolled SVG (no charting library), `react-native-qrcode-svg` + `jsqr` (pure JS, web-only camera scanning) |

---

## Features

### Public site (no login required)
- Home, About, What is Rotary, Get Involved, Contact, Privacy Policy
- Service Project Gallery + Project Details (with per-project impact stats: wells built, students sponsored, funds raised, people impacted — shown only when an admin has entered them)
- Club Photo Gallery
- Meetings & Events calendar, with one-tap RSVP for signed-in members
- Members Directory (Charter & Active / Board Executives / Paul Harris Fellows)
- Club Videos section (multi-provider embed: YouTube/Vimeo/etc.)
- Social feed preview (Instagram + Facebook, synced server-side via Edge Functions — renders nothing if not configured)
- "Download for Android — Free" section: honest direct-APK-download CTA, explicit "no Play Store needed" copy, App Store/Google Play badges shown as "Coming Soon" (never implying a live store listing)
- First-run onboarding modal

### Member Dashboard (self-serve, email/password or Google OAuth)
- Sign-up → "member or guest" choice → member requests go to admin-approval queue; guests get immediate limited access
- Profile editing: name, phone, bio, uploaded photo (Supabase Storage `avatars` bucket)
- Single-scroll dashboard: profile, attendance history, upcoming events + RSVP status, gallery submission statuses, notifications
- Submit a photo for the gallery (goes into the same moderation queue admins already use for project submissions)
- Request officer access (Secretary / Treasurer / Media, with an optional note) — reviewed by full admins
- QR/geofenced meeting check-in (see below)

> Note: an older, separate **Rotary ID + 6-digit PIN** member login system existed earlier in this project's history and has since been **fully retired** (its Edge Functions now return `410 Gone`). The Member Dashboard above is the only member system today.

### Meeting attendance (QR + geofence)
- Officers enable attendance tracking per event (venue lat/lng + radius)
- Officer's device shows a rotating signed QR code (~45s TTL) plus the plain code as text
- Members scan (web: camera via `getUserMedia` + `jsQR`) or manually type the code; their GPS position is checked server-side against the venue radius (haversine distance + accuracy buffer)
- All verification happens in an Edge Function using the service-role key — the `attendance_records`/`checkin_tokens` tables have **no client-reachable write policy at all**, so the check can't be bypassed by calling the REST API directly
- Rate-limited (6 attempts/60s/member), every failure logged, idempotent on duplicate check-ins, poor GPS accuracy degrades to "low confidence" rather than blocking
- Officers get a live attendee list (RSVPs + verified attendance) with a manual override for GPS-unreliable indoor venues
- **Native-app limitation, by design**: this build has no `expo-camera`/`expo-location`, so camera scanning and GPS capture are web-only; the native app falls back to manual code entry with a clear "use the web app" message rather than silently failing

### Admin dashboard (role-based)
Roles: `admin` / `president` / `secretary` (full access), `treasurer` (projects), `media` (content/gallery/submissions/social). Enforced via Postgres RLS functions (`is_admin()`, `is_media_officer()`, `is_treasurer_officer()`), not just a frontend check.

- Projects, Events, Members, Inquiries CRUD
- Approvals queue (member project/photo submissions → publish)
- Page Content CMS (add/edit/reorder/hide freeform sections per public page, no code change needed)
- Pending Members (approve/reject Member Dashboard sign-ups)
- Officer Access Requests queue (approve/deny role requests)
- Event Attendees + Check-In screens (QR generation, manual add/remove)
- Roles management
- Analytics: traffic chart, top pages, top locations (IP-geolocated server-side, never client-supplied)
- Visitor Log (searchable/filterable)
- Social Feed config (Meta credentials, token health/expiry, manual sync)
- Site Settings

### Deliberately dormant (built but not wired into the UI)
- **Donations**: Stripe Checkout Edge Functions (`create-donation-checkout`, `stripe-webhook`) and a `donations` table are deployed and live, but the Donate button/UI was pulled from Home and Project Details per a later request ("leave donation out for now"). Re-adding the UI is a quick change, not a rebuild.
- **Newsletter automation**: `send-newsletter` Edge Function exists (emails subscribers + members when a new project/event is published); needs a `RESEND_API_KEY` secret to actually send.

---

## Update propagation (web + Android)

This was a dedicated fix — worth documenting since it's easy to regress:

- **Web**: a hand-rolled service worker (generated fresh on every export, keyed by Vercel's own commit SHA so it's byte-different every deploy) — network-first for the HTML app shell, stale-while-revalidate for content-hashed JS/CSS, `skipWaiting()`+`clients.claim()` on activate. A small registration script shows an "Update available — tap to refresh" banner the moment a new version takes control, and forces a fresh check whenever the tab regains focus. `vercel.json` sets explicit `no-cache` on `/`, `/index.html`, `/sw.js`; long immutable caching on hashed `/_expo/static/` assets.
- **Android**: `eas.json` uses `appVersionSource: "remote"` with `autoIncrement: true` so EAS's own servers track a real, always-incrementing `versionCode` across stateless CI runs (a "local" version source silently produced the *same* versionCode on every CI build for a while — the actual root cause of an earlier "stale APK" bug). Each successful build publishes a `version.json` (versionName/versionCode/apkUrl) alongside the APK on the same permanent GitHub Release URL; the app compares this against its own build-time versionCode (`expo-constants`) on launch and shows an "Update available" banner linking straight to the APK if it's behind.

---

## Backend (Supabase)

Schema, RLS policies, Storage buckets, and Edge Functions are **managed directly against the live Supabase project** (via the Supabase connection), not checked into this repository as SQL files.

Key tables: `admins` (role-based), `profiles` (Member Dashboard, `membership_status` enum + a trigger blocking self-approval), `projects`, `events`, `event_rsvps`, `content_blocks` (CMS), `gallery_photos`, `submissions`, `role_requests`, `attendance_records` / `attendance_attempts` / `checkin_tokens` (no client write access — Edge Function only), `page_views`, `social_posts` / `social_config`, `donations` (dormant), `newsletter_subscribers` / `newsletter_sends`.

Key Edge Functions: `log-page-view` (server-side IP geolocation), `get-checkin-token` / `attendance-check-in` (QR/geofence, service-role only), `sync-social-feed` / `refresh-social-tokens`, `create-donation-checkout` / `stripe-webhook` (dormant), `send-newsletter`.

Auth: Supabase Auth (email/password + Google OAuth) for the Member Dashboard and Admin sign-in; admin access is additionally re-checked server-side against the `admins` table via RLS — the in-app check is a UX convenience, not the real security boundary.

---

## Environment variables

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key   # publishable/anon key only, never service_role
```

Expo reads any `EXPO_PUBLIC_*` var automatically. If unset, the app still runs against a local AsyncStorage sandbox with seed content, so it demos cleanly with zero config.

---

## Running it locally

```bash
cd mobile-rn
npm install
cp .env.example .env   # fill in the two vars above
npx expo start         # then i / a / w for iOS sim / Android emulator / web
npm run web:export     # production static web build -> ./dist
```

## Deployment

- **Web**: push to `main` → Vercel builds `mobile-rn` via `vercel.json`'s `buildCommand` (`expo export --platform web` + a post-export script that injects SEO meta tags and generates the service worker) → deploys automatically.
- **Android**: push to `main` touching `mobile-rn/**` → `.github/workflows/eas-build.yml` runs `eas build --profile preview --platform android`, downloads the signed APK, and re-publishes it (plus `version.json`) to the `android-latest` GitHub Release.
  - Free-tier EAS accounts have a **monthly Android build quota** — a build failing in under a minute with "This account has used its Android builds from the Free plan this month" is this quota wall, not a code problem.

## Project structure

```
mobile-rn/
  App.tsx                     # entry point: providers + navigation + update banner + onboarding
  public/                     # static files copied verbatim into the web build (sw-register.js)
  scripts/inject-web-meta.js  # post-export: SEO meta tags + service worker generation
  src/
    types.ts, data.ts, theme.ts
    lib/                      # supabase client, service.ts (all reads/writes), cms.ts, social.ts,
                               # memberAccount.ts, appUpdate.ts, analytics.ts, storage.ts, validate.ts
    components/                # shared UI kit, SafeImage, OnboardingModal, UpdateAvailableBanner,
                               # DownloadAppSection, SocialFeedSection, VideoEmbed
    navigation/                # RootNavigator, TabNavigator, per-tab stack navigators, ResponsiveTabBar
    screens/                   # one file per screen (public, member, and ~19 admin screens)
```

## Security posture (audited)

- RLS enforced on every table; no client-side-only gates
- No hardcoded secrets — only the publishable Supabase anon key appears in the client, by design
- Android: real managed release keystore (not debug), `usesCleartextTraffic` disabled, no unnecessary permissions (camera/location features are web-only in this build, so nothing is requested natively)
- Privacy Policy accurately discloses GPS collection during meeting check-in, profile data, and analytics

## Known limitations / honest gaps

- iOS build not yet set up (needs Apple Developer credentials)
- Camera QR scanning and GPS capture are web-only (no native camera/location module in this build)
- Donations and newsletter automation are backend-complete but not user-facing / not fully configured (see above)
- Nothing in this sandboxed environment has direct network access to `rcfsunset.org` or the live Supabase project — verification throughout has relied on local production builds, headless-browser testing, and the Supabase MCP connection (a separate channel that *does* reach the live project)
