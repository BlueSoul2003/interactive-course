(function () {
  'use strict';
  const data = window.EARTH_SPACE_DATA, core = window.EarthSpaceCore;
  const $ = id => document.getElementById(id);
  const all = data.questions, byId = new Map(all.map(q => [q.id, q]));
  const key = 'earth-space-revision-v1', boardKey = `${key}-board`;
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fresh = () => ({ version: 1, resetAt: 0, answers: {}, drafts: {}, session: null, type: 'all', level: 'all', sound: false, autoAdvance: false });
  function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (_) { return fallback; } }
  const saved = read(key, fresh());
  let state = core.merge({ ...fresh(), ...saved, answers: {} }, saved, new Set(byId.keys()));
  if (!['all', 'mcq', 'fill'].includes(state.type)) state.type = 'all';
  if (!['all', 'core', 'apply', 'stretch'].includes(state.level)) state.level = 'all';
  if (!state.drafts || typeof state.drafts !== 'object') state.drafts = {};
  if (!state.session || !Array.isArray(state.session.ids) || !state.session.ids.length || !state.session.ids.every(id => byId.has(id)) || !Number.isInteger(state.session.index) || state.session.index < 0 || state.session.index >= state.session.ids.length) state.session = null;
  let selection = null, submitted = false, confirmAction = null, questionTouched = false;
  let restoreFocus = null, advanceTimer = null, audioContext = null;
  function cancelAdvance() { clearTimeout(advanceTimer); advanceTimer = null; $('stayHere')?.remove(); }
  async function correctSound() {
    if (!state.sound) return;
    try {
      const Audio = window.AudioContext || window.webkitAudioContext; if (!Audio) return;
      audioContext ||= new Audio(); await audioContext.resume();
      const oscillator = audioContext.createOscillator(), gain = audioContext.createGain(), now = audioContext.currentTime;
      oscillator.frequency.setValueAtTime(523.25, now); oscillator.frequency.setValueAtTime(659.25, now + .11);
      gain.gain.setValueAtTime(.035, now); gain.gain.exponentialRampToValueAtTime(.001, now + .3);
      oscillator.connect(gain); gain.connect(audioContext.destination); oscillator.start(now); oscillator.stop(now + .32);
    } catch (_) { /* Audio is optional; grading continues if the browser blocks it. */ }
  }
  function persist() {
    try { localStorage.setItem(key, JSON.stringify(state)); $('saveStatus').textContent = 'Progress saved on this device'; }
    catch (_) { $('saveStatus').textContent = 'Device storage unavailable. Keep this page open or export your progress.'; }
    window.dispatchEvent(new CustomEvent('earth-space-save', { detail: cloudState() }));
  }
  function cloudState() { return { version: 1, resetAt: state.resetAt, answers: state.answers, session: state.session }; }
  function show(view) { ['dashboard', 'workspace', 'empty'].forEach(id => $(id).hidden = id !== view); }
  function counts() { return core.stats(all, state.answers); }
  function updateHome() {
    const s = counts();
    $('topProgress').textContent = `${s.mastered} / 150 understood`;
    $('reviewCount').textContent = s.review;
    $('continue').innerHTML = `${state.session ? 'Continue exploring' : 'Start exploring'} <span>→</span>`;
    $('level').value = state.level;
    $('soundSetting').checked = !!state.sound; $('advanceSetting').checked = !!state.autoAdvance;
    document.querySelectorAll('[data-type]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.type === state.type)));
    $('topics').innerHTML = data.topics.map((t, i) => {
      const qs = core.select(all, state.answers, { topic: t.id, type: state.type, level: state.level });
      const s = core.stats(qs, state.answers);
      return `<button type="button" class="topic-row" data-topic="${t.id}" style="--topic:${t.color}" ${qs.length ? '' : 'disabled'}><span class="topic-number">0${i + 1}</span><span class="topic-copy"><strong>${t.title}</strong><small>${t.subtitle}</small></span><span class="topic-count">${s.mastered} / ${qs.length} understood<span class="mini-progress"><i style="width:${qs.length ? s.mastered / qs.length * 100 : 0}%"></i></span></span><span class="topic-arrow" aria-hidden="true">↗</span></button>`;
    }).join('');
  }
  function home() { cancelAdvance(); show('dashboard'); $('navigator').hidden = true; $('questionList').setAttribute('aria-expanded', 'false'); updateHome(); window.scrollTo(0, 0); }
  function empty(title, text) { $('emptyTitle').textContent = title; $('emptyText').textContent = text; show('empty'); }
  function start(topic = 'all', mode = 'topic') {
    let qs = core.select(all, state.answers, { topic, type: state.type, level: state.level, review: mode === 'review' });
    if (!qs.length) { empty(mode === 'review' ? 'Nothing to revisit here.' : 'No questions in this selection.', mode === 'review' ? 'There are no unresolved mistakes for these filters. Try another topic or question type.' : 'Choose another question type or level from the field guide.'); return; }
    if (mode === 'mixed') {
      const unseen = core.shuffle(qs.filter(q => !state.answers[q.id]?.mastered));
      const learned = core.shuffle(qs.filter(q => state.answers[q.id]?.mastered));
      qs = [...unseen, ...learned].slice(0, 10);
    }
    const title = mode === 'mixed' ? 'Mixed practice · 10 discoveries' : mode === 'review' ? 'Revisit mistakes' : data.topics.find(t => t.id === topic)?.title || 'All topics';
    const nextIndex = mode === 'topic' ? qs.findIndex(q => !state.answers[q.id]?.mastered) : 0;
    state.session = { ids: qs.map(q => q.id), index: Math.max(0, nextIndex), label: title };
    persist(); show('workspace'); renderQuestion(); window.scrollTo(0, 0);
  }
  function current() { return byId.get(state.session?.ids[state.session.index]); }
  function renderQuestion(focus = false) {
    cancelAdvance();
    const q = current(); if (!q) return home();
    const t = data.topics.find(t => t.id === q.topic), a = state.answers[q.id];
    questionTouched = false;
    const hasDraft = Object.prototype.hasOwnProperty.call(state.drafts, q.id);
    selection = hasDraft ? state.drafts[q.id] : a ? a.value : (q.type === 'fill' ? q.answers.map(() => '') : null);
    if (q.type === 'fill' && !Array.isArray(selection)) selection = q.answers.map(() => '');
    submitted = !!a && !hasDraft;
    $('sessionLabel').textContent = state.session.label;
    $('position').textContent = `${state.session.index + 1} / ${state.session.ids.length}`;
    $('sessionProgress').style.width = `${(state.session.index + 1) / state.session.ids.length * 100}%`;
    $('questionMeta').textContent = `${t.title} / ${q.type === 'mcq' ? 'Multiple choice' : 'Fill in the blanks'}`;
    $('difficulty').textContent = { core: 'Core', apply: 'Apply', stretch: 'Think deeper' }[q.level];
    $('prompt').textContent = q.type === 'mcq' ? q.prompt : 'Find the missing words.';
    const v = window.EARTH_SPACE_VISUALS[q.visual];
    $('evidence').hidden = !v;
    $('evidenceTitle').textContent = v?.title || '';
    $('evidenceBody').innerHTML = v?.html || '';
    $('evidenceCaption').textContent = v?.caption || '';
    $('vocabularyText').textContent = t.vocabulary;
    document.querySelector('.vocabulary').open = false;
    $('teacherNote').hidden = true; $('teacher').setAttribute('aria-expanded', 'false');
    const answer = q.type === 'mcq' ? q.options[q.answer] : q.answers.map(x => x[0]).join(' / ');
    $('teacherContent').innerHTML = `<p><strong>Answer:</strong> ${escape(answer)}</p><p>${escape(q.explanation)}</p><p>${escape(t.note)}</p><p lang="zh-Hant">${escape(t.zh)} · ${escape(t.vocabulary)}</p>`;
    renderAnswer();
    $('feedback').hidden = !submitted;
    if (submitted) feedback(a);
    $('previous').disabled = state.session.index === 0;
    $('next').textContent = state.session.index === state.session.ids.length - 1 ? 'Finish practice →' : 'Next question →';
    const batch = Math.floor(state.session.index / 10) + 1;
    $('batchNote').textContent = `Step ${batch} · ${state.session.index % 10 + 1} of ${Math.min(10, state.session.ids.length - (batch - 1) * 10)} questions`;
    updateHome(); renderNavigator();
    if (focus) $('prompt').focus({ preventScroll: true });
  }
  function renderAnswer() {
    const q = current();
    if (q.type === 'mcq') {
      $('answerArea').innerHTML = q.options.map((opt, i) => `<button class="option" type="button" data-option="${i}" aria-pressed="${selection === i}" ${submitted ? 'disabled' : ''}><span class="option-letter">${'ABCD'[i]}</span><span>${escape(opt)}</span></button>`).join('');
    } else {
      let n = 0;
      const sentence = escape(q.prompt).replace(/___/g, () => `<span class="blank-label">[${++n}]</span>`);
      $('answerArea').innerHTML = `<p class="fill-sentence">${sentence}</p>` + q.answers.map((_, i) => `<label class="fill-label" for="blank${i}">Missing word ${i + 1}<input id="blank${i}" class="fill-input" data-blank="${i}" type="text" maxlength="80" autocomplete="off" autocapitalize="none" spellcheck="false" aria-describedby="blankResult${i}" value="${escape(selection?.[i] || '')}" ${submitted ? 'readonly' : ''}><span class="blank-result" id="blankResult${i}"></span></label>`).join('');
    }
    $('check').hidden = submitted;
    $('retry').hidden = !submitted;
  }
  function feedback(a) {
    const q = current();
    $('feedback').hidden = false;
    $('feedback').classList.toggle('wrong', !a.correct);
    const answer = q.type === 'mcq' ? q.options[q.answer] : q.answers.map((list, i) => `${i + 1}: ${list[0]}`).join(' · ');
    $('feedback').innerHTML = `<strong>${a.correct ? 'That makes sense. Well done!' : 'A useful discovery. Let’s look again.'}</strong>${a.correct ? '' : `<p class="correct-answer">Answer: ${escape(answer)}</p>`}<p>${escape(q.explanation)}</p>`;
    if (q.type === 'mcq') {
      document.querySelectorAll('[data-option]').forEach(b => {
        const i = Number(b.dataset.option);
        b.classList.toggle('is-right', i === q.answer);
        b.classList.toggle('is-wrong', !a.correct && i === a.value);
      });
    } else {
      q.answers.forEach((accepted, i) => {
        const right = core.grade(q, a.value).blanks[i];
        $(`blank${i}`).setAttribute('aria-invalid', String(!right));
        $(`blankResult${i}`).textContent = right ? '✓ Correct' : `Try: ${accepted[0]}`;
      });
    }
  }
  function check() {
    if (submitted) return;
    const q = current();
    if ((q.type === 'mcq' && selection === null) || (q.type === 'fill' && selection.some(v => !String(v).trim()))) {
      $('feedback').hidden = false; $('feedback').classList.add('wrong'); $('feedback').textContent = q.type === 'mcq' ? 'Choose an option before checking.' : 'Fill in every blank before checking.'; return;
    }
    questionTouched = true;
    const a = core.record(state.answers[q.id], selection, core.grade(q, selection));
    state.answers[q.id] = a; delete state.drafts[q.id]; submitted = true;
    persist(); renderAnswer(); feedback(a); updateHome(); renderNavigator();
    if (a.correct) {
      correctSound();
      if (state.autoAdvance && $('board').hidden && $('teacherNote').hidden && state.session.index < state.session.ids.length - 1) {
        const stay = document.createElement('button'); stay.id = 'stayHere'; stay.type = 'button'; stay.textContent = 'Stay here · next in 4 seconds'; stay.onclick = cancelAdvance; $('feedback').append(stay);
        advanceTimer = setTimeout(() => navigate(state.session.index + 1), 4000);
      }
    }
    $('next').focus({ preventScroll: true });
  }
  function renderNavigator() {
    $('questionGrid').innerHTML = state.session.ids.map((id, i) => {
      const a = state.answers[id], status = a ? (a.correct ? 'mastered' : 'mistake') : '';
      return `<button type="button" class="question-jump ${status}" data-jump="${i}" aria-current="${i === state.session.index}" aria-label="Question ${i + 1}, ${a ? (a.correct ? 'understood' : 'revisit') : 'not attempted'}">${i + 1} ${a ? (a.correct ? '✓' : '!') : '○'}</button>`;
    }).join('');
  }
  function navigate(index) {
    if (index < 0 || index >= state.session.ids.length) return;
    state.session.index = index; persist(); renderQuestion(true); window.scrollTo(0, 0);
  }
  function openDialog(id) { cancelAdvance(); restoreFocus = document.activeElement; $(id).showModal(); }
  function ask(title, description, action) { $('confirmTitle').textContent = title; $('confirmText').textContent = description; confirmAction = action; openDialog('confirmDialog'); }
  function report() {
    const s = counts();
    const rate = s.attempted ? `${Math.round(s.firstCorrect / s.attempted * 100)}%` : '—';
    $('reportContent').innerHTML = `<div class="report-stats"><div class="report-stat"><strong>${s.mastered}<small> / 150</small></strong><span>Understood at least once</span></div><div class="report-stat"><strong>${rate}</strong><span>Correct on first attempt</span></div><div class="report-stat"><strong>${s.review}</strong><span>Questions to revisit</span></div></div><p class="report-note">${s.attempted} questions attempted. First-attempt accuracy is measured only across attempted questions; retries do not change it.</p><table class="report-table"><thead><tr><th scope="col">Topic</th><th scope="col">Understood</th><th scope="col">First correct</th><th scope="col">Revisit</th></tr></thead><tbody>${data.topics.map(t => { const s = core.stats(all.filter(q => q.topic === t.id), state.answers); return `<tr><th scope="row">${t.title}</th><td>${s.mastered} / ${s.total}</td><td>${s.firstCorrect} / ${s.attempted}</td><td>${s.review}</td></tr>`; }).join('')}</tbody></table><p class="report-note">Progress is saved on this device. Signed-in progress also uses the course portal’s existing sync service when available. Writing-board notes stay on this device.</p>`;
    openDialog('reportDialog');
  }
  $('home').onclick = home; $('back').onclick = home; $('emptyBack').onclick = home;
  $('continue').onclick = () => { if (state.session) { show('workspace'); renderQuestion(true); } else start('earth'); };
  $('mixed').onclick = () => start('all', 'mixed'); $('review').onclick = () => start('all', 'review');
  $('topics').onclick = e => { const b = e.target.closest('[data-topic]'); if (b) start(b.dataset.topic); };
  $('typeFilters').onclick = e => { const b = e.target.closest('[data-type]'); if (b) { state.type = b.dataset.type; persist(); updateHome(); } };
  $('level').onchange = e => { state.level = e.target.value; persist(); updateHome(); };
  $('soundSetting').onchange = e => { state.sound = e.target.checked; persist(); };
  $('advanceSetting').onchange = e => { state.autoAdvance = e.target.checked; cancelAdvance(); persist(); };
  $('answerArea').onclick = e => { const b = e.target.closest('[data-option]'); if (!b || submitted) return; questionTouched = true; selection = Number(b.dataset.option); state.drafts[current().id] = selection; persist(); document.querySelectorAll('[data-option]').forEach(opt => opt.setAttribute('aria-pressed', String(Number(opt.dataset.option) === selection))); $('feedback').hidden = true; };
  $('answerArea').oninput = e => { if (e.target.dataset.blank === undefined || submitted) return; questionTouched = true; selection[Number(e.target.dataset.blank)] = e.target.value; state.drafts[current().id] = [...selection]; persist(); $('feedback').hidden = true; };
  $('answerArea').onkeydown = e => { if (e.key === 'Enter' && e.target.matches('input')) { e.preventDefault(); check(); } };
  $('check').onclick = check;
  $('retry').onclick = () => { questionTouched = true; submitted = false; const q = current(); selection = q.type === 'mcq' ? null : q.answers.map(() => ''); state.drafts[q.id] = selection; persist(); $('feedback').hidden = true; renderAnswer(); $('answerArea').querySelector('button,input')?.focus(); };
  $('previous').onclick = () => navigate(state.session.index - 1);
  $('next').onclick = () => {
    if (state.session.index < state.session.ids.length - 1) return navigate(state.session.index + 1);
    const s = core.stats(state.session.ids.map(id => byId.get(id)), state.answers);
    empty('A little more understood.', `${s.mastered} of ${s.total} questions understood in this practice. ${s.review} to revisit and ${s.total - s.attempted} not yet attempted. Your progress is saved; you can return whenever you like.`);
  };
  $('questionList').onclick = () => { const visible = $('navigator').hidden; $('navigator').hidden = !visible; $('questionList').setAttribute('aria-expanded', String(visible)); };
  $('closeNavigator').onclick = () => { $('navigator').hidden = true; $('questionList').setAttribute('aria-expanded', 'false'); $('questionList').focus(); };
  $('questionGrid').onclick = e => { const b = e.target.closest('[data-jump]'); if (b) { navigate(Number(b.dataset.jump)); $('navigator').hidden = true; $('questionList').setAttribute('aria-expanded', 'false'); } };
  $('teacher').onclick = () => { cancelAdvance(); const open = $('teacherNote').hidden; $('teacherNote').hidden = !open; $('teacher').setAttribute('aria-expanded', String(open)); };
  $('report').onclick = report;
  $('sourcesButton').onclick = () => { $('sourceList').innerHTML = data.sources.map(s => `<li><a href="${s.url}" target="_blank" rel="noopener">${escape(s.title)}</a></li>`).join(''); openDialog('sourcesDialog'); };
  document.querySelectorAll('dialog').forEach(d => { d.addEventListener('click', e => { if (e.target.closest('[data-close]')) d.close(); }); d.addEventListener('close', () => restoreFocus?.focus?.({ preventScroll: true })); });
  $('cancelConfirm').onclick = () => { confirmAction = null; $('confirmDialog').close(); };
  $('acceptConfirm').onclick = () => { const action = confirmAction; confirmAction = null; $('confirmDialog').close(); action?.(); };
  $('reset').onclick = () => ask('Reset this unit’s progress?', 'This clears answers and drafts for Earth & Space only. Your writing board is kept. Export progress first if you want a record.', () => { state = { ...fresh(), resetAt: Date.now() }; persist(); $('reportDialog').close(); home(); });
  $('print').onclick = () => window.print();
  $('export').onclick = () => { const blob = new Blob([JSON.stringify({ module: data.id, exportedAt: new Date().toISOString(), summary: counts(), ...cloudState() }, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'earth-space-progress.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); };

  // Independent, locally persisted teacher board. Coordinates use a fixed logical 1200 × 900 surface.
  let boardData = read(boardKey, { strokes: [], text: '' });
  if (!boardData || !Array.isArray(boardData.strokes)) boardData = { strokes: [], text: '' };
  let active = null, tool = 'pen', pointerId = null;
  const canvas = $('inkCanvas'), ctx = canvas.getContext('2d');
  function saveBoard() { try { localStorage.setItem(boardKey, JSON.stringify(boardData)); $('boardStatus').textContent = 'Notes saved on this device'; } catch (_) { $('boardStatus').textContent = 'Storage full or unavailable. Keep this page open.'; } }
  function drawStroke(stroke) {
    if (!stroke.points?.length) return;
    ctx.save(); ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over'; ctx.strokeStyle = stroke.color; ctx.fillStyle = stroke.color; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = stroke.width;
    const points = stroke.points; ctx.beginPath(); ctx.moveTo(points[0].x, points[0].y); points.slice(1).forEach(p => ctx.lineTo(p.x, p.y)); ctx.stroke();
    if (points.length === 1) { ctx.beginPath(); ctx.arc(points[0].x, points[0].y, stroke.width / 2, 0, 2 * Math.PI); ctx.fill(); }
    ctx.restore();
  }
  function drawBoard() { ctx.clearRect(0, 0, canvas.width, canvas.height); boardData.strokes.forEach(drawStroke); if (active) drawStroke(active); $('undo').disabled = !boardData.strokes.length; }
  function board(open) { cancelAdvance(); $('board').hidden = !open; $('boardTab').hidden = open; $('boardTab').setAttribute('aria-expanded', String(open)); if (open) { drawBoard(); $('closeBoard').focus({ preventScroll: true }); } else $('boardTab').focus({ preventScroll: true }); }
  document.addEventListener('keydown', e => { if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'r') { e.preventDefault(); if (!$('confirmDialog').open) $('reset').click(); } });
  function point(e) { const r = canvas.getBoundingClientRect(); return { x: Math.max(0, Math.min(1200, (e.clientX - r.left) / r.width * 1200)), y: Math.max(0, Math.min(900, (e.clientY - r.top) / r.height * 900)) }; }
  canvas.addEventListener('pointerdown', e => { if (pointerId !== null || e.button !== 0) return; e.preventDefault(); pointerId = e.pointerId; canvas.setPointerCapture(pointerId); active = { tool, color: $('inkColor').value, width: tool === 'eraser' ? 38 : Number($('inkWidth').value), points: [point(e)] }; drawBoard(); });
  canvas.addEventListener('pointermove', e => { if (!active || e.pointerId !== pointerId) return; e.preventDefault(); const events = e.getCoalescedEvents?.() || [e]; for (const sample of events.length ? events : [e]) { const p = point(sample), last = active.points.at(-1); if (Math.hypot(p.x - last.x, p.y - last.y) > 1) active.points.push(p); } drawBoard(); });
  function finishStroke(e) { if (!active || e.pointerId !== pointerId) return; boardData.strokes.push(active); active = null; pointerId = null; drawBoard(); saveBoard(); }
  canvas.addEventListener('pointerup', finishStroke); canvas.addEventListener('pointercancel', finishStroke); canvas.addEventListener('lostpointercapture', finishStroke);
  $('typedNotes').value = boardData.text || ''; $('typedNotes').oninput = e => { boardData.text = e.target.value; saveBoard(); };
  $('boardTab').onclick = () => board(true); $('closeBoard').onclick = () => board(false);
  $('expandBoard').onclick = () => { const expanded = $('board').classList.toggle('expanded'); $('expandBoard').setAttribute('aria-pressed', String(expanded)); $('expandBoard').textContent = expanded ? 'Compact ↔' : 'Expand ↔'; drawBoard(); };
  function setTool(next) { tool = next; $('pen').setAttribute('aria-pressed', String(tool === 'pen')); $('eraser').setAttribute('aria-pressed', String(tool === 'eraser')); }
  $('pen').onclick = () => setTool('pen'); $('eraser').onclick = () => setTool('eraser');
  $('undo').onclick = () => { boardData.strokes.pop(); drawBoard(); saveBoard(); };
  $('clearBoard').onclick = () => ask('Clear the writing board?', 'This clears handwriting and typed notes. Question answers and learning progress are kept.', () => { boardData = { strokes: [], text: '' }; $('typedNotes').value = ''; drawBoard(); saveBoard(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !document.querySelector('dialog[open]')) { if (!$('board').hidden) board(false); else if (!$('navigator').hidden) $('closeNavigator').click(); } if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'b') { e.preventDefault(); board($('board').hidden); } if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 't' && !$('workspace').hidden) { e.preventDefault(); $('teacher').click(); } });
  window.EarthSpaceApp = {
    cloudState,
    mergeRemote(remote) {
      const old = state; state = core.merge(state, remote, new Set(byId.keys()));
      // Never move a learner away from their active question or overwrite in-progress typing.
      if (!state.session && remote?.session && Array.isArray(remote.session.ids) && remote.session.ids.length && remote.session.ids.every(id => byId.has(id)) && Number.isInteger(remote.session.index) && remote.session.index >= 0 && remote.session.index < remote.session.ids.length) state.session = remote.session;
      if (state.resetAt > old.resetAt) state.drafts = {};
      try { localStorage.setItem(key, JSON.stringify(state)); } catch (_) { /* In-memory progress remains usable. */ }
      updateHome(); if (!$('workspace').hidden && !questionTouched) renderQuestion();
    }
  };
  home();
})();
