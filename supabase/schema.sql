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
--   4. users                   - public member directory profiles (adds
--                                 auth_user_id linking a roster row to a
--                                 Supabase Auth account, and a self-editable
--                                 bio column)
--   5. member_contact_info     - sensitive member contact fields (admin +
--                                 the linked member can read/write their own)
--   6. inquiries                - contact form submissions
--   7. event_rsvps              - public RSVPs to events
--   8. project_applications     - public volunteer applications to projects
--   9. newsletter_subscribers   - homepage footer newsletter signups
--  10. submissions              - member-submitted projects/photos awaiting
--                                 admin approval before they go live
--  11. gallery_photos            - the Club Gallery's backing table; an
--                                 approved kind='photo' submission is
--                                 copied here by an admin action
--
-- Known design note: there is no dedicated "site_settings" table. The app
-- persists global site copy (hero text, mission statements, layout config,
-- etc.) as a single disguised row in `projects` with id = 'settings_site_config'
-- and the settings JSON stuffed into the `description` column
-- (see getSiteSettings/updateSiteSettings in src/supabase-service.ts). This
-- schema reproduces that existing behavior as-is; it has not been redesigned
-- as part of this migration.
--
-- Member portal / approvals design note: members authenticate with the same
-- Supabase Auth users as admins (email/password), linked to their roster row
-- via users.auth_user_id. A member can update their own name/bio/avatarurl
-- and their own member_contact_info row; every other roster field (role,
-- committee, attendance, contributions, Paul Harris status, classification,
-- joined date) stays admin-only, enforced by a trigger (not just RLS) so a
-- client-side bug can't let a member self-promote. Member project/photo
-- submissions land in `submissions` with status='pending' and are never
-- visible to anyone but the submitter and admins; approving one is an admin
-- action that copies the content into `projects` (kind='project') or is
-- surfaced in the Club Gallery (kind='photo') — public visitors never see
-- pending/rejected rows because there is no public RLS policy on this table
-- at all.
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

-- 1.4 Users — public member directory (no sensitive columns). rotary_id is
-- the member-facing login identifier (e.g. RCFS-001), auto-assigned by the
-- assign_rotary_id trigger (section 2) -- never set it manually. The PIN
-- itself is never stored here; it *is* the Supabase Auth password on
-- auth_user_id, so Supabase's own bcrypt hashing covers it. failed_pin_attempts
-- / pin_locked_until back the per-Rotary-ID login lockout (section 3.4 has
-- the column-privilege REVOKE that keeps these unreadable by anyone but the
-- service role).
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
  bio TEXT,
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  rotary_id TEXT UNIQUE,
  failed_pin_attempts INTEGER NOT NULL DEFAULT 0,
  pin_locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS rotary_id TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_pin_attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS pin_locked_until TIMESTAMP WITH TIME ZONE;

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

-- 1.10 Submissions — member-submitted projects/photos awaiting admin approval.
-- Never publicly readable; a member sees only their own rows, admins see all.
-- Approval is an admin action performed in application code that copies the
-- submission's content into `projects` (kind='project') or makes it appear
-- in the Club Gallery (kind='photo') and stamps `published_id` here.
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submitter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('project', 'photo')),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  year INTEGER,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reject_reason TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  published_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- 1.11 Gallery Photos — the Club Gallery's actual backing table. Public
-- read (anyone can browse the gallery); admin-only write. Approving a
-- kind='photo' submission is an admin action that inserts a row here.
CREATE TABLE IF NOT EXISTS gallery_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('meetings', 'anniversary', 'outreach', 'rotaract')),
  image_url TEXT NOT NULL,
  taken_date TEXT,
  location TEXT,
  submission_id UUID REFERENCES submissions(id) ON DELETE SET NULL,
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

-- protect_admin_only_user_fields() — trigger function that guards the
-- roster fields a member must never be able to change on their own row
-- (role, committee, attendance/contribution figures, tasks, classification,
-- Paul Harris status, joined date, and the auth_user_id link itself). RLS
-- alone can only grant/deny access to a whole row, not individual columns,
-- so this is enforced with a BEFORE UPDATE trigger instead: for any update
-- performed by a non-admin, the protected columns are silently forced back
-- to their previous values. A member can still update their own name, bio,
-- and avatarurl. This is defense-in-depth — even if a client-side bug sent
-- a role change, the database would refuse to apply it.
CREATE OR REPLACE FUNCTION protect_admin_only_user_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    NEW.role := OLD.role;
    NEW.committee := OLD.committee;
    NEW.attendancerate := OLD.attendancerate;
    NEW.contributiongoals := OLD.contributiongoals;
    NEW.contributedamount := OLD.contributedamount;
    NEW.tasks := OLD.tasks;
    NEW.classification := OLD.classification;
    NEW.ispaulharrisfellow := OLD.ispaulharrisfellow;
    NEW.paulharrislevel := OLD.paulharrislevel;
    NEW.joineddate := OLD.joineddate;
    NEW.auth_user_id := OLD.auth_user_id;
    NEW.rotary_id := OLD.rotary_id;
    NEW.failed_pin_attempts := OLD.failed_pin_attempts;
    NEW.pin_locked_until := OLD.pin_locked_until;
  END IF;
  RETURN NEW;
