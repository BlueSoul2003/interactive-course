const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const moduleId = 'spm-chem-f5-terengganu-2025-k2-teacher';
const moduleTitle = 'Terengganu 2025 Kimia Kertas 2 Teacher Slides';
const moduleRoute = 'content/SPM_Syllabus/Form5/Chemistry/Terengganu_2025_Kertas_2_Teacher/index.html';
const moduleRoot = path.join(root, path.dirname(moduleRoute));
const html = fs.readFileSync(path.join(root, moduleRoute), 'utf8');
const questionsSource = fs.readFileSync(path.join(moduleRoot, 'questions.js'), 'utf8');
const portal = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const expectedQuestionHashes = {
  'page-01.jpg': '4f79d2d89c652c456a204ec4833f6ee710e5fa790b9163ea85d9c4d52bcd8d80',
  'page-02.jpg': '8791df6c43ccc0ee83cec084864a73200c0c3a97e63f6546ed6535d1bbd52885',
  'page-03.jpg': 'f67e5a3ae2173911b25997984853abf43873c88005f89c11904280a956b26bad',
  'page-04.jpg': '730458e18a78c8e178e41623d2ecd98879efe8dc3e52cf29489bad2d3c1a9692',
  'page-05.jpg': '1bcf210ecac0ed2e4a8608064e576f78612c7a6e96b8e37e2cddabb688dbd52a',
  'page-06.jpg': 'de57efe626a48013ac45b9873a6f595e702615993c89ca5e5b865c2479768d6f',
  'page-07.jpg': 'a47109b3fbb0ed057ebf92d6a2986fd2383e09441060f2ec914517ad51cccd2e',
  'page-08.jpg': 'bebe1255d2b7a298230a8d4aa8d8d15aff5b9985e6538e76a6d1f164bd02372a',
  'page-09.jpg': '84646566019a0e6b65a5fa3dc7fc3023d9871dfb818d0d9a7c73b3e6bf867cf4',
  'page-10.jpg': 'efc3bd312c6981d7b0aed827365d68f302bfb061aad9eca5f6b1f0b029850679',
  'page-11.jpg': '81359b858460d21b748f1887403cd74bf1ee0a04a21eda41383ab3d251483d9b',
  'page-12.jpg': '9ea5363cfc225ece01da4bd6873202fa16c897ee2ba19166839692cd087cf672',
  'page-13.jpg': '4c710d0859e4670ca559c5dff94dbb3488c0ef882ea3a88fa5bda514b8857523',
  'page-14.jpg': '23f250c0aa524c8925d3d33f0f0043d007760b1e7ae74c67bf1b6d3a5f7fff25',
  'page-15.jpg': 'efb7a8a0c0edba68a47e4ee3b3e868e6f84270b2f69bf56067dc8ecd3738a8cc',
  'page-16.jpg': '70421bde02aacb2cfb6f2413e31025399ed2a7f6490038c6006d67cc734bbc7e',
  'page-17.jpg': '6bc0d4266a3c1ec02935fcaec3877deae60b1e4aaa3f5e2df8831f22fc1d5ffd',
  'page-18.jpg': '75785112efed06fcbd9aafb5338e94ba85fd5b37b28126fadd4465fc3b9431c7',
  'page-19.jpg': '559f553e53524cb91d5d404f348c601bf65d58189df30a18c8d71002b4f3eb53',
  'page-20.jpg': '9bc51b0ca4948ba34ff04e7e902aa16f2f663aca02eaa2c5c3604ad2bbc33950',
  'page-21.jpg': 'fbd150a854c8b930a19aba2c980a1fdc0cf1f161b21b7ffdb205d9cfee66e742'
};
const questionDir = path.join(moduleRoot, 'assets', 'questions');
assert.deepStrictEqual(
  fs.readdirSync(questionDir).filter(file => file.endsWith('.jpg')).sort(),
  Object.keys(expectedQuestionHashes).sort(),
  'Expected all 21 original question-paper JPEGs'
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
  'q05-water-electron-arrangement.jpg',
  'q09-gas-collection-apparatus.jpg',
  'q10-polystyrene-equation.jpg'
];
const answerDir = path.join(moduleRoot, 'assets', 'answers');
assert.deepStrictEqual(
  fs.readdirSync(answerDir).filter(file => /\.(?:jpg|png)$/i.test(file)).sort(),
  expectedAnswerImages,
  'Expected three source-faithful marking-scheme images'
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
const questions = questionsContext.window.TERENGGANU_QUESTIONS;
assert.ok(Array.isArray(questions), 'TERENGGANU_QUESTIONS was not loaded');
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
  Array.from({ length: 20 }, (_, index) => index + 2),
  'Question mapping must cover paper pages 2-21'
);

const segments = questions.flatMap(question => Array.from(question.segments));
assert.strictEqual(segments.length, 62, 'Expected 62 staged answer segments');
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
assert.match(questions[3].note, /^Source warning:/, 'Question 4 must show the printed atomic-mass warning');
assert.match(questions[3].note, /Aᵣ\(N\) = 14/, 'Question 4 warning must preserve the corrected nitrogen value');

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
  window: { TERENGGANU_QUESTIONS: questions },
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

assert.match(html, /--indigo: #0b5963/, 'Terengganu deck needs its deep-teal theme');
assert.match(html, /2025 SPM Chemistry Terengganu · Kertas 2 Teacher Slides/, 'Terengganu page title is missing');
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
assert.match(html, /nuclide-notation/, 'Module needs stable nuclide notation layout');
assert.match(html, /procedure-answer/, 'Module needs compact long-procedure layout');
assert.match(html, /has-answer-image/, 'Module needs compact answer-image layout');
assert.strictEqual(questions[0].segments[3].nuclide.symbol, 'Na', 'Question 1(d) must use structured sodium notation');
assert.strictEqual(questions[6].segments[2].layout, 'compact', 'Question 7 comparison must use compact layout');
assert.strictEqual(questions[10].segments[5].layout, 'procedure', 'Question 11 procedure must use procedure layout');
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
  .filter(file => file.endsWith('_register_spm_chem_terengganu_2025_kertas_2_teacher.sql'));
assert.strictEqual(migrationFiles.length, 1, 'Expected exactly one Terengganu teacher registry migration');
const migration = fs.readFileSync(path.join(root, 'supabase', 'migrations', migrationFiles[0]), 'utf8');
assert.match(migration, new RegExp(moduleId), 'Registry migration must include the canonical module ID');
assert.match(migration, /'protected'/, 'Registry migration must preserve protected launcher access');

console.log(
  'Terengganu 2025 Kimia Kertas 2 Teacher verification passed: ' +
  '11 questions, 120 marks, 62 answer stages, 5 two-click calculations, 21 byte-exact question pages, ' +
  '3 scheme images, stable nuclide and compact long-answer layouts, protected access, navigation, and progress sync.'
);
