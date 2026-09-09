const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const moduleId = 'spm-chem-f5-sbp-2025-k2-teacher';
const moduleTitle = 'SBP 2025 Kimia Kertas 2 Teacher Slides';
const moduleRoute = 'content/SPM_Syllabus/Form5/Chemistry/SBP_2025_Kertas_2_Teacher/index.html';
const moduleRoot = path.join(root, path.dirname(moduleRoute));
const html = fs.readFileSync(path.join(root, moduleRoute), 'utf8');
const questionsSource = fs.readFileSync(path.join(moduleRoot, 'questions.js'), 'utf8');
const portal = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const expectedQuestionFiles = Array.from({ length: 28 }, (_, index) =>
  'page-' + String(index + 1).padStart(2, '0') + '.jpg'
);
assert.deepStrictEqual(
  fs.readdirSync(path.join(moduleRoot, 'assets', 'questions')).filter(file => file.endsWith('.jpg')).sort(),
  expectedQuestionFiles,
  'Expected the 28 original question-paper page images'
);
for (const file of expectedQuestionFiles) {
  assert.ok(
    fs.statSync(path.join(moduleRoot, 'assets', 'questions', file)).size > 10_000,
    'Question-page image is unexpectedly small: ' + file
  );
}

const expectedAnswerImages = [
  'q03-atom-r.png',
  'q07-gas-test.png',
  'q08-rate-graph.png',
  'q09-structure-j.png',
  'q09-structures-mq.png',
  'q09-y-isomers.png',
  'q11-chemical-cell.png'
];
assert.deepStrictEqual(
  fs.readdirSync(path.join(moduleRoot, 'assets', 'answers')).filter(file => file.endsWith('.png')).sort(),
  expectedAnswerImages,
  'Expected the seven source-faithful marking-scheme crops'
);
for (const file of expectedAnswerImages) {
  assert.ok(
    fs.statSync(path.join(moduleRoot, 'assets', 'answers', file)).size > 10_000,
    'Answer image is unexpectedly small: ' + file
  );
}
assert.deepStrictEqual(
  fs.readdirSync(moduleRoot).filter(file => file.toLowerCase().endsWith('.pdf')),
  [],
  'Source PDFs must stay off-repository'
);

const questionsContext = { window: {} };
vm.createContext(questionsContext);
assert.doesNotThrow(
  () => new vm.Script(questionsSource, { filename: 'questions.js' }).runInContext(questionsContext),
  'Question data JavaScript should parse'
);
const questions = questionsContext.window.SBP_QUESTIONS;
assert.ok(Array.isArray(questions), 'SBP_QUESTIONS was not loaded');
assert.strictEqual(questions.length, 11, 'Teacher deck must cover Questions 1-11');
assert.deepStrictEqual(
  Array.from(questions, question => question.number),
  Array.from({ length: 11 }, (_, index) => index + 1),
  'Question numbers must be continuous from 1 to 11'
);
assert.strictEqual(
  questions.reduce((total, question) => total + Number.parseInt(question.marks, 10), 0),
  120,
  'Total marks must be 120'
);
assert.deepStrictEqual(
  Array.from(new Set(questions.flatMap(question => Array.from(question.pages)))).sort((a, b) => a - b),
  Array.from({ length: 26 }, (_, index) => index + 2),
  'Question mapping must cover paper pages 2-27'
);

const segments = questions.flatMap(question => Array.from(question.segments));
assert.strictEqual(segments.length, 54, 'Expected 54 staged answer segments');
assert.ok(segments.every(segment => segment.label && segment.answer && segment.explanation), 'Every segment needs a label, answer, and explanation');
assert.ok(segments.every(segment => !/[\u3400-\u9fff]/.test(segment.answer)), 'Every answer must remain in English');
assert.ok(segments.every(segment => /[\u3400-\u9fff]/.test(segment.explanation)), 'Every explanation must contain Chinese guidance');
for (const segment of segments.filter(segment => segment.image)) {
  assert.ok(fs.existsSync(path.join(moduleRoot, ...segment.image.split('/'))), 'Missing scheme crop: ' + segment.image);
}

const calculationSegments = segments.filter(segment => segment.calculation);
assert.strictEqual(calculationSegments.length, 6, 'Expected six two-click calculation segments');
for (const segment of calculationSegments) {
  const lines = segment.answer.split('\n').filter(Boolean);
  assert.ok(lines.length >= 2, 'Calculation answer is missing working steps: ' + segment.label);
  assert.ok(lines.every(line => /^(Step \d+|Final answer|Conclusion):/.test(line)), 'Each calculation line needs a step/final label: ' + segment.label);
  assert.ok(lines.some(line => /^(Final answer|Conclusion):/.test(line)), 'Calculation answer needs a final result: ' + segment.label);
}

const inlineScripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
  .map(match => match[1])
  .filter(source => source.trim());
const deckSource = inlineScripts.find(source => source.includes('class SlidePresentation'));
assert.ok(deckSource, 'Teacher deck source script is missing');
assert.doesNotThrow(() => new vm.Script(deckSource), 'Teacher deck JavaScript should parse');
const classSource = deckSource.replace(
  /window\.teacherDeck\s*=\s*new SlidePresentation\([\s\S]*?\);\s*$/,
  'globalThis.TestSlidePresentation = SlidePresentation;'
);
const appContext = {
  window: { SBP_QUESTIONS: questions },
  console,
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} }
};
vm.createContext(appContext);
new vm.Script(classSource, { filename: 'index-state-machine.js' }).runInContext(appContext);
const TestSlidePresentation = appContext.TestSlidePresentation;
assert.strictEqual(typeof TestSlidePresentation, 'function', 'SlidePresentation class could not be loaded for state testing');