END;
$$;

-- assign_rotary_id() — assigns the next sequential RCFS-NNN Rotary ID on
-- insert whenever the caller doesn't supply one, so every path that creates
-- a users row (the roster seed button, an admin adding a member one at a
-- time, or any future path) gets a Rotary ID without the client having to
-- compute it. Simple MAX+1 rather than a real sequence: this table only
-- ever gets inserted into by a single admin at a time (sequential seed loop
-- or a form submission), so the tiny race window is an acceptable tradeoff
-- against the complexity of a dedicated sequence.
CREATE OR REPLACE FUNCTION assign_rotary_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_num INTEGER;
BEGIN
  IF NEW.rotary_id IS NULL THEN
    SELECT COALESCE(MAX(SUBSTRING(rotary_id FROM 6)::int), 0) + 1
    INTO next_num
    FROM users
    WHERE rotary_id ~ '^RCFS-\d+$';

    NEW.rotary_id := 'RCFS-' || LPAD(next_num::text, 3, '0');
  END IF;
  RETURN NEW;
END;
$$;

-- prevent_self_admin_removal() — blocks an admin from deleting their own
-- `admins` row (via the app's "demote" action or otherwise), so an admin
-- can never accidentally lock themselves out of the admin dashboard.
CREATE OR REPLACE FUNCTION prevent_self_admin_removal()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.user_id = auth.uid() THEN
    RAISE EXCEPTION 'Admins cannot remove their own admin privileges.';
  END IF;
  RETURN OLD;
END;
$$;

-- All three trigger functions above are only ever meant to fire as
-- triggers, not be called directly as an RPC endpoint (PostgREST exposes
-- every function in the public schema by default). Revoking EXECUTE
-- doesn't affect trigger firing, since that isn't gated by the invoking
-- role's function privileges. Must revoke from PUBLIC, not just
-- anon/authenticated — CREATE FUNCTION grants EXECUTE to PUBLIC by default,
-- and anon/authenticated inherit through PUBLIC, so revoking from those
-- roles alone leaves them able to execute it via the inherited PUBLIC grant.
REVOKE EXECUTE ON FUNCTION protect_admin_only_user_fields() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION prevent_self_admin_removal() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION assign_rotary_id() FROM PUBLIC;

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
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- 3.1 admins — completely private; no public SELECT policy exists.
-- Only the SECURITY DEFINER is_admin() function can read it.
CREATE POLICY "Allow admin read and write on admins" ON admins
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP TRIGGER IF EXISTS trg_prevent_self_admin_removal ON admins;
CREATE TRIGGER trg_prevent_self_admin_removal
  BEFORE DELETE ON admins
  FOR EACH ROW EXECUTE FUNCTION prevent_self_admin_removal();

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

-- Members may update their own roster row (name/bio/avatarurl only — every
-- other column is force-reverted by trg_protect_admin_only_user_fields
-- below regardless of what the client sends). No self-INSERT/DELETE: only
-- an admin creates or removes a roster row.
DROP POLICY IF EXISTS "Allow self update on users" ON users;
CREATE POLICY "Allow self update on users" ON users
  FOR UPDATE TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

DROP TRIGGER IF EXISTS trg_protect_admin_only_user_fields ON users;
CREATE TRIGGER trg_protect_admin_only_user_fields
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION protect_admin_only_user_fields();

DROP TRIGGER IF EXISTS trg_assign_rotary_id ON users;
CREATE TRIGGER trg_assign_rotary_id
  BEFORE INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION assign_rotary_id();

-- REVOKE/GRANT note: table-level privileges are a prerequisite to RLS —
-- without an UPDATE grant here, no policy above (including the admin one)
-- can ever actually update a row against a real Supabase project.
REVOKE ALL PRIVILEGES ON users FROM public, anon, authenticated;
GRANT SELECT ON users TO public, anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON users TO authenticated;

-- Lockout state must never be readable by anyone but the service role (used
-- by the member-login Edge Function) and admins via direct table access --
-- exposing the attempt counter/lockout time to a caller trying to brute
-- force a PIN would leak useful timing/state information.
REVOKE SELECT (failed_pin_attempts, pin_locked_until) ON users FROM public, anon, authenticated;

-- 3.5 member_contact_info — admins can read/write everything; a member can
-- read and write only their own contact info row (matched via users.uid ->
-- users.auth_user_id = auth.uid(), since this table's PK is the roster uid,
-- not an auth id)
CREATE POLICY "Allow admin select on member_contact_info" ON member_contact_info
  FOR SELECT TO authenticated USING (is_admin());

CREATE POLICY "Allow admin write on member_contact_info" ON member_contact_info
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Allow self select on member_contact_info" ON member_contact_info;
CREATE POLICY "Allow self select on member_contact_info" ON member_contact_info
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users u WHERE u.uid = member_contact_info.uid AND u.auth_user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Allow self insert on member_contact_info" ON member_contact_info;
CREATE POLICY "Allow self insert on member_contact_info" ON member_contact_info
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM users u WHERE u.uid = member_contact_info.uid AND u.auth_user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Allow self update on member_contact_info" ON member_contact_info;
CREATE POLICY "Allow self update on member_contact_info" ON member_contact_info
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users u WHERE u.uid = member_contact_info.uid AND u.auth_user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM users u WHERE u.uid = member_contact_info.uid AND u.auth_user_id = auth.uid()
  ));

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

