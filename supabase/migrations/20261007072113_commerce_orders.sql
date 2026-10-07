-- Additive commerce boundary. No catalog prices, accounts or historical grants are seeded.
create schema if not exists commerce_private;
revoke all on schema commerce_private from public;
grant usage on schema commerce_private to anon, authenticated;

create table public.course_topics (
 id text primary key check(id ~ '^[a-z0-9][a-z0-9-]{1,99}$'),
 title text not null check(length(btrim(title)) between 1 and 180),
 is_active boolean not null default false
);
create table public.course_topic_modules (
 module_id text primary key references public.modules(id),
 topic_id text not null references public.course_topics(id),
 edition text not null check(edition in ('student','teacher'))
);
create index course_topic_modules_topic_idx on public.course_topic_modules(topic_id);
create table public.course_offers (
 id uuid primary key default gen_random_uuid(),
 topic_id text not null references public.course_topics(id),
 edition text not null check(edition in ('student','teacher')),
 term_months integer not null check(term_months in (1,3,6,12)),
 amount_sen integer not null check(amount_sen between 1 and 100000000),
 currency text not null default 'MYR' check(currency='MYR'),
 is_active boolean not null default false
);
create index course_offers_topic_idx on public.course_offers(topic_id);
create table public.course_orders (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id),
 request_id uuid not null,
 offer_id uuid not null references public.course_offers(id),
 topic_id text not null references public.course_topics(id),
 topic_title text not null,
 edition text not null check(edition in ('student','teacher')),
 term_months integer not null check(term_months in (1,3,6,12)),
 amount_sen integer not null check(amount_sen>0),
 currency text not null check(currency='MYR'),
 status text not null default 'pending' check(status in ('pending','paid','revoked')),
 created_at timestamptz not null default now(),
 confirmed_at timestamptz,
 confirmed_by uuid references auth.users(id),
 confirmation_key uuid unique,
 payment_reference text unique,
 starts_at timestamptz,
 expires_at timestamptz,
 revoked_at timestamptz,
 revoked_by uuid references auth.users(id),
 revocation_reason text,
 unique(user_id,request_id),
 check((status='pending' and confirmed_at is null and starts_at is null and expires_at is null and confirmation_key is null and payment_reference is null and confirmed_by is null)
    or (status in ('paid','revoked') and confirmed_at is not null and confirmed_by is not null and confirmation_key is not null and payment_reference is not null and starts_at is not null and expires_at is not null and expires_at>starts_at)),
 check((status='revoked' and revoked_at is not null and revoked_by is not null and revocation_reason is not null and length(btrim(revocation_reason))>0) or (status<>'revoked' and revoked_at is null and revoked_by is null and revocation_reason is null))
);
create index course_orders_user_topic_idx on public.course_orders(user_id,topic_id,edition,status,expires_at);
create index course_orders_offer_idx on public.course_orders(offer_id);
create index course_orders_topic_idx on public.course_orders(topic_id);
create index course_orders_reviewer_idx on public.course_orders(confirmed_by);
create index course_orders_revoker_idx on public.course_orders(revoked_by);
alter table public.course_topics enable row level security;
alter table public.course_topic_modules enable row level security;
alter table public.course_offers enable row level security;
alter table public.course_orders enable row level security;
revoke all on public.course_topics,public.course_topic_modules,public.course_offers,public.course_orders from anon,authenticated;
grant select on public.course_topics,public.course_offers to anon,authenticated;
grant select on public.course_orders to authenticated;
create policy active_topics on public.course_topics for select to anon,authenticated using(is_active);
create policy active_offers on public.course_offers for select to anon,authenticated using(is_active and exists(select 1 from public.course_topics t where t.id=topic_id and t.is_active));
create policy own_or_admin_orders on public.course_orders for select to authenticated using (
 not coalesce((auth.jwt()->>'is_anonymous')::boolean,false)
 and (user_id=auth.uid() or exists(select 1 from public.user_profiles p where p.id=auth.uid() and p.tier='admin'))
);

create function commerce_private.member_id() returns uuid language plpgsql stable set search_path='' as $$
begin
 if auth.uid() is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then
  raise exception 'Sign in with a permanent account' using errcode='42501';
 end if;
 if not exists(select 1 from public.user_profiles where id=auth.uid()) then
  raise exception 'Account profile required' using errcode='42501';
 end if;
 return auth.uid();
end $$;
create function commerce_private.admin_id() returns uuid language plpgsql stable set search_path='' as $$
declare actor uuid:=commerce_private.member_id();
begin
 if not exists(select 1 from public.user_profiles where id=actor and tier='admin') then
  raise exception 'Administrator required' using errcode='42501';
 end if;
 return actor;
