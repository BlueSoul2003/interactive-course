/* Original SVG teaching models. No external renderer, textures or network assets. */
(function(){
  'use strict';
  const NS='http://www.w3.org/2000/svg',pref=matchMedia('(prefers-reduced-motion: reduce)');
  let active=null,serial=0,previous=null,manualReduced=false;
  try{manualReduced=localStorage.getItem('crystal-reduced-motion')==='true';}catch(_){}
  const reduced=()=>pref.matches||manualReduced,clamp=n=>Math.max(0,Math.min(1,n)),mix=(a,b,t)=>a+(b-a)*t;
  const attr=(el,values)=>{for(const [k,v] of Object.entries(values))el.setAttribute(k,String(v));};
  function stop(){if(!active)return;previous={id:active.id,value:active.value,target:active.target,time:active.time,paused:active.paused};active.dispose();active=null;}
  function mount(slide,state){
    const host=document.querySelector('#stage .scene');if(!host)return;
    const old=host.querySelector('svg');if(!old)return;
    const kind=slide.type==='compare'?'compare':slide.type==='particles'?'particles':slide.type==='filter'?'filter':slide.type==='evaporation'?'evaporation':slide.scene;
    const sand=kind==='compare'?state.lab.material==='sand':kind==='filter'&&state.lab.filter==='sand';
    const driven=['compare','particles','filter','evaporation'].includes(kind);
    const target=kind==='compare'?Number(state.lab.stirred):kind==='particles'?state.lab.particle/2:kind==='filter'?Number(state.lab.filtered):kind==='evaporation'?state.lab.evap/2:0;
    const id=slide.id+':'+kind+':'+sand,carry=previous?.id===id?previous:null;
    const filter=kind==='filter',evap=['evaporation','recovery'].includes(kind),melt=kind==='melt',zoom=kind==='particles',two=['two-clear','test','mystery'].includes(kind),unknown=kind==='zoom';
    const uid='crystal-motion-'+(++serial),svg=document.createElementNS(NS,'svg');
    attr(svg,{viewBox:'0 0 440 300',role:'img','aria-label':old.getAttribute('aria-label')||'Interactive scientific model',class:'living-model'});
    const glass=(x,y,w,h)=>`<path d="M${x} ${y}v${h-12}q0 12 12 12h${w-24}q12 0 12-12V${y}" fill="url(#${uid}-glass)" stroke="#658e87" stroke-width="2.5"/><path d="M${x+7} ${y+13}v${h-35}" stroke="#fff" stroke-opacity=".75" stroke-width="3" stroke-linecap="round"/>`;
    svg.innerHTML=`<defs><linearGradient id="${uid}-water" x2="0" y2="1"><stop stop-color="#badfdf"/><stop offset="1" stop-color="#72b7bf" stop-opacity=".58"/></linearGradient><linearGradient id="${uid}-glass"><stop stop-color="#fff" stop-opacity=".28"/><stop offset=".5" stop-color="#fff" stop-opacity=".02"/><stop offset="1" stop-color="#fff" stop-opacity=".4"/></linearGradient><clipPath id="${uid}-clip">${evap?'<path d="M75 196q15 54 145 54t145-54Z"/>':''}<rect x="${filter?168:zoom?40:two?245:120}" y="${filter?182:50}" width="${filter?104:zoom?360:two?150:200}" height="${evap?0:filter?90:190}" rx="12"/></clipPath></defs><ellipse cx="220" cy="267" rx="${two?190:125}" ry="9" fill="#547b64" opacity=".08"/>
    ${filter?`<path d="M80 35h280L240 153v31h-40v-31Z" fill="#faf3df" stroke="#728c77" stroke-width="2.5"/><path d="M95 44l125 104L345 44" fill="none" stroke="#c7ac73" stroke-width="3"/>`:''}
    ${evap?'<path d="M75 196q15 54 145 54t145-54" fill="#f6f0dd" stroke="#71917c" stroke-width="2.5"/>':''}
    <g clip-path="url(#${uid}-clip)"><path data-water fill="url(#${uid}-water)"/><g data-molecules></g></g><g data-grains></g><g data-vapour></g>
    ${filter?glass(163,181,114,90):zoom?'<rect x="38" y="48" width="364" height="194" rx="16" fill="none" stroke="#789c8c" stroke-width="2" stroke-dasharray="5 6"/>':evap?'':glass(two?242:117,46,two?156:206,201)}
    ${two?`${glass(34,46,156,201)}<path d="M38 103q35-5 73 0t75 0v128q0 12-12 12H50q-12 0-12-12Z" fill="url(#${uid}-water)"/><text x="112" y="286" text-anchor="middle">${kind==='test'?'Stirred':kind==='two-clear'?'Glass A':'Before'}</text>`:''}
    <g data-spoon><path d="M268 17l-37 163" stroke="#597b72" stroke-width="7" stroke-linecap="round"/><ellipse cx="230" cy="181" rx="9" ry="16" fill="#a2b5a1" transform="rotate(13 230 181)"/></g>
    <g data-ice><ellipse data-puddle cx="87" cy="212" rx="55" ry="12" fill="#8fc4cd"/><rect data-cube x="49" y="110" width="76" height="76" rx="12" fill="#d5eded" stroke="#72a2aa" stroke-width="2"/><path data-shine d="M60 124h24m-24 0v23" fill="none" stroke="white" stroke-width="4" stroke-linecap="round"/></g>
    <text data-label x="${two?320:220}" y="286" text-anchor="middle"></text>${unknown?'<text x="220" y="166" text-anchor="middle" font-size="65">?</text>':''}`;
    svg.querySelectorAll('text').forEach(e=>{e.setAttribute('fill','#244d46');e.setAttribute('font-family','Segoe UI,Arial,sans-serif');if(!e.hasAttribute('font-size'))e.setAttribute('font-size','14');});
    old.replaceWith(svg);
    const water=svg.querySelector('[data-water]'),spoon=svg.querySelector('[data-spoon]'),cube=svg.querySelector('[data-cube]'),puddle=svg.querySelector('[data-puddle]'),shine=svg.querySelector('[data-shine]'),label=svg.querySelector('[data-label]');
    const node=(tag,group,props)=>{const e=document.createElementNS(NS,tag);attr(e,props);svg.querySelector(group).append(e);return e;};
    const molecules=Array.from({length:zoom?36:18},(_,i)=>node('circle','[data-molecules]',{r:zoom?6:2.3,fill:'#448ca3',opacity:zoom?.7:.25}));
    const grains=Array.from({length:zoom?8:16},(_,i)=>node('rect','[data-grains]',{width:zoom?11:6,height:zoom?11:6,rx:zoom?2:1.3,fill:sand?'#897254':kind==='sugar'?'#bc943b':'#bb693c'}));
    const beforeGrains=['mystery','test'].includes(kind)?Array.from({length:16},(_,i)=>node('rect','[data-grains]',{x:76+(i%6)*11,y:225-Math.floor(i/6)*9,width:6,height:6,rx:1.3,fill:'#bb693c'})):[];
    const stream=filter?node('path','[data-vapour]',{d:'M220 151v108',stroke:'#71aeba','stroke-width':5,'stroke-linecap':'round','stroke-dasharray':'5 9',opacity:0}):null;
    const sourceWater=filter?node('path','[data-vapour]',{fill:'#83bdc5',opacity:.3}):null;
    const vapour=Array.from({length:12},()=>node('circle','[data-vapour]',{r:3,fill:'#548e9e'}));
    const controls=document.createElement('div');controls.className='model-controls';
    controls.innerHTML=`<div class="model-buttons"><button type="button" data-play>${driven?'Pause motion':'Play model'}</button><button type="button" data-replay>Replay motion</button><label><input type="checkbox" data-reduced ${reduced()?'checked':''} ${pref.matches?'disabled':''}> Less motion</label></div><p class="model-status" aria-live="polite"></p><p class="model-note">${zoom?'Moving symbols · all 8 salt markers are conserved.':filter?'Simplified flow · ordinary filter paper.':evap?'Time compressed · water can evaporate without boiling.':unknown?'Your prediction first · this view does not reveal the particle arrangement.':'Illustrative model · not to scale or a measured experiment.'}</p>`;
    svg.after(controls);
    const play=controls.querySelector('[data-play]'),status=controls.querySelector('.model-status');
    const m={id,value:carry?carry.value:driven?target:0,target:carry&&!driven?carry.target:target,time:carry?.time||0,paused:carry?.paused||false,frame:0,visible:true,last:0,disposed:false};
    if(carry&&driven&&target!==carry.target)m.paused=false;
    const duration=filter?3800:evap?4200:zoom?2400:3000;
    let from=m.value,elapsed=0,goal=m.target,done=Math.abs(m.value-m.target)<.0001;
    if(filter)controls.querySelector('.model-note').textContent=sand?'Sand grains remain on ordinary filter paper.':'Orange dots track dissolved salt, magnified symbolically; the collected solution is clear.';
    if(unknown||kind==='two-clear'){play.hidden=true;controls.querySelector('[data-replay]').hidden=true;}
    function updateStatus(){play.textContent=m.paused?'Resume motion':!driven&&m.target===0?'Play model':'Pause motion';status.textContent=reduced()?'Less motion: showing the selected state.':m.paused?'Motion paused — discuss what you notice.':Math.abs(m.value-m.target)>.001?'Watch the change unfold…':driven?'Use the lesson controls to change the model.':'Replay or pause to follow the change.';}
    function draw(){
      const p=m.value,t=m.time/1000,drift=reduced()?0:1;
      const x=filter?168:evap?75:zoom?40:two?245:120,w=filter?104:evap?290:zoom?360:two?150:200;
      const y=filter?mix(269,200,p):evap?mix(192,244,p):zoom?57:105,bottom=filter?270:evap?248:238;
      attr(water,{d:`M${x} ${y}Q${x+w*.25} ${y+Math.sin(t*1.3)*3*drift} ${x+w*.5} ${y}T${x+w} ${y}V${bottom}H${x}Z`,opacity:evap?1-p:1});
      molecules.forEach((e,i)=>{const cx=x+15+(i%6)*(w-30)/5,cy=zoom?75+Math.floor(i/6)*29:mix(y+12,bottom-10,Math.floor(i/6)/2);attr(e,{cx:cx+Math.sin(t*.55+i*2)*5*drift,cy:cy+Math.cos(t*.6+i)*4*drift,opacity:unknown?0:zoom?.65:evap?(1-p)*.3:.23});});
      grains.forEach((e,i)=>{
        let gx,gy,opacity=1;
        if(zoom){const start=[175+(i%4)*22,220-Math.floor(i/4)*22],end=[[73,80],[171,106],[287,79],[355,130],[117,168],[233,167],[76,219],[331,212]][i];gx=mix(start[0],end[0],p);gy=mix(start[1],end[1],p);gx+=Math.sin(t*.7+i*2)*5*p*drift;gy+=Math.cos(t*.8+i)*4*p*drift;}
        else if(filter){const flow=clamp((p-i*.012)/.8);if(sand){gx=mix(180+(i%6)*12,190+(i%6)*10,flow);gy=mix(57+i*2,108-Math.floor(i/6)*7,flow);}else if(flow<.55){gx=mix(180+(i%6)*12,216+(i%3)*3,flow/.55);gy=mix(65+i*2,180,flow/.55);}else{gx=mix(216+(i%3)*3,184+(i%6)*11,(flow-.55)/.45);gy=mix(180,213+Math.floor(i/6)*13,(flow-.55)/.45);}opacity=sand?1:.7;}
        else if(evap){gx=175+(i%6)*13;gy=231-Math.floor(i/6)*8;opacity=clamp((p-.7)/.3);}
        else {gx=(two?280:174)+(i%6)*11;gy=225-Math.floor(i/6)*9;const swirl=Math.sin(p*Math.PI);gx+=Math.sin(t*3+i)*30*swirl;gy-=Math.abs(Math.cos(t*2+i))*65*swirl;opacity=sand?1:kind==='test'?1-p*.55:1-p;}
        if(kind==='two-clear'||unknown)opacity=0;
        attr(e,{x:gx,y:gy,opacity});
      });
      vapour.forEach((e,i)=>{const phase=(t*.16+i/12)%1;attr(e,{cx:147+(i%5)*36+Math.sin(t+i)*5,cy:185-phase*140,opacity:evap&&!reduced()?Math.sin(phase*Math.PI)*Math.sin(p*Math.PI)*.7:0});});
      beforeGrains.forEach(e=>e.setAttribute('opacity',kind==='test'?1-p:1));
      if(stream){attr(stream,{opacity:Math.sin(p*Math.PI),'stroke-dashoffset':-t*30});const sy=50+85*p,lx=80+(sy-35)*140/118;attr(sourceWater,{d:`M${lx} ${sy}H${440-lx}L220 153Z`,opacity:.35*(1-p)});}
      attr(spoon,{opacity:!filter&&!evap&&!zoom&&!melt&&!unknown&&kind!=='two-clear'?Math.sin(p*Math.PI):0,transform:`translate(${(kind==='test'?-110:two?70:0)+Math.sin(t*4)*14*Math.sin(p*Math.PI)} 0)`});
      attr(svg.querySelector('[data-ice]'),{opacity:melt?1:0,transform:'translate(-20 0)'});
      attr(cube,{y:110+p*82,height:Math.max(0,76*(1-p)),opacity:1-p,transform:`rotate(${-7*(1-p)} 87 186)`});attr(shine,{opacity:1-p});attr(puddle,{rx:mix(22,45,p),opacity:mix(.25,.8,p)});
      const text=filter?(p<.99?'Follow the water and solid':sand?'Sand stays · water passes':'Salt + water pass together'):evap?(p<.1?'Salt solution':p<.99?'Water leaves as vapour':'Solid salt remains'):zoom?(p<.1?'Before · 8 salt markers':p<.99?'Spreading · still 8':'Distributed · still 8'):two?(kind==='test'?'Not stirred':kind==='two-clear'?'Glass B':'After stirring'):melt?'Salt dissolves · ice melts':unknown?'What would your model show?':sand?'Sand remains as grains':p<.99?'Follow the solid in water':'No visible crystals · solute remains';
      if(label.textContent!==text)label.textContent=text;
    }
    function tick(now){m.frame=0;if(m.disposed||!m.visible||document.hidden||m.paused||reduced())return;const dt=m.last?Math.min(now-m.last,50):0;m.last=now;m.time+=dt;
      if(goal!==m.target){from=m.value;goal=m.target;elapsed=0;done=false;}
      if(Math.abs(m.value-m.target)>.0001){elapsed+=dt;const u=clamp(elapsed/duration),ease=u*u*(3-2*u);m.value=mix(from,m.target,ease);if(u===1&&!done){done=true;updateStatus();}}
      draw();m.frame=requestAnimationFrame(tick);
    }
    function wake(){cancelAnimationFrame(m.frame);m.frame=0;m.last=0;if(reduced()){m.value=m.target;draw();updateStatus();return;}if(m.visible&&!document.hidden&&!m.paused)m.frame=requestAnimationFrame(tick);}
    function retarget(n){from=m.value;goal=m.target=n;elapsed=0;done=false;m.paused=false;updateStatus();wake();}
    play.onclick=()=>{if(reduced())return;if(!driven&&m.target===0)retarget(1);else{m.paused=!m.paused;updateStatus();wake();}};
    m.replay=()=>{m.value=0;draw();retarget(driven?target:1);};
    controls.querySelector('[data-replay]').onclick=m.replay;
    controls.querySelector('[data-reduced]').onchange=e=>{manualReduced=e.target.checked;try{localStorage.setItem('crystal-reduced-motion',manualReduced);}catch(_){}document.documentElement.classList.toggle('less-motion',reduced());play.disabled=reduced();wake();};
    const visibility=()=>wake(),preference=()=>{controls.querySelector('[data-reduced]').checked=reduced();controls.querySelector('[data-reduced]').disabled=pref.matches;play.disabled=reduced();document.documentElement.classList.toggle('less-motion',reduced());wake();};
    const observer=new IntersectionObserver(entries=>{m.visible=entries[0].isIntersecting;wake();});observer.observe(svg);
    document.addEventListener('visibilitychange',visibility);pref.addEventListener('change',preference);
    m.dispose=()=>{m.disposed=true;cancelAnimationFrame(m.frame);observer.disconnect();document.removeEventListener('visibilitychange',visibility);pref.removeEventListener('change',preference);};
    m.pause=()=>{m.paused=true;updateStatus();wake();};
    active=m;play.disabled=reduced();document.documentElement.classList.toggle('less-motion',reduced());draw();updateStatus();wake();
  }
  function reveal(el){if(!el||reduced()||!el.animate)return;el.getAnimations().forEach(a=>a.cancel());el.animate([{opacity:.35,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{duration:280,easing:'cubic-bezier(.2,.7,.2,1)'});}
  const feedbackObserver=new MutationObserver(records=>{const changed=new Set();for(const r of records){const el=r.target.nodeType===1?r.target:r.target.parentElement;if(el.matches?.('.feedback')&&!el.hidden)changed.add(el);for(const n of r.addedNodes)if(n.nodeType===1){if(n.matches('.feedback,.reveal-row h3,#roundHeading'))changed.add(n);n.querySelectorAll?.('.feedback:not([hidden]),.reveal-row h3,#roundHeading').forEach(e=>changed.add(e));}}changed.forEach(reveal);});
  feedbackObserver.observe(document.getElementById('stage'),{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});
  window.addEventListener('pagehide',stop);document.documentElement.classList.toggle('less-motion',reduced());window.CRYSTAL_MOTION={stop,mount,reveal,replay:()=>active?.replay(),pause:()=>active?.pause()};
})();
