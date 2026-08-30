const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const moduleId = 'spm-chem-f5-kedah-2025-k1';
const moduleRoute = 'content/SPM_Syllabus/Form5/Chemistry/Kedah_2025_Kertas_1/index.html';
const moduleRoot = path.join(root, path.dirname(moduleRoute));
const html = fs.readFileSync(path.join(root, moduleRoute), 'utf8');
const portal = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

for (let page = 1; page <= 28; page += 1) {
  const file = `page-${String(page).padStart(2, '0')}.png`;
  const absolute = path.join(moduleRoot, 'assets', 'pages', file);
  assert.ok(fs.existsSync(absolute), `Missing question-page image: ${file}`);
  assert.ok(fs.statSync(absolute).size > 10_000, `Question-page image is unexpectedly small: ${file}`);
}
assert.strictEqual(fs.readdirSync(path.join(moduleRoot, 'assets', 'pages')).filter(file => file.endsWith('.png')).length, 28, 'Expected exactly 28 PNG question pages');
assert.deepStrictEqual(fs.readdirSync(moduleRoot).filter(file => file.toLowerCase().endsWith('.pdf')), [], 'Source PDFs and answer schemes must stay off-repository');

const inlineScripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(match => match[1]);
const quizSource = inlineScripts.find(source => source.includes('const answerKey'));
assert.ok(quizSource, 'Quiz source script is missing');
const capture = `${quizSource}\n;globalThis.__quiz = { answerKey, questionPages };`;
const context = { globalThis: {}, window: {}, document: {}, localStorage: {} };
assert.doesNotThrow(() => new vm.Script(capture), 'Quiz JavaScript should parse');
const dataContext = { globalThis: {} };
vm.createContext(dataContext);
vm.runInContext(capture.replace(/\s*let state = loadState\(\);[\s\S]*/, '\n;globalThis.__quiz = { answerKey, questionPages };'), dataContext);
const { answerKey, questionPages } = dataContext.globalThis.__quiz;
assert.strictEqual(answerKey.length, 41, 'Answer key must cover questions 1–40');
assert.strictEqual(Array.from(answerKey.slice(1)).join(''), 'BCBDCBBBCACBACADCABCCDADBADDCBDAACAADDBD', 'Answer key must match the Kedah marking scheme');
assert.ok(answerKey.slice(1).every(answer => ['A', 'B', 'C', 'D'].includes(answer)), 'Every answer must be A–D');
assert.deepStrictEqual(Object.keys(questionPages).map(Number), Array.from({ length: 40 }, (_, index) => index + 1), 'Question-page map must cover questions 1–40');
assert.deepStrictEqual(Array.from(questionPages[22]), [12, 13], 'Question 22 must display both source pages 12 and 13');
assert.strictEqual(questionPages[1][0], 2, 'Question 1 must start on source page 2');
assert.strictEqual(questionPages[40][0], 28, 'Question 40 must use source page 28');
assert.ok(Object.values(questionPages).flat().every(page => page >= 1 && page <= 28), 'Question map references a page outside 1–28');

assert.match(html, /class="ghost-button back-link"/, 'Module needs a context-aware portal return link');
assert.match(html, /auth-access\.js\?v=1\.2\.0/, 'Module must load shared access support');
assert.match(html, /navigation\.js\?v=1\.0\.0/, 'Module must load central navigation');
assert.match(html, /progress-tracker\.js\?v=1\.0\.2/, 'Module must load portal progress tracking');
assert.ok(html.indexOf('navigation.js?v=1.0.0') < html.indexOf('progress-tracker.js?v=1.0.2'), 'Navigation must load before progress tracking');
assert.match(html, new RegExp(`data-module-id="${moduleId}"`), 'Progress tracker must use the canonical module ID');
assert.match(html, /ProgressTracker\.init/, 'Module must restore signed-in student progress');
assert.match(html, /ProgressTracker\.autoSave/, 'Module must auto-save signed-in student progress');
assert.match(html, /pageStack\.dataset\.pageKey !== pageKey/, 'Shared-page navigation must preserve the paper scroll position');
assert.match(html, /window\.scrollTo\(\{ top: 0, left: 0, behavior: "auto" \}\)/, 'A new paper page must reset to the top');
assert.match(html, /paperStage\.scrollTo\(\{ top: 0, left: 0, behavior: "auto" \}\)/, 'A new paper page must reset the mobile paper pane');
assert.match(html, /grid-template-rows: minmax\(0, 56%\) minmax\(0, 44%\)/, 'Portrait mobile view must split paper and answer panes');
assert.match(html, /orientation: landscape/, 'Landscape mobile view must switch to side-by-side panes');
assert.match(html, /questionGrid\.scrollLeft/, 'Mobile question strip must follow the current question');
assert.match(html, /answerPanel\.scrollTo/, 'Changing questions must return the mobile answer pane to its controls');
assert.match(html, /const compactScale = Math\.min\(1, paperWidth \/ 900\)/, 'Mobile paper zoom must start fitted to the pane');

const cardPattern = new RegExp(`<a\\b(?=[^>]*href="${moduleRoute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}")(?=[^>]*data-module-id="${moduleId}")(?=[^>]*data-bundle="spm_form5")[^>]*>`);
assert.match(portal, cardPattern, 'Portal card must expose the canonical route, ID, and bundle');

const manifest = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'module-manifest.json'), 'utf8'));
assert.deepStrictEqual(manifest.modules.find(module => module.id === moduleId), {
  id: moduleId,
  title: 'Kedah 2025 Kimia Kertas 1',
  delivery: 'public',
  path: moduleRoute
});

const migration = fs.readFileSync(path.join(root, 'supabase', 'migrations', '20260831003000_register_spm_chem_kedah_2025_kertas_1.sql'), 'utf8');
assert.match(migration, new RegExp(moduleId), 'Registry migration must include the canonical module ID');
assert.match(migration, /'protected'/, 'Registry migration must preserve protected launcher access');

console.log('Kedah 2025 Kimia Kertas 1 verification passed: 40 questions, 28 page images, protected access, navigation, and progress sync.');
