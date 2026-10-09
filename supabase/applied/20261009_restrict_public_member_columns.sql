-- Applied to production on 2026-10-09, after the website revamp went live.
--
-- Anonymous visitors could read every column of public.users (join dates,
-- PHF status, attendance, contributions, Rotary IDs, PIN-lockout fields).
-- Access came from two grants -- to anon and to PUBLIC -- so both are
-- revoked. Anonymous visitors keep only the columns the public Members page
-- needs; logged-in members, admins and the service role keep full access.

revoke select on public.users from anon;
revoke select on public.users from public;
grant select on public.users to authenticated, service_role;
grant select (uid, name, role, committee, club_position, exec_order, avatarurl) on public.users to anon;
