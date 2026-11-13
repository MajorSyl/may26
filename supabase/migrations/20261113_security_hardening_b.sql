-- RCFS security hardening, step B (applied 13 Nov 2026, after the website
-- switched full member reads to public.users_private).
-- Signed-in accounts get the same public directory columns of public.users
-- as anonymous visitors; full records come only through users_private
-- (officers: all rows, a member: own row).
-- Rollback: grant select on public.users to authenticated;
begin;
revoke select on public.users from authenticated;
grant select (uid, name, role, committee, club_position, exec_order, avatarurl) on public.users to authenticated;
commit;
