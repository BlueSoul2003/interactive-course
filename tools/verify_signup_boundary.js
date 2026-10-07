// Runs actual PL/pgSQL + RLS in an in-memory PostgreSQL engine, no live credentials.
const {PGlite} = require('@electric-sql/pglite');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {randomUUID} = require('node:crypto');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root,p),'utf8');
const migration = read('supabase/migrations/20261007065934_signup_metadata_no_entitlements.sql');
const functionFrom = source => source.match(/create or replace function public\.can_launch_module[\s\S]*?\$\$;/i)[0];

async function main() {
 const db = await PGlite.create();
 try {
  await db.exec(`
   create role anon; create role authenticated;
   create schema auth;
   create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
   create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
   grant usage on schema auth,public to authenticated,anon;
   create table auth.users(id uuid primary key,email text,is_anonymous boolean default false,raw_user_meta_data jsonb default '{}');
   create table public.user_profiles(id uuid primary key references auth.users(id),email text,tier text default 'free',tier_level int default 0,fullname text,phone text,syllabus text,age int,gender text,role text,unlocked_modules text[] default '{}');
   alter table public.user_profiles enable row level security;
   grant select,insert,update on public.user_profiles to authenticated;
   create table public.modules(id text primary key,bundle text,syllabus text,access_mode text,is_active boolean);
   insert into public.modules values ('test-protected','test-bundle','test-syllabus','protected',true);
   create table public.module_entitlements(user_id uuid,grant_type text,target_id text,access_level text,starts_at timestamptz default now(),expires_at timestamptz,revoked_at timestamptz);
   alter table public.module_entitlements enable row level security;
   create policy own_grants on public.module_entitlements for select to authenticated using(user_id=auth.uid());
   grant select on public.modules,public.module_entitlements to authenticated;
  `);
  await db.exec(read('db/migrations/harden_user_profile_privileges.sql'));
  await db.exec(functionFrom(read('supabase/migrations/20260812085950_module_access_foundation.sql')));
  await db.exec(read('tools/fixtures/legacy_signup_trigger.sql'));
  await db.exec('create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();');
  async function user(meta,anonymous=false) {
   const id=randomUUID();
   await db.query('insert into auth.users(id,email,is_anonymous,raw_user_meta_data) values($1,$2,$3,$4)',[id,`${id}@example.invalid`,anonymous,JSON.stringify(meta)]);
   return id;
  }
  async function asUser(id,fn) {
   await db.query("select set_config('request.jwt.claim.sub',$1,false),set_config('request.jwt.claims','{\"is_anonymous\":false}',false)",[id]);
   await db.exec('set role authenticated');
   try { return await fn(); } finally { await db.exec('reset role'); }
  }
  const launch = async id => asUser(id,async()=> (await db.query("select public.can_launch_module('test-protected') as decision")).rows[0].decision);
  const bad=await user({syllabus:'*'});
  assert.equal((await launch(bad)).allowed,true,'Original trigger must reproduce unearned access');
  const before=(await db.query('select * from public.user_profiles order by id')).rows;
  await db.exec(migration);
  assert.deepEqual((await db.query('select * from public.user_profiles order by id')).rows,before,'Migration must preserve existing profiles');
  for (const syllabus of ['*','test-protected','test-bundle','test-syllabus','',null]) {
   const id=await user({syllabus,fullname:'Test Learner',age:'17',role:'admin',tier:'admin',unlocked_modules:['*']});
   const profile=(await db.query('select * from public.user_profiles where id=$1',[id])).rows[0];
   assert.deepEqual(profile.unlocked_modules,[]); assert.equal(profile.tier,'member');assert.equal(profile.tier_level,1);
   assert.equal(profile.syllabus,syllabus);assert.equal(profile.fullname,'Test Learner');assert.equal(profile.age,17);
   assert.equal((await launch(id)).allowed,false,'Metadata must not grant access');
   await asUser(id,()=>db.query("update public.user_profiles set syllabus='*',fullname='Updated' where id=$1",[id]));
   assert.equal((await launch(id)).allowed,false,'Demographic changes must not grant access');
   await assert.rejects(asUser(id,()=>db.query("update public.user_profiles set unlocked_modules=array['*'] where id=$1",[id])),/permission denied/);
   await assert.rejects(asUser(id,()=>db.query("update public.user_profiles set tier='admin' where id=$1",[id])),/permission denied/);
  }
  const anonymous=await user({syllabus:'*'},true);
  assert.equal((await db.query('select * from public.user_profiles where id=$1',[anonymous])).rows.length,0);
  // A missing profile is repaired by the same member/empty-grants insert the browser uses.
  const repair=randomUUID();await db.query('insert into auth.users(id,is_anonymous) values($1,true)',[repair]);
  await db.query('update auth.users set is_anonymous=false where id=$1',[repair]);
  await assert.rejects(asUser(repair,()=>db.query("insert into public.user_profiles(id,tier,unlocked_modules) values($1,'admin','{}')",[repair])),/row-level security/);
  await assert.rejects(asUser(repair,()=>db.query("insert into public.user_profiles(id,tier,unlocked_modules) values($1,'member',array['*'])",[repair])),/row-level security/);
  await asUser(repair,()=>db.query("insert into public.user_profiles(id,tier,tier_level,unlocked_modules) values($1,'member',1,'{}')",[repair]));
  assert.equal((await launch(repair)).allowed,false);
  const admin=await user({});await db.query("update public.user_profiles set tier='admin' where id=$1",[admin]);
  assert.equal((await launch(admin)).reason,'admin');
  const granted=await user({});await db.query("insert into public.module_entitlements(user_id,grant_type,target_id,access_level) values($1,'module','test-protected','student')",[granted]);
  assert.equal((await launch(granted)).reason,'entitlement');
  assert.equal((await launch(bad)).reason,'legacy_entitlement','Existing grants are intentionally not migrated here');
  // Exercise the trigger's conflict branch without touching the auth schema in production.
  await db.exec('create temp table replay (like auth.users); create trigger replay_profile after insert on replay for each row execute function public.handle_new_user();');
  await db.query("insert into replay(id,email,raw_user_meta_data) values($1,'replay@example.invalid','{\"syllabus\":\"*\"}')",[admin]);
  assert.equal((await launch(admin)).reason,'admin');
  await db.query("insert into replay(id,email,raw_user_meta_data) values($1,'legacy@example.invalid','{\"syllabus\":\"new\"}')",[bad]);
  assert.equal((await launch(bad)).reason,'legacy_entitlement');
  // Historical setup paths that are still documented must keep the same safe definition.
  for (const source of ['db/migrations/addmaths_live_quiz.sql','db/migrations/fix_registration_and_progress.sql']) {
   const definition=read(source).match(/CREATE OR REPLACE FUNCTION public.handle_new_user\(\)[\s\S]*?\$\$;/)[0];
   await db.exec(definition);
   assert.equal((await launch(await user({syllabus:'*'}))).allowed,false,source);
  }
  console.log('Signup boundary passed: original escalation reproduced; wildcard/module/bundle/syllabus inputs denied; RLS repair/update checks and admin/explicit/legacy controls passed.');
 } finally { await db.close(); }
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
