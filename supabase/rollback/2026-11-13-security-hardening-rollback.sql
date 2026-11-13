-- Rollback for the 2026-11-13 security hardening (migration
-- "security_hardening_2026_11_13"). Restores the exact definitions that
-- were live before it. Run as a single transaction in the SQL editor.
-- Nothing here contains a secret value.

begin;

-- 1. users: restore full SELECT for signed-in users, drop the private view.
drop view if exists public.users_private;
grant select on public.users to authenticated;

-- 2. member_contact_info "self" policies: back to the direct users lookup.
drop policy if exists "Allow self select on member_contact_info" on public.member_contact_info;
drop policy if exists "Allow self insert on member_contact_info" on public.member_contact_info;
drop policy if exists "Allow self update on member_contact_info" on public.member_contact_info;
create policy "Allow self select on member_contact_info" on public.member_contact_info as permissive for select to authenticated
  using (exists (select 1 from users u where u.uid = member_contact_info.uid and u.auth_user_id = auth.uid()));
create policy "Allow self insert on member_contact_info" on public.member_contact_info as permissive for insert to authenticated
  with check (exists (select 1 from users u where u.uid = member_contact_info.uid and u.auth_user_id = auth.uid()));
create policy "Allow self update on member_contact_info" on public.member_contact_info as permissive for update to authenticated
  using (exists (select 1 from users u where u.uid = member_contact_info.uid and u.auth_user_id = auth.uid()))
  with check (exists (select 1 from users u where u.uid = member_contact_info.uid and u.auth_user_id = auth.uid()));
drop function if exists public.current_member_uid();

-- 3. review_submission: reviewer taken from the parameter again.
create or replace function public.review_submission(p_submission_id uuid, p_decision text, p_reviewer_id uuid, p_reject_reason text default null::text)
 returns text language plpgsql security definer set search_path to 'public'
as $function$
declare
  v_submission record;
  v_published_id text;
begin
  if not is_reviewer_or_admin() then raise exception 'Forbidden'; end if;
  if p_decision not in ('approved', 'rejected') then raise exception 'Invalid decision'; end if;
  select * into v_submission from submissions where id = p_submission_id;
  if not found then raise exception 'Submission not found'; end if;
  if p_decision = 'approved' then
    if v_submission.kind = 'project' then
      v_published_id := 'proj_sub_' || p_submission_id::text;
      insert into projects (id, title, category, description, year, status, imageUrl)
        values (v_published_id, v_submission.title, coalesce(v_submission.category, 'Community Economic Development'),
                coalesce(v_submission.description, ''), coalesce(v_submission.year, extract(year from now())::int), 'Completed', v_submission.image_url);
    else
      insert into gallery_photos (title, description, category, image_url, submission_id)
        values (v_submission.title, v_submission.description, coalesce(v_submission.category, 'outreach'), v_submission.image_url, p_submission_id)
        returning id::text into v_published_id;
    end if;
  end if;
  update submissions set status = p_decision,
    reject_reason = case when p_decision = 'rejected' then p_reject_reason else null end,
    reviewed_by = p_reviewer_id, reviewed_at = now(), published_id = v_published_id
  where id = p_submission_id;
  return v_published_id;
end;
$function$;

-- 4. Trigger/event functions: restore default EXECUTE.
grant execute on function public.rls_auto_enable() to public;
grant execute on function public.prevent_self_status_change() to public;

-- 5. Storage: public listing of newsletters and site-images.
drop policy if exists "Officers list newsletters" on storage.objects;
drop policy if exists "Officers list site-images" on storage.objects;
create policy "Allow public read on newsletters" on storage.objects as permissive for select to public using (bucket_id = 'newsletters'::text);
create policy "Allow public read on site-images" on storage.objects as permissive for select to public using (bucket_id = 'site-images'::text);

-- 6. Cron jobs: back to unauthenticated calls (only if the edge functions
--    are also rolled back to versions without the auth check).
select cron.alter_job(1, command := '
  select net.http_post(
    url := ''https://kgbwfowgiczhuzbfnzmb.supabase.co/functions/v1/sync-social-feed'',
    headers := ''{"Content-Type": "application/json"}''::jsonb,
    body := ''{}''::jsonb
  );
  ');
select cron.alter_job(2, command := '
  select net.http_post(
    url := ''https://kgbwfowgiczhuzbfnzmb.supabase.co/functions/v1/refresh-social-tokens'',
    headers := ''{"Content-Type": "application/json"}''::jsonb,
    body := ''{}''::jsonb
  );
  ');
-- The vault secret "cron_secret" and public.verify_cron_secret() can stay;
-- they grant nothing on their own.

commit;
