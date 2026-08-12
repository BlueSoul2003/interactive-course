-- Follow-up hardening from the Supabase security and performance advisors.

create index if not exists module_entitlements_created_by_idx
  on public.module_entitlements (created_by)
  where created_by is not null;

drop policy if exists "Users can read own module entitlements" on public.module_entitlements;
drop policy if exists "Admins can read module entitlements" on public.module_entitlements;
drop policy if exists "Accounts can read permitted module entitlements" on public.module_entitlements;

create policy "Accounts can read permitted module entitlements"
on public.module_entitlements
for select
to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1
    from public.user_profiles
    where user_profiles.id = (select auth.uid())
      and user_profiles.tier = 'admin'
  )
);

-- Public module metadata already has an unrestricted SELECT policy. Keep admin
-- writes separate so the ALL policy does not overlap every public SELECT.
drop policy if exists "Admins can manage modules" on public.modules;
drop policy if exists "Admins can insert modules" on public.modules;
drop policy if exists "Admins can update modules" on public.modules;
drop policy if exists "Admins can delete modules" on public.modules;

create policy "Admins can insert modules"
on public.modules
for insert
to authenticated
with check (
  exists (
    select 1 from public.user_profiles
    where user_profiles.id = (select auth.uid())
      and user_profiles.tier = 'admin'
  )
);

create policy "Admins can update modules"
on public.modules
for update
to authenticated
using (
  exists (
    select 1 from public.user_profiles
    where user_profiles.id = (select auth.uid())
      and user_profiles.tier = 'admin'
  )
)
with check (
  exists (
    select 1 from public.user_profiles
    where user_profiles.id = (select auth.uid())
      and user_profiles.tier = 'admin'
  )
);

create policy "Admins can delete modules"
on public.modules
for delete
to authenticated
using (
  exists (
    select 1 from public.user_profiles
    where user_profiles.id = (select auth.uid())
      and user_profiles.tier = 'admin'
  )
);
