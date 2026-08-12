-- Keep account profile editing separate from access-control fields.

drop policy if exists "Users can read own profile" on public.user_profiles;
drop policy if exists "Users can read their own profile" on public.user_profiles;
create policy "Users can read their own profile"
on public.user_profiles
for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "Users can insert their own profile" on public.user_profiles;
create policy "Users can insert their own profile"
on public.user_profiles
for insert
to authenticated
with check (
  (select auth.uid()) = id
  and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
  and tier is distinct from 'admin'
  and coalesce(unlocked_modules, '{}'::text[]) = '{}'::text[]
);

drop policy if exists "Users can update their own profile" on public.user_profiles;
create policy "Users can update their own profile"
on public.user_profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

revoke insert, update on public.user_profiles from anon;
revoke update on public.user_profiles from authenticated;
grant update (fullname, phone, syllabus, age, gender, role)
on public.user_profiles
to authenticated;
