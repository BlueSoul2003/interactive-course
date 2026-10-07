/* Display only explicit lesson data. A saved checkpoint is not a certified result. */
(function(root){
 'use strict';
 function summary(data={}){
  const out=[];const finite=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0;
  if(finite(data.score))out.push('记录分数 '+data.score);
  if(data.completed===true)out.push('课程标记：已完成');
  if(Array.isArray(data.completedIndices))out.push('已记录 '+new Set(data.completedIndices.filter(Number.isInteger)).size+' 个完成步骤');
  for(const [key,label] of [['stage','阶段'],['section','分区'],['step','步骤'],['questionIndex','题目位置'],['currentQ','题目位置'],['phase','学习环节']]){
   if((typeof data[key]==='string'||finite(data[key]))&&String(data[key]).length<=60){out.push(label+'：'+data[key]);break;}
  }
  return out.length?out.join(' · '):'已保存学习状态';
 }
 function resolve(row,modules,base){
  let match=modules.find(m=>m.id===row.module_id);
  if(!match&&typeof row.module_url==='string'){
   try{const url=new URL(row.module_url,base);const prefix=new URL('.',base);
    if(url.origin===prefix.origin&&url.pathname.startsWith(prefix.pathname)){
     const path=url.pathname.slice(prefix.pathname.length);match=modules.find(m=>m.path===path);
    }
   }catch{}
  }
  return match||null;
 }
 async function compact(container,rows,base){
  container.replaceChildren();
  const hub=document.createElement('a');hub.textContent='查看完整学习记录 →';hub.href=new URL('learning.html',base).href;hub.style.cssText='color:#a78bfa;padding:10px 0;display:block';container.append(hub);
  if(!rows.length){const p=document.createElement('p');p.textContent='还没有云端记录。完成课程中的操作后，再回来看看。';container.append(p);return;}
  const response=await fetch(new URL('resources/module-manifest.json',base));if(!response.ok)throw Error('Course directory unavailable');
  const {modules}=await response.json();
  for(const row of rows.slice(0,5)){
   const item=document.createElement('div');item.style.cssText='padding:14px 0;border-bottom:1px solid #ffffff22';
   const title=document.createElement('strong'),detail=document.createElement('p'),m=resolve(row,modules,base);
   title.textContent=m?.title||row.module_name||row.module_id;detail.textContent=summary(row.progress_data);detail.style.cssText='font-size:13px;color:#c4b5d5;margin:6px 0';item.append(title,detail);
   if(m){const a=document.createElement('a');a.textContent='继续学习 →';a.href=new URL('launcher.html?module='+encodeURIComponent(m.id),base).href;a.style.color='#a78bfa';item.append(a);}
   container.append(item);
  }
 }
 const api={summary,resolve,compact};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.LearningRecords=api;
})(typeof window!=='undefined'?window:globalThis);