end $$;
create function commerce_private.require_ready(p_topic text,p_edition text) returns void language plpgsql stable set search_path='' as $$
begin
 if not exists(select 1 from public.course_topics where id=p_topic and is_active)
 or not exists(select 1 from public.course_topic_modules where topic_id=p_topic and edition='student')
 or (p_edition='teacher' and not exists(select 1 from public.course_topic_modules where topic_id=p_topic and edition='teacher'))
 or exists(select 1 from public.course_topic_modules tm join public.modules m on m.id=tm.module_id
   left join public.module_packages mp on mp.module_id=m.id and mp.is_active
   left join storage.buckets b on b.id=mp.bucket_id
   left join storage.objects obj on obj.bucket_id=mp.bucket_id and obj.name=mp.storage_path
   where tm.topic_id=p_topic and (tm.edition='student' or p_edition='teacher')
   and (m.access_mode<>'protected' or not coalesce(m.is_active,false) or mp.module_id is null or b.id is null or b.public or obj.id is null)) then
  raise exception 'Course package is not ready for sale' using errcode='22023';
 end if;
end $$;

create function commerce_private.create_order(p_offer_id uuid,p_request_id uuid) returns public.course_orders
language plpgsql security definer set search_path='' as $$
declare actor uuid:=commerce_private.member_id(); offer public.course_offers%rowtype; result public.course_orders%rowtype; title_snapshot text;
begin
 if p_request_id is null then raise exception 'Request ID required' using errcode='22023'; end if;
 select * into result from public.course_orders where user_id=actor and request_id=p_request_id;
 if found then
  if result.offer_id is distinct from p_offer_id then raise exception 'Request ID already used for another offer' using errcode='22023'; end if;
  return result;
 end if;
 select * into offer from public.course_offers where id=p_offer_id and is_active for share;
 if not found then raise exception 'Offer unavailable' using errcode='22023'; end if;
 perform commerce_private.require_ready(offer.topic_id,offer.edition);
 select title into title_snapshot from public.course_topics where id=offer.topic_id;
 insert into public.course_orders(user_id,request_id,offer_id,topic_id,topic_title,edition,term_months,amount_sen,currency)
 values(actor,p_request_id,offer.id,offer.topic_id,title_snapshot,offer.edition,offer.term_months,offer.amount_sen,offer.currency)
 on conflict(user_id,request_id) do nothing returning * into result;
 if not found then select * into result from public.course_orders where user_id=actor and request_id=p_request_id; end if;
 if result.offer_id is distinct from p_offer_id then raise exception 'Request ID already used for another offer' using errcode='22023'; end if;
 return result;
end $$;

create function commerce_private.confirm_order(p_order_id uuid,p_confirmation_key uuid,p_payment_reference text,p_received_sen integer)
returns public.course_orders language plpgsql security definer set search_path='' as $$
declare actor uuid:=commerce_private.admin_id(); result public.course_orders%rowtype; ref text:=upper(btrim(p_payment_reference)); start_time timestamptz;
begin
 if p_confirmation_key is null or ref is null or length(ref) not between 3 and 120 then raise exception 'Confirmation key and transaction reference required' using errcode='22023'; end if;
 select * into result from public.course_orders where id=p_order_id for update;
 if not found then raise exception 'Order not found' using errcode='22023'; end if;
 if p_received_sen is distinct from result.amount_sen then raise exception 'Received amount does not match order' using errcode='22023'; end if;
 if result.status='paid' then
  if result.confirmation_key=p_confirmation_key and result.payment_reference=ref then return result; end if;
  raise exception 'Order already confirmed with different evidence' using errcode='22023';
 end if;
 if result.status<>'pending' then raise exception 'Order cannot be confirmed' using errcode='22023'; end if;
 perform commerce_private.require_ready(result.topic_id,result.edition);
 -- Serialize fulfilment per buyer/topic/edition, including confirmations of different orders.
 perform pg_advisory_xact_lock(hashtextextended(result.user_id::text||':'||result.topic_id||':'||result.edition,0));
 select greatest(now(),coalesce(max(expires_at),now())) into start_time
 from public.course_orders where user_id=result.user_id and topic_id=result.topic_id
 and edition=result.edition and status='paid' and expires_at>now();
 update public.course_orders set status='paid',confirmed_at=now(),confirmed_by=actor,
 confirmation_key=p_confirmation_key,payment_reference=ref,starts_at=start_time,
 expires_at=((start_time at time zone 'Asia/Kuala_Lumpur')+make_interval(months=>result.term_months)) at time zone 'Asia/Kuala_Lumpur'
 where id=result.id returning * into result;
 return result;
end $$;

