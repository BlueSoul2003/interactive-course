const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const modulePath = path.join(
  root,
  "content/IGCSE_Syllabus/Year4/Science/Science_Command_Centre/index.html"
);
const html = fs.readFileSync(modulePath, "utf8");

assert.match(
  html,
  /const PERSISTED_PHASES=new Set\(\["home","choice","quiz","exit"\]\)/,
  "Science module must use the exact validated persisted phases"
);
assert.doesNotMatch(
  html,
  /onclick="[^"]*\bshowScreen\(/,
  "Direct screen controls must use save-aware transitions"
);

function functionSource(name) {
  const asyncStart = html.indexOf(`async function ${name}(`);
  const plainStart = html.indexOf(`function ${name}(`);
  const start = asyncStart >= 0 ? asyncStart : plainStart;
  assert.ok(start >= 0, `Science module missing ${name}()`);
  const next = html.indexOf("\nfunction ", start + 10);
  return html.slice(start, next >= 0 ? next : html.length);
}

const snapshot = functionSource("progressSnapshot");
assert.match(snapshot, /\bphase\s*:\s*currentPhase\b/, "Progress snapshot must persist phase");
const showScreen = functionSource("showScreen");
vm.runInNewContext(
  `
  const PERSISTED_PHASES = new Set(["home", "choice", "quiz", "exit"]);
  let currentPhase = "quiz";
  const screens = Object.fromEntries(
    ["home", "route", "choice", "quiz", "exit"].map(id => [
      id,
      { classList: { add() {}, remove() {} } }
    ])
  );
  const document = {
    getElementById(id) { return screens[id] || null; },
    querySelectorAll() { return Object.values(screens); }
  };
  function stopTimer() {}
  function updateExit() {}
  ${showScreen}
  showScreen("route");
  assert.equal(currentPhase, "quiz");
  showScreen("home");
  assert.equal(currentPhase, "home");
  currentPhase = "quiz";
  showScreen("missing");
  assert.equal(currentPhase, "home");
  `,
  { assert }
);

const transition = functionSource("transitionTo");
vm.runInNewContext(
  `
  const calls = [];
  function showScreen(id) { calls.push("show:" + id); }
  function saveProgress() { calls.push("save"); }
  ${transition}
  transitionTo("choice");
  transitionTo("exit");
  assert.deepEqual(calls, ["show:choice", "save", "show:exit", "save"]);
  `,
  { assert }
);

const missions = functionSource("renderMissions");
assert.match(
  missions,
  /m\.id==="choice"\?"transitionTo\('choice'\)":m\.id==="exit"\?"transitionTo\('exit'\)"/,
  "Mission-grid Choice and Exit controls must save their screen transitions"
);

const resolveRestorePhase = functionSource("resolveRestorePhase");
vm.runInNewContext(
  `
  ${resolveRestorePhase}
  assert.equal(resolveRestorePhase("choice", false, 300), "choice");
  assert.equal(resolveRestorePhase("exit", true, 300), "exit");
  assert.equal(resolveRestorePhase("quiz", true, 0), "exit");
  assert.equal(resolveRestorePhase("quiz", true, 125), "quiz");
  assert.equal(resolveRestorePhase("quiz", false, 125), "home");
  assert.equal(resolveRestorePhase("home", true, 125), "home");
  assert.equal(resolveRestorePhase("bogus", true, 125), "home");
  `,
  { assert }
);

