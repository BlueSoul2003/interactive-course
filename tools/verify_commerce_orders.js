const {PGlite}=require('@electric-sql/pglite');
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const {randomUUID}=require('node:crypto');
const root=path.resolve(__dirname,'..');
async function main(){
 const db=await PGlite.create();
 try{
 await db.exec(`create role anon;create role authenticated;create schema auth;
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
 grant usage on schema auth,public to anon,authenticated;
 create table auth.users(id uuid primary key);
 create table public.user_profiles(id uuid primary key references auth.users(id),tier text,unlocked_modules text[] default '{}');
 alter table public.user_profiles enable row level security;
 create policy own on public.user_profiles for select to authenticated using(id=auth.uid());
 grant select on public.user_profiles to authenticated;
 create table public.modules(id text primary key,bundle text,syllabus text,access_mode text,is_active boolean);
 grant select on public.modules to anon,authenticated;
 create schema storage;create table storage.buckets(id text primary key,public boolean);create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text);
 insert into storage.buckets values('private',false);insert into storage.objects(bucket_id,name) values('private','student.html'),('private','teacher.html');
 create table public.module_packages(module_id text primary key references public.modules(id),is_active boolean,bucket_id text,storage_path text);
 create table public.module_entitlements(user_id uuid,grant_type text,target_id text,access_level text,revoked_at timestamptz,starts_at timestamptz default now(),expires_at timestamptz);
 grant select on public.module_entitlements to authenticated;
 insert into public.modules values ('test-student','test','spm','protected',true),('test-teacher','test','spm','protected',true),('legacy','test','spm','protected',true);
 insert into public.module_packages values ('test-student',true,'private','student.html'),('test-teacher',true,'private','teacher.html');`);
 const migration=fs.readdirSync(path.join(root,'supabase/migrations')).find(p=>p.endsWith('_commerce_orders.sql'));
 await db.exec(fs.readFileSync(path.join(root,'supabase/migrations',migration),'utf8'));
 const buyer=randomUUID(),other=randomUUID(),admin=randomUUID();
 for(const id of [buyer,other,admin]){await db.query('insert into auth.users values($1)',[id]);await db.query("insert into public.user_profiles values($1,$2,array['*'])",[id,id===admin?'admin':'member']);}
 await db.exec("insert into public.course_topics values('test-topic','Trial topic',true);insert into public.course_topic_modules values('test-student','test-topic','student'),('test-teacher','test-topic','teacher');");
 const offers={};for(const edition of ['student','teacher'])for(const months of [1,3,6,12]){
  const id=randomUUID();offers[edition+months]=id;await db.query("insert into public.course_offers(id,topic_id,edition,term_months,amount_sen,is_active) values($1,'test-topic',$2,$3,1500,true)",[id,edition,months]);
 }
 async function as(id,sql,args=[],anonymous=false){
  await db.query("select set_config('request.jwt.claim.sub',$1,false),set_config('request.jwt.claims',$2,false)",[id||'',JSON.stringify({is_anonymous:anonymous})]);
  await db.exec(id?'set role authenticated':'set role anon');
  try{return await db.query(sql,args);}finally{await db.exec('reset role');}
 }
 const access=async(id,module='test-student')=>(await as(id,'select public.can_launch_module($1) as d',[module])).rows[0].d;
 const create=async(id,offer,request=randomUUID())=>(await as(id,'select * from public.create_course_order($1,$2)',[offer,request])).rows[0];
 const confirm=async(order,key=randomUUID(),ref=randomUUID(),amount=1500)=>(await as(admin,'select * from public.confirm_course_order($1,$2,$3,$4)',[order.id,key,ref,amount])).rows[0];
 assert.equal((await access(buyer)).allowed,false,'Legacy wildcard must not grant commercial topics');
 assert.equal((await access(buyer,'legacy')).allowed,true,'Existing course compatibility');
 assert.equal((await access(null)).allowed,false);
 await assert.rejects(as(null,'select * from public.course_orders'),/permission denied/);
 await assert.rejects(as(null,'select * from public.create_course_order($1,$2)',[offers.student1,randomUUID()]),/permission denied/);
 await assert.rejects(as(buyer,'select * from public.create_course_order($1,$2)',[offers.student1,randomUUID()],true),/permanent account/);
 const request=randomUUID(),order=await create(buyer,offers.student1,request);
 assert.equal((await create(buyer,offers.student1,request)).id,order.id);
 await assert.rejects(create(buyer,offers.teacher1,request),/another offer/);
 assert.equal((await as(other,'select * from public.course_orders')).rows.length,0);
 await assert.rejects(as(buyer,"update public.course_orders set status='paid' where id=$1",[order.id]),/permission denied/);
 await assert.rejects(as(buyer,'select * from public.confirm_course_order($1,$2,$3,$4)',[order.id,randomUUID(),'fake-ref',1500]),/Administrator required/);
 await assert.rejects(confirm(order,randomUUID(),'amount-mismatch',1499),/amount/);
 await db.query('update public.course_offers set amount_sen=9900 where id=$1',[offers.student1]);
 const key=randomUUID(),paid=await confirm(order,key,'tng-demo-001');
 assert.equal(paid.amount_sen,1500,'Price snapshot');
 assert.equal((await confirm(order,key,' TNG-DEMO-001 ')).expires_at.toISOString(),paid.expires_at.toISOString(),'Retry must not extend access');
 assert.equal((await access(buyer)).allowed,true);assert.equal((await access(buyer,'test-teacher')).allowed,false);
 const next=await confirm(await create(buyer,offers.student3));
 assert.equal(next.starts_at.toISOString(),paid.expires_at.toISOString(),'Early renewal starts at previous expiry');
 await assert.rejects(confirm(order,randomUUID(),'TNG-DEMO-002'),/different evidence/);
 const second=await create(other,offers.student3);
 await assert.rejects(confirm(second,randomUUID(),'TNG-DEMO-001'),/unique constraint/);
 assert.equal((await as(other,'select status from public.course_orders where id=$1',[second.id])).rows[0].status,'pending','Failed confirmation is atomic');
 assert.equal((await access(other)).allowed,false);
 const teacher=await confirm(await create(other,offers.teacher6));
 assert.equal((await access(other,'test-teacher')).effective_role,'teacher');assert.equal((await access(other)).allowed,true);
 await assert.rejects(as(other,'select * from public.revoke_course_order($1,$2)',[teacher.id,'refund']),/Administrator/);
 await as(admin,'select * from public.revoke_course_order($1,$2)',[teacher.id,'Confirmed reversal']);
 assert.equal((await access(other,'test-teacher')).allowed,false);assert.equal((await access(other)).allowed,false);
 await db.query("update public.course_orders set starts_at=now()-interval '2 months',expires_at=now() where id=$1",[paid.id]);
 assert.equal((await access(buyer)).allowed,false,'Expiry boundary is exclusive');
 await as(admin,'select * from public.revoke_course_order($1,$2)',[next.id,'Cancel scheduled test renewal']);
 const renewed=await confirm(await create(buyer,offers.student12));assert.equal((await access(buyer)).allowed,true);
 assert.equal((await access(admin,'test-teacher')).effective_role,'admin');
 await db.exec("update public.module_packages set is_active=false where module_id='test-teacher'");
 await assert.rejects(create(buyer,offers.teacher1),/not ready/);
 await db.exec("update public.module_packages set is_active=true;update storage.buckets set public=true");
 await assert.rejects(create(buyer,offers.student3),/not ready/);
 await assert.rejects(confirm(second),/not ready/);
 assert.equal((await as(other,'select status from public.course_orders where id=$1',[second.id])).rows[0].status,'pending');
 await db.exec("update storage.buckets set public=false;update storage.objects set name='missing.html' where name='student.html'");
 await assert.rejects(create(buyer,offers.student3),/not ready/);
 await db.exec("update storage.objects set name='student.html' where name='missing.html'");
 for(const months of [1,3,6,12]){
  const trial=await create(other,offers['teacher'+months]);const granted=await confirm(trial);
  const expected=(await db.query("select (($1::timestamptz at time zone 'Asia/Kuala_Lumpur')+make_interval(months=>$2)) at time zone 'Asia/Kuala_Lumpur' as expiry",[granted.starts_at,months])).rows[0].expiry;
  assert.equal(granted.expires_at.toISOString(),expected.toISOString());
 }
 assert.ok((await as(admin,'select * from public.course_orders')).rows.length>1,'Admin can reconcile all orders');
 // Calendar months, not 30-day approximations; use Malaysia wall time and clamp month end.
 const dates=(await db.query("select (timestamptz '2028-01-31 09:00:00+08' at time zone 'Asia/Kuala_Lumpur')+make_interval(months=>1) as leap,(timestamptz '2027-01-31 09:00:00+08' at time zone 'Asia/Kuala_Lumpur')+make_interval(months=>1) as ordinary")).rows[0];
 assert.match(String(dates.leap.toISOString()),/^2028-02-29/);assert.match(String(dates.ordinary.toISOString()),/^2027-02-28/);
 assert.equal((await as(buyer,'select tier from public.user_profiles where id=$1',[buyer])).rows[0].tier,'member');
 console.log('Commerce PostgreSQL checks passed: role/RLS boundaries, snapshot pricing, request retry, confirmation retry, duplicate receipt atomicity, student/teacher access, expiry, revocation, renewal and month-end dates. Concurrent multi-connection load is not simulated by this engine.');
 }finally{await db.close();}
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
