(function () {
  "use strict";

  var API = "https://ycsixsyssbdovpmmhefz.supabase.co/functions/v1/friendship-course-api";
  var sectionNames = ["welcome", "video", "reflect", "quiz"];
  var classCode = (new URLSearchParams(location.search).get("class") || "").trim().toUpperCase();
  if (!/^[A-Z2-9]{8}$/.test(classCode)) classCode = "";

  var storageSuffix = classCode || "SELF";
  var attemptStorageKey = "friendshipAttempt:" + storageSuffix;
  var nameStorageKey = "friendshipStudentName";
  var reflectionStorageKey = "friendshipReflections:" + storageSuffix;
  var sectionIndex = 0;
  var currentQuestion = 0;
  var questions = [];
  var answers = {};
  var result = null;
  var attempt = null;
  var attemptId = readStorage(attemptStorageKey) || makeUuid();
  var started = false;
  var pendingSaves = 0;

  var slides = Array.from(document.querySelectorAll(".slide"));
  var sectionButtons = Array.from(document.querySelectorAll(".section-progress button"));
  var studentForm = document.getElementById("student-form");
  var nameInput = document.getElementById("student-name");
  var studentError = document.getElementById("student-error");
  var previousButton = document.getElementById("previous");
  var nextButton = document.getElementById("next");
  var submitButton = document.getElementById("submit-quiz");
  var position = document.getElementById("position");
  var saveState = document.getElementById("save-state");

  nameInput.value = readStorage(nameStorageKey) || "";
  document.getElementById("class-label").textContent = classCode ? "Class " + classCode : "Self-study lesson";

  function readStorage(key) {
    try { return localStorage.getItem(key); } catch (_error) { return null; }
  }

  function writeStorage(key, value) {
    try { localStorage.setItem(key, value); } catch (_error) {}
  }

  function removeStorage(key) {
    try { localStorage.removeItem(key); } catch (_error) {}
  }

  function makeUuid() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, function (character) {
      return (Number(character) ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> Number(character) / 4).toString(16);
    });
  }

  async function api(action, options) {
    var config = options || {};
    var response = await fetch(API + "?action=" + encodeURIComponent(action), {
      method: config.body ? "POST" : "GET",
      cache: "no-store",
      headers: config.body ? { "Content-Type": "application/json" } : {},
      body: config.body ? JSON.stringify(config.body) : undefined
    });
    var data = await response.json().catch(function () { return {}; });
    if (!response.ok) throw new Error(data.error || "The course service could not complete this request.");
    return data;
  }

  function setSaveState(message, isError) {
    saveState.textContent = message || "";
    saveState.style.color = isError ? "var(--danger)" : "";
  }

  function hydrateAttempt(value) {
    attempt = value || null;
    answers = {};
    if (attempt && Array.isArray(attempt.answers)) {
      attempt.answers.forEach(function (answer) { answers[answer.question_no] = answer.selected_index; });
      nameInput.value = attempt.student_name || nameInput.value;
      started = true;
    }
  }

  async function loadCourse() {
    var url = API + "?action=course&attempt_id=" + encodeURIComponent(attemptId);
    try {
      var response = await fetch(url, { cache: "no-store" });
      var data = await response.json().catch(function () { return {}; });
      if (!response.ok) throw new Error(data.error || "The quiz could not be loaded.");
      questions = Array.isArray(data.questions) ? data.questions : [];
      if (questions.length !== 30) throw new Error("The 30-question quiz is not ready.");
      hydrateAttempt(data.attempt);
      result = data.result || null;
      document.querySelector("#student-form .primary").textContent = attempt ? "Resume lesson" : "Begin lesson";
      renderQuiz();
    } catch (error) {
      document.getElementById("quiz-loading").innerHTML = "<h2>Quiz unavailable</h2><p></p>";
      document.querySelector("#quiz-loading p").textContent = error.message;
    }
  }

  async function beginLesson(event) {
    event.preventDefault();
    var studentName = nameInput.value.trim().replace(/\s+/g, " ").slice(0, 80);
    if (!studentName) {
      studentError.textContent = "Please enter your name.";
      nameInput.focus();
      return;
    }
    studentError.textContent = "";
    var button = document.querySelector("#student-form .primary");
    button.disabled = true;
    button.textContent = "Preparing...";
    try {
      var data = await api("start", { body: { attempt_id: attemptId, student_name: studentName, class_code: classCode } });
      hydrateAttempt(data.attempt);
      result = data.result || null;
      writeStorage(attemptStorageKey, attemptId);
      writeStorage(nameStorageKey, studentName);
      started = true;
      showSection(1);
    } catch (error) {
      studentError.textContent = error.message;
    } finally {
      button.disabled = false;
      button.textContent = attempt ? "Resume lesson" : "Begin lesson";
    }
  }

  function showSection(index) {
    if (index > 0 && !started) {
      studentError.textContent = "Enter your name to begin the lesson.";
      index = 0;
    }
    var previousIndex = sectionIndex;
    sectionIndex = Math.max(0, Math.min(sectionNames.length - 1, index));
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === sectionIndex);
      slide.classList.toggle("exit-left", slideIndex < sectionIndex);
      slide.setAttribute("aria-hidden", slideIndex === sectionIndex ? "false" : "true");
    });
    sectionButtons.forEach(function (button, buttonIndex) {
      button.classList.toggle("active", buttonIndex === sectionIndex);
      button.setAttribute("aria-current", buttonIndex === sectionIndex ? "step" : "false");
    });
    if (previousIndex !== sectionIndex) document.getElementById("deck").focus({ preventScroll: true });
    if (sectionIndex === 3) renderQuiz();
    renderControls();
  }

  function renderControls() {
    previousButton.disabled = sectionIndex === 0;
    submitButton.hidden = true;
    nextButton.hidden = false;
    if (sectionIndex < 3) {
      position.textContent = "Part " + (sectionIndex + 1) + " of 4";
      nextButton.textContent = sectionIndex === 2 ? "Start quiz" : "Next";
      nextButton.disabled = sectionIndex === 0 && !started;
      return;
    }
    if (result) {
      position.textContent = "Attempt submitted";
      nextButton.hidden = true;
      previousButton.disabled = false;
      return;
    }
    position.textContent = "Question " + (currentQuestion + 1) + " of 30";
    if (currentQuestion === questions.length - 1) {
      nextButton.hidden = true;
      submitButton.hidden = false;
      submitButton.disabled = Object.keys(answers).length !== 30 || pendingSaves > 0;
    } else {
      nextButton.textContent = "Next";
      nextButton.disabled = !questions.length;
    }
  }

  function goPrevious() {
    if (sectionIndex === 3 && !result && currentQuestion > 0) {
      currentQuestion -= 1;
      renderQuiz();
    } else showSection(sectionIndex - 1);
  }

  function goNext() {
    if (sectionIndex < 3) showSection(sectionIndex + 1);
    else if (!result && currentQuestion < questions.length - 1) {
      currentQuestion += 1;
      renderQuiz();
    }
  }

  function renderQuiz() {
    if (!questions.length) return;
    document.getElementById("quiz-loading").hidden = true;
    if (result) {
      document.getElementById("quiz-panel").hidden = true;
      renderResult();
      renderControls();
      return;
    }
    document.getElementById("result-panel").hidden = true;
    document.getElementById("quiz-panel").hidden = false;
    var question = questions[currentQuestion];
    document.getElementById("question-category").textContent = question.category === "vocabulary" ? "Vocabulary" : "Video comprehension";
    document.getElementById("question-count").textContent = Object.keys(answers).length + " of 30 answered";
    document.getElementById("question-prompt").textContent = question.question_no + ". " + question.prompt;

    var nav = document.getElementById("question-nav");
    nav.replaceChildren();
    questions.forEach(function (item, index) {
      var marker = document.createElement("button");
      marker.type = "button";
      marker.textContent = "Question " + item.question_no;
      marker.title = "Question " + item.question_no;
      marker.className = (Object.prototype.hasOwnProperty.call(answers, item.question_no) ? "answered " : "") + (index === currentQuestion ? "current" : "");
      marker.addEventListener("click", function () { currentQuestion = index; renderQuiz(); });
      nav.appendChild(marker);
    });

    var options = document.getElementById("answer-options");
    options.replaceChildren();
    question.options.forEach(function (option, index) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "answer-option" + (answers[question.question_no] === index ? " selected" : "");
      button.setAttribute("aria-pressed", answers[question.question_no] === index ? "true" : "false");
      var letter = document.createElement("span");
      letter.className = "answer-letter";
      letter.textContent = String.fromCharCode(65 + index);
      var label = document.createElement("span");
      label.textContent = String(option);
      button.append(letter, label);
      button.addEventListener("click", function () { saveAnswer(question.question_no, index); });
      options.appendChild(button);
    });
    renderControls();
  }

  async function saveAnswer(questionNo, selectedIndex) {
    var previousValue = answers[questionNo];
    answers[questionNo] = selectedIndex;
    pendingSaves += 1;
    setSaveState("Saving...", false);
    document.getElementById("answer-message").textContent = "Saving your answer...";
    renderQuiz();
    try {
      await api("answer", { body: { attempt_id: attemptId, question_no: questionNo, selected_index: selectedIndex } });
      pendingSaves -= 1;
      if (!pendingSaves) {
        setSaveState("Saved", false);
        document.getElementById("answer-message").textContent = "Answer saved.";
      }
    } catch (error) {
      pendingSaves = Math.max(0, pendingSaves - 1);
      if (typeof previousValue === "undefined") delete answers[questionNo]; else answers[questionNo] = previousValue;
      setSaveState("Save failed", true);
      document.getElementById("answer-message").textContent = error.message;
      document.getElementById("answer-message").classList.add("error");
      renderQuiz();
    }
  }

  async function submitQuiz() {
    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";
    try {
      var data = await api("submit", { body: { attempt_id: attemptId } });
      attempt = data.attempt;
      result = data.result;
      setSaveState("Submitted", false);
      renderQuiz();
    } catch (error) {
      document.getElementById("answer-message").textContent = error.message;
      document.getElementById("answer-message").classList.add("error");
    } finally {
      submitButton.textContent = "Submit quiz";
      renderControls();
    }
  }

  function renderResult() {
    var panel = document.getElementById("result-panel");
    panel.hidden = false;
    document.getElementById("score-heading").textContent = "Your score: " + attempt.score + " / 30";
    var list = document.getElementById("result-list");
    list.replaceChildren();
    result.forEach(function (item) {
      var question = questions.find(function (entry) { return entry.question_no === item.question_no; });
      var details = document.createElement("details");
      details.className = "result-item " + (item.correct ? "correct" : "incorrect");
      var summary = document.createElement("summary");
      summary.textContent = item.question_no + ". " + (item.correct ? "Correct" : "Review this answer");
      var answerText = document.createElement("p");
      answerText.textContent = "Correct answer: " + String(question.options[item.correct_index]);
      var explanation = document.createElement("p");
      explanation.textContent = String(item.explanation || "");
      details.append(summary, answerText, explanation);
      list.appendChild(details);
    });
  }

  async function startNewAttempt() {
    var studentName = nameInput.value.trim().replace(/\s+/g, " ").slice(0, 80);
    var button = document.getElementById("new-attempt");
    button.disabled = true;
    try {
      attemptId = makeUuid();
      var data = await api("start", { body: { attempt_id: attemptId, student_name: studentName, class_code: classCode } });
      writeStorage(attemptStorageKey, attemptId);
      hydrateAttempt(data.attempt);
      result = null;
      currentQuestion = 0;
      renderQuiz();
    } catch (error) {
      alert(error.message);
    } finally {
      button.disabled = false;
    }
  }

  function loadReflections() {
    var stored = {};
    try { stored = JSON.parse(readStorage(reflectionStorageKey) || "{}"); } catch (_error) {}
    document.querySelectorAll("[data-reflection]").forEach(function (textarea) {
      textarea.value = stored[textarea.dataset.reflection] || "";
      textarea.addEventListener("input", function () {
        stored[textarea.dataset.reflection] = textarea.value;
        writeStorage(reflectionStorageKey, JSON.stringify(stored));
      });
    });
  }

  studentForm.addEventListener("submit", beginLesson);
  previousButton.addEventListener("click", goPrevious);
  nextButton.addEventListener("click", goNext);
  submitButton.addEventListener("click", submitQuiz);
  document.getElementById("new-attempt").addEventListener("click", startNewAttempt);
  sectionButtons.forEach(function (button, index) { button.addEventListener("click", function () { showSection(index); }); });

  document.addEventListener("keydown", function (event) {
    if (/^(INPUT|TEXTAREA|BUTTON)$/.test(event.target.tagName)) return;
    if (event.key === "ArrowLeft") goPrevious();
    if (event.key === "ArrowRight") goNext();
  });

  var touchStartX = null;
  var touchStartY = null;
  document.getElementById("deck").addEventListener("touchstart", function (event) {
    if (event.target.closest("button,input,textarea,iframe,a")) return;
    touchStartX = event.changedTouches[0].clientX;
    touchStartY = event.changedTouches[0].clientY;
  }, { passive: true });
  document.getElementById("deck").addEventListener("touchend", function (event) {
    if (touchStartX === null) return;
    var deltaX = event.changedTouches[0].clientX - touchStartX;
    var deltaY = event.changedTouches[0].clientY - touchStartY;
    touchStartX = null;
    touchStartY = null;
    if (Math.abs(deltaX) < 55 || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) return;
    if (deltaX > 0) goPrevious(); else goNext();
  }, { passive: true });

  loadReflections();
  showSection(0);
  loadCourse();
})();
