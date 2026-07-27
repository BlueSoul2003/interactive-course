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
  const start = html.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `Science module missing ${name}()`);
  const next = html.indexOf("\nfunction ", start + 10);
  return html.slice(start, next >= 0 ? next : html.length);
}

const snapshot = functionSource("progressSnapshot");
assert.match(snapshot, /\bphase\s*:\s*currentPhase\b/, "Progress snapshot must persist phase");
const showScreen = functionSource("showScreen");
assert.match(
  showScreen,
  /currentPhase=PERSISTED_PHASES\.has\(safeId\)\?safeId:"home"/,
  "Displayed screens must normalize to a validated persisted phase"
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

const restoreStart = html.indexOf("const restorePhase=");
const restoreEnd = html.indexOf("refreshStats();", restoreStart);
assert.ok(restoreStart >= 0 && restoreEnd > restoreStart, "Science restore phase block missing");
const restoreBlock = html.slice(restoreStart, restoreEnd);
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

console.log("PASS verify_science_command_centre_progress");
