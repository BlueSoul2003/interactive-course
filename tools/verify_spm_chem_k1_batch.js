const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const portal = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'module-manifest.json'), 'utf8'));
const migrationPath = path.join(root, 'supabase', 'migrations', '20260904143452_register_spm_chem_2025_kertas_1_batch.sql');
const migration = fs.readFileSync(migrationPath, 'utf8');

const modules = [
  {
    id: 'spm-chem-f5-sbp-2025-k1',
    title: 'SBP 2025 Kimia Kertas 1',
    directory: 'SBP_2025_Kertas_1',
    pageCount: 27,
    answerKey: 'ABDDABDAACADBDACCBDCCBACDCCBDCBABADBDBAC',
    firstPages: [1],
    lastPages: [26, 27],
    special: [21, [11, 12]]
  },
  {
    id: 'spm-chem-f5-selangor-pintas-2025-k1',
    title: 'Selangor PINTAS 2025 Kimia Kertas 1',
    directory: 'Selangor_PINTAS_2025_Kertas_1',
    pageCount: 27,
    answerKey: 'CCADCAADCBBCBDBDCDDBCBBDACABABCABCBDCCDD',
    firstPages: [2],
    lastPages: [27]
  },
  {
    id: 'spm-chem-f5-terengganu-2025-k1',
    title: 'Terengganu 2025 Kimia Kertas 1',
    directory: 'Terengganu_2025_Kertas_1',
    pageCount: 24,
    answerKey: 'CAACBCBBDBAADCDBADCADDABCDADDADBBACBCCCB',
    firstPages: [2],
    lastPages: [24]
  }
];

for (const item of modules) {
  const route = `content/SPM_Syllabus/Form5/Chemistry/${item.directory}/index.html`;
  const moduleRoot = path.join(root, path.dirname(route));
  const html = fs.readFileSync(path.join(root, route), 'utf8');
  const pagesRoot = path.join(moduleRoot, 'assets', 'pages');
  const pageFiles = fs.readdirSync(pagesRoot).filter(file => file.endsWith('.jpg')).sort();
  assert.strictEqual(pageFiles.length, item.pageCount, `${item.title}: unexpected JPEG page count`);
  for (let page = 1; page <= item.pageCount; page += 1) {
    const file = `page-${String(page).padStart(2, '0')}.jpg`;
    assert.ok(pageFiles.includes(file), `${item.title}: missing ${file}`);
    assert.ok(fs.statSync(path.join(pagesRoot, file)).size > 10_000, `${item.title}: ${file} is unexpectedly small`);
  }
  assert.deepStrictEqual(
    fs.readdirSync(moduleRoot).filter(file => file.toLowerCase().endsWith('.pdf')),
    [],
    `${item.title}: source PDFs and answer schemes must stay off-repository`
  );

  const inlineScripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(match => match[1]);
  const quizSource = inlineScripts.find(source => source.includes('const answerKey'));
  assert.ok(quizSource, `${item.title}: quiz source script is missing`);
  const capture = `${quizSource}\n;globalThis.__quiz = { answerKey, questionPages };`;
  assert.doesNotThrow(() => new vm.Script(capture), `${item.title}: quiz JavaScript should parse`);
  const dataContext = { globalThis: {} };
  vm.createContext(dataContext);
  vm.runInContext(capture.replace(/\s*let state = loadState\(\);[\s\S]*/, '\n;globalThis.__quiz = { answerKey, questionPages };'), dataContext);
  const { answerKey, questionPages } = dataContext.globalThis.__quiz;
  assert.strictEqual(answerKey.length, 41, `${item.title}: answer key must cover questions 1–40`);
  assert.strictEqual(Array.from(answerKey.slice(1)).join(''), item.answerKey, `${item.title}: answer key must match its marking scheme`);
  assert.deepStrictEqual(Object.keys(questionPages).map(Number), Array.from({ length: 40 }, (_, index) => index + 1), `${item.title}: question map must cover 1–40`);
  assert.deepStrictEqual(Array.from(questionPages[1]), item.firstPages, `${item.title}: question 1 page map is wrong`);
  assert.deepStrictEqual(Array.from(questionPages[40]), item.lastPages, `${item.title}: question 40 page map is wrong`);
  if (item.special) assert.deepStrictEqual(Array.from(questionPages[item.special[0]]), item.special[1], `${item.title}: cross-page map is wrong`);
  assert.ok(Object.values(questionPages).flat().every(page => page >= 1 && page <= item.pageCount), `${item.title}: map references a page outside the source paper`);

  assert.match(html, /class="ghost-button back-link"/, `${item.title}: portal return link is missing`);
  assert.match(html, /auth-access\.js\?v=1\.2\.0/, `${item.title}: access support is missing`);
  assert.match(html, /navigation\.js\?v=1\.0\.0/, `${item.title}: navigation is missing`);
  assert.match(html, /progress-tracker\.js\?v=1\.0\.2/, `${item.title}: progress tracker is missing`);
  assert.ok(html.indexOf('navigation.js?v=1.0.0') < html.indexOf('progress-tracker.js?v=1.0.2'), `${item.title}: navigation must load before progress tracking`);
  assert.match(html, new RegExp(`data-module-id="${item.id}"`), `${item.title}: canonical module ID is missing`);
  assert.match(html, /ProgressTracker\.init/, `${item.title}: signed-in progress restore is missing`);
  assert.match(html, /ProgressTracker\.autoSave/, `${item.title}: signed-in progress save is missing`);
  assert.match(html, /pageStack\.dataset\.pageKey !== pageKey/, `${item.title}: same-page scroll preservation is missing`);
  assert.match(html, /paperStage\.scrollTo\(\{ top: 0, left: 0, behavior: "auto" \}\)/, `${item.title}: new-page paper reset is missing`);
  assert.match(html, /grid-template-rows: minmax\(0, 56%\) minmax\(0, 44%\)/, `${item.title}: portrait split layout is missing`);
  assert.match(html, /orientation: landscape/, `${item.title}: landscape layout is missing`);
  assert.match(html, /answerPanel\.scrollTo/, `${item.title}: answer pane reset is missing`);

  const cardPattern = new RegExp(`<a\\b(?=[^>]*href="${route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}")(?=[^>]*data-module-id="${item.id}")(?=[^>]*data-bundle="spm_form5")[^>]*>`);
  assert.match(portal, cardPattern, `${item.title}: portal card does not expose the canonical route, ID, and bundle`);
  assert.deepStrictEqual(manifest.modules.find(module => module.id === item.id), {
    id: item.id,
    title: item.title,
    delivery: 'public',
    path: route
  });
  assert.match(migration, new RegExp(item.id), `${item.title}: registry migration is missing the module ID`);
}

assert.strictEqual((migration.match(/'protected'/g) || []).length, 3, 'All three registry entries must be protected');
console.log('Chemistry Kertas 1 batch verification passed: 120 scheme-verified answers, 78 JPEG pages, protected access, navigation, responsive scroll behavior, and progress sync.');