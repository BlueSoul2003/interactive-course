const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const moduleId = 'spm-chem-f5-selangor-pintas-2025-k2-teacher';
const moduleTitle = 'Selangor PINTAS 2025 Kimia Kertas 2 Teacher Slides';
const moduleRoute = 'content/SPM_Syllabus/Form5/Chemistry/Selangor_PINTAS_2025_Kertas_2_Teacher/index.html';
const moduleRoot = path.join(root, path.dirname(moduleRoute));
const html = fs.readFileSync(path.join(root, moduleRoute), 'utf8');
const questionsSource = fs.readFileSync(path.join(moduleRoot, 'questions.js'), 'utf8');
const portal = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const expectedQuestionHashes = {
  'page-01.jpg': '85077a6b853d53e84a97321e784d0f107dcd0669b8b075ec5dbeea5ec6d48a37',
  'page-02.jpg': '8e9543dbc7447f34d844da28aec109af3426dca9e6b5af61513cd60304da2dfa',
  'page-03.jpg': 'a5533b9ef0411687483435266851c94edd55a30de8f96b34945eb7eeb4d667ad',
  'page-04.jpg': 'ae368897cf513e2b5718bb9287de03a252eacca910ee5741bb3d46a7e9ac2367',
  'page-05.jpg': '9c94156dc6c1a7058440ba7584798648b72a19e8c6a85b2385e3ff8c53d2ac9a',
  'page-06.jpg': 'c34aa30b3778cec5e4b94fb13a8689cfe4da8102756cf25e09b9ddce5eaea9dd',
  'page-07.jpg': '5a1ecddd7e5419e6b6e2b1da1ae1a2dfd692a50ff3e91e88683d07be10000735',
  'page-08.jpg': 'a0526baabddbe459be40b0a5d737e80835b6f62e6c0cd1963ae95836eb4be8d0',
  'page-09.jpg': 'e1a4bd3c2e6591ed9cf3c3989e21052dfc5b70182befcc35b800ce5399cdb8a6',
  'page-10.jpg': '20149ee7bd8668edf51e42749fc906b6980fed49024c2857680843a3135cb307',
  'page-11.jpg': 'baae22d9b7a9c439e2c4c9a6291f46561e7382489a520b8f63d125ad14db5c3c',
  'page-12.jpg': '77dea9d56dd1371cbe88088c26127de5e0472015b7673e5bbcf5995fe366725e',
  'page-13.jpg': '915ef15e9a77a57643fb487c58e42e8a697101f42f220c4f35dee7abb26097d3',
  'page-14.jpg': '5c3e15f7653029ba74d47fdbf3df0a6de6d223d4f2327442cbb79a8ad274e2c7',
  'page-15.jpg': '4211c36839cea52c6519a4347aee9abb6b6c78e88d394a909e738c5b869f7100',
  'page-16.jpg': '5ae74450d278192131feb35a93f7376976c41de4b14052899e967f8f6f6aa3f8',
  'page-17.jpg': '6ff9238b1c2829f5488a6a912072d8b4719987c42724f0814bd8eadc117ceb02',
  'page-18.jpg': '131a50742798e429117fdea84703fa579a7cf3161f984cd0b10c1bcea426b82e',
  'page-19.jpg': '5a23a5cdd235f42c3f482a4eab7096d0ef568a82749b34b988a78ce5bfa1942e',
  'page-20.jpg': 'eee23e4bdeb16b416ebb9e7a00fd88e133e7d4abadef2bcfe88700b2ecb9c27a',
  'page-21.jpg': 'f51b177f68bdf4bc88caa9aa04c9dd56400c5ce1102525a23b9017874c2d830b',
  'page-22.jpg': 'b620302958410126f31d5963eab55994816df66c5d7621aa7bd4849eaf7cd876',
  'page-23.jpg': '39e255712da363273e6e290b54f8f2d1b55ca0510a215e83374c7ad6bc934925',
  'page-24.jpg': '817aeeed1a60c89d65e3ea7ff40bfcee15a7f6826263311687a6cbc41800b7b9',
  'page-25.jpg': '17f3713107b14cde8b1e4b36e6deec372b245b44283e2ee9e71887428f40f34b',
  'page-26.jpg': '201694725c3d66c4b5b8d70eac3e6665911919af03bc1f62676c9ed6c7218985'
};
const questionDir = path.join(moduleRoot, 'assets', 'questions');
assert.deepStrictEqual(
  fs.readdirSync(questionDir).filter(file => file.endsWith('.jpg')).sort(),
  Object.keys(expectedQuestionHashes).sort(),
  'Expected all 26 original question-paper JPEGs'
);
for (const [file, expectedHash] of Object.entries(expectedQuestionHashes)) {
  const content = fs.readFileSync(path.join(questionDir, file));
  assert.strictEqual(
    crypto.createHash('sha256').update(content).digest('hex'),
    expectedHash,
    'Question image must remain byte-exact: ' + file
  );
}