const validateSavedSeconds = functionSource("validateSavedSeconds");
const restoreSessionState = functionSource("restoreSessionState");
vm.runInNewContext(
  `
  ${validateSavedSeconds}
  ${resolveRestorePhase}
  ${restoreSessionState}
  function simulateLoader(saved) {
    let seconds = 3600;
    let timerStarted = false;
    const restored = restoreSessionState(saved, true);
    if (restored.seconds !== null) seconds = restored.seconds;
    if (restored.phase === "quiz") timerStarted = true;
    return { restored, runtimeSeconds: seconds, timerStarted };
  }
  for (const saved of [
    { phase: "quiz" },
    { phase: "quiz", seconds: null },
    { phase: "quiz", seconds: "125" },
    { phase: "quiz", seconds: NaN }
  ]) {
    const result = simulateLoader(saved);
    assert.equal(result.restored.phase, "home");
    assert.equal(result.restored.seconds, null);
    assert.equal(result.timerStarted, false);
  }
  const activeQuiz = simulateLoader({ phase: "quiz", seconds: 125 });
  assert.equal(activeQuiz.restored.phase, "quiz");
  assert.equal(activeQuiz.runtimeSeconds, 125);
  assert.equal(activeQuiz.timerStarted, true);
  const completedQuiz = simulateLoader({ phase: "quiz", seconds: 0 });
  assert.equal(completedQuiz.restored.phase, "exit");
  assert.equal(completedQuiz.runtimeSeconds, 0);
  assert.equal(completedQuiz.timerStarted, false);
  `,
  { assert }
);

const timerTick = functionSource("timerTick");
vm.runInNewContext(
  `
  let seconds = 1;
  let timerHandle = {};
  const calls = [];
  function updateTimer() { calls.push("update"); }
  function stopTimer() { timerHandle = null; calls.push("stop"); }
  function showScreen(id) { calls.push("show:" + id); }
  function saveProgress() { calls.push("save"); }
  ${timerTick}
  timerTick();
  assert.equal(seconds, 0);
  assert.equal(timerHandle, null);
  assert.deepEqual(calls, ["update", "stop", "show:exit", "save"]);
  `,
  { assert }
);

assert.doesNotMatch(
  html,
  /onclick="location\.reload\(\)"/,
  "Reset control must not reload without clearing and saving progress"
);
assert.match(
  html,
  /onclick="resetForNextClass\(\)"/,
  "Reset control must call the explicit reset workflow"
);
const resetForNextClass = functionSource("resetForNextClass");
const resetTest = vm.runInNewContext(
  `
  let currentMissionId = "boss";
  let currentRouteChoice = "earth";
  let activeQuestions = [{ id: "q1" }];
  let index = 4;
  let xp = 120;
  let focus = 3;
  let streak = 5;
  let wrongStreak = 2;
  let bestStreak = 7;
  let correctCount = 8;
  let wrongCount = 4;
  let seconds = 0;
  let currentPhase = "exit";
  let timerHandle = {};
  let autoAdvanceTimer = {};
  let pendingNextMissionId = "choice";
  const state = { q1: { value: 2, checked: true }, q2: { revealedLetters: [0] } };
  const calls = [];
  let savedSnapshot = null;
  function stopTimer() { timerHandle = null; calls.push("stop"); }
  function clearAutoAdvance() {
    autoAdvanceTimer = null;
    pendingNextMissionId = null;
    calls.push("clear-auto");
  }
  function showScreen(id) { currentPhase = id; calls.push("show:" + id); }
  function refreshStats() { calls.push("refresh"); }
  function updateTimer() { calls.push("timer-ui"); }
  function progressSnapshot() {
    return {
      phase: currentPhase,
      missionId: currentMissionId,
      routeChoice: currentRouteChoice,
      questionIds: activeQuestions.map(item => item.id),
      questionIndex: index,
      xp,
      focus,
      streak,
      wrongStreak,
      bestStreak,
      correctCount,
      wrongCount,
      seconds,
      responses: state
    };
  }
  const ProgressTracker = {
    async save(value) {
      savedSnapshot = JSON.parse(JSON.stringify(value));
      calls.push("save");
    }
  };
  const window = { ProgressTracker };
  const location = { reload() { calls.push("reload"); } };
  ${resetForNextClass}
  (async () => {
    async function exerciseReset(phase) {
      currentMissionId = "boss";
      currentRouteChoice = "earth";
      activeQuestions = [{ id: "q1" }];
      index = 4;
      xp = 120;
      focus = 3;
      streak = 5;
      wrongStreak = 2;
      bestStreak = 7;
      correctCount = 8;
      wrongCount = 4;
      seconds = phase === "exit" ? 0 : 125;
      currentPhase = phase;
      timerHandle = {};
      autoAdvanceTimer = {};
      pendingNextMissionId = "choice";
      state.q1 = { value: 2, checked: true };
      state.q2 = { revealedLetters: [0] };
      savedSnapshot = null;
      const callStart = calls.length;
      await resetForNextClass();
      const resetCalls = calls.slice(callStart);
      assert.equal(currentMissionId, null);
      assert.equal(currentRouteChoice, null);
      assert.deepEqual(activeQuestions, []);
      assert.equal(index, 0);
      assert.equal(xp, 0);
      assert.equal(focus, 0);
      assert.equal(streak, 0);
      assert.equal(wrongStreak, 0);
      assert.equal(bestStreak, 0);
      assert.equal(correctCount, 0);
      assert.equal(wrongCount, 0);
      assert.equal(seconds, 3600);
      assert.deepEqual(state, {});
      assert.equal(timerHandle, null);
      assert.equal(autoAdvanceTimer, null);
      assert.equal(pendingNextMissionId, null);
      assert.equal(currentPhase, "home");
      assert.deepEqual(savedSnapshot, {
        phase: "home",
        missionId: null,
        routeChoice: null,
        questionIds: [],
        questionIndex: 0,
        xp: 0,
        focus: 0,
        streak: 0,
        wrongStreak: 0,
        bestStreak: 0,
        correctCount: 0,
        wrongCount: 0,
        seconds: 3600,
        responses: {}
      });
      assert.ok(resetCalls.indexOf("save") > resetCalls.indexOf("show:home"));
      assert.ok(resetCalls.indexOf("reload") > resetCalls.indexOf("save"));
    }
    await exerciseReset("exit");
    await exerciseReset("quiz");
  })();
  `,
  { assert }
);