-- 3.10 submissions — no public policy exists at all (visitors can never see
-- pending or rejected submissions, or any submission belonging to another
-- member). A member may insert/select/update only their own rows, and only
-- while status is 'pending' — so once an admin approves or rejects a row,
-- the submitting member can still see the outcome (SELECT has no status
-- restriction) but can no longer edit it out from under the admin's
-- decision. Admins have full access via the existing is_admin() pattern.
DROP POLICY IF EXISTS "Allow members to insert own pending submissions" ON submissions;
CREATE POLICY "Allow members to insert own pending submissions" ON submissions
  FOR INSERT TO authenticated
  WITH CHECK (submitter_id = auth.uid() AND status = 'pending');

DROP POLICY IF EXISTS "Allow members to select own submissions" ON submissions;
CREATE POLICY "Allow members to select own submissions" ON submissions
  FOR SELECT TO authenticated
  USING (submitter_id = auth.uid());

DROP POLICY IF EXISTS "Allow members to update own pending submissions" ON submissions;
CREATE POLICY "Allow members to update own pending submissions" ON submissions
  FOR UPDATE TO authenticated
  USING (submitter_id = auth.uid() AND status = 'pending')
  WITH CHECK (submitter_id = auth.uid() AND status = 'pending');

DROP POLICY IF EXISTS "Allow admin full access to submissions" ON submissions;
CREATE POLICY "Allow admin full access to submissions" ON submissions
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 3.11 gallery_photos — public read, admin-only write
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anyone to read gallery_photos" ON gallery_photos;
CREATE POLICY "Allow anyone to read gallery_photos" ON gallery_photos
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow admin full access to gallery_photos" ON gallery_photos;
CREATE POLICY "Allow admin full access to gallery_photos" ON gallery_photos
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
alter publication supabase_realtime add table submissions;
alter publication supabase_realtime add table gallery_photos;

-- -----------------------------------------------------------------------------
-- 6. STORAGE — member-uploads bucket
-- -----------------------------------------------------------------------------
-- Holds member profile photos and submission photos. Bucket is public=true,
-- so approved content and profile photos render on the public site via a
-- direct object URL without any RLS check — Supabase serves public bucket
-- URLs unconditionally, so no SELECT policy is added here (one was tried
-- and removed: it only enabled authenticated *listing* of every file in the
-- bucket, which the app never needs and the Supabase security linter flags).
-- A member may only write inside a folder named after their own auth uid
-- (member-uploads/<auth.uid()>/...), enforced by checking the first path
-- segment of the object name; admins have full access.
INSERT INTO storage.buckets (id, name, public)
VALUES ('member-uploads', 'member-uploads', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Allow public read on member-uploads" ON storage.objects;

DROP POLICY IF EXISTS "Allow members to upload to their own folder" ON storage.objects;
CREATE POLICY "Allow members to upload to their own folder" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'member-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Allow members to update their own files" ON storage.objects;
CREATE POLICY "Allow members to update their own files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'member-uploads' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'member-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Allow members to delete their own files" ON storage.objects;
CREATE POLICY "Allow members to delete their own files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'member-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Allow admin full access to member-uploads" ON storage.objects;
CREATE POLICY "Allow admin full access to member-uploads" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'member-uploads' AND is_admin())
  WITH CHECK (bucket_id = 'member-uploads' AND is_admin());
