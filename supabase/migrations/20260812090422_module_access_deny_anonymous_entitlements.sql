-- Anonymous Supabase Auth users assume the authenticated Postgres role. Keep
-- entitlement data restricted to permanent signed-in accounts.

drop policy if exists "Accounts can read permitted module entitlements" on public.module_entitlements;

create policy "Accounts can read permitted module entitlements"
on public.module_entitlements
for select
to authenticated
using (
  coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
  and (
    user_id = (select auth.uid())
    or exists (
      select 1
      from public.user_profiles
      where user_profiles.id = (select auth.uid())
        and user_profiles.tier = 'admin'
    )
  )
);
