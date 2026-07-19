# Rotary Club of Freetown Sunset — Website

The official website for the Rotary Club of Freetown Sunset, Sierra Leone (Rotary District 9101). Built with React, TypeScript, and Vite, backed by Supabase.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in your Supabase project's URL and anon key (Project Settings → API in your Supabase dashboard). Without these, the app runs in a local-only simulated mode using browser storage.
3. Run the app:
   ```
   npm run dev
   ```

## Build

```
npm run build
```

## Database Setup

`supabase/schema.sql` is the single source of truth for the database schema — tables, Row Level Security policies, and the admin helper function. Run it in your Supabase project's SQL Editor to provision everything the app needs.

## Deployment

The site is deployed on Vercel. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables in your Vercel project settings.
