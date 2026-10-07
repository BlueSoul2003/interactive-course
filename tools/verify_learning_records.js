const {PGlite}=require('@electric-sql/pglite');const assert=require('node:assert/strict');const fs=require('node:fs');const {randomUUID}=require('node:crypto');const vm=require('node:vm');const core=require('../js/learning-records-core');
async function main(){const db=await PGlite.create();try{
await db.exec(`create role anon;create role authenticated;create schema auth;create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;create function auth.jwt() returns jsonb language sql as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;grant usage on schema auth,public to anon,authenticated;create table auth.users(id uuid primary key);create table public.user_profiles(id uuid primary key);create table public.student_progress(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users,module_id text not null,module_name text,module_url text,progress_data jsonb not null default '{}',updated_at timestamptz not null default now(),unique(user_id,module_id));alter table public.student_progress enable row level security;grant select,insert,update,delete on public.student_progress to authenticated;`);
const migration=fs.readdirSync('supabase/migrations').find(p=>p.endsWith('_learning_records.sql'));await db.exec(fs.readFileSync('supabase/migrations/'+migration,'utf8'));
const a=randomUUID(),b=randomUUID();for(const id of[a,b]){await db.query('insert into auth.users values($1)',[id]);await db.query('insert into public.user_profiles values($1)',[id]);}
async function as(id,sql,args=[],anon=false){await db.query("select set_config('request.jwt.claim.sub',$1,false),set_config('request.jwt.claims',$2,false)",[id,JSON.stringify({is_anonymous:anon})]);await db.exec('set role authenticated');try{return await db.query(sql,args)}finally{await db.exec('reset role')}}
const save=async(id,data,version=null)=>(await as(id,"select * from public.save_learning_progress('test','Test','content/test.html',$1,$2)",[data,version])).rows[0];
const first=await save(a,{answers:{a:'private text'},score:2,stage:1});
const next=await save(a,{section:2},first.updated_at);
assert.equal(next.progress_data.answers.a,'private text');assert.equal(next.progress_data.score,2);
await assert.rejects(save(a,{score:0},first.updated_at),/progress_conflict/);
assert.equal((await as(b,'select * from public.student_progress')).rows.length,0);
assert.equal((await as(b,'select * from public.learning_activity')).rows.length,0);
await assert.rejects(as(b,'update public.student_progress set user_id=$1 where user_id=$2',[b,a]).then(r=>{assert.equal(r.affectedRows,0);throw Error('denied')}),/denied/);
await assert.rejects(as(a,'update public.student_progress set module_id=$1',['other']),/identity cannot change/);
await assert.rejects(as(a,"select * from public.save_learning_progress('test','Test','test','{}',null)",[],true),/Sign in/);
await assert.rejects(save(a,[],next.updated_at),/JSON object/);
const history=(await as(a,'select * from public.learning_activity')).rows;assert.equal(history.length,1);assert.equal(history[0].summary.score,2);assert.equal(history[0].summary.answers,undefined);
await as(a,"update public.student_progress set progress_data='{\"stage\":3}',updated_at='2099-01-01' where module_id='test'");
const legacy=(await as(a,'select * from public.student_progress')).rows[0];assert.equal(legacy.progress_data.answers.a,'private text');assert.ok(legacy.updated_at.getUTCFullYear()<2099);
await assert.rejects(save(a,{stage:4},next.updated_at),/progress_conflict/);
await assert.rejects(as(a,"insert into public.learning_activity values($1,'fake',current_date,now(),'{}')",[a]),/permission denied/);
console.log('Learning database passed: ownership, anonymous denial, partial saves, server time, stale-write rejection, legacy compatibility and daily history without answers.');
}finally{await db.close()}
assert.equal(core.summary({score:0}),'记录分数 0');assert.equal(core.summary({visited:true}),'已保存学习状态');assert.ok(!core.summary({stage:1}).includes('%'));
const modules=[{id:'safe',title:'Safe',path:'content/safe.html'}];assert.equal(core.resolve({module_url:'javascript:alert(1)'},modules,'https://example.org/app/learning.html'),null);assert.equal(core.resolve({module_url:'https://evil.test/app/content/safe.html'},modules,'https://example.org/app/learning.html'),null);assert.equal(core.resolve({module_url:'content/safe.html'},modules,'https://example.org/app/learning.html').id,'safe');
await sdkTest();console.log('Learning client passed: safe route resolution, honest summaries, serialized saving, retry and account-switch isolation.');}
async function sdkTest(){let user='A',stored=null,calls=[],fail=false;const events=[];const element=()=>({style:{},setAttribute(){},append(){},replaceChildren(){}});
const client={auth:{getUser:async()=>({data:{user:{id:user}}})},from:()=>({select(){return this},eq(){return this},maybeSingle:async()=>({data:stored})}),rpc:async(name,args)=>{calls.push(args);if(fail){fail=false;return {error:{message:'offline'}}}stored={updated_at:String(calls.length),progress_data:{...(stored?.progress_data||{}),...args.p_data}};return {data:stored}}};
const win={supabaseClient:client,addEventListener(){},dispatchEvent:e=>events.push(e.detail)};const context={window:win,document:{currentScript:{dataset:{moduleId:'test',moduleName:'Test',moduleUrl:'content/test.html'}},body:{append(){}},createElement:element,createTextNode:s=>s},location:{pathname:'/test'},console,CustomEvent:function(name,opts){this.detail=opts.detail},setTimeout,clearTimeout};vm.runInNewContext(fs.readFileSync('js/progress-tracker.js','utf8'),context);const t=win.ProgressTracker;
await t.load();await Promise.all([t.save({score:2}),t.save({section:2})]);assert.equal(calls[1].p_expected_at,'1');assert.equal(stored.progress_data.score,2);
fail=true;await t.save({answers:{q:'retry'}});assert.equal(events.at(-1).state,'error');await t.save({section:3});assert.equal(stored.progress_data.answers.q,'retry');
user='B';const before=calls.length;await t.save({score:99});assert.equal(calls.length,before,'Never write A page state as B');
}
main().catch(e=>{console.error(e);process.exitCode=1});
