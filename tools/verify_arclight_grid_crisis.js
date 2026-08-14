const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const modulePath = path.join(root, 'content', 'IGCSE_Syllabus', 'Year4', 'Science', 'Arclight_Grid_Crisis');
const moduleRoute = 'content/IGCSE_Syllabus/Year4/Science/Arclight_Grid_Crisis/index.html';
const moduleId = 'igcse-y4-sci-arclight-grid-crisis';

const requiredFiles = [
  'index.html',
  'styles.css',
  'data.js',
  'visuals.js',
  'app.js',
  'assets/art/arclight-hero.png',
  'assets/art/reactor-deck-blackout.png',
  'assets/kenney/Kenney-Future.ttf',
  'assets/kenney/Kenney-Future-Narrow.ttf'
];

requiredFiles.forEach(relativeFile => {
  assert.ok(fs.existsSync(path.join(modulePath, relativeFile)), `Missing Arclight asset: ${relativeFile}`);
});

const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(modulePath, 'data.js'), 'utf8'), context);
const missions = context.window.ARCLIGHT_DATA.missions;
const questions = missions.flatMap(mission => mission.questions);
const marks = questions.reduce((total, question) => total + question.marks, 0);

assert.strictEqual(missions.length, 7, 'Arclight should contain seven missions');
missions.forEach(mission => assert.strictEqual(mission.questions.length, 8, `${mission.id} should contain eight questions`));
assert.strictEqual(questions.length, 56, 'Arclight should contain 56 questions');
assert.strictEqual(new Set(questions.map(question => question.id)).size, 56, 'Arclight question IDs should be unique');
assert.strictEqual(marks, 163, 'Arclight should contain 163 marks');

const rootHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert.match(rootHtml, new RegExp(`data-module-id="${moduleId}"`), 'Portal card should use the canonical module ID');
assert.match(rootHtml, new RegExp(moduleRoute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), 'Portal card should use the canonical route');

const moduleHtml = fs.readFileSync(path.join(modulePath, 'index.html'), 'utf8');
assert.match(moduleHtml, /class="portal-link back-link"/, 'Module should expose a portal return link');
assert.match(moduleHtml, /navigation\.js\?v=1\.0\.0/, 'Module should load central navigation');
assert.match(moduleHtml, /progress-tracker\.js\?v=1\.0\.2/, 'Module should load portal progress tracking');
assert.ok(moduleHtml.indexOf('navigation.js?v=1.0.0') < moduleHtml.indexOf('progress-tracker.js?v=1.0.2'), 'Navigation should load before progress tracking');
assert.match(moduleHtml, new RegExp(`data-module-id="${moduleId}"`), 'Progress tracker should use the canonical module ID');

const manifest = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'module-manifest.json'), 'utf8'));
const manifestEntry = manifest.modules.find(module => module.id === moduleId);
assert.deepStrictEqual(manifestEntry, {
  id: moduleId,
  title: 'Arclight Grid Crisis',
  delivery: 'public',
  path: moduleRoute
});

const migrationFiles = fs.readdirSync(path.join(root, 'supabase', 'migrations'))
  .filter(file => file.endsWith('_register_arclight_grid_crisis.sql'));
assert.strictEqual(migrationFiles.length, 1, 'Arclight should have one registry migration');
const migrationSql = fs.readFileSync(path.join(root, 'supabase', 'migrations', migrationFiles[0]), 'utf8');
assert.match(migrationSql, new RegExp(moduleId), 'Migration should register the canonical module ID');
assert.match(migrationSql, /'protected'/, 'Migration should preserve protected launcher access');

console.log('Arclight Grid Crisis verification passed.');