const expectedAnswerImages = [
  'q03-chlorine-electron-arrangement.jpg',
  'q07-rate-graph.jpg',
  'q10-butanol-isomers.jpg',
  'q10-butene-isomer.png',
  'q10-combustion-apparatus.png',
  'q11-redox-apparatus.jpg'
];
const answerDir = path.join(moduleRoot, 'assets', 'answers');
assert.deepStrictEqual(
  fs.readdirSync(answerDir).filter(file => /\.(?:jpg|png)$/i.test(file)).sort(),
  expectedAnswerImages,
  'Expected six source-faithful marking-scheme images'
);
for (const file of expectedAnswerImages) {
  assert.ok(fs.statSync(path.join(answerDir, file)).size > 2_000, 'Answer image is unexpectedly small: ' + file);
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
const questions = questionsContext.window.SELANGOR_PINTAS_QUESTIONS;
assert.ok(Array.isArray(questions), 'SELANGOR_PINTAS_QUESTIONS was not loaded');
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
  Array.from({ length: 25 }, (_, index) => index + 2),
  'Question mapping must cover paper pages 2-26'
);

const segments = questions.flatMap(question => Array.from(question.segments));
assert.strictEqual(segments.length, 63, 'Expected 63 staged answer segments');
assert.ok(segments.every(segment => segment.label && segment.answer && segment.explanation), 'Every segment needs a label, answer, and explanation');
assert.ok(segments.every(segment => !/[\u3400-\u9fff]/.test(segment.answer)), 'Every answer must remain in English');
assert.ok(segments.every(segment => /[\u3400-\u9fff]/.test(segment.explanation)), 'Every explanation must contain Chinese guidance');
for (const segment of segments.filter(segment => segment.image)) {
  assert.ok(fs.existsSync(path.join(moduleRoot, ...segment.image.split('/'))), 'Missing scheme image: ' + segment.image);
}

const calculationSegments = segments.filter(segment => segment.calculation);
assert.strictEqual(calculationSegments.length, 5, 'Expected five two-click calculation segments');
for (const segment of calculationSegments) {
  const lines = segment.answer.split('\n').filter(Boolean);
  assert.ok(lines.length >= 4, 'Calculation answer is missing working steps: ' + segment.label);
  assert.ok(lines.every(line => /^(Step \d+|Final answer):/.test(line)), 'Each calculation line needs a step/final label: ' + segment.label);
  assert.ok(lines.some(line => /^Final answer:/.test(line)), 'Calculation answer needs a final result: ' + segment.label);
}
assert.match(questions[8].note, /^Source warning:/, 'Question 9 must show the scheme typo warning');
assert.match(questions[8].segments[0].answer, /hydrogen ions/, 'Question 9(a) must use the scientifically correct ion');
assert.doesNotMatch(questions[8].segments[0].answer, /hydroxide ions/, 'Question 9(a) must not repeat the scheme typo');

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
  window: { SELANGOR_PINTAS_QUESTIONS: questions },
  console,
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} }
};
vm.createContext(appContext);
new vm.Script(classSource, { filename: 'index-state-machine.js' }).runInContext(appContext);
const TestSlidePresentation = appContext.TestSlidePresentation;
assert.strictEqual(typeof TestSlidePresentation, 'function', 'SlidePresentation class could not be loaded for state testing');

const calculationQuestionIndex = questions.findIndex(question => question.segments.some(segment => segment.calculation));
const calculationSegmentIndex = questions[calculationQuestionIndex].segments.findIndex(segment => segment.calculation);
const deck = Object.create(TestSlidePresentation.prototype);
deck.questions = questions;
deck.current = calculationQuestionIndex;
deck.reveals = questions.map(() => ({ segment: -1, mode: 'idle', calcStep: -1, calcPhase: 'label' }));
deck.rememberPaperPosition = () => {};
deck.save = () => {};
deck.render = () => {};
const state = deck.reveals[calculationQuestionIndex];
deck.startSegment(state, calculationSegmentIndex);
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
assert.strictEqual(state.calcPhase, 'value', 'Fourth calculation click must reveal the Step 2 value');
while (state.mode === 'calculation') deck.advanceReveal();
assert.strictEqual(state.mode, 'explanation', 'Final calculation value must advance to its Chinese explanation');

assert.match(html, /--indigo: #6f1732/, 'Selangor deck needs its crimson theme');
assert.match(html, /2025 SPM Chemistry Selangor PINTAS · Kertas 2 Teacher Slides/, 'Selangor page title is missing');
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
  .filter(file => file.endsWith('_register_spm_chem_selangor_pintas_2025_kertas_2_teacher.sql'));
assert.strictEqual(migrationFiles.length, 1, 'Expected exactly one Selangor teacher registry migration');
const migration = fs.readFileSync(path.join(root, 'supabase', 'migrations', migrationFiles[0]), 'utf8');
assert.match(migration, new RegExp(moduleId), 'Registry migration must include the canonical module ID');
assert.match(migration, /'protected'/, 'Registry migration must preserve protected launcher access');

console.log(
  'Selangor PINTAS 2025 Kimia Kertas 2 Teacher verification passed: ' +
  '11 questions, 120 marks, 63 answer stages, 5 two-click calculations, 26 byte-exact question pages, ' +
  '6 scheme images, source correction, crimson theme, protected access, navigation, and progress sync.'
);