const deck = Object.create(TestSlidePresentation.prototype);
deck.questions = questions;
deck.current = 3;
deck.reveals = questions.map(() => ({ segment: -1, mode: 'idle', calcStep: -1, calcPhase: 'label' }));
deck.rememberPaperPosition = () => {};
deck.save = () => {};
deck.render = () => {};
const state = deck.reveals[3];
deck.startSegment(state, 2);
assert.deepStrictEqual(
  { mode: state.mode, step: state.calcStep, phase: state.calcPhase },
  { mode: 'calculation', step: 0, phase: 'label' },
  'First calculation click must show only the Step 1 label'
);
deck.advanceReveal();
assert.strictEqual(state.calcPhase, 'value', 'Second calculation click must reveal the Step 1 value');
deck.advanceReveal();
assert.deepStrictEqual(
  { step: state.calcStep, phase: state.calcPhase },
  { step: 1, phase: 'label' },
  'Third calculation click must add the Step 2 label while retaining Step 1'
);
deck.advanceReveal();
assert.deepStrictEqual(
  { step: state.calcStep, phase: state.calcPhase },
  { step: 1, phase: 'value' },
  'Fourth calculation click must reveal the Step 2 value'
);
const lineCount = deck.getCalculationLines(questions[3].segments[2]).length;
while (state.mode === 'calculation') deck.advanceReveal();
assert.strictEqual(state.mode, 'explanation', 'Final calculation value must advance to its Chinese explanation');
assert.deepStrictEqual(
  { step: state.calcStep, phase: state.calcPhase },
  { step: lineCount - 1, phase: 'value' },
  'All calculation steps must remain visible before the explanation'
);

assert.match(html, /--indigo: #123d49/, 'SBP deck needs its marine-teal theme');
assert.match(html, /2025 SPM Chemistry SBP · Kertas 2 Teacher Slides/, 'SBP page title is missing');
assert.match(html, /className = "back-link"/, 'Module needs a context-aware portal return link');
assert.match(html, /auth-access\.js\?v=1\.2\.0/, 'Module must load shared access support');
assert.match(html, /navigation\.js\?v=1\.0\.0/, 'Module must load central navigation');
assert.match(html, /progress-tracker\.js\?v=1\.0\.2/, 'Module must load portal progress tracking');
assert.ok(html.indexOf('navigation.js?v=1.0.0') < html.indexOf('progress-tracker.js?v=1.0.2'), 'Navigation must load before progress tracking');
assert.match(html, new RegExp('data-module-id="' + moduleId + '"'), 'Progress tracker must use the canonical module ID');
assert.match(html, /ProgressTracker\.init/, 'Module must restore signed-in teacher progress');
assert.match(html, /ProgressTracker\.autoSave/, 'Module must auto-save signed-in teacher progress');
assert.match(html, /restoreRemoteProgress/, 'Module must restore remote reveal state');
assert.match(html, /rememberPaperPosition/, 'Question-paper scrolling must be preserved during answer reveals');
assert.match(html, /currentPaperState\(\)\.top = 0/, 'Switching source pages must return the paper to the top');
assert.match(html, /resetCurrent/, 'Module needs a per-question reset');
assert.match(html, /resetAll/, 'Module needs a full-deck reset');
assert.doesNotMatch(html + questionsSource, /service[_-]?role/i, 'Public module must not contain a Supabase service-role secret');

const escapedRoute = moduleRoute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const cardPattern = new RegExp(
  '<a\\b(?=[^>]*href="' + escapedRoute + '")' +
  '(?=[^>]*data-module-id="' + moduleId + '")' +
  '(?=[^>]*data-bundle="spm_form5")[^>]*>'
);
assert.match(portal, cardPattern, 'Portal card must expose the canonical route, ID, and bundle');

const manifest = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'module-manifest.json'), 'utf8'));
assert.deepStrictEqual(manifest.modules.find(module => module.id === moduleId), {
  id: moduleId,
  title: moduleTitle,
  delivery: 'public',
  path: moduleRoute
});

const migrationFiles = fs.readdirSync(path.join(root, 'supabase', 'migrations'))
  .filter(file => file.endsWith('_register_spm_chem_sbp_2025_kertas_2_teacher.sql'));
assert.strictEqual(migrationFiles.length, 1, 'Expected exactly one SBP teacher registry migration');
const migration = fs.readFileSync(path.join(root, 'supabase', 'migrations', migrationFiles[0]), 'utf8');
assert.match(migration, new RegExp(moduleId), 'Registry migration must include the canonical module ID');
assert.match(migration, /'protected'/, 'Registry migration must preserve protected launcher access');

console.log(
  'SBP 2025 Kimia Kertas 2 Teacher verification passed: ' +
  '11 questions, 120 marks, 54 answer stages, 6 two-click calculations, 28 question pages, ' +
  '7 scheme images, marine-teal theme, protected access, navigation, and progress sync.'
);
