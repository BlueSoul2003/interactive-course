-- Preserve existing snapshots. Daily history begins with new saves, not invented backfill.
create schema if not exists learning_private;
revoke all on schema learning_private from public;
grant usage on schema learning_private to authenticated;
create table public.learning_activity (
 user_id uuid not null references auth.users(id) on delete cascade,
 module_id text not null,
 activity_date date not null,
 last_saved_at timestamptz not null,
 summary jsonb not null,
 primary key(user_id,module_id,activity_date)
);
alter table public.learning_activity enable row level security;
revoke all on public.learning_activity from anon,authenticated;
grant select on public.learning_activity to authenticated;
create policy own_activity on public.learning_activity for select to authenticated using(
 user_id=(select auth.uid()) and not coalesce(((select auth.jwt())->>'is_anonymous')::boolean,false)
);
create index learning_activity_recent_idx on public.learning_activity(user_id,last_saved_at desc);
create index if not exists student_progress_recent_idx on public.student_progress(user_id,updated_at desc);

create function learning_private.prepare_progress() returns trigger language plpgsql set search_path='' as $$
begin
 if jsonb_typeof(new.progress_data)<>'object' or octet_length(new.progress_data::text)>1048576 then
  raise exception 'Progress must be a JSON object under 1 MB' using errcode='22023';
 end if;
 if tg_op='UPDATE' then
  if new.user_id<>old.user_id or new.module_id<>old.module_id then raise exception 'Progress identity cannot change' using errcode='42501';end if;
  -- Navigation-only saves must not erase answers. Explicit null/empty arrays replace a field.
  new.progress_data:=old.progress_data||new.progress_data;
 end if;
 if octet_length(new.progress_data::text)>1048576 then raise exception 'Progress exceeds 1 MB' using errcode='22023';end if;
 new.updated_at:=clock_timestamp();
 return new;
end $$;
create trigger prepare_learning_progress before insert or update on public.student_progress for each row execute function learning_private.prepare_progress();

create function learning_private.record_activity() returns trigger language plpgsql security definer set search_path='' as $$
declare brief jsonb;
begin
 -- No typed answers or notes are duplicated into the activity log.
 select coalesce(jsonb_object_agg(key,value),'{}') into brief from jsonb_each(new.progress_data)
 where key in ('stage','section','step','questionIndex','currentQ','score','totalQuestions','total','completed','completedIndices','phase')
 and jsonb_typeof(value) in ('number','boolean','string') and octet_length(value::text)<=200;
 insert into public.learning_activity(user_id,module_id,activity_date,last_saved_at,summary)
 values(new.user_id,new.module_id,(new.updated_at at time zone 'Asia/Kuala_Lumpur')::date,new.updated_at,brief)
 on conflict(user_id,module_id,activity_date) do update set last_saved_at=excluded.last_saved_at,summary=excluded.summary;
 return new;
end $$;
create trigger record_learning_activity after insert or update on public.student_progress for each row execute function learning_private.record_activity();

-- The legacy direct writer remains compatible; the new shared SDK detects stale snapshots.
create function learning_private.save_progress(p_module_id text,p_module_name text,p_module_url text,p_data jsonb,p_expected_at timestamptz)
returns public.student_progress language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); previous public.student_progress; result public.student_progress;
begin
 if actor is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) or not exists(select 1 from public.user_profiles where id=actor) then raise exception 'Sign in required' using errcode='42501';end if;
 if p_module_id is null or length(p_module_id) not between 1 and 200 then raise exception 'Invalid module' using errcode='22023';end if;
 perform pg_advisory_xact_lock(hashtextextended(actor::text||':'||p_module_id,0));
 select * into previous from public.student_progress where user_id=actor and module_id=p_module_id for update;
 if previous.updated_at is distinct from p_expected_at then raise exception 'progress_conflict' using errcode='40001';end if;
 insert into public.student_progress(user_id,module_id,module_name,module_url,progress_data)
 values(actor,p_module_id,left(p_module_name,200),left(p_module_url,2000),p_data)
 on conflict(user_id,module_id) do update set progress_data=excluded.progress_data,module_name=excluded.module_name,module_url=excluded.module_url
 where public.student_progress.updated_at is not distinct from p_expected_at
 returning * into result;
 if result.id is null then raise exception 'progress_conflict' using errcode='40001';end if;
 return result;
end $$;
create function public.save_learning_progress(p_module_id text,p_module_name text,p_module_url text,p_data jsonb,p_expected_at timestamptz)
returns public.student_progress language sql security invoker set search_path='' as $$
 select learning_private.save_progress(p_module_id,p_module_name,p_module_url,p_data,p_expected_at)
$$;
revoke all on all functions in schema learning_private from public,anon,authenticated;
grant execute on function learning_private.save_progress(text,text,text,jsonb,timestamptz) to authenticated;
revoke all on function public.save_learning_progress(text,text,text,jsonb,timestamptz) from public,anon;
grant execute on function public.save_learning_progress(text,text,text,jsonb,timestamptz) to authenticated;
-- Keep account-owned legacy writes while rejecting anonymous Auth sessions.
drop policy if exists "Users manage own progress" on public.student_progress;
create policy "Users manage own progress" on public.student_progress for all to authenticated
using(user_id=(select auth.uid()) and not coalesce(((select auth.jwt())->>'is_anonymous')::boolean,false))
with check(user_id=(select auth.uid()) and not coalesce(((select auth.jwt())->>'is_anonymous')::boolean,false));
