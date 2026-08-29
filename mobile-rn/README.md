# Rotary Club of Freetown Sunset — Mobile (React Native / Expo)

A React Native (Expo, TypeScript) app for the Rotary Club of Freetown Sunset, covering the public site plus member and admin sign-in. One codebase targets iOS, Android, and web (via `react-native-web`).

This is the only codebase in this repository — there is no separate web app and no Capacitor wrapper.

## Scope of this build

**Built:** Home, About, What is Rotary, Service Gallery + Project Details, Club Gallery, Meetings & Events (with RSVP), Members Directory, Get Involved, Contact, Privacy Policy — plus both login flows (member Rotary ID + PIN, and admin email/password), each landing on a placeholder screen after signing in.

**Not built (by design, see `MIGRATION_NOTES.md`):** the full member portal (profile editing, submissions, live chat, member timeline) and the full admin dashboard (projects/events/members/inquiries/approvals/settings/roles/analytics CRUD). Both are being redesigned separately; their Supabase tables and Edge Functions were **not** touched or removed by this project.

## Requirements

- Node.js 18+
- An Expo account is **not** required to run this locally with `expo start`.
- A Supabase project provisioned with this app's schema, RLS policies, and Edge Functions.

## Setup

```bash
cd mobile-rn
npm install
cp .env.example .env
# edit .env with your Supabase project's URL + anon key
```

`.env` variables (Expo reads any `EXPO_PUBLIC_*` variable automatically, no extra config needed):

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these from the Supabase dashboard → Project Settings → API — the public "anon" key, never the `service_role` key.

If these aren't set, the app still runs — it falls back to on-device local storage (AsyncStorage) with built-in seed content, so it demos cleanly with zero configured env vars.

## Running it

```bash
npx expo start        # then press i for iOS simulator, a for Android emulator, w for web
npm run ios           # shortcut for the above, iOS
npm run android       # shortcut for the above, Android
npm run web           # shortcut for the above, web
```

Scan the QR code with the Expo Go app on a physical device as another option.

## Building for real devices (EAS)

This project doesn't include EAS configuration yet (`eas.json`) since that requires an Expo account tied to this specific app. To set it up:

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform ios       # requires an Apple Developer account
eas build --platform android
```

## Web export

```bash
npm run web:export    # outputs a static site to ./dist
```

The `dist/` folder can be deployed to any static host (Vercel, Netlify, etc.).

## Project structure

```
mobile-rn/
  App.tsx                    # entry point: providers + navigation container
  src/
    types.ts                 # ported verbatim from the web app's src/types.ts
    data.ts                  # ported static content (FAQs, focus areas, sandbox fallback data)
    memberData.ts             # ported verbatim: the 60+ member roster
    theme.ts                  # brand color tokens (same values as web app's index.css)
    lib/
      supabase.ts             # Supabase client (SecureStore-backed auth session)
      localStore.ts           # AsyncStorage-backed sandbox-mode fallback helpers
      service.ts               # all Supabase reads/writes this app needs + both login flows
    components/
      ui.tsx                  # shared ScreenScroll/Badge/Card/Button/TextField/etc.
      SafeImage.tsx            # ported image-safety component (see MIGRATION_NOTES.md)
      MemberSpotlight.tsx      # ported "random member" widget used on Home
    navigation/
      types.ts                 # all navigator param lists
      RootNavigator.tsx         # top-level stack: tabs + auth flows
      TabNavigator.tsx          # the 5 bottom tabs
      *StackNavigator.tsx       # one native-stack per tab
    screens/                   # one file per screen, named ScreenNameScreen.tsx
```

## Non-negotiables honored in this build

- Every real photo renders with `resizeMode="contain"` — never cropped, never tinted/filtered.
- Admin access is gated by Supabase Auth plus a re-check against the `admins` table (RLS-enforced server-side; the in-app check is a UX convenience, not the real security boundary).
- Member login is Rotary ID + 6-digit PIN via the `member-login` Edge Function.
- No schema changes were made or are required.
