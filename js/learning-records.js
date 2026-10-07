(()=>{
 'use strict';const el=id=>document.getElementById(id),core=window.LearningRecords;
 let client,user,modules=[],rows=[],latest=[],mode='courses',offset=0,more=false,busy=false;
 const stamp=value=>new Date(value).toLocaleString('zh-CN',{timeZone:'Asia/Kuala_Lumpur',year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
 function node(tag,text,cls){const n=document.createElement(tag);n.textContent=text;if(cls)n.className=cls;return n;}
 const match=row=>core.resolve({...latest.find(r=>r.module_id===row.module_id),...row},modules,location.href);
 const title=row=>match(row)?.title||row.module_name||latest.find(r=>r.module_id===row.module_id)?.module_name||row.module_id;
 function link(m){const a=node('a','继续学习 →');a.href='launcher.html?module='+encodeURIComponent(m.id);return a;}
 function render(){
  const term=el('search').value.trim().toLowerCase();const shown=rows.filter(row=>title(row).toLowerCase().includes(term));el('records').replaceChildren();
  el('view-note').textContent=mode==='courses'?'按最近保存排序。搜索当前已载入的课程；分数是课程记录值，不是正式成绩。':'每天每门课程保留最后一次保存的摘要。历史从此次更新后的保存开始，不补造过去记录；搜索当前已载入的历史。';
  if(!shown.length){const box=node('div','','empty');box.append(node('h2',term?'没有找到匹配的记录':mode==='courses'?'你的下一步，从一门课开始':'新的学习足迹会出现在这里'),node('p',term?'试试更短的关键词，或载入更多记录。':'只要课程支持云端保存，学习后就能回来继续。'));el('records').append(box);}
  shown.forEach((row,i)=>{const article=node('article','','record'),mark=node('div',String(i+1).padStart(2,'0'),'marker'),body=node('div');const m=match(row);
   body.append(node('h3',title(row)),node('p',core.summary(mode==='courses'?row.progress_data:row.summary)),node('p',(mode==='courses'?'最近保存：':'学习日期：'+row.activity_date+' · ')+stamp(row.updated_at||row.last_saved_at)));
   article.append(mark,body);if(m)article.append(link(m));else body.append(node('p','课程入口待整理，记录仍保留。'));el('records').append(article);
  });el('more').hidden=!more;
 }
 async function load(reset=true){if(busy)return;busy=true;el('message').textContent='正在同步云端记录…';document.querySelectorAll('button').forEach(b=>b.disabled=true);
  try{
   if(reset){offset=0;rows=[];el('records').replaceChildren();}
   const table=mode==='courses'?'student_progress':'learning_activity';const fields=mode==='courses'?'module_id,module_name,module_url,progress_data,updated_at':'module_id,activity_date,last_saved_at,summary';
   const result=await client.from(table).select(fields,{count:'exact'}).eq('user_id',user.id).order(mode==='courses'?'updated_at':'last_saved_at',{ascending:false}).order('module_id').range(offset,offset+49);
   if(result.error)throw result.error;rows=rows.concat(result.data||[]);offset+=result.data.length;more=offset<result.count;
   if(mode==='courses'){
    latest=rows;el('course-count').textContent=result.count;el('last-save').textContent=rows[0]?stamp(rows[0].updated_at):'还未开始';
    const row=rows.find(r=>match(r));el('resume').hidden=!row;el('resume').replaceChildren();
    if(row){const body=node('div');body.append(node('p','接着上次，继续学习','eyebrow'),node('h2',title(row)),node('p',core.summary(row.progress_data)));el('resume').append(body,link(match(row)));}
   }
   render();el('message').textContent='';
  }catch(e){el('message').textContent='暂时无法载入记录，你的数据不会因此被删除。请检查连接，再点击刷新。';}
  finally{busy=false;document.querySelectorAll('button').forEach(b=>b.disabled=false);}
 }
 async function init(){
  client=window.supabaseClient;if(!client)throw Error('服务未载入');const result=await client.auth.getUser();user=result.data?.user;
  if(!user||user.is_anonymous){el('guest').hidden=false;el('message').textContent='';return;}
  client.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_OUT'||(session?.user?.id&&session.user.id!==user.id)){el('workspace').hidden=true;el('records').replaceChildren();location.reload();}});
  const response=await fetch('resources/module-manifest.json');if(!response.ok)throw Error('课程目录不可用');modules=(await response.json()).modules;
  el('workspace').hidden=false;el('refresh').onclick=()=>load();el('more').onclick=()=>load(false);el('search').addEventListener('input',render);
  for(const [id,value] of [['courses-tab','courses'],['activity-tab','activity']])el(id).onclick=()=>{mode=value;for(const name of ['courses','activity']){el(name+'-tab').classList.toggle('active',name===mode);el(name+'-tab').setAttribute('aria-pressed',String(name===mode));}load();};
  await load();
 }
 init().catch(()=>{el('message').textContent='无法载入学习空间，请检查连接后重新整理此页。';});
})();
