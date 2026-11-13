-- RCFS security hardening, step A (non-breaking).
-- HOW TO RUN: Supabase dashboard -> SQL Editor -> New query -> paste this
-- whole file -> Run. Rollback: supabase/rollback/2026-11-13-security-hardening-rollback.sql
-- Contains no secret values (the cron secret is generated inside the database).

begin;

-- 1. Helper: the member uid linked to the signed-in account.
create or replace function public.current_member_uid()
returns text language sql stable security definer set search_path = public
as $$ select uid from public.users where auth_user_id = auth.uid() limit 1 $$;
revoke all on function public.current_member_uid() from public, anon;
grant execute on function public.current_member_uid() to authenticated;

drop policy if exists "Allow self select on member_contact_info" on public.member_contact_info;
drop policy if exists "Allow self insert on member_contact_info" on public.member_contact_info;
drop policy if exists "Allow self update on member_contact_info" on public.member_contact_info;
create policy "Allow self select on member_contact_info" on public.member_contact_info
  for select to authenticated using (uid = public.current_member_uid());
create policy "Allow self insert on member_contact_info" on public.member_contact_info
  for insert to authenticated with check (uid = public.current_member_uid());
create policy "Allow self update on member_contact_info" on public.member_contact_info
  for update to authenticated using (uid = public.current_member_uid()) with check (uid = public.current_member_uid());

-- 2. Full member records: officers see all rows, a member only their own.
create or replace view public.users_private with (security_barrier = true) as
  select u.* from public.users u
  where public.is_reviewer_or_admin()
     or (u.auth_user_id is not null and u.auth_user_id = auth.uid());
comment on view public.users_private is
  'Full member records: officers see all rows, a member sees only their own. Signed-in users otherwise only get the public directory columns of public.users.';
revoke all on public.users_private from public, anon, authenticated;
grant select on public.users_private to authenticated;

-- 3. review_submission records the real caller as reviewer.
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
    reviewed_by = auth.uid(), reviewed_at = now(), published_id = v_published_id
  where id = p_submission_id;
  return v_published_id;
end;
$function$;

-- 4. Trigger functions are not callable over the API.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
revoke execute on function public.prevent_self_status_change() from public, anon, authenticated;

-- 5. Storage: files stay public by link; only officers can list folders.
drop policy if exists "Allow public read on newsletters" on storage.objects;
drop policy if exists "Allow public read on site-images" on storage.objects;
create policy "Officers list newsletters" on storage.objects for select to authenticated
  using (bucket_id = 'newsletters' and public.is_media_officer());
create policy "Officers list site-images" on storage.objects for select to authenticated
  using (bucket_id = 'site-images' and public.is_media_officer());

-- 6. Scheduled jobs authenticate with a secret generated and kept in Vault.
do $$
begin
  if not exists (select 1 from vault.secrets where name = 'cron_secret') then
    perform vault.create_secret(encode(extensions.gen_random_bytes(32), 'hex'), 'cron_secret', 'pg_cron -> edge function shared secret');
  end if;
end $$;

create or replace function public.verify_cron_secret(p_secret text)
returns boolean language sql stable security definer set search_path = ''
as $$
  select coalesce(length(p_secret) >= 32 and exists (
    select 1 from vault.decrypted_secrets s where s.name = 'cron_secret' and s.decrypted_secret = p_secret
  ), false)
$$;
revoke all on function public.verify_cron_secret(text) from public, anon, authenticated;
grant execute on function public.verify_cron_secret(text) to service_role;

select cron.alter_job(1, command := $cmd$
  select net.http_post(
    url := 'https://kgbwfowgiczhuzbfnzmb.supabase.co/functions/v1/sync-social-feed',
    headers := jsonb_build_object('Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')),
    body := '{}'::jsonb
  );
$cmd$);
select cron.alter_job(2, command := $cmd$
  select net.http_post(
    url := 'https://kgbwfowgiczhuzbfnzmb.supabase.co/functions/v1/refresh-social-tokens',
    headers := jsonb_build_object('Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')),
    body := '{}'::jsonb
  );
$cmd$);

commit;