create function commerce_private.revoke_order(p_order_id uuid,p_reason text) returns public.course_orders
language plpgsql security definer set search_path='' as $$
declare actor uuid:=commerce_private.admin_id(); result public.course_orders%rowtype;
begin
 if p_reason is null or length(btrim(p_reason)) not between 3 and 500 then raise exception 'Revocation reason required' using errcode='22023'; end if;
 select * into result from public.course_orders where id=p_order_id for update;
 if not found then raise exception 'Order not found' using errcode='22023'; end if;
 if result.status='revoked' then return result; end if;
 if result.status<>'paid' then raise exception 'Only paid orders can be revoked' using errcode='22023'; end if;
 update public.course_orders set status='revoked',revoked_at=now(),revoked_by=actor,revocation_reason=btrim(p_reason)
 where id=result.id returning * into result;
 return result;
end $$;

-- NULL means an existing non-commerce course: its original policy still applies.
create function commerce_private.module_access(p_module_id text) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare mapping public.course_topic_modules%rowtype; actor uuid:=auth.uid(); level text; reason text:='not_entitled';
begin
 select * into mapping from public.course_topic_modules where module_id=p_module_id;
 if not found then return null; end if;
 if actor is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then reason:='authentication_required';
 elsif exists(select 1 from public.user_profiles where id=actor and tier='admin') then level:='admin';reason:='admin';
 elsif not exists(select 1 from public.modules where id=p_module_id and is_active and access_mode='protected') then reason:='module_unavailable';
 else
  select edition into level from public.course_orders where user_id=actor and topic_id=mapping.topic_id and status='paid'
   and starts_at<=now() and expires_at>now() and (edition='teacher' or mapping.edition='student')
   order by case edition when 'teacher' then 0 else 1 end limit 1;
  if found then reason:='paid_order'; end if;
 end if;
 return jsonb_build_object('allowed',level is not null,'reason',reason,'effective_role',coalesce(level,'student'),
  'module_id',p_module_id,'access_mode','protected','matched_grant_type',case when level is not null then 'topic' end,
  'matched_grant_target',case when level is not null then mapping.topic_id end);
end $$;

create function public.create_course_order(p_offer_id uuid,p_request_id uuid) returns public.course_orders
language sql security invoker set search_path='' as $$ select commerce_private.create_order(p_offer_id,p_request_id) $$;
create function public.confirm_course_order(p_order_id uuid,p_confirmation_key uuid,p_payment_reference text,p_received_sen integer) returns public.course_orders
language sql security invoker set search_path='' as $$ select commerce_private.confirm_order(p_order_id,p_confirmation_key,p_payment_reference,p_received_sen) $$;
create function public.revoke_course_order(p_order_id uuid,p_reason text) returns public.course_orders
language sql security invoker set search_path='' as $$ select commerce_private.revoke_order(p_order_id,p_reason) $$;
create function public.commercial_module_access(p_module_id text) returns jsonb
language sql security invoker set search_path='' as $$ select commerce_private.module_access(p_module_id) $$;

revoke all on all functions in schema commerce_private from public,anon,authenticated;
grant execute on function commerce_private.create_order(uuid,uuid),commerce_private.confirm_order(uuid,uuid,text,integer),commerce_private.revoke_order(uuid,text) to authenticated;
grant execute on function commerce_private.module_access(text) to anon,authenticated;
revoke all on function public.create_course_order(uuid,uuid),public.confirm_course_order(uuid,uuid,text,integer),public.revoke_course_order(uuid,text),public.commercial_module_access(text) from public,anon,authenticated;
grant execute on function public.create_course_order(uuid,uuid),public.confirm_course_order(uuid,uuid,text,integer),public.revoke_course_order(uuid,text) to authenticated;
grant execute on function public.commercial_module_access(text) to anon,authenticated;

-- Reuse the established decision API; mapped topics never fall back to legacy grants.
create or replace function public.can_launch_module(p_module_id text)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  requested_module public.modules%rowtype;
  current_user_id uuid := (select auth.uid());
  current_tier text;
  current_legacy_unlocks text[] := '{}'::text[];
  matched_grant record;
  legacy_type text;
  legacy_target text;
  commercial_decision jsonb;
