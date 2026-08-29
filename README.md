# Rotary Club of Freetown Sunset

The official app for the Rotary Club of Freetown Sunset, Sierra Leone (Rotary District 9101) — a React Native (Expo, TypeScript) project targeting iOS, Android, and web from one codebase, backed by Supabase.

## The project

**[`mobile-rn/`](./mobile-rn) is the entire codebase.** There is no separate web app and no Capacitor wrapper — see `mobile-rn/README.md` for setup, run, and build instructions, and `mobile-rn/MIGRATION_NOTES.md` for what's in scope today versus still to come.

## Database

The Supabase schema, Row Level Security policies, and Edge Functions live in the Supabase project itself, managed directly (via the Supabase dashboard or CLI) rather than checked into this repository.
