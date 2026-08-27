(function () {
  'use strict';

  const data = window.PLANET_EARTH_REVISION_DATA;
  if (!data) throw new Error('Planet Earth revision data failed to load.');

  const STORAGE_KEY = 'planet-earth-revision-v3';
  const levels = ['core', 'apply', 'stretch'];
  const defaultState = {
    mode: 'mcq',
    unit: 'structure',
    filter: 'all',
    index: 0,
    answers: {},
    lastOpened: null
  };
  let state = loadLocalState();
  let strokesByQuestion = {};
  let activeStroke = null;
  let drawing = false;
  let inkMode = 'pen';
  let autoAdvanceTimer = null;
  let autoAdvanceInterval = null;

  const el = {};
  document.querySelectorAll('[id]').forEach((node) => { el[node.id] = node; });

  function loadLocalState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return { ...defaultState, ...(saved || {}), answers: saved?.answers || {} };
    } catch (_error) {
      return { ...defaultState };
    }
  }

  function persist(message) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    el.saveStatus.textContent = message || 'Progress saved';
    el.saveStatus.classList.add('show');
    window.clearTimeout(persist.timer);
    persist.timer = window.setTimeout(() => el.saveStatus.classList.remove('show'), 1400);
    if (window.ProgressTracker) {
      window.ProgressTracker.autoSave({
        mode: state.mode,
        unit: state.unit,
        filter: state.filter,
        index: state.index,
        answers: state.answers,
        lastOpened: state.lastOpened
      });
    }
  }

  function mergeRemote(remote) {
    if (!remote || typeof remote !== 'object') return;
    state = {
      ...state,
      ...remote,
      answers: { ...state.answers, ...(remote.answers || {}) }
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    updateDashboard();
  }

  function questionId(unitKey, mode, index) {
    return `${unitKey}-${mode}-${String(index + 1).padStart(3, '0')}`;
  }

  function questionsFor(unitKey = state.unit, mode = state.mode, applyFilter = true) {
    const source = data.units[unitKey][mode];
    return source.map((question, sourceIndex) => ({
      ...question,
      id: questionId(unitKey, mode, sourceIndex),
      sourceIndex
    })).filter((question) => !applyFilter || state.filter === 'all' || question.level === state.filter);
  }

  function allQuestions() {
    return data.unitOrder.flatMap((unitKey) => ['mcq', 'cloze'].flatMap((mode) =>
      questionsFor(unitKey, mode, false).map((question) => ({ ...question, unitKey, mode }))
    ));
  }

  function answeredStats(questionList) {
    return questionList.reduce((stats, question) => {
      const answer = state.answers[question.id];
      if (answer) stats.attempted += 1;
      if (answer?.correct) {
        stats.answered += 1;
        stats.correct += 1;
      }
      if (answer) stats.wrongAttempts += answer.wrongAttempts || (answer.correct ? 0 : 1);
      return stats;
    }, { attempted: 0, answered: 0, correct: 0, wrongAttempts: 0 });
  }

  function updateDashboard() {
    const everyQuestion = allQuestions();
    const total = answeredStats(everyQuestion);
    el.scoreValue.textContent = total.correct;
    el.scoreTotal.textContent = `/ ${everyQuestion.length}`;

    data.unitOrder.forEach((unitKey) => {
      const list = ['mcq', 'cloze'].flatMap((mode) => questionsFor(unitKey, mode, false));
      const stats = answeredStats(list);
      const label = document.querySelector(`[data-unit-count="${unitKey}"]`);
      if (label) label.textContent = `${stats.answered} / ${list.length} completed`;
    });

    document.querySelectorAll('.mode-card').forEach((button) => {
      const active = button.dataset.mode === state.mode;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('.filter-button').forEach((button) => {
      const active = button.dataset.filter === state.filter;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    if (state.lastOpened) {
      el.resumeButton.hidden = false;
      const lastUnit = data.units[state.lastOpened.unit];
      el.resumeButton.textContent = `Resume ${lastUnit ? lastUnit.title : 'last question'}`;
    }
  }

  function firstUnanswered(unitKey, mode) {
    const list = questionsFor(unitKey, mode);
    const index = list.findIndex((question) => !state.answers[question.id]);
    return index === -1 ? 0 : index;
  }

  function openUnit(unitKey, requestedIndex) {
    state.unit = unitKey;
    const list = questionsFor();
    state.index = Number.isInteger(requestedIndex) ? Math.min(Math.max(requestedIndex, 0), Math.max(list.length - 1, 0)) : firstUnanswered(unitKey, state.mode);
    state.lastOpened = { unit: state.unit, mode: state.mode, index: state.index };
    el.dashboardView.hidden = true;
    el.workspaceView.hidden = false;
    renderWorkspace();
    persist('Question opened');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showDashboard() {
    cancelAutoAdvance();
    el.workspaceView.hidden = true;
    el.dashboardView.hidden = false;
    updateDashboard();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function currentQuestion() {
    return questionsFor()[state.index] || null;
  }

  function renderWorkspace() {
    cancelAutoAdvance();
    const unit = data.units[state.unit];
    const list = questionsFor();
    if (!list.length) {
      state.filter = 'all';
      state.index = 0;
      return renderWorkspace();
    }
    state.index = Math.min(state.index, list.length - 1);
    const question = list[state.index];
    const answer = state.answers[question.id];

    el.questionMeta.textContent = `${unit.title} | ${state.mode === 'mcq' ? 'Four-option MCQ' : 'Triple-blank cloze'} ${state.index + 1} of ${list.length}`;
    el.questionTitle.textContent = state.mode === 'mcq' ? question.prompt : 'Complete all three blanks.';
    el.difficultyBadge.textContent = question.level[0].toUpperCase() + question.level.slice(1);
    el.difficultyBadge.dataset.level = question.level;
    const visualImage = el.topicVisual.querySelector('img');
    visualImage.src = unit.image;
    visualImage.alt = unit.imageAlt;
    el.topicCaption.textContent = unit.caption;

    renderRail(list);
    renderAnswer(question, answer);
    renderTeacher(question);
    el.previousQuestion.disabled = state.index === 0;
    el.nextQuestion.textContent = state.index === list.length - 1 ? 'Finish unit' : 'Next question';
    el.questionProgress.textContent = `${state.index + 1} / ${list.length}`;
    restoreCanvas(question.id);
    state.lastOpened = { unit: state.unit, mode: state.mode, index: state.index };
    updateDashboard();
  }

  function renderRail(list) {
    const stats = answeredStats(list);
    el.railSummary.innerHTML = `<strong>${data.units[state.unit].title}</strong><span>${stats.answered} completed, ${stats.wrongAttempts} mistakes</span>`;
    el.railContent.innerHTML = '';
    levels.forEach((level) => {
      const levelQuestions = list.map((question, index) => ({ question, index })).filter((item) => item.question.level === level);
      if (!levelQuestions.length) return;
      const group = document.createElement('section');
      group.className = 'rail-group';
      const heading = document.createElement('h3');
      heading.textContent = level[0].toUpperCase() + level.slice(1);
      group.appendChild(heading);
      const grid = document.createElement('div');
      grid.className = 'rail-grid';
      levelQuestions.forEach(({ question, index }) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = index + 1;
        button.setAttribute('aria-label', `Open question ${index + 1}`);
        const saved = state.answers[question.id];
        if (saved) button.classList.add(saved.correct ? 'correct' : 'incorrect');
        if (index === state.index) button.classList.add('current');
        button.addEventListener('click', () => {
          state.index = index;
          renderWorkspace();
          persist('Question changed');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        grid.appendChild(button);
      });
      group.appendChild(grid);
      el.railContent.appendChild(group);
    });
  }

  function renderAnswer(question, saved) {
    el.answerArea.innerHTML = '';
    el.feedback.className = 'feedback';
    el.feedback.textContent = '';
    if (state.mode === 'mcq') renderMcq(question, saved);
    else renderCloze(question, saved);
  }

  function renderMcq(question, saved) {
    question.options.forEach((option, index) => {
      const button = document.createElement('button');
      button.className = 'answer-option';
      button.type = 'button';
      button.innerHTML = `<span>${String.fromCharCode(65 + index)}</span><strong>${escapeHtml(option)}</strong>`;
      if (saved?.correct) {
        button.disabled = true;
        if (index === question.answer) button.classList.add('correct');
      }
      if (!saved?.correct && saved?.wrongChoices?.includes(index)) {
        button.disabled = true;
        button.classList.add('incorrect');
      }
      button.addEventListener('click', () => saveAnswer(question, { choice: index }, index === question.answer));
      el.answerArea.appendChild(button);
    });
    if (saved) showFeedback(question, saved.correct, saved);
  }

  function renderCloze(question, saved) {
    const sentence = document.createElement('div');
    sentence.className = 'cloze-sentence';
    question.parts.forEach((part, index) => {
      sentence.append(document.createTextNode(part));
      if (index < question.blanks.length) {
        const select = document.createElement('select');
        select.setAttribute('aria-label', `Blank ${index + 1}`);
        select.innerHTML = '<option value="">Choose</option>' + question.blanks[index].choices.map((choice, choiceIndex) => `<option value="${choiceIndex}">${escapeHtml(choice)}</option>`).join('');
        if (saved?.choices) {
          select.value = String(saved.choices[index]);
          select.disabled = Boolean(saved.correct);
          select.classList.add(saved.choices[index] === question.blanks[index].answer ? 'correct' : 'incorrect');
        }
        select.addEventListener('change', () => {
          if (!saved?.correct) {
            select.classList.remove('correct', 'incorrect');
            el.feedback.className = 'feedback';
            el.feedback.textContent = '';
          }
        });
        sentence.appendChild(select);
      }
    });
    el.answerArea.appendChild(sentence);
    if (!saved?.correct) {
      const check = document.createElement('button');
      check.className = 'primary-action cloze-check';
      check.type = 'button';
      check.textContent = 'Check all three';
      check.addEventListener('click', () => {
        const choices = Array.from(sentence.querySelectorAll('select')).map((select) => Number(select.value));
        if (choices.some((value, index) => sentence.querySelectorAll('select')[index].value === '')) {
          el.feedback.className = 'feedback visible incorrect';
          el.feedback.textContent = 'Choose an answer for all three blanks first.';
          return;
        }
        const correct = choices.every((choice, index) => choice === question.blanks[index].answer);
        saveAnswer(question, { choices }, correct);
      });
      el.answerArea.appendChild(check);
    } else {
      showFeedback(question, saved.correct, saved);
    }
  }

  function saveAnswer(question, payload, correct) {
    const previous = state.answers[question.id] || {};
    const wrongAttempts = previous.wrongAttempts || (previous.correct === false ? 1 : 0);
    const wrongChoices = Array.isArray(previous.wrongChoices) ? previous.wrongChoices.slice() : [];
    if (!correct && state.mode === 'mcq' && !wrongChoices.includes(payload.choice)) wrongChoices.push(payload.choice);
    state.answers[question.id] = {
      ...payload,
      correct,
      attempts: (previous.attempts || 0) + 1,
      wrongAttempts: wrongAttempts + (correct ? 0 : 1),
      wrongChoices,
      answeredAt: new Date().toISOString()
    };
    if (correct) celebrateCorrect();
    renderWorkspace();
    if (correct) scheduleAutoAdvance();
    persist(correct ? 'Correct answer saved' : 'Mistake recorded. Try again.');
  }

  function showFeedback(question, correct, saved) {
    el.feedback.className = `feedback visible ${correct ? 'correct' : 'incorrect'}`;
    if (correct) {
      el.feedback.innerHTML = `<strong>Correct.</strong><span>${escapeHtml(question.explanation)}</span>`;
    } else {
      const count = saved?.wrongAttempts || 1;
      el.feedback.innerHTML = `<strong>Not yet. Try again.</strong><span>Mistakes on this question: ${count}</span>`;
    }
  }

  function celebrateCorrect() {
    playCorrectSound();
    document.body.classList.remove('correct-flash');
    void document.body.offsetWidth;
    document.body.classList.add('correct-flash');
    window.clearTimeout(celebrateCorrect.timer);
    celebrateCorrect.timer = window.setTimeout(() => document.body.classList.remove('correct-flash'), 850);
  }

  function playCorrectSound() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    try {
      const context = playCorrectSound.context || (playCorrectSound.context = new AudioContextClass());
      const now = context.currentTime;
      const gain = context.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.16, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.46);
      gain.connect(context.destination);
      [523.25, 659.25, 783.99].forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        oscillator.connect(gain);
        oscillator.start(now + index * 0.075);
        oscillator.stop(now + 0.42 + index * 0.075);
      });
    } catch (_error) {
      // Audio feedback is optional when the browser blocks Web Audio.
    }
  }

  function cancelAutoAdvance() {
    if (autoAdvanceTimer) window.clearTimeout(autoAdvanceTimer);
    if (autoAdvanceInterval) window.clearInterval(autoAdvanceInterval);
    autoAdvanceTimer = null;
    autoAdvanceInterval = null;
    if (el.questionNavigation) el.questionNavigation.classList.remove('auto-advance');
  }

  function scheduleAutoAdvance() {
    cancelAutoAdvance();
    let secondsLeft = 4;
    el.questionNavigation.classList.add('auto-advance');
    const updateCountdown = () => {
      const list = questionsFor();
      const lastQuestion = state.index === list.length - 1;
      el.nextQuestion.textContent = `${lastQuestion ? 'Finish' : 'Next question'} in ${secondsLeft}s`;
      let note = el.feedback.querySelector('.auto-next-note');
      if (!note) {
        note = document.createElement('span');
        note.className = 'auto-next-note';
        el.feedback.appendChild(note);
      }
      note.textContent = `${lastQuestion ? 'Returning to the dashboard' : 'Moving to the next question'} in ${secondsLeft} seconds.`;
    };
    updateCountdown();
    autoAdvanceInterval = window.setInterval(() => {
      secondsLeft -= 1;
      if (secondsLeft > 0) updateCountdown();
    }, 1000);
    autoAdvanceTimer = window.setTimeout(() => {
      cancelAutoAdvance();
      goToNextQuestion();
    }, 4000);
  }

  function goToNextQuestion() {
    cancelAutoAdvance();
    const list = questionsFor();
    if (state.index < list.length - 1) {
      state.index += 1;
      renderWorkspace();
      persist('Question changed');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      showDashboard();
    }
  }

  function correctAnswerText(question) {
    if (state.mode === 'mcq') return question.options[question.answer];
    return question.blanks.map((blank) => blank.choices[blank.answer]).join(' | ');
  }

  function renderTeacher(question) {
    el.teacherAnswer.innerHTML = `<p class="teacher-label">Correct answer</p><strong>${escapeHtml(correctAnswerText(question))}</strong><p>${escapeHtml(question.teachingNote)}</p>`;
  }

  function toggleTeacher(force) {
    const willShow = typeof force === 'boolean' ? force : el.teacherConsole.hidden;
    el.teacherConsole.hidden = !willShow;
    el.workspaceView.classList.toggle('teacher-open', willShow);
  }

  function buildReport() {
    const rows = data.unitOrder.map((unitKey) => {
      const list = ['mcq', 'cloze'].flatMap((mode) => questionsFor(unitKey, mode, false));
      const stats = answeredStats(list);
      return { unitKey, title: data.units[unitKey].title, total: list.length, ...stats };
    });
    const totals = answeredStats(allQuestions());
    el.reportContent.innerHTML = `
      <section class="report-hero"><div><span>Completed</span><strong>${totals.answered} / 150</strong></div><div><span>Wrong attempts</span><strong>${totals.wrongAttempts}</strong></div><div><span>Accuracy</span><strong>${totals.answered + totals.wrongAttempts ? Math.round(totals.answered / (totals.answered + totals.wrongAttempts) * 100) : 0}%</strong></div></section>
      <div class="report-units">${rows.map((row) => `<article><h3>${escapeHtml(row.title)}</h3><p>${row.answered} of ${row.total} completed</p><strong>${row.wrongAttempts} wrong attempts</strong></article>`).join('')}</div>
      <p class="report-note">This report records submitted answers. Student learning progress still requires teacher review.</p>`;
  }

  function exportReport() {
    const payload = {
      module: data.title,
      exportedAt: new Date().toISOString(),
      answers: state.answers,
      summary: answeredStats(allQuestions())
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `planet-earth-revision-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function resetProgress() {
    cancelAutoAdvance();
    state = { ...defaultState, answers: {}, lastOpened: null };
    strokesByQuestion = {};
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (window.ProgressTracker) {
      await window.ProgressTracker.save({
        mode: state.mode,
        unit: state.unit,
        filter: state.filter,
        index: state.index,
        answers: {},
        lastOpened: null
      });
    }
    toggleTeacher(false);
    if (el.resetDialog.open) el.resetDialog.close();
    showDashboard();
    el.saveStatus.textContent = 'Revision progress reset';
    el.saveStatus.classList.add('show');
    window.clearTimeout(persist.timer);
    persist.timer = window.setTimeout(() => el.saveStatus.classList.remove('show'), 1800);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  }

  function sizeCanvas() {
    const canvas = el.inkCanvas;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width * ratio));
    const height = Math.max(1, Math.round(rect.height * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
  }

  function canvasPoint(event) {
    const rect = el.inkCanvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height
    };
  }

  function drawCanvas() {
    const question = currentQuestion();
    if (!question) return;
    sizeCanvas();
    const canvas = el.inkCanvas;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    const strokes = strokesByQuestion[question.id] || [];
    strokes.forEach((stroke) => {
      if (stroke.points.length < 1) return;
      context.beginPath();
      context.strokeStyle = stroke.mode === 'eraser' ? '#f7fbf8' : '#173c36';
      context.lineWidth = (stroke.mode === 'eraser' ? 24 : 4) * (window.devicePixelRatio || 1);
      stroke.points.forEach((point, index) => {
        const x = point.x * canvas.width;
        const y = point.y * canvas.height;
        if (index === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      });
      context.stroke();
    });
  }

  function restoreCanvas() {
    window.requestAnimationFrame(drawCanvas);
  }

  function beginStroke(event) {
    const question = currentQuestion();
    if (!question) return;
    drawing = true;
    el.inkCanvas.setPointerCapture(event.pointerId);
    activeStroke = { mode: inkMode, points: [canvasPoint(event)] };
    strokesByQuestion[question.id] = strokesByQuestion[question.id] || [];
    strokesByQuestion[question.id].push(activeStroke);
    drawCanvas();
  }

  function moveStroke(event) {
    if (!drawing || !activeStroke) return;
    activeStroke.points.push(canvasPoint(event));
    drawCanvas();
  }

  function endStroke() {
    drawing = false;
    activeStroke = null;
  }

  function setInkMode(mode) {
    inkMode = mode;
    el.penTool.classList.toggle('active', mode === 'pen');
    el.eraserTool.classList.toggle('active', mode === 'eraser');
  }

  document.querySelectorAll('.mode-card').forEach((button) => button.addEventListener('click', () => {
    state.mode = button.dataset.mode;
    updateDashboard();
    persist('Question mode changed');
  }));
  document.querySelectorAll('.filter-button').forEach((button) => button.addEventListener('click', () => {
    state.filter = button.dataset.filter;
    updateDashboard();
    persist('Difficulty filter changed');
  }));
  document.querySelectorAll('.unit-card').forEach((button) => button.addEventListener('click', () => openUnit(button.dataset.unit)));
  el.continueButton.addEventListener('click', () => {
    for (const unitKey of data.unitOrder) {
      const pending = questionsFor(unitKey, state.mode).find((question) => !state.answers[question.id]);
      if (pending) return openUnit(unitKey, firstUnanswered(unitKey, state.mode));
    }
    openUnit(data.unitOrder[0], 0);
  });
  el.resumeButton.addEventListener('click', () => {
    if (!state.lastOpened) return;
    state.mode = state.lastOpened.mode;
    state.unit = state.lastOpened.unit;
    openUnit(state.unit, state.lastOpened.index);
  });
  el.homeButton.addEventListener('click', showDashboard);
  el.backButton.addEventListener('click', showDashboard);
  el.previousQuestion.addEventListener('click', () => {
    if (state.index > 0) state.index -= 1;
    renderWorkspace();
    persist('Question changed');
  });
  el.nextQuestion.addEventListener('click', () => {
    goToNextQuestion();
  });
  el.reportButton.addEventListener('click', () => {
    buildReport();
    el.reportDialog.showModal();
  });
  el.exportReport.addEventListener('click', exportReport);
  el.printReport.addEventListener('click', () => window.print());
  el.cancelReset.addEventListener('click', () => el.resetDialog.close());
  el.confirmReset.addEventListener('click', async () => {
    el.confirmReset.disabled = true;
    el.confirmReset.textContent = 'Resetting...';
    try {
      await resetProgress();
    } finally {
      el.confirmReset.disabled = false;
      el.confirmReset.textContent = 'Reset progress';
    }
  });
  el.closeTeacher.addEventListener('click', () => toggleTeacher(false));
  el.toggleScratchpad.addEventListener('click', () => {
    const hidden = el.scratchpadBody.hidden;
    el.scratchpadBody.hidden = !hidden;
    el.toggleScratchpad.textContent = hidden ? 'Hide' : 'Show';
    el.toggleScratchpad.setAttribute('aria-expanded', String(hidden));
    if (hidden) restoreCanvas();
  });
  el.penTool.addEventListener('click', () => setInkMode('pen'));
  el.eraserTool.addEventListener('click', () => setInkMode('eraser'));
  el.undoInk.addEventListener('click', () => {
    const question = currentQuestion();
    if (!question) return;
    (strokesByQuestion[question.id] || []).pop();
    drawCanvas();
  });
  el.clearInk.addEventListener('click', () => {
    const question = currentQuestion();
    if (!question) return;
    strokesByQuestion[question.id] = [];
    drawCanvas();
  });
  el.inkCanvas.addEventListener('pointerdown', beginStroke);
  el.inkCanvas.addEventListener('pointermove', moveStroke);
  el.inkCanvas.addEventListener('pointerup', endStroke);
  el.inkCanvas.addEventListener('pointercancel', endStroke);
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 't') {
      event.preventDefault();
      toggleTeacher();
    }
    if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 'r') {
      event.preventDefault();
      if (!el.resetDialog.open) el.resetDialog.showModal();
    }
  });
  window.addEventListener('resize', restoreCanvas);

  updateDashboard();
  if (window.ProgressTracker) {
    window.ProgressTracker.init(async (tracker) => {
      const remote = await tracker.load();
      mergeRemote(remote);
    });
  }
})();
