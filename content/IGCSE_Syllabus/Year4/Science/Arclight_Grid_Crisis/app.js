(function () {
  "use strict";

  const data = window.ARCLIGHT_DATA;
  const storageKey = "arclight-grid-crisis-progress-v2";
  const difficultyLabels = { core: "Core", challenge: "Challenge", beyond: "Beyond IGCSE", boss: "Boss" };
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  const defaultState = {
    missionIndex: 0,
    questionIndex: 0,
    filter: "all",
    answers: {},
    drafts: {},
    selections: {},
    switches: {},
    orders: {},
    teacherMarks: {},
    review: {},
    revealed: {},
    ink: {}
  };

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
      return { ...defaultState, ...saved, teacherMode: false };
    } catch (error) {
      return { ...defaultState, teacherMode: false };
    }
  }

  let state = loadState();
  let currentView = "dashboard";
  let inkMode = "pen";
  let drawing = false;
  let lastPoint = null;
  let inkUndoStack = [];

  const elements = {
    dashboardView: document.getElementById("dashboardView"),
    workspaceView: document.getElementById("workspaceView"),
    missionGrid: document.getElementById("missionGrid"),
    railMissionList: document.getElementById("railMissionList"),
    questionMeta: document.getElementById("questionMeta"),
    questionTitle: document.getElementById("questionTitle"),
    difficultyBadge: document.getElementById("difficultyBadge"),
    visualPanel: document.getElementById("visualPanel"),
    evidenceContent: document.getElementById("evidenceContent"),
    answerArea: document.getElementById("answerArea"),
    feedback: document.getElementById("feedback"),
    questionDots: document.getElementById("questionDots"),
    teacherConsole: document.getElementById("teacherConsole"),
    teacherAnswer: document.getElementById("teacherAnswer"),
    teacherScore: document.getElementById("teacherScore"),
    scoreValue: document.getElementById("scoreValue"),
    scoreTotal: document.getElementById("scoreTotal"),
    inkCanvas: document.getElementById("inkCanvas"),
    reportDialog: document.getElementById("reportDialog"),
    reportContent: document.getElementById("reportContent")
  };

  function saveState() {
    const copy = { ...state };
    delete copy.teacherMode;
    try { localStorage.setItem(storageKey, JSON.stringify(copy)); } catch (error) { /* Storage can be full if many ink pages are saved. */ }
    if (window.ProgressTracker?.autoSave) {
      const questions = allQuestions();
      window.ProgressTracker.autoSave({
        answered: questions.filter(isAnswered).length,
        totalQuestions: questions.length,
        score: totalScore(),
        totalMarks: totalMarks(),
        missionId: currentMission()?.id || null,
        questionIndex: state.questionIndex,
        updatedAt: new Date().toISOString()
      });
    }
  }

  function allQuestions() {
    return data.missions.flatMap((mission) => mission.questions);
  }

  function currentMission() {
    return data.missions[state.missionIndex];
  }

  function currentQuestion() {
    return currentMission().questions[state.questionIndex];
  }

  function questionById(id) {
    return allQuestions().find((question) => question.id === id);
  }

  function isAnswered(question) {
    return Boolean(state.answers[question.id]?.submitted || Number.isFinite(state.teacherMarks[question.id]));
  }

  function questionScore(question) {
    if (Number.isFinite(state.teacherMarks[question.id])) return state.teacherMarks[question.id];
    return state.answers[question.id]?.correct ? question.marks : 0;
  }

  function totalScore() {
    return allQuestions().reduce((sum, question) => sum + questionScore(question), 0);
  }

  function totalMarks() {
    return allQuestions().reduce((sum, question) => sum + question.marks, 0);
  }

  function filteredQuestions(mission) {
    return state.filter === "all" ? mission.questions : mission.questions.filter((question) => question.level === state.filter);
  }

  function updateScore() {
    elements.scoreValue.textContent = totalScore();
    elements.scoreTotal.textContent = "/ " + totalMarks() + " marks";
  }

  function renderDashboard() {
    currentView = "dashboard";
    elements.dashboardView.hidden = false;
    elements.workspaceView.hidden = true;
    const cards = data.missions.map((mission, missionIndex) => {
      const relevant = filteredQuestions(mission);
      const completed = relevant.filter(isAnswered).length;
      const total = relevant.length;
      const noMatch = total === 0;
      return `
        <button class="mission-card" type="button" data-mission="${missionIndex}" ${noMatch ? "disabled" : ""}>
          <span class="mission-code">${mission.code}</span>
          <h3>${mission.title}</h3>
          <p>${mission.blurb}</p>
          <span class="mission-card-footer">
            <span>${noMatch ? "No questions in this filter" : total + " questions"}</span>
            <span class="mission-card-progress">${completed} complete</span>
          </span>
        </button>`;
    }).join("");
    elements.missionGrid.innerHTML = cards;
    elements.missionGrid.querySelectorAll("[data-mission]").forEach((button) => {
      button.addEventListener("click", () => openMission(Number(button.dataset.mission)));
    });
    document.querySelectorAll(".filter-button").forEach((button) => button.classList.toggle("active", button.dataset.filter === state.filter));
    updateScore();
    saveState();
  }

  function openMission(index) {
    const changingMission = index !== state.missionIndex;
    state.missionIndex = Math.max(0, Math.min(data.missions.length - 1, index));
    const mission = currentMission();
    const valid = filteredQuestions(mission);
    if (changingMission && valid.length) {
      const nextUnfinished = valid.find((question) => !isAnswered(question)) || valid[0];
      state.questionIndex = mission.questions.indexOf(nextUnfinished);
    } else if (valid.length && !valid.includes(mission.questions[state.questionIndex])) {
      state.questionIndex = mission.questions.indexOf(valid[0]);
    } else {
      state.questionIndex = Math.max(0, Math.min(mission.questions.length - 1, state.questionIndex));
    }
    currentView = "workspace";
    elements.dashboardView.hidden = true;
    elements.workspaceView.hidden = false;
    renderQuestion();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderMissionRail() {
    elements.railMissionList.innerHTML = data.missions.map((mission, index) => `
      <button class="rail-mission ${index === state.missionIndex ? "active" : ""}" type="button" data-rail-mission="${index}">
        <span class="rail-mission-number">${index + 1}</span>
        <span>${mission.title}</span>
      </button>`).join("");
    elements.railMissionList.querySelectorAll("[data-rail-mission]").forEach((button) => {
      button.addEventListener("click", () => openMission(Number(button.dataset.railMission)));
    });
  }

  function renderQuestionDots() {
    const mission = currentMission();
    elements.questionDots.innerHTML = mission.questions.map((question, index) => {
      const classes = ["question-dot"];
      if (index === state.questionIndex) classes.push("active");
      if (isAnswered(question)) classes.push("complete");
      if (state.review[question.id]) classes.push("review");
      return `<button class="${classes.join(" ")}" type="button" data-question="${index}" aria-label="Question ${index + 1}">${index + 1}</button>`;
    }).join("");
    elements.questionDots.querySelectorAll("[data-question]").forEach((button) => {
      button.addEventListener("click", () => {
        state.questionIndex = Number(button.dataset.question);
        renderQuestion();
      });
    });
  }

  function choiceMarkup(question) {
    const selected = state.selections[question.id];
    return `<div class="choice-list">${question.options.map((option, index) => `
      <button class="answer-choice ${selected === index ? "selected" : ""}" type="button" data-choice="${index}">
        <span class="choice-key">${letters[index]}</span><span>${option}</span>
      </button>`).join("")}</div><button class="primary-action submit-answer" type="button" id="submitAnswer">Check answer</button>`;
  }

  function multiMarkup(question) {
    const selected = state.selections[question.id] || [];
    return `<div class="multi-list">${question.options.map((option, index) => `
      <button class="answer-choice ${selected.includes(index) ? "selected" : ""}" type="button" data-multi="${index}" aria-pressed="${selected.includes(index)}">
        <span class="choice-key">${selected.includes(index) ? "X" : letters[index]}</span><span>${option}</span>
      </button>`).join("")}</div><button class="primary-action submit-answer" type="button" id="submitAnswer">Check selections</button>`;
  }

  function numericMarkup(question) {
    const draft = state.drafts[question.id] || "";
    return `<div class="numeric-entry"><div class="numeric-row"><input id="numericInput" inputmode="decimal" autocomplete="off" value="${escapeAttribute(draft)}" aria-label="Numeric answer"><span class="unit-label">${question.answer.unit}</span></div></div><button class="primary-action submit-answer" type="button" id="submitAnswer">Check calculation</button>`;
  }

  function switchMarkup(question) {
    const values = state.switches[question.id] || question.switches.map(() => false);
    return `<div class="circuit-puzzle"><div class="switch-bank">${question.switches.map((label, index) => `
      <button class="switch-control ${values[index] ? "active" : ""}" type="button" data-switch="${index}" aria-pressed="${values[index]}">
        <span>${label}</span><span class="switch-indicator" aria-hidden="true"></span>
      </button>`).join("")}</div></div><button class="primary-action submit-answer" type="button" id="submitAnswer">Test configuration</button>`;
  }

  function orderMarkup(question) {
    const chosen = state.orders[question.id] || [];
    return `<div class="order-list">${question.items.map((item) => {
      const orderIndex = chosen.indexOf(item);
      return `<button class="order-item ${orderIndex >= 0 ? "selected" : ""}" type="button" data-order-item="${escapeAttribute(item)}"><span class="order-index">${orderIndex >= 0 ? orderIndex + 1 : "+"}</span><span>${item}</span></button>`;
    }).join("")}</div><button class="text-button" id="resetOrder" type="button">Reset order</button><button class="primary-action submit-answer" type="button" id="submitAnswer">Check sequence</button>`;
  }

  function openMarkup(question) {
    const draft = state.drafts[question.id] || "";
    return `<div class="open-entry"><textarea id="openResponse" placeholder="Write a claim, use the evidence, then explain the science.">${escapeHtml(draft)}</textarea></div><button class="primary-action submit-answer" type="button" id="submitOpen">Ready for teacher review</button>`;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[character]));
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/'/g, "&#39;");
  }

  function renderAnswerArea(question) {
    const renderers = { choice: choiceMarkup, multi: multiMarkup, numeric: numericMarkup, switch: switchMarkup, order: orderMarkup, open: openMarkup };
    elements.answerArea.innerHTML = renderers[question.type](question);
    bindAnswerEvents(question);
  }

  function bindAnswerEvents(question) {
    elements.answerArea.querySelectorAll("[data-choice]").forEach((button) => {
      button.addEventListener("click", () => { state.selections[question.id] = Number(button.dataset.choice); renderAnswerArea(question); saveState(); });
    });
    elements.answerArea.querySelectorAll("[data-multi]").forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.multi);
        const selected = new Set(state.selections[question.id] || []);
        selected.has(index) ? selected.delete(index) : selected.add(index);
        state.selections[question.id] = Array.from(selected).sort((a, b) => a - b);
        renderAnswerArea(question);
        saveState();
      });
    });
    elements.answerArea.querySelectorAll("[data-switch]").forEach((button) => {
      button.addEventListener("click", () => {
        const values = state.switches[question.id] || question.switches.map(() => false);
        values[Number(button.dataset.switch)] = !values[Number(button.dataset.switch)];
        state.switches[question.id] = values;
        renderAnswerArea(question);
        saveState();
      });
    });
    elements.answerArea.querySelectorAll("[data-order-item]").forEach((button) => {
      button.addEventListener("click", () => {
        const item = button.dataset.orderItem;
        const chosen = state.orders[question.id] || [];
        const index = chosen.indexOf(item);
        if (index >= 0) chosen.splice(index, 1); else chosen.push(item);
        state.orders[question.id] = chosen;
        renderAnswerArea(question);
        saveState();
      });
    });
    document.getElementById("resetOrder")?.addEventListener("click", () => { state.orders[question.id] = []; renderAnswerArea(question); saveState(); });
    document.getElementById("numericInput")?.addEventListener("input", (event) => { state.drafts[question.id] = event.target.value; saveState(); });
    document.getElementById("openResponse")?.addEventListener("input", (event) => { state.drafts[question.id] = event.target.value; saveState(); });
    document.getElementById("submitAnswer")?.addEventListener("click", () => submitAutoAnswer(question));
    document.getElementById("submitOpen")?.addEventListener("click", () => {
      const text = (state.drafts[question.id] || "").trim();
      if (text.length < 20) {
        showFeedback("Write at least one complete scientific sentence before sending it for review.", "incorrect");
        return;
      }
      state.answers[question.id] = { submitted: true, correct: false, value: text };
      saveState();
      showFeedback("Response saved for teacher review. Continue when your reasoning is complete.", "correct");
      renderQuestionDots();
      updateScore();
    });
  }

  function arraysEqual(a, b) {
    return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((value, index) => value === b[index]);
  }

  function submitAutoAnswer(question) {
    let value;
    let correct = false;
    if (question.type === "choice") {
      value = state.selections[question.id];
      if (!Number.isInteger(value)) return showFeedback("Select one answer first.", "incorrect");
      correct = value === question.answer;
    } else if (question.type === "multi") {
      value = state.selections[question.id] || [];
      correct = arraysEqual(value, question.answer);
    } else if (question.type === "numeric") {
      value = Number(state.drafts[question.id]);
      if (!Number.isFinite(value)) return showFeedback("Enter a numeric answer first.", "incorrect");
      correct = Math.abs(value - question.answer.value) <= question.answer.tolerance;
    } else if (question.type === "switch") {
      value = state.switches[question.id] || question.switches.map(() => false);
      correct = arraysEqual(value, question.answer);
    } else if (question.type === "order") {
      value = state.orders[question.id] || [];
      if (value.length !== question.items.length) return showFeedback("Place every step in the sequence first.", "incorrect");
      correct = arraysEqual(value, question.answer);
    }
    state.answers[question.id] = { submitted: true, correct, value };
    if (correct) {
      showFeedback("Correct. " + question.explanation, "correct");
    } else {
      showFeedback("Not yet. " + question.hint, "incorrect");
    }
    saveState();
    renderQuestionDots();
    renderMissionRail();
    updateScore();
    renderTeacherConsole(question);
  }

  function showFeedback(message, kind) {
    elements.feedback.textContent = message;
    elements.feedback.className = "feedback " + kind;
  }

  function renderSavedFeedback(question) {
    const result = state.answers[question.id];
    if (state.revealed[question.id]) return showFeedback(question.explanation, "revealed");
    if (!result?.submitted) return showFeedback("", "");
    if (question.type === "open") return showFeedback("Response saved for teacher review.", "correct");
    if (result.correct) return showFeedback("Correct. " + question.explanation, "correct");
    showFeedback("Not yet. " + question.hint, "incorrect");
  }

  function renderTeacherConsole(question) {
    elements.teacherConsole.hidden = !state.teacherMode;
    elements.workspaceView.classList.toggle("teacher-open", state.teacherMode);
    if (!state.teacherMode) return;
    const rubric = question.rubric ? `<h3>Rubric</h3><ol>${question.rubric.map((item) => `<li>${item}</li>`).join("")}</ol>` : "";
    elements.teacherAnswer.innerHTML = `<h3>Expected answer</h3><p>${question.explanation}</p>${rubric}<h3>Teaching move</h3><p>${question.teacher}</p><h3>Student draft</h3><p>${escapeHtml(state.drafts[question.id] || "No written draft saved.")}</p>`;
    const currentMark = state.teacherMarks[question.id];
    elements.teacherScore.innerHTML = Array.from({ length: question.marks + 1 }, (_, mark) => `<button class="score-button ${currentMark === mark ? "active" : ""}" type="button" data-mark="${mark}">${mark}</button>`).join("");
    elements.teacherScore.querySelectorAll("[data-mark]").forEach((button) => {
      button.addEventListener("click", () => {
        state.teacherMarks[question.id] = Number(button.dataset.mark);
        saveState();
        renderTeacherConsole(question);
        renderQuestionDots();
        updateScore();
      });
    });
    document.getElementById("markReview").classList.toggle("active", Boolean(state.review[question.id]));
  }

  function renderQuestion() {
    const mission = currentMission();
    const question = currentQuestion();
    elements.questionMeta.textContent = mission.code + " | Question " + (state.questionIndex + 1) + " of " + mission.questions.length + " | " + question.marks + (question.marks === 1 ? " mark" : " marks");
    elements.questionTitle.textContent = question.prompt;
    elements.difficultyBadge.textContent = difficultyLabels[question.level];
    elements.visualPanel.innerHTML = window.renderArclightVisual(mission.visual, question);
    elements.evidenceContent.innerHTML = question.evidence;
    renderAnswerArea(question);
    renderSavedFeedback(question);
    renderQuestionDots();
    renderMissionRail();
    renderTeacherConsole(question);
    updateScore();
    loadInk(question.id);
    document.getElementById("previousQuestion").disabled = state.questionIndex === 0;
    document.getElementById("nextQuestion").textContent = state.questionIndex === mission.questions.length - 1 ? "Mission complete" : "Next question";
    saveState();
  }

  function moveQuestion(direction) {
    const mission = currentMission();
    const next = state.questionIndex + direction;
    if (next >= mission.questions.length) return renderDashboard();
    state.questionIndex = Math.max(0, next);
    renderQuestion();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleTeacherMode(force) {
    state.teacherMode = typeof force === "boolean" ? force : !state.teacherMode;
    if (currentView === "workspace") renderTeacherConsole(currentQuestion());
  }

  function pointFromEvent(event) {
    const rect = elements.inkCanvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * elements.inkCanvas.width / rect.width, y: (event.clientY - rect.top) * elements.inkCanvas.height / rect.height };
  }

  function inkContext() {
    const context = elements.inkCanvas.getContext("2d");
    context.lineCap = "round";
    context.lineJoin = "round";
    return context;
  }

  function saveInk() {
    const id = currentQuestion().id;
    try {
      state.ink[id] = elements.inkCanvas.toDataURL("image/webp", .72);
      saveState();
    } catch (error) { /* Keep the rest of the lesson usable if canvas storage fails. */ }
  }

  function loadInk(questionId) {
    const context = inkContext();
    context.clearRect(0, 0, elements.inkCanvas.width, elements.inkCanvas.height);
    inkUndoStack = [];
    if (!state.ink[questionId]) return;
    const image = new Image();
    image.onload = () => context.drawImage(image, 0, 0, elements.inkCanvas.width, elements.inkCanvas.height);
    image.src = state.ink[questionId];
  }

  function beginInk(event) {
    event.preventDefault();
    drawing = true;
    try { elements.inkCanvas.setPointerCapture(event.pointerId); } catch (error) { /* Synthetic test pointers may not support capture. */ }
    inkUndoStack.push(elements.inkCanvas.toDataURL("image/webp", .55));
    if (inkUndoStack.length > 12) inkUndoStack.shift();
    lastPoint = pointFromEvent(event);
  }

  function drawInk(event) {
    if (!drawing) return;
    event.preventDefault();
    const point = pointFromEvent(event);
    const context = inkContext();
    context.globalCompositeOperation = inkMode === "eraser" ? "destination-out" : "source-over";
    context.strokeStyle = "#162534";
    context.lineWidth = inkMode === "eraser" ? 30 : Math.max(3, (event.pressure || .45) * 7);
    context.beginPath();
    context.moveTo(lastPoint.x, lastPoint.y);
    context.lineTo(point.x, point.y);
    context.stroke();
    lastPoint = point;
  }

  function endInk(event) {
    if (!drawing) return;
    drawing = false;
    lastPoint = null;
    try { elements.inkCanvas.releasePointerCapture(event.pointerId); } catch (error) { /* Pointer may already be released. */ }
    saveInk();
  }

  function undoInk() {
    const previous = inkUndoStack.pop();
    if (!previous) return;
    const context = inkContext();
    const image = new Image();
    image.onload = () => { context.clearRect(0, 0, elements.inkCanvas.width, elements.inkCanvas.height); context.drawImage(image, 0, 0); saveInk(); };
    image.src = previous;
  }

  function renderReport() {
    const questions = allQuestions();
    const answered = questions.filter(isAnswered).length;
    const reviewCount = questions.filter((question) => state.review[question.id]).length;
    const rows = data.missions.map((mission) => {
      const complete = mission.questions.filter(isAnswered).length;
      const score = mission.questions.reduce((sum, question) => sum + questionScore(question), 0);
      const max = mission.questions.reduce((sum, question) => sum + question.marks, 0);
      const flagged = mission.questions.filter((question) => state.review[question.id]).length;
      return `<tr><td>${mission.title}</td><td>${complete} / ${mission.questions.length}</td><td>${score} / ${max}</td><td>${flagged}</td></tr>`;
    }).join("");
    elements.reportContent.innerHTML = `
      <div class="report-summary">
        <div class="report-stat"><strong>${answered} / ${questions.length}</strong><span>questions completed</span></div>
        <div class="report-stat"><strong>${totalScore()} / ${totalMarks()}</strong><span>marks awarded</span></div>
        <div class="report-stat"><strong>${reviewCount}</strong><span>flagged for review</span></div>
      </div>
      <table class="report-table"><thead><tr><th>Mission</th><th>Completion</th><th>Score</th><th>Review</th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  function openReport() {
    renderReport();
    elements.reportDialog.showModal();
  }

  function exportReport() {
    const exportData = {
      lesson: data.title,
      exportedAt: new Date().toISOString(),
      score: totalScore(),
      totalMarks: totalMarks(),
      missions: data.missions.map((mission) => ({
        title: mission.title,
        questions: mission.questions.map((question) => ({
          id: question.id,
          title: question.title,
          answered: isAnswered(question),
          score: questionScore(question),
          maxMarks: question.marks,
          review: Boolean(state.review[question.id]),
          draft: state.drafts[question.id] || ""
        }))
      }))
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "arclight-progress-" + new Date().toISOString().slice(0, 10) + ".json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  document.querySelectorAll(".filter-button").forEach((button) => {
    button.addEventListener("click", () => { state.filter = button.dataset.filter; renderDashboard(); });
  });
  document.getElementById("continueButton").addEventListener("click", () => openMission(state.missionIndex));
  document.getElementById("homeButton").addEventListener("click", renderDashboard);
  document.getElementById("backButton").addEventListener("click", renderDashboard);
  document.getElementById("previousQuestion").addEventListener("click", () => moveQuestion(-1));
  document.getElementById("nextQuestion").addEventListener("click", () => moveQuestion(1));
  document.getElementById("closeTeacher").addEventListener("click", () => toggleTeacherMode(false));
  document.getElementById("revealToStudent").addEventListener("click", () => { const id = currentQuestion().id; state.revealed[id] = !state.revealed[id]; saveState(); renderSavedFeedback(currentQuestion()); });
  document.getElementById("markReview").addEventListener("click", () => { const id = currentQuestion().id; state.review[id] = !state.review[id]; saveState(); renderQuestionDots(); renderTeacherConsole(currentQuestion()); });
  document.getElementById("resetProgress").addEventListener("click", () => {
    if (!window.confirm("Reset every answer, score and ink page in this lesson?")) return;
    localStorage.removeItem(storageKey);
    state = { ...defaultState, teacherMode: false };
    renderDashboard();
  });
  document.getElementById("reportButton").addEventListener("click", openReport);
  document.getElementById("exportReport").addEventListener("click", exportReport);
  document.getElementById("printReport").addEventListener("click", () => { renderReport(); window.print(); });
  document.getElementById("toggleScratchpad").addEventListener("click", (event) => {
    const body = document.getElementById("scratchpadBody");
    body.hidden = !body.hidden;
    event.currentTarget.textContent = body.hidden ? "Show" : "Hide";
    event.currentTarget.setAttribute("aria-expanded", String(!body.hidden));
  });
  document.getElementById("penTool").addEventListener("click", () => { inkMode = "pen"; document.getElementById("penTool").classList.add("active"); document.getElementById("eraserTool").classList.remove("active"); });
  document.getElementById("eraserTool").addEventListener("click", () => { inkMode = "eraser"; document.getElementById("eraserTool").classList.add("active"); document.getElementById("penTool").classList.remove("active"); });
  document.getElementById("undoInk").addEventListener("click", undoInk);
  document.getElementById("clearInk").addEventListener("click", () => {
    if (!window.confirm("Clear the ink on this question?")) return;
    inkUndoStack.push(elements.inkCanvas.toDataURL("image/webp", .55));
    inkContext().clearRect(0, 0, elements.inkCanvas.width, elements.inkCanvas.height);
    delete state.ink[currentQuestion().id];
    saveState();
  });
  elements.inkCanvas.addEventListener("pointerdown", beginInk);
  elements.inkCanvas.addEventListener("pointermove", drawInk);
  elements.inkCanvas.addEventListener("pointerup", endInk);
  elements.inkCanvas.addEventListener("pointercancel", endInk);
  window.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.altKey && event.key.toLowerCase() === "t") {
      event.preventDefault();
      toggleTeacherMode();
    }
  });

  renderDashboard();
}());
