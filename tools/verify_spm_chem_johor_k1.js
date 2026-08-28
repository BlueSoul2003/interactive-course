const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const moduleId = 'spm-chem-f5-johor-2025-k1';
const moduleRoute = 'content/SPM_Syllabus/Form5/Chemistry/Johor_2025_Kertas_1/index.html';
const moduleRoot = path.join(root, path.dirname(moduleRoute));
const html = fs.readFileSync(path.join(root, moduleRoute), 'utf8');
const portal = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

for (let page = 1; page <= 26; page += 1) {
  const file = `page-${String(page).padStart(2, '0')}.png`;
  const absolute = path.join(moduleRoot, 'assets', 'pages', file);
  assert.ok(fs.existsSync(absolute), `Missing question-page image: ${file}`);
  assert.ok(fs.statSync(absolute).size > 10_000, `Question-page image is unexpectedly small: ${file}`);
}
assert.strictEqual(fs.readdirSync(path.join(moduleRoot, 'assets', 'pages')).filter(file => file.endsWith('.png')).length, 26, 'Expected exactly 26 PNG question pages');
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
assert.ok(answerKey.slice(1).every(answer => ['A', 'B', 'C', 'D'].includes(answer)), 'Every answer must be A–D');
assert.deepStrictEqual(Object.keys(questionPages).map(Number), Array.from({ length: 40 }, (_, index) => index + 1), 'Question-page map must cover questions 1–40');
assert.ok(Object.values(questionPages).flat().every(page => page >= 1 && page <= 26), 'Question map references a page outside 1–26');

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

const cardPattern = new RegExp(`<a\\b(?=[^>]*href="${moduleRoute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}")(?=[^>]*data-module-id="${moduleId}")(?=[^>]*data-bundle="spm_form5")[^>]*>`);
assert.match(portal, cardPattern, 'Portal card must expose the canonical route, ID, and bundle');

const manifest = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'module-manifest.json'), 'utf8'));
assert.deepStrictEqual(manifest.modules.find(module => module.id === moduleId), {
  id: moduleId,
  title: 'Johor 2025 Kimia Kertas 1',
  delivery: 'public',
  path: moduleRoute
});

const migration = fs.readFileSync(path.join(root, 'supabase', 'migrations', '20260828052437_register_spm_chem_johor_2025_kertas_1.sql'), 'utf8');
assert.match(migration, new RegExp(moduleId), 'Registry migration must include the canonical module ID');
assert.match(migration, /'protected'/, 'Registry migration must preserve protected launcher access');

console.log('Johor 2025 Kimia Kertas 1 verification passed: 40 questions, 26 page images, protected access, navigation, and progress sync.');
