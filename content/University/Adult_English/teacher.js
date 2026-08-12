(function () {
  "use strict";

  var API = "https://ycsixsyssbdovpmmhefz.supabase.co/functions/v1/friendship-course-api";
  var KEY_NAME = "friendshipTeacherAccessKey";
  var teacherKey = "";
  var dashboardData = { classes: [], attempts: [], questions: [] };
  var loginPanel = document.getElementById("login-panel");
  var dashboard = document.getElementById("dashboard");
  var loginForm = document.getElementById("login-form");
  var keyInput = document.getElementById("teacher-key");
  var loginError = document.getElementById("login-error");
  var classFilter = document.getElementById("class-filter");

  function readSessionKey() {
    try { return sessionStorage.getItem(KEY_NAME) || ""; } catch (_error) { return ""; }
  }

  function saveSessionKey(value) {
    try { sessionStorage.setItem(KEY_NAME, value); } catch (_error) {}
  }

  function clearSessionKey() {
    try { sessionStorage.removeItem(KEY_NAME); } catch (_error) {}
  }

  async function api(action, options) {
    var config = options || {};
    var response = await fetch(API + "?action=" + encodeURIComponent(action), {
      method: config.body ? "POST" : "GET",
      cache: "no-store",
      headers: Object.assign({ "x-teacher-key": teacherKey }, config.body ? { "Content-Type": "application/json" } : {}),
      body: config.body ? JSON.stringify(config.body) : undefined
    });
    var data = await response.json().catch(function () { return {}; });
    if (!response.ok) throw new Error(data.error || "The dashboard request failed.");
    return data;
  }

  async function login(event) {
    if (event) event.preventDefault();
    teacherKey = (event ? keyInput.value : teacherKey).trim();
    if (!teacherKey) return;
    loginError.textContent = "";
    var button = loginForm.querySelector("button");
    button.disabled = true;
    button.textContent = "Checking...";
    try {
      await api("teacher-check", { body: {} });
      saveSessionKey(teacherKey);
      loginPanel.hidden = true;
      dashboard.hidden = false;
      document.getElementById("lock-dashboard").hidden = false;
      keyInput.value = "";
      await refreshDashboard();
    } catch (error) {
      teacherKey = "";
      clearSessionKey();
      loginError.textContent = error.message;
    } finally {
      button.disabled = false;
      button.textContent = "Open dashboard";
    }
  }

  function lockDashboard() {
    teacherKey = "";
    clearSessionKey();
    dashboard.hidden = true;
    loginPanel.hidden = false;
    document.getElementById("lock-dashboard").hidden = true;
    keyInput.focus();
  }

  async function refreshDashboard() {
    try {
      dashboardData = await api("teacher");
      renderDashboard();
      document.getElementById("last-updated").textContent = "Updated " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch (error) {
      if (/denied/i.test(error.message)) lockDashboard();
      else document.getElementById("last-updated").textContent = error.message;
    }
  }

  function sessionLink(classCode) {
    var url = new URL("Friendship/index.html", location.href);
    url.searchParams.set("class", classCode);
    return url.href;
  }

  function displayDate(value) {
    if (!value) return "Not submitted";
    return new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
  }

  function classById(id) {
    return dashboardData.classes.find(function (item) { return item.id === id; });
  }

  function renderDashboard() {
    renderFilter();
    renderSessions();
    renderAttempts();
  }

  function renderFilter() {
    var selected = classFilter.value || "all";
    classFilter.querySelectorAll("option[data-class]").forEach(function (option) { option.remove(); });
    dashboardData.classes.forEach(function (session) {
      var option = document.createElement("option");
      option.value = session.id;
      option.dataset.class = "true";
      option.textContent = session.title + " (" + session.class_code + ")";
      classFilter.appendChild(option);
    });
    if (Array.from(classFilter.options).some(function (option) { return option.value === selected; })) classFilter.value = selected;
  }

  function renderSessions() {
    var list = document.getElementById("session-list");
    list.replaceChildren();
    if (!dashboardData.classes.length) {
      var empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "No class sessions yet. Create one above when you are ready to teach.";
      list.appendChild(empty);
      return;
    }
    dashboardData.classes.forEach(function (session) {
      var article = document.createElement("article");
      article.className = "session-card";
      var header = document.createElement("header");
      var heading = document.createElement("h3");
      heading.textContent = session.title;
      var status = document.createElement("span");
      status.className = "status" + (session.status === "ended" ? " ended" : "");
      status.textContent = session.status === "live" ? "Live" : "Ended";
      header.append(heading, status);
      var meta = document.createElement("p");
      meta.textContent = "Code " + session.class_code + " | Created " + displayDate(session.created_at);
      var link = document.createElement("div");
      link.className = "share-link";
      link.textContent = sessionLink(session.class_code);
      var actions = document.createElement("div");
      actions.className = "session-actions";
      var copy = document.createElement("button");
      copy.type = "button";
      copy.textContent = "Copy student link";
      copy.addEventListener("click", function () { copyLink(copy, sessionLink(session.class_code)); });
      actions.appendChild(copy);
      if (session.status === "live") {
        var end = document.createElement("button");
        end.type = "button";
        end.textContent = "End session";
        end.addEventListener("click", function () { endSession(session, end); });
        actions.appendChild(end);
      }
      article.append(header, meta, link, actions);
      list.appendChild(article);
    });
  }

  async function copyLink(button, value) {
    try {
      await navigator.clipboard.writeText(value);
      var original = button.textContent;
      button.textContent = "Copied";
      setTimeout(function () { button.textContent = original; }, 1500);
    } catch (_error) {
      button.textContent = "Copy unavailable";
    }
  }

  async function endSession(session, button) {
    if (!confirm("End " + session.title + "? New students will no longer be able to join.")) return;
    button.disabled = true;
    try {
      await api("end-class", { body: { class_id: session.id } });
      await refreshDashboard();
    } catch (error) {
      alert(error.message);
      button.disabled = false;
    }
  }

  function filteredAttempts() {
    var value = classFilter.value;
    if (value === "all") return dashboardData.attempts;
    if (value === "self") return dashboardData.attempts.filter(function (attempt) { return !attempt.class_session_id; });
    return dashboardData.attempts.filter(function (attempt) { return attempt.class_session_id === value; });
  }

  function renderAttempts() {
    var attempts = filteredAttempts();
    var rows = document.getElementById("attempt-rows");
    rows.replaceChildren();
    document.getElementById("empty-attempts").hidden = attempts.length > 0;
    attempts.forEach(function (attempt) {
      var row = document.createElement("tr");
      var session = classById(attempt.class_session_id);
      addCell(row, attempt.student_name);
      addCell(row, session ? session.title : "Self-study");
      var statusCell = addCell(row, attempt.status === "submitted" ? "Submitted" : "In progress");
      statusCell.className = "status-label" + (attempt.status === "submitted" ? " submitted" : "");
      addCell(row, attempt.answered_count + " / 30");
      addCell(row, attempt.status === "submitted" ? attempt.score + " / 30" : "Pending");
      addCell(row, displayDate(attempt.submitted_at));
      var detailCell = document.createElement("td");
      detailCell.appendChild(answerDetails(attempt));
      row.appendChild(detailCell);
      rows.appendChild(row);
    });
  }

  function addCell(row, value) {
    var cell = document.createElement("td");
    cell.textContent = String(value);
    row.appendChild(cell);
    return cell;
  }

  function answerDetails(attempt) {
    var details = document.createElement("details");
    var summary = document.createElement("summary");
    var answerList = attempt.friendship_quiz_attempt_answers || [];
    summary.textContent = "View " + answerList.length + " answers";
    var grid = document.createElement("div");
    grid.className = "answer-grid";
    var byNumber = new Map(answerList.map(function (answer) { return [answer.question_no, answer]; }));
    dashboardData.questions.forEach(function (question) {
      var answer = byNumber.get(question.question_no);
      var cell = document.createElement("span");
      cell.className = "answer-cell";
      cell.textContent = question.question_no + ": " + (answer ? String.fromCharCode(65 + answer.selected_index) : "-");
      cell.title = question.prompt;
      if (answer) cell.classList.add(answer.selected_index === question.correct_index ? "correct" : "incorrect");
      grid.appendChild(cell);
    });
    details.append(summary, grid);
    return details;
  }

  async function createClass(event) {
    event.preventDefault();
    var title = document.getElementById("class-title").value.trim().replace(/\s+/g, " ");
    var message = document.getElementById("class-message");
    var button = event.target.querySelector("button");
    button.disabled = true;
    message.textContent = "Creating session...";
    try {
      var data = await api("create-class", { body: { title: title } });
      document.getElementById("class-title").value = "";
      message.textContent = "Created. Student link: " + sessionLink(data.class_session.class_code);
      await refreshDashboard();
    } catch (error) {
      message.textContent = error.message;
      message.className = "message error";
    } finally {
      button.disabled = false;
    }
  }

  function csvSafe(value) {
    var text = value === null || typeof value === "undefined" ? "" : String(value);
    if (/^[=+\-@]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  }

  function downloadCsv() {
    var attempts = filteredAttempts();
    var header = ["Student", "Session", "Class code", "Status", "Answered", "Score", "Created", "Submitted"];
    dashboardData.questions.forEach(function (question) { header.push("Q" + question.question_no); });
    var rows = [header];
    attempts.forEach(function (attempt) {
      var session = classById(attempt.class_session_id);
      var byNumber = new Map((attempt.friendship_quiz_attempt_answers || []).map(function (answer) { return [answer.question_no, answer.selected_index]; }));
      var row = [attempt.student_name, session ? session.title : "Self-study", session ? session.class_code : "", attempt.status, attempt.answered_count, attempt.score === null ? "" : attempt.score, attempt.created_at, attempt.submitted_at || ""];
      dashboardData.questions.forEach(function (question) {
        var selected = byNumber.get(question.question_no);
        row.push(typeof selected === "number" ? String.fromCharCode(65 + selected) + (selected === question.correct_index ? " correct" : " incorrect") : "");
      });
      rows.push(row);
    });
    var csv = "\ufeff" + rows.map(function (row) { return row.map(csvSafe).join(","); }).join("\r\n");
    var blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "friendship-quiz-" + new Date().toISOString().slice(0, 10) + ".csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  }

  loginForm.addEventListener("submit", login);
  document.getElementById("lock-dashboard").addEventListener("click", lockDashboard);
  document.getElementById("refresh").addEventListener("click", refreshDashboard);
  document.getElementById("class-form").addEventListener("submit", createClass);
  document.getElementById("download-csv").addEventListener("click", downloadCsv);
  classFilter.addEventListener("change", renderAttempts);

  teacherKey = readSessionKey();
  if (teacherKey) login();
  setInterval(function () { if (teacherKey && !document.hidden) refreshDashboard(); }, 10000);
})();