const startTimer = functionSource("startTimer");
vm.runInNewContext(
  `
  let seconds = 125;
  let timerHandle = null;
  let intervalCalls = 0;
  function timerTick() {}
  function setInterval(callback, delay) {
    intervalCalls++;
    assert.equal(callback, timerTick);
    assert.equal(delay, 1000);
    return { callback, delay };
  }
  ${startTimer}
  startTimer();
  assert.ok(timerHandle);
  assert.equal(intervalCalls, 1);
  startTimer();
  assert.equal(intervalCalls, 1);
  `,
  { assert }
);

const restoreStart = html.indexOf("const restoredSession=");
const restoreEnd = html.indexOf("refreshStats();", restoreStart);
assert.ok(restoreStart >= 0 && restoreEnd > restoreStart, "Science restore phase block missing");
const restoreBlock = html.slice(restoreStart, restoreEnd);
assert.match(
  restoreBlock,
  /const restoredSession=restoreSessionState\(saved,hasValidQuestions\)/
);
assert.doesNotMatch(
  html,
  /seconds\s*=\s*saved\.seconds/,
  "Loader must not let invalid saved seconds inherit the runtime default"
);
assert.match(restoreBlock, /restorePhase==="choice"[\s\S]*showScreen\("choice"\)/);
assert.match(restoreBlock, /restorePhase==="exit"[\s\S]*showScreen\("exit"\)/);
assert.match(
  restoreBlock,
  /restorePhase==="quiz"[\s\S]*showScreen\("quiz"\)[\s\S]*renderQuestion\(\)[\s\S]*startTimer\(\)/
);
assert.match(restoreBlock, /else\{[\s\S]*showScreen\("home"\)/);
assert.equal(
  (restoreBlock.match(/startTimer\(\)/g) || []).length,
  1,
  "Only a valid active Quiz restore may restart the timer"
);

Promise.resolve(resetTest)
  .then(() => console.log("PASS verify_science_command_centre_progress"))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
