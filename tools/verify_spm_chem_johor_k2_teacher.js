const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const moduleId = 'spm-chem-f5-johor-2025-k2-teacher';
const moduleRoute = 'content/SPM_Syllabus/Form5/Chemistry/Johor_2025_Kertas_2_Teacher/index.html';
const moduleRoot = path.join(root, path.dirname(moduleRoute));
const html = fs.readFileSync(path.join(root, moduleRoute), 'utf8');
const portal = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

for (let page = 1; page <= 20; page += 1) {
  const file = 'page-' + String(page).padStart(2, '0') + '.png';
  const absolute = path.join(moduleRoot, 'assets', 'questions', file);
  assert.ok(fs.existsSync(absolute), 'Missing question-page image: ' + file);
  assert.ok(fs.statSync(absolute).size > 10_000, 'Question-page image is unexpectedly small: ' + file);
}
assert.strictEqual(
  fs.readdirSync(path.join(moduleRoot, 'assets', 'questions')).filter(file => file.endsWith('.png')).length,
  20,
  'Expected exactly 20 PNG question pages'
);

const expectedAnswerImages = [
  'q5-rate-curve.png',
  'q6-cooling-curve.png',
  'q6-heating-apparatus.png',
  'q8-propanol-isomers.png'
];
assert.deepStrictEqual(
  fs.readdirSync(path.join(moduleRoot, 'assets', 'answers')).filter(file => file.endsWith('.png')).sort(),
  expectedAnswerImages,
  'Expected the four source-faithful marking-scheme images'
);
for (const file of expectedAnswerImages) {
  const absolute = path.join(moduleRoot, 'assets', 'answers', file);
  assert.ok(fs.statSync(absolute).size > 8_000, 'Answer image is unexpectedly small: ' + file);
}
assert.deepStrictEqual(
  fs.readdirSync(moduleRoot).filter(file => file.toLowerCase().endsWith('.pdf')),
  [],
  'Source PDFs must stay off-repository'
);

const inlineScripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(match => match[1]);
const deckSource = inlineScripts.find(source => source.includes('const QUESTIONS'));
assert.ok(deckSource, 'Teacher deck source script is missing');
assert.doesNotThrow(() => new vm.Script(deckSource), 'Teacher deck JavaScript should parse');

const dataSource = deckSource.replace(/\n\s*window\.teacherDeck[\s\S]*$/, '') +
  '\n;globalThis.__questions = QUESTIONS;';
const context = { globalThis: {}, console };
vm.createContext(context);
vm.runInContext(dataSource, context);
const questions = context.globalThis.__questions;

assert.strictEqual(questions.length, 11, 'Teacher deck must cover Questions 1-11');
assert.deepStrictEqual(
  Array.from(questions, question => question.number),
  Array.from({ length: 11 }, (_, index) => index + 1),
  'Question numbers must be continuous from 1 to 11'
);
const referencedPages = Array.from(new Set(Array.from(questions).flatMap(question => Array.from(question.pages)))).sort((a, b) => a - b);
assert.deepStrictEqual(
  referencedPages,
  Array.from({ length: 20 }, (_, index) => index + 1),
  'Question-page mapping must cover PDF pages 1-20'
);

const segments = questions.flatMap(question => question.segments);
assert.strictEqual(segments.length, 75, 'Expected 75 staged answer segments');
assert.ok(
  segments.every(segment => !/[\u3400-\u9fff]/.test(segment.answer)),
  'Every answer must remain in English'
);
assert.ok(
  segments.every(segment => /[\u3400-\u9fff]/.test(segment.explanation)),
  'Every explanation must contain Chinese guidance'
);
const calculationSegments = segments.filter(segment => segment.calculation);
assert.strictEqual(calculationSegments.length, 10, 'Expected ten step-by-step calculation segments');
for (const segment of calculationSegments) {
  const lines = segment.answer.split('\n').filter(Boolean);
  assert.ok(lines.length >= 4, 'Calculation answer is missing working steps: ' + segment.label);
  assert.ok(
    lines.every(line => /^(Step \d+|Final answer):/.test(line)),
    'Each calculation step must occupy its own labelled line: ' + segment.label
  );
  assert.ok(
    lines.some(line => line.startsWith('Final answer:')),
    'Calculation answer needs a distinct final answer: ' + segment.label
  );
}

assert.match(html, /className = "back-link"/, 'Module needs a context-aware portal return link');
assert.match(html, /auth-access\.js\?v=1\.2\.0/, 'Module must load shared access support');
assert.match(html, /navigation\.js\?v=1\.0\.0/, 'Module must load central navigation');
assert.match(html, /progress-tracker\.js\?v=1\.0\.2/, 'Module must load portal progress tracking');
assert.ok(
  html.indexOf('navigation.js?v=1.0.0') < html.indexOf('progress-tracker.js?v=1.0.2'),
  'Navigation must load before progress tracking'
);
assert.match(html, new RegExp('data-module-id="' + moduleId + '"'), 'Progress tracker must use the canonical module ID');
assert.match(html, /ProgressTracker\.init/, 'Module must restore signed-in teacher progress');
assert.match(html, /ProgressTracker\.autoSave/, 'Module must auto-save signed-in teacher progress');
assert.match(html, /Click to view full image/, 'Marking-scheme images need a full-image control');
assert.match(html, /rememberPaperPosition/, 'Question paper scrolling must be preserved during answer reveals');

const escapedRoute = moduleRoute.replace(/[.*+?^\${}()|[\]\\]/g, '\\$&');
const cardPattern = new RegExp(
  '<a\\b(?=[^>]*href="' + escapedRoute + '")' +
  '(?=[^>]*data-module-id="' + moduleId + '")' +
  '(?=[^>]*data-bundle="spm_form5")[^>]*>'
);
assert.match(portal, cardPattern, 'Portal card must expose the canonical route, ID, and bundle');

const manifest = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'module-manifest.json'), 'utf8'));
assert.deepStrictEqual(manifest.modules.find(module => module.id === moduleId), {
  id: moduleId,
  title: 'Johor 2025 Kimia Kertas 2 Teacher Slides',
  delivery: 'public',
  path: moduleRoute
});

const migration = fs.readFileSync(
  path.join(root, 'supabase', 'migrations', '20260828070000_register_spm_chem_johor_2025_kertas_2_teacher.sql'),
  'utf8'
);
assert.match(migration, new RegExp(moduleId), 'Registry migration must include the canonical module ID');
assert.match(migration, /'protected'/, 'Registry migration must preserve protected launcher access');

console.log(
  'Johor 2025 Kimia Kertas 2 Teacher verification passed: ' +
  '11 questions, 75 answer stages, 10 worked calculations, 20 question pages, ' +
  '4 scheme images, protected access, navigation, and progress sync.'
);
