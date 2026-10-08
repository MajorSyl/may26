-- Apply together with the website revamp merge (not before): the current
-- production build reads `users` with select('*') as an anonymous visitor,
-- which this change would block.
--
-- Today any anonymous visitor can read every column of public.users,
-- including join dates, PHF status, attendance, contributions, Rotary IDs
-- and PIN-lockout fields. After this, anonymous visitors can only read the
-- columns the public Members page needs. Logged-in members and admins are
-- unaffected (the `authenticated` role keeps its existing access).

revoke select on public.users from anon;
grant select (uid, name, role, committee, club_position, exec_order, avatarurl) on public.users to anon;
