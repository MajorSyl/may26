-- =============================================================================
-- Rotary Club of Freetown Sunset — Consolidated Supabase Schema
-- =============================================================================
-- Run this entire script once, in order, against a brand-new Supabase project's
-- SQL Editor to provision every table, function, and RLS policy this app
-- expects. It is idempotent where practical (CREATE TABLE IF NOT EXISTS,
-- DROP POLICY IF EXISTS before CREATE POLICY) so it is safe to re-run.
--
-- Generated as part of the Supabase project migration audit. This file is the
-- single source of truth for schema going forward — it consolidates the SQL
-- previously embedded only as a string in src/supabase-service.ts
-- (GET_SUPABASE_SQL_SCHEMA, still used to power the "copy SQL" button in the
-- Admin Dashboard). If you change this file, update that function to match.
--
-- Tables created:
--   1. admins                 - grants a Supabase Auth user admin privileges
--   2. projects                - service projects (also stores site settings,
--                                 see note under "Known design note" below)
--   3. events                  - club meetings / events
--   4. users                   - public member directory profiles
--   5. member_contact_info     - sensitive member contact fields (admin-only)
--   6. inquiries                - contact form submissions
--   7. event_rsvps              - public RSVPs to events
--   8. project_applications     - public volunteer applications to projects
--   9. newsletter_subscribers   - homepage footer newsletter signups
--
-- Known design note: there is no dedicated "site_settings" table. The app
-- persists global site copy (hero text, mission statements, layout config,
-- etc.) as a single disguised row in `projects` with id = 'settings_site_config'
-- and the settings JSON stuffed into the `description` column
-- (see getSiteSettings/updateSiteSettings in src/supabase-service.ts). This
-- schema reproduces that existing behavior as-is; it has not been redesigned
-- as part of this migration.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. TABLES
-- -----------------------------------------------------------------------------

-- 1.1 Admins — links a Supabase Auth user to admin privileges
CREATE TABLE IF NOT EXISTS admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 1.2 Projects (also carries the single "settings_site_config" settings row)
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  year INTEGER NOT NULL,
  impact TEXT,
  status TEXT NOT NULL CHECK (status IN ('Completed', 'Active', 'Planning')),
  imageUrl TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- 1.3 Events
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  speaker TEXT,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('Weekly Meeting', 'Service Project', 'Social', 'Fundraiser')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- 1.4 Users — public member directory (no sensitive columns)
CREATE TABLE IF NOT EXISTS users (
  uid TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Rotarian', 'Club Officer', 'Guest', 'President')),
  attendancerate INTEGER,
  contributiongoals INTEGER,
  contributedamount INTEGER,
  committee TEXT,
  tasks TEXT[],
  classification TEXT,
  ispaulharrisfellow BOOLEAN DEFAULT false,
  paulharrislevel TEXT,
  joineddate TEXT,
  avatarurl TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- 1.5 Member Contact Info — sensitive fields split out, admin-only
CREATE TABLE IF NOT EXISTS member_contact_info (
  uid TEXT PRIMARY KEY REFERENCES users(uid) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  birthday TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- 1.6 Inquiries — contact form submissions
CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Membership Inquiry', 'Donation Inquiry', 'General Contact')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- 1.7 Event RSVPs
CREATE TABLE IF NOT EXISTS event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- 1.8 Project Applications — volunteer applications
CREATE TABLE IF NOT EXISTS project_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  statement TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- 1.9 Newsletter Subscribers — homepage footer signups
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- -----------------------------------------------------------------------------
-- 2. HELPER FUNCTIONS
-- -----------------------------------------------------------------------------

-- is_admin() — SECURITY DEFINER so it can read `admins` even though that
-- table has no public SELECT policy. Used by every admin-only RLS policy.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid()
  );
END;
$$;

-- -----------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY
-- -----------------------------------------------------------------------------

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- 3.1 admins — completely private; no public SELECT policy exists.
-- Only the SECURITY DEFINER is_admin() function can read it.
CREATE POLICY "Allow admin read and write on admins" ON admins
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 3.2 projects — public read (also serves the disguised settings row),
-- admin-only write
DROP POLICY IF EXISTS "Allow anyone to read projects" ON projects;
DROP POLICY IF EXISTS "Allow admin full access to projects" ON projects;

CREATE POLICY "Allow anyone to read projects" ON projects
  FOR SELECT TO public USING (true);

CREATE POLICY "Allow admin full access to projects" ON projects
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 3.3 events — public read, admin-only write
DROP POLICY IF EXISTS "Allow anyone to read events" ON events;
DROP POLICY IF EXISTS "Allow admin full access to events" ON events;

CREATE POLICY "Allow anyone to read events" ON events
  FOR SELECT TO public USING (true);

CREATE POLICY "Allow admin full access to events" ON events
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 3.4 users — public read (no sensitive columns), admin-only write
DROP POLICY IF EXISTS "Allow anyone to select on users" ON users;
DROP POLICY IF EXISTS "Allow admin full access to users" ON users;

CREATE POLICY "Allow anyone to select on users" ON users
  FOR SELECT TO public USING (true);

CREATE POLICY "Allow admin full access to users" ON users
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

REVOKE ALL PRIVILEGES ON users FROM public, anon, authenticated;
GRANT SELECT ON users TO public, anon, authenticated;

-- 3.5 member_contact_info — strictly admin-only, both read and write
CREATE POLICY "Allow admin select on member_contact_info" ON member_contact_info
  FOR SELECT TO authenticated USING (is_admin());

CREATE POLICY "Allow admin write on member_contact_info" ON member_contact_info
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 3.6 inquiries — public insert (contact form), admin-only read/manage
DROP POLICY IF EXISTS "Allow anyone to insert inquiries" ON inquiries;
DROP POLICY IF EXISTS "Allow admin full access to inquiries" ON inquiries;

CREATE POLICY "Allow anyone to insert inquiries" ON inquiries
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow admin full access to inquiries" ON inquiries
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 3.7 event_rsvps — public insert, admin-only read/manage
CREATE POLICY "Allow public insert to event_rsvps" ON event_rsvps
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow admin full access to event_rsvps" ON event_rsvps
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 3.8 project_applications — public insert, admin-only read/manage
CREATE POLICY "Allow public insert to project_applications" ON project_applications
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow admin full access to project_applications" ON project_applications
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 3.9 newsletter_subscribers — public insert, admin-only read/manage
CREATE POLICY "Allow anyone to insert newsletter_subscribers" ON newsletter_subscribers
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow admin full access to newsletter_subscribers" ON newsletter_subscribers
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- -----------------------------------------------------------------------------
-- 4. SEED INITIAL ADMIN USER
-- -----------------------------------------------------------------------------
-- This only takes effect once a Supabase Auth user with this email exists
-- (i.e. after that person signs up / signs in for the first time on the new
-- project). Update the email below before running, or re-run this block
-- after the admin's first sign-in.
INSERT INTO admins (user_id)
SELECT id FROM auth.users WHERE email = 'bigsyl19@gmail.com'
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- 5. REALTIME
-- -----------------------------------------------------------------------------
alter publication supabase_realtime add table projects;
alter publication supabase_realtime add table events;
alter publication supabase_realtime add table event_rsvps;
alter publication supabase_realtime add table project_applications;
