const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const moduleRoot = path.join(root, 'content', 'IGCSE_Syllabus', 'Year4', 'Science', 'Planet_Earth_Revision');
const dataPath = path.join(moduleRoot, 'data.js');
const indexPath = path.join(moduleRoot, 'index.html');
const appPath = path.join(moduleRoot, 'app.js');
const stylesPath = path.join(moduleRoot, 'styles.css');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(dataPath, 'utf8'), context, { filename: dataPath });
const data = context.window.PLANET_EARTH_REVISION_DATA;
assert(data, 'Revision data did not register on window.');
assert(data.id === 'igcse-y4-sci-planet-earth-revision-v2', 'Unexpected module ID.');

const expected = {
  structure: { mcq: 25, cloze: 13 },
  volcanoes: { mcq: 25, cloze: 13 },
  earthquakes: { mcq: 25, cloze: 12 },
  alerts: { mcq: 25, cloze: 12 }
};
const ids = new Set();
const prompts = new Set();
let mcqTotal = 0;
let clozeTotal = 0;

for (const unitKey of data.unitOrder) {
  const unit = data.units[unitKey];
  assert(unit, `Missing unit: ${unitKey}`);
  assert(unit.mcq.length === expected[unitKey].mcq, `${unitKey} MCQ count is ${unit.mcq.length}.`);
  assert(unit.cloze.length === expected[unitKey].cloze, `${unitKey} cloze count is ${unit.cloze.length}.`);
  assert(fs.existsSync(path.join(moduleRoot, unit.image)), `Missing unit image: ${unit.image}`);

  unit.mcq.forEach((question, index) => {
    const id = `${unitKey}-mcq-${String(index + 1).padStart(3, '0')}`;
    assert(!ids.has(id), `Duplicate ID: ${id}`);
    ids.add(id);
    assert(['core', 'apply', 'stretch'].includes(question.level), `${id} has invalid difficulty.`);
    assert(typeof question.prompt === 'string' && question.prompt.trim(), `${id} has no prompt.`);
    assert(question.options.length === 4, `${id} does not have four options.`);
    assert(new Set(question.options).size === 4, `${id} has repeated options.`);
    assert(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < 4, `${id} has an invalid answer.`);
    assert(question.explanation && question.teachingNote, `${id} is missing feedback.`);
    const normalized = question.prompt.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    assert(!prompts.has(normalized), `Duplicate MCQ prompt: ${question.prompt}`);
    prompts.add(normalized);
    mcqTotal += 1;
  });

  unit.cloze.forEach((question, index) => {
    const id = `${unitKey}-cloze-${String(index + 1).padStart(3, '0')}`;
    assert(!ids.has(id), `Duplicate ID: ${id}`);
    ids.add(id);
    assert(['core', 'apply', 'stretch'].includes(question.level), `${id} has invalid difficulty.`);
    assert(question.parts.length === 4, `${id} must contain exactly three blanks.`);
    assert(question.blanks.length === 3, `${id} must contain exactly three blank definitions.`);
    question.blanks.forEach((blank, blankIndex) => {
      assert(blank.choices.length === 4, `${id} blank ${blankIndex + 1} does not have four choices.`);
      assert(new Set(blank.choices).size === 4, `${id} blank ${blankIndex + 1} has repeated choices.`);
      assert(Number.isInteger(blank.answer) && blank.answer >= 0 && blank.answer < 4, `${id} blank ${blankIndex + 1} has an invalid answer.`);
    });
    assert(question.explanation && question.teachingNote, `${id} is missing feedback.`);
    clozeTotal += 1;
  });
}

assert(mcqTotal === 100, `Expected 100 MCQs, found ${mcqTotal}.`);
assert(clozeTotal === 50, `Expected 50 cloze questions, found ${clozeTotal}.`);

const html = fs.readFileSync(indexPath, 'utf8');
const app = fs.readFileSync(appPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');
const requiredIds = ['dashboardView', 'workspaceView', 'unitGrid', 'answerArea', 'inkCanvas', 'teacherConsole', 'reportDialog', 'resetDialog'];
requiredIds.forEach((id) => assert(html.includes(`id="${id}"`), `Missing required element: ${id}`));
assert(html.includes('data-module-id="igcse-y4-sci-planet-earth-revision-v2"'), 'Progress tracker module ID is missing.');
assert(html.includes('data.js') && html.includes('app.js'), 'Data or application script is missing.');
assert(app.includes("event.ctrlKey && event.altKey && event.key.toLowerCase() === 't'"), 'Teacher shortcut is missing.');
assert(app.includes("event.ctrlKey && event.altKey && event.key.toLowerCase() === 'r'"), 'Teacher reset shortcut is missing.');
assert(app.includes("addEventListener('pointerdown'"), 'Electronic pen pointer support is missing.');
assert(app.includes('wrongAttempts') && app.includes('celebrateCorrect()'), 'Retry tracking or correct-answer celebration is missing.');
assert(app.includes('scheduleAutoAdvance()') && app.includes('4000'), 'Four-second auto advance is missing.');
assert(!/[—–]/.test(html + app), 'Visible application source contains a banned long dash.');
assert(styles.includes('prefers-reduced-motion'), 'Reduced-motion support is missing.');
assert(styles.includes('correct-edge-pulse'), 'Correct-answer edge glow is missing.');
assert(styles.includes('min-height:100dvh'), 'Stable mobile viewport height is missing.');

console.log(`Planet Earth Revision verified: ${mcqTotal} MCQs, ${clozeTotal} cloze questions, ${ids.size} unique IDs.`);
