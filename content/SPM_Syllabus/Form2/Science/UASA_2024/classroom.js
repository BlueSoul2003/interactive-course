(() => {
  'use strict';
  const bank = window.UASA_SCIENCE.questions;
  const $ = id => document.getElementById(id);
  const storageKey = 'spm-sci-f2-uasa-2024-classroom-v1';
  let index = 0, revealed = 0, zoom = 100, autoFit = true;
  const languages = ['zh','en','both'];
  let explanationLanguage = 'zh', explanationsVisible = true;
  let visited = new Set();
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && Number.isInteger(saved.index) && saved.index >= 0 && saved.index < bank.length) index = saved.index;
    if (Array.isArray(saved?.visited)) visited = new Set(saved.visited.filter(i => Number.isInteger(i) && i >= 0 && i < bank.length));
    if (languages.includes(saved?.explanationLanguage)) explanationLanguage = saved.explanationLanguage;
    if (typeof saved?.explanationsVisible === 'boolean') explanationsVisible = saved.explanationsVisible;
  } catch (_) {}
  function save() { try { localStorage.setItem(storageKey, JSON.stringify({index, visited:[...visited], explanationLanguage, explanationsVisible})); } catch (_) {} }
  function make(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; }
  function updateControls() {
    const count = bank[index].steps.length;
    $('stepCount').textContent = `${revealed} / ${count} langkah`;
    $('answerEmpty').hidden = revealed > 0;
    $('answerSteps').hidden = revealed === 0;
    $('answerDone').hidden = revealed !== count;
    $('undoButton').disabled = $('hideButton').disabled = revealed === 0;
    $('previousButton').disabled = index === 0;
    $('nextButton').disabled = index === bank.length - 1;
    $('revealButton').disabled = revealed === count && index === bank.length - 1;
    $('revealLabel').textContent = revealed === count ? (index === bank.length - 1 ? 'Kertas selesai' : 'Soalan seterusnya') : (revealed ? 'Langkah seterusnya' : 'Tunjuk jawapan');
  }
  function render() {
    revealed = 0;
    const q = bank[index];
    $('sectionLabel').textContent = `BAHAGIAN ${q.section} · ${q.section === 'A' ? 'OBJEKTIF' : q.section === 'B' ? 'STRUKTUR' : 'RESPONS TERBUKA'}`;
    $('questionTitle').textContent = `Soalan ${q.label}`;
    $('topicLabel').textContent = q.topic;
    $('positionLabel').textContent = `${String(index+1).padStart(2,'0')} / ${bank.length}`;
    $('shortPosition').textContent = `${index+1} / ${bank.length}`;
    $('progressFill').style.width = `${(index+1)/bank.length*100}%`;
    $('questionImages').replaceChildren();
    q.images.forEach((src, i) => {
      const paper = make('div', 'source-paper');
      const layout = window.UASA_QUESTION_LAYOUT?.[src];
      const strips = layout?.strips || [[0,q.dimensions[i][1]]];
      strips.forEach(([top,bottom], j) => {
        const strip = make('div', 'source-strip');
        strip.style.aspectRatio = `${q.dimensions[i][0]} / ${bottom-top}`;
        const img = make('img'); img.src = src;
        img.alt = j === 0 ? (i === 0 ? `Petikan soalan asal ${q.section}${q.label}` : 'Rajah atau maklumat asal untuk soalan ini') : '';
        img.width = q.dimensions[i][0]; img.height = q.dimensions[i][1];
        img.style.transform = `translateY(-${top/q.dimensions[i][1]*100}%)`;
        strip.append(img); paper.append(strip);
      });
      $('questionImages').append(paper);
    });
    $('questionText').textContent = q.text;
    $('questionScroll').scrollTop = $('questionScroll').scrollLeft = 0;
    $('sourceLabel').textContent = `Kertas asal · halaman ${q.pages.join(', ')}`;
    $('sourceLink').href = `source.pdf#page=${q.pages[0]}`;
    $('answerSteps').replaceChildren();
    $('noteWrap').hidden = !q.note;
    $('teacherNote').hidden = true;
    $('teacherNote').textContent = q.note || '';
    $('noteButton').setAttribute('aria-expanded', 'false');
    autoFit = true; updateControls(); updateExplanations(); fitQuestion(); save();
  }
  function go(next) { if (next >= 0 && next < bank.length) { index = next; render(); } }
  function scrollAnswer() {
    const article = $('answerSteps').lastElementChild;
    if (!article) return;
    const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
    if (matchMedia('(min-width: 961px)').matches) $('answerSteps').scrollTo({top:$('answerSteps').scrollHeight, behavior});
    else article.scrollIntoView({block:'nearest', behavior});
  }
  function showStep() {
    const q = bank[index];
    if (revealed === q.steps.length) { go(index+1); return; }
    const s = q.steps[revealed];
    const article = make('article', 'answer-step');
    article.append(make('span', 'step-label', `LANGKAH ${revealed+1}`), make('p', 'answer-main', s.bm));
    const explanations = make('div','explanations');
    const chinese = make('p','explanation chinese',s.zh); chinese.lang = 'zh-Hant';
    const english = make('p','explanation english',s.en); english.lang = 'en';
    explanations.append(chinese,english);
    if (s.diagram === 'pyramid') {
      const p = make('div','pyramid');
      for(let i=0;i<4;i++) { const e = make('div'); e.style.width = `${40+i*20}%`; p.append(e); }
      explanations.append(p);
    }
    if (s.diagram === 'filter') explanations.append(make('div','filter-diagram'));
    article.append(explanations);
    $('answerSteps').append(article); revealed++;
    if (revealed === q.steps.length) visited.add(index);
    updateControls(); updateExplanations(); save();
    scrollAnswer();
  }
  function undo() { if (revealed > 0) { $('answerSteps').lastElementChild.remove(); revealed--; updateControls(); } }
  function hide() { revealed = 0; $('answerSteps').replaceChildren(); updateControls(); }
  function updateExplanations() {
    document.querySelectorAll('[data-explanation-language]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.explanationLanguage === explanationLanguage)));
    $('explanationToggle').setAttribute('aria-pressed',String(explanationsVisible));
    $('explanationToggle').textContent = explanationsVisible ? '隱藏解釋 / Hide' : '顯示解釋 / Show';
    const label = (zh,en) => explanationLanguage === 'zh' ? zh : explanationLanguage === 'en' ? en : `${zh} / ${en}`;
    $('answerSteps').querySelectorAll('.answer-step').forEach(article => {
      const explanations = article.querySelector('.explanations');
      explanations.hidden = !explanationsVisible;
      explanations.lang = explanationLanguage === 'en' ? 'en' : 'zh-Hant';
      article.querySelector('.chinese').hidden = explanationLanguage === 'en';
      article.querySelector('.english').hidden = explanationLanguage === 'zh';
      const pyramid = article.querySelector('.pyramid');
      if(pyramid) {
        const tiers = [['白鷺','Egret'],['大魚','Big fish'],['小魚','Small fish'],['水草','Waterweed']];
        [...pyramid.children].forEach((tier,i) => tier.textContent = label(...tiers[i]));
      }
      const filter = article.querySelector('.filter-diagram');
      if(filter) filter.textContent = [['泥水','Muddy water'],['大石塊','Coarse stones'],['小石塊','Small stones'],['乾淨口罩','Clean face mask'],['瓶口','Bottle opening'],['收集容器','Collection vessel']].map(([zh,en])=>label(zh,en)).join(' ↓\n');
    });
  }
  function setExplanationLanguage(value) {
    if (!languages.includes(value)) return;
    explanationLanguage = value; updateExplanations(); save(); requestAnimationFrame(scrollAnswer);
  }
  function toggleExplanations() { explanationsVisible = !explanationsVisible; updateExplanations(); save(); requestAnimationFrame(scrollAnswer); }
  function updateZoom() {
    $('zoomLabel').value = `${zoom}%`;
    $('zoomOut').disabled = zoom <= 75; $('zoomIn').disabled = zoom >= 175;
    $('fitButton').setAttribute('aria-pressed',String(autoFit));
  }
  function setZoom(value) { autoFit = false; zoom = Math.max(75,Math.min(175,value)); $('questionImages').style.width = `${zoom}%`; updateZoom(); }
  function fitQuestion() {
    if (!autoFit) return;
    const images = $('questionImages'), scroll = $('questionScroll');
    images.style.width = '100%'; zoom = 100;
    if (matchMedia('(min-width: 961px)').matches) {
      const style = getComputedStyle(scroll);
      const available = scroll.clientHeight-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom)-2;
      const ratio = Math.min(1,available/images.offsetHeight);
      // Fit ordinary questions; retain readable size for genuinely long tables.
      if (ratio >= .76) {
        zoom = Math.max(75,Math.floor(ratio*100));
        images.style.width = `${zoom}%`;
        for (let i=0;i<3 && images.offsetHeight>available && zoom>75;i++) images.style.width = `${--zoom}%`;
      }
    }
    scroll.scrollTop = scroll.scrollLeft = 0; updateZoom();
  }
  async function full() { try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); } catch (_) { $('fullscreenButton').textContent = 'Gunakan F11'; } }
  function openMap() {
    const nav = $('questionMap'); nav.replaceChildren();
    ['A','B','C'].forEach(section => {
      const group = make('section','question-group'); group.append(make('h3','',`BAHAGIAN ${section}`)); const list = make('div','map-buttons');
      bank.forEach((q,i) => { if(q.section !== section) return; const b = make('button',visited.has(i)?'visited':'',q.label); if(i === index) b.setAttribute('aria-current','true'); b.addEventListener('click',()=>{go(i);$('jumpDialog').close();}); list.append(b); });
      group.append(list); nav.append(group);
    }); $('jumpDialog').showModal();
  }
  $('previousButton').onclick = () => go(index-1); $('nextButton').onclick = () => go(index+1);
  $('revealButton').onclick = showStep; $('undoButton').onclick = undo; $('hideButton').onclick = hide;
  $('zoomOut').onclick = () => setZoom(zoom-25); $('zoomIn').onclick = () => setZoom(zoom+25);
  $('fitButton').onclick = () => {autoFit=true;fitQuestion();};
  document.querySelectorAll('[data-explanation-language]').forEach(button => button.onclick = () => setExplanationLanguage(button.dataset.explanationLanguage));
  $('explanationToggle').onclick = toggleExplanations;
  $('fullscreenButton').onclick = full; $('jumpButton').onclick = openMap; $('helpButton').onclick = () => $('helpDialog').showModal();
  $('noteButton').onclick = () => { const closed = $('teacherNote').hidden; $('teacherNote').hidden = !closed; $('noteButton').setAttribute('aria-expanded',String(closed)); requestAnimationFrame(scrollAnswer); };
  document.querySelectorAll('[data-close]').forEach(b => b.onclick = () => b.closest('dialog').close());
  document.addEventListener('click', e => {
    if(e.detail > 0 && e.target.closest('button') && !document.querySelector('dialog[open]')) document.activeElement?.blur();
  });
  document.addEventListener('keydown', e => {
    if (e.repeat || e.ctrlKey || e.metaKey || e.altKey || document.querySelector('dialog[open]') || e.target.closest('button,a,input,textarea,select,[contenteditable="true"]')) return;
    if(e.code === 'Space') { e.preventDefault(); showStep(); }
    else if(e.key === 'ArrowRight') { e.preventDefault();go(index+1); }
    else if(e.key === 'ArrowLeft') { e.preventDefault();go(index-1); }
    else if(e.key === 'Backspace') { e.preventDefault();undo(); }
    else if(e.key.toLowerCase() === 'h') hide();
    else if(e.key.toLowerCase() === 'f') full();
    else if(e.key.toLowerCase() === 'e') { e.preventDefault(); toggleExplanations(); }
    else if(e.key.toLowerCase() === 'l') { e.preventDefault(); setExplanationLanguage(languages[(languages.indexOf(explanationLanguage)+1)%languages.length]); }
    else if(e.key === '+' || e.key === '=') setZoom(zoom+25);
    else if(e.key === '-') setZoom(zoom-25);
  });
  new ResizeObserver(fitQuestion).observe($('questionScroll'));
  render();
})();
