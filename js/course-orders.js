/* The database owns prices, identity, grants and dates. This page only requests actions. */
(() => {
 'use strict';
 const el=id=>document.getElementById(id);
 const money=sen=>new Intl.NumberFormat('en-MY',{style:'currency',currency:'MYR'}).format(sen/100);
 const date=value=>value?new Date(value).toLocaleString('zh-CN',{timeZone:'Asia/Kuala_Lumpur'}):'—';
 let client,user,admin=false,busy=false;
 const status={pending:'待核账',paid:'已确认',revoked:'已撤销'};
 function node(tag,text,cls){const n=document.createElement(tag);n.textContent=text;if(cls)n.className=cls;return n;}
 function message(text){el('message').textContent=text;el('message').scrollIntoView({block:'nearest'});}
 async function action(work){if(busy)return;busy=true;document.querySelectorAll('button').forEach(b=>b.disabled=true);try{await work();}catch(error){message(error.message||'操作未完成，请重试。');}finally{busy=false;document.querySelectorAll('button').forEach(b=>b.disabled=false);}}
 async function rpc(name,args){const {data,error}=await client.rpc(name,args);if(error)throw error;const order=Array.isArray(data)?data[0]:data;if(!order?.id)throw Error('未收到完整订单结果，请刷新后重试。');return order;}
 function key(name){let value=sessionStorage.getItem(name);if(!value){value=crypto.randomUUID();sessionStorage.setItem(name,value);}return value;}
 async function load(){
  const {data:orders,error}=await client.from('course_orders').select('*').order('created_at',{ascending:false}).limit(100);if(error)throw error;
  el('orders').replaceChildren();el('order-note').textContent=admin?'管理视图：最近 100 笔订单。只有核实实际到账后，才可确认开通。':'最近 100 笔订单。请保留订单编号，付款后交给工作人员核账。';
  if(!orders.length){el('orders').append(node('p','还没有订单。','empty'));return;}
  for(const o of orders){
   const row=node('article','','row');row.append(node('h3',`${o.topic_title} · ${o.edition==='teacher'?'教师版':'学生版'}`));
   row.append(node('span',`${status[o.status]} · ${o.term_months} 个月 · ${money(o.amount_sen)}`,'badge'));
   row.append(node('p',`订单编号：${o.id}`,'meta'));
   if(admin)row.append(node('p',`账号编号：${o.user_id}`,'meta'));
   if(o.starts_at)row.append(node('p',`使用期限：${date(o.starts_at)} 至 ${date(o.expires_at)}（马来西亚时间）`,'meta'));
   if(o.status==='paid' && new Date(o.expires_at)<=new Date())row.append(node('p','已到期；续购后可恢复课程访问。','meta'));
   if(o.status==='paid' && new Date(o.starts_at)>new Date())row.append(node('p','续购已确认，将在上述开始时间接续。','meta'));
   if(admin&&o.status==='pending'){
    const form=node('form','','actions'),ref=node('input'),amount=node('input'),ack=node('input');ref.required=true;ref.minLength=3;ref.maxLength=120;ref.id=`ref-${o.id}`;
    amount.type='number';amount.min='0.01';amount.step='0.01';amount.required=true;amount.id=`amount-${o.id}`;
    for(const [input,title] of [[ref,'TNG 实际交易编号'],[amount,'实际到账金额（RM）']]){const label=node('label',title);label.htmlFor=input.id;form.append(label,input);}
    ack.type='checkbox';ack.required=true;const label=node('label','','confirm-line');label.append(ack,node('span','我已在收款账户核实到账，金额与此订单相符。'));form.append(label);
    const submit=node('button','确认到账并开通');submit.type='submit';form.append(submit);
    form.addEventListener('submit',event=>{event.preventDefault();action(async()=>{
     const sen=Math.round(Number(amount.value)*100);if(!Number.isSafeInteger(sen)||Math.abs(Number(amount.value)*100-sen)>.00001)throw Error('请输入最多两位小数的金额。');
     await rpc('confirm_course_order',{p_order_id:o.id,p_confirmation_key:key(`owl-confirm:${user.id}:${o.id}`),p_payment_reference:ref.value,p_received_sen:sen});
     message('核账成功，课程权限已记录。');await load();
    });});row.append(form);
   }
   if(admin&&o.status==='paid'){
    const form=node('form','','actions'),reason=node('input');reason.required=true;reason.minLength=3;reason.maxLength=500;reason.id=`reason-${o.id}`;const label=node('label','撤销原因（此操作不会转账退款）');label.htmlFor=reason.id;
    const button=node('button','撤销此订单的课程访问','secondary');button.type='submit';form.append(label,reason,button);
    form.addEventListener('submit',event=>{event.preventDefault();action(async()=>{await rpc('revoke_course_order',{p_order_id:o.id,p_reason:reason.value});message('此订单的课程访问已撤销。其他有效订单不受影响。');await load();});});row.append(form);
   }
   el('orders').append(row);
  }
 }
 async function init(){
  client=window.supabaseClient;if(!client)throw Error('无法连接课程服务，请刷新重试。');
  const {data,error}=await client.auth.getUser();if(error||!data.user||data.user.is_anonymous){el('signed-out').hidden=false;return;}user=data.user;
  client.auth.onAuthStateChange((event,session)=>{
   if(event==='SIGNED_OUT'||(session?.user?.id&&session.user.id!==user.id)){
    el('shop').hidden=true;el('history').hidden=true;el('orders').replaceChildren();
    window.location.reload();
   }
  });
  const {data:profile,error:profileError}=await client.from('user_profiles').select('tier').eq('id',user.id).maybeSingle();if(profileError)throw profileError;
  admin=profile?.tier==='admin';el('history-title').textContent=admin?'订单核账与访问管理':'我的订单';
  el('shop').hidden=false;el('history').hidden=false;
  const {data:offers,error:offerError}=await client.from('course_offers').select('id,topic_id,edition,term_months,amount_sen,course_topics(title)').eq('is_active',true).order('term_months');if(offerError)throw offerError;
  for(const o of offers){const option=node('option',`${o.course_topics?.title||o.topic_id} / ${o.edition==='teacher'?'教师':'学生'} / ${o.term_months} 个月 / ${money(o.amount_sen)}`);option.value=o.id;el('offer').append(option);}
  el('order-form').hidden=!offers.length;el('no-offers').hidden=!!offers.length;
  el('order-form').addEventListener('submit',event=>{event.preventDefault();action(async()=>{
   const offer=el('offer').value;const storageKey=`owl-order:${user.id}:${offer}`;
   const order=await rpc('create_course_order',{p_offer_id:offer,p_request_id:key(storageKey)});
   // Keep this key until a response is received; network retries cannot duplicate the order.
   sessionStorage.removeItem(storageKey);message(`订单已建立：${order.id}\n请通过现有付款渠道付款，并向工作人员提供订单编号及交易编号。核账后开通。`);await load();
  });});
  el('refresh').addEventListener('click',()=>action(load));await load();
 }
 init().catch(e=>message(e.message||'加载失败，请刷新重试。'));
})();
