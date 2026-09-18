(function(){
  'use strict';
  const sounds={
    correct:[[[523,.00,.12],[659,.10,.13],[784,.22,.20]],[[659,0,.10],[880,.12,.22]],[[523,0,.13],[784,.14,.13],[1047,.28,.18]],[[587,0,.13],[740,.09,.16],[880,.18,.23]]],
    incorrect:[[[349,0,.16],[294,.17,.22]],[[392,0,.12],[330,.14,.13],[262,.29,.20]],[[311,0,.20],[277,.22,.22]],[[440,0,.12],[349,.15,.15],[294,.32,.20]]]
  };
  let ctx=null,muted=false,streak=0,kind=null,glowTimer=null,animation=null,generation=0;
  const count={correct:0,incorrect:0},voices=new Set();
  try{muted=localStorage.getItem('crystal-sound-muted')==='true';}catch(_){}
  const button=document.createElement('button');button.id='soundToggle';button.className='quiet';
  document.querySelector('.top-actions').append(button);
  const edges=document.createElement('div');edges.className='answer-edges';edges.setAttribute('aria-hidden','true');edges.hidden=true;document.body.append(edges);
  const toast=document.createElement('div');toast.className='streak-toast';toast.setAttribute('role','status');toast.hidden=true;document.body.append(toast);
  function sync(){button.textContent=muted?'♪ ×':'♪';button.setAttribute('aria-label',muted?'Turn answer sounds on':'Mute answer sounds');button.setAttribute('aria-pressed',String(!muted));button.title=muted?'Answer sounds off':'Answer sounds on · 4 correct + 4 incorrect';}
  function silence(){generation++;for(const v of voices){try{v.stop();}catch(_){}}voices.clear();}
  button.onclick=()=>{muted=!muted;if(muted)silence();try{localStorage.setItem('crystal-sound-muted',String(muted));}catch(_){}sync();};
  async function play(type,index){
    silence();if(muted)return;const token=generation;
    try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;ctx=ctx||new Audio();await ctx.resume();if(token!==generation||muted||document.hidden)return;
      button.dataset.audioState=ctx.state;button.dataset.lastEffect=type+'-'+(index+1);
      const now=ctx.currentTime+.015;
      for(const [frequency,delay,length] of sounds[type][index]){const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=type==='correct'?'sine':'triangle';osc.frequency.setValueAtTime(frequency,now+delay);gain.gain.setValueAtTime(0,now+delay);gain.gain.linearRampToValueAtTime(.065,now+delay+.018);gain.gain.exponentialRampToValueAtTime(.001,now+delay+length);osc.connect(gain);gain.connect(ctx.destination);voices.add(osc);osc.onended=()=>{voices.delete(osc);osc.disconnect();gain.disconnect();};osc.start(now+delay);osc.stop(now+delay+length+.02);}
    }catch(_){button.dataset.audioState='unavailable';}
  }
  function clearGlow(){clearTimeout(glowTimer);animation?.cancel();animation=null;edges.hidden=true;toast.hidden=true;}
  function respond(correct,first=true){const type=correct?'correct':'incorrect';play(type,count[type]++%4);if(!first)return;streak=kind===type?streak+1:1;kind=type;clearGlow();if(streak<2)return;
    const soft=matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.classList.contains('less-motion');
    edges.dataset.result=type;edges.hidden=soft;toast.dataset.result=type;toast.textContent=correct?streak+' in a row!':streak+' to revisit · take your time';toast.hidden=false;
    if(!soft&&edges.animate)animation=edges.animate([{opacity:0},{opacity:.85,offset:.22},{opacity:.55,offset:.6},{opacity:0}],{duration:1700,easing:'ease-out'});
    glowTimer=setTimeout(clearGlow,1800);
  }
  function reset(){streak=0;kind=null;clearGlow();silence();}
  document.addEventListener('visibilitychange',()=>{if(document.hidden){silence();clearGlow();}});window.addEventListener('pagehide',reset);
  sync();window.CRYSTAL_FEEDBACK={respond,reset};
})();
