# Migration Notes

What's different from the original React/Vite/TypeScript web app this was rebuilt from, and why, plus an honest account of what was and wasn't verified. That original web app and its Capacitor Android wrapper have since been removed from this repository entirely — this file is a historical record of the rebuild, not a description of a currently-existing sibling project.

## Confirmed: old dashboard code and backend were left untouched at the time of this rebuild

Per the brief, the old web app's member `Dashboard.tsx` (profile/submissions/chat/timeline) and `AdminDashboard.tsx` (+ its six section files, Roles, Analytics) were **not built** in this project. Nothing was touched to build this rebuild itself — the old `src/`, `supabase/schema.sql`, `supabase/functions/` source, and every other old-codebase file were only removed afterward, in a separate, later cleanup pass once this project was confirmed working (see the repo's git history for that commit). The live Supabase project's actual tables, RLS policies, and deployed Edge Functions were never touched by either step — only this repo's local copies of that source.

## Corrections to the original migration brief

The prompt that kicked this off described the source project inaccurately in a few ways worth recording, so future work isn't planned around a wrong picture:

- The web app is **React 19**, not React 18.
- There is **no Firebase** anywhere in the codebase — `db-router.ts` only ever routes between Supabase and a local-storage sandbox fallback (a vestigial `getActiveDbDriver()` always returns `'supabase'` now).
- There is **no shared passcode gate** for the members directory — it's a public page.
- Member login is **Rotary ID + 6-digit PIN** via a Supabase Edge Function (`member-login`), not a generic "passcode."
- Admin lock-down is enforced by **Postgres RLS** (`is_admin()` / the `admins` table), not a single hardcoded email in the frontend — and as of this session the schema also supports a second "reviewer" admin tier (irrelevant to this rebuild's scope, but worth knowing it exists).

## Deliberate simplifications

- **Home and About pages**: the web app has an admin-editable block-reordering CMS system (drag/reorder/hide sections, tied to `AdminDashboard.tsx`'s "Design" tab). This rebuild renders the same sections in a fixed order instead — still pulling live copy from `getSiteSettings()`, so an admin's text edits still show up, just not section reordering/hiding. Reinstating that would mean porting the admin Design tab too, which is out of scope here.
- **Members Directory**: the web app's "Verbatim Roster" sub-tab (a name+classification-only duplicate view of the same member list) was dropped as redundant. The three real filter tabs (Charter & Active / Board Executives / Paul Harris Fellows) are all ported.
- **Project fields**: `types.ts` declares several `Project` fields (`budget`, `fundingRaised`, `beneficiariesCount`, `teamLeads`, `details`, `galleryUrls`) that aren't actual columns in the live `projects` table (confirmed against `supabase/schema.sql`) — they're rendered conditionally where present, exactly as the web app does, so this is a pre-existing characteristic of the data model, not something this rebuild introduced or needs to fix.
- **Local sandbox project seed data**: the one project in the web app's local-only fallback list that used a bundled image (`kaningo-2017.jpg`) is ported without that image here; it falls back to `SafeImage`'s "Photo Coming Soon" placeholder instead. This only affects the no-Supabase-configured demo mode, never real data.

## Real behavior differences (not simplifications — deliberate, per your non-negotiables)

- **Image fit**: the web app crops some images with CSS `object-cover` (e.g. gallery card thumbnails). Every image in this app uses `resizeMode="contain"` instead, per your explicit instruction — nothing is ever cropped or has a face cut off. Expect photos to letterbox inside their frames sometimes, rather than fill them edge-to-edge.
- **Styling approach**: NativeWind was used everywhere it fit cleanly; a few structural pieces (`SafeImage`, some `Modal` layout) use plain `StyleSheet` where NativeWind's cross-platform image handling isn't a natural fit. Both coexist without issue.

## Auth flows: what to verify on a real device

The login screens were built end-to-end against the same Supabase project (`member-login` Edge Function, `admins` table check) and verified via a full web export + headless-browser pass with zero console errors and working cross-tab navigation. What **couldn't** be verified from this sandbox — it has no network path to your live Supabase instance:

- An actual successful member sign-in with a real Rotary ID + PIN.
- An actual successful admin sign-in with a real email/password.
- Any RSVP / contact / Get Involved / project-inquiry form actually landing a row in your live database.

These should all work as written (they call the exact same endpoints and tables the web app already uses successfully), but please do one real pass of each on your device or the Expo web preview before considering this done.

## Dependency version pinning (a real gotcha, documented so it doesn't get "fixed" into breaking again)

`package.json` pins `nativewind` to the exact version `4.1.23` and overrides `react-native` to `0.76.5` and `react-native-reanimated` to `~3.16.1`. This isn't arbitrary: newer `nativewind`/`react-native-css-interop` versions pull in `react-native-reanimated@4.x`'s new "worklets" architecture, which is incompatible with Expo SDK 52 / React Native 0.76 and breaks the Metro bundler build entirely (`Cannot find module 'react-native-worklets/plugin'`). If you upgrade Expo SDK later, these pins should be revisited together, not individually.

## What was actually verified in this sandbox (no device/simulator available here)

- `npx tsc --noEmit` — clean, zero errors, across the full project.
- `npx expo export --platform web` — a full production bundle built successfully (2,464 modules).
- The exported web build was served locally and driven with a headless browser: Home renders with real content and the hero image intact (not cropped), all 5 bottom tabs navigate correctly, the Members Directory renders live roster data, and the Member Sign In screen opens correctly as a modal from the More menu — zero console errors throughout.
- iOS/Android-specific behavior (native modules, SecureStore, camera/gallery pickers if added later) was **not** verified, since this sandbox has no simulator or device. Please do a first run on both platforms before shipping.

## Later addition: responsive layouts, super admin dashboard, self-serve member dashboard

Built end-to-end (schema, RLS, storage, Edge Function, and UI) in a later session. Summary:

- **Responsive layouts**: `useBreakpoint()` + `ResponsiveTabBar` swap bottom tabs for a persistent left side rail at tablet/desktop widths (mobile bottom-tab behavior is untouched). Gallery/ClubGallery/Events/MembersDirectory get responsive multi-column grids. Text-first screens are capped/centered at wide widths via `ScreenScroll`.
- **Super Admin**: Pending Members approval, a generalized Page Content CMS (`content_blocks` table) for Home/About/WhatIsRotary/GetInvolved/Contact, direct Gallery CRUD, an Analytics traffic chart + top-pages/top-locations (hand-rolled SVG bars, no new charting dependency), and a searchable Visitor Log.
- **New Member Dashboard**: a second, parallel member system (email/password + Google OAuth, admin-approval workflow) living alongside the existing Rotary-ID+PIN Member Portal, which is untouched. New `profiles` table with a `membership_status` enum (pending/approved/rejected/guest), RLS, and a trigger that blocks a member from self-approving. Profile photos go through a new `avatars` Storage bucket (own-path-only write, public read).
- **Visitor analytics**: a new `log-page-view` Edge Function resolves city/country server-side from the request IP (ipapi.co free tier, no key) and writes to a new `page_views` table; `logPageView()` is wired into every in-scope public screen.

All of the above Supabase-side work (tables, RLS, the trigger, the storage bucket + policies, the Edge Function) was applied directly against the live project and is real/live now — that part didn't depend on this sandbox reaching Supabase, since the Supabase MCP connection is a separate channel from the app's own network path.

**What's verified**: `npx tsc --noEmit` clean across the whole project (including this addition), a full production web export builds with zero errors, and a headless-browser pass at mobile/tablet/desktop viewports shows zero console/page errors and confirms the responsive side rail renders correctly at each breakpoint.

**What's not verified** (same sandbox network block as before, now also blocking Supabase directly, not just expo.dev/Vercel): an actual sign-up → pending → admin-approve round trip, Google OAuth end-to-end (also needs Google Cloud Console credentials that only the account owner can create), avatar photo upload landing in Storage, a CMS-added section actually appearing on its public page, and a real page view producing a geolocated row via the Edge Function. These should all work as written (the RLS policies and column names were checked directly against the live schema, not guessed), but please do one real pass of each before considering this done.

**Deliberately out of scope**: provisioning a brand-new Rotary-ID+PIN member login from the admin dashboard (still requires the `member-accounts` Edge Function interactively, unrelated to this new system) and any drag-to-reorder UI for CMS blocks (up/down buttons instead, functional but not fancy).