begin
  if p_module_id is null or length(btrim(p_module_id)) = 0 then
    return jsonb_build_object(
      'allowed', false,
      'reason', 'invalid_module_id',
      'effective_role', 'guest',
      'module_id', p_module_id,
      'access_mode', null,
      'matched_grant_type', null,
      'matched_grant_target', null
    );
  end if;

  select modules.*
  into requested_module
  from public.modules
  where modules.id = p_module_id
    and coalesce(modules.is_active, true)
  limit 1;

  if not found then
    return jsonb_build_object(
      'allowed', false,
      'reason', 'module_not_found',
      'effective_role', 'guest',
      'module_id', p_module_id,
      'access_mode', null,
      'matched_grant_type', null,
      'matched_grant_target', null
    );
  end if;

  commercial_decision := public.commercial_module_access(p_module_id);
  if commercial_decision is not null then return commercial_decision; end if;

  if requested_module.access_mode in ('public', 'demo') then
    return jsonb_build_object(
      'allowed', true,
      'reason', requested_module.access_mode,
      'effective_role', 'public',
      'module_id', requested_module.id,
      'access_mode', requested_module.access_mode,
      'matched_grant_type', null,
      'matched_grant_target', null
    );
  end if;

  if current_user_id is null then
    return jsonb_build_object(
      'allowed', false,
      'reason', 'authentication_required',
      'effective_role', 'guest',
      'module_id', requested_module.id,
      'access_mode', requested_module.access_mode,
      'matched_grant_type', null,
      'matched_grant_target', null
    );
  end if;

  if coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) then
    return jsonb_build_object(
      'allowed', false,
      'reason', 'anonymous_account_not_allowed',
      'effective_role', 'guest',
      'module_id', requested_module.id,
      'access_mode', requested_module.access_mode,
      'matched_grant_type', null,
      'matched_grant_target', null
    );
  end if;

  select profiles.tier, coalesce(profiles.unlocked_modules, '{}'::text[])
  into current_tier, current_legacy_unlocks
  from public.user_profiles as profiles
  where profiles.id = current_user_id
  limit 1;

  if not found then
    return jsonb_build_object(
      'allowed', false,
      'reason', 'profile_required',
      'effective_role', 'guest',
      'module_id', requested_module.id,
      'access_mode', requested_module.access_mode,
      'matched_grant_type', null,
      'matched_grant_target', null
    );
  end if;

  if current_tier = 'admin' then
    return jsonb_build_object(
      'allowed', true,
      'reason', 'admin',
      'effective_role', 'admin',
      'module_id', requested_module.id,
      'access_mode', requested_module.access_mode,
      'matched_grant_type', 'admin',
      'matched_grant_target', '*'
    );
  end if;

  select entitlements.grant_type, entitlements.target_id, entitlements.access_level
  into matched_grant
  from public.module_entitlements as entitlements
  where entitlements.user_id = current_user_id
    and entitlements.revoked_at is null
    and entitlements.starts_at <= now()
    and (entitlements.expires_at is null or entitlements.expires_at > now())
    and (
      (entitlements.grant_type = 'module' and entitlements.target_id = requested_module.id)
      or (entitlements.grant_type = 'bundle' and entitlements.target_id = requested_module.bundle)
      or (entitlements.grant_type = 'syllabus' and entitlements.target_id = requested_module.syllabus)
    )
  order by
    case entitlements.access_level when 'teacher' then 0 else 1 end,
    case entitlements.grant_type when 'module' then 0 when 'bundle' then 1 else 2 end
  limit 1;

  if found then
    return jsonb_build_object(
      'allowed', true,
      'reason', 'entitlement',
      'effective_role', matched_grant.access_level,
      'module_id', requested_module.id,
      'access_mode', requested_module.access_mode,
      'matched_grant_type', matched_grant.grant_type,
      'matched_grant_target', matched_grant.target_id
    );
  end if;

  -- Transitional compatibility for PINs created before module_entitlements.
  if '*' = any(current_legacy_unlocks) then
    legacy_type := 'all';
    legacy_target := '*';
  elsif requested_module.id = any(current_legacy_unlocks) then
    legacy_type := 'module';
    legacy_target := requested_module.id;
  elsif requested_module.bundle = any(current_legacy_unlocks) then
    legacy_type := 'bundle';
    legacy_target := requested_module.bundle;
  elsif requested_module.syllabus = any(current_legacy_unlocks) then
    legacy_type := 'syllabus';
    legacy_target := requested_module.syllabus;
  elsif requested_module.id = 'spm-en-social-media'
    and 'Social_Media_Masterclass' = any(current_legacy_unlocks) then
    legacy_type := 'module';
    legacy_target := 'Social_Media_Masterclass';
  end if;

  if legacy_type is not null then
    return jsonb_build_object(
      'allowed', true,
      'reason', 'legacy_entitlement',
      'effective_role', 'student',
      'module_id', requested_module.id,
      'access_mode', requested_module.access_mode,
      'matched_grant_type', legacy_type,
      'matched_grant_target', legacy_target
    );
  end if;

  return jsonb_build_object(
    'allowed', false,
    'reason', 'not_entitled',
    'effective_role', 'student',
    'module_id', requested_module.id,
    'access_mode', requested_module.access_mode,
    'matched_grant_type', null,
    'matched_grant_target', null
  );
end;
$$;
