const fs = require('fs');
const path = require('path');
const acorn = require('acorn');

const REPO_ROOT = path.resolve(__dirname, '..');
const TARGETS = [
  { grade: 3, unit: 6, name: 'Sunny Food Market', world: 'food-market', pages: [43, 44, 45, 46, 47, 48, 49, 50], tokens: ['food groups', 'some', 'there are', 'street food', 'comma'] },
  { grade: 3, unit: 7, name: 'Little Safe Town', world: 'safe-town', pages: [51, 52, 53, 54, 55, 56, 57, 58], tokens: ['sign', 'road safety', 'quarter', 'plural', 'there are'] },
  { grade: 3, unit: 8, name: 'Time-Travel Town', world: 'time-travel-town', pages: [59, 60, 61, 62, 63, 64, 65, 66], tokens: ['postcard', 'simple past', 'was', 'were', 'opposite'] },
  { grade: 3, unit: 9, name: 'Holiday Explorer', world: 'holiday-explorer', pages: [67, 68, 69, 70, 71, 72, 73, 74], tokens: ['holiday', 'trip essentials', 'simple past', 'but', 'beach'] },
  { grade: 3, unit: 10, name: 'Space Observatory', world: 'space-observatory', pages: [75, 76, 77, 78, 79, 80, 81, 82], tokens: ['solar system', 'planet', 'comparative', 'superlative', 'animal'] },
  { grade: 6, unit: 7, name: 'Sound Lab Studio', world: 'music-studio', pages: [55, 56, 57, 58, 59, 60, 61, 62, 63], tokens: ['music genre', 'instrument', 'idiom', 'going to', 'prefix'] },
  { grade: 6, unit: 8, name: 'Lantern Story Library', world: 'story-library', pages: [64, 65, 66, 67, 68, 69, 70, 71, 72], tokens: ['rose', 'book genre', 'first conditional', 'email', 'golden apple'] },
  { grade: 6, unit: 9, name: 'The Debate Club', world: 'debate-club', pages: [73, 74, 75, 76, 77, 78, 79, 80, 81], tokens: ['fact', 'opinion', 'reported speech', 'for', 'against'] },
  { grade: 6, unit: 10, name: 'Northlight Detective Bureau', world: 'detective-bureau', pages: [82, 83, 84, 85, 86, 87, 88, 89, 90], tokens: ['crime', 'clue', 'question tag', 'idiom', 'play script', 'escape room'] },
];

function getAttribute(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}="([^"]*)"`, 'i'));
  return match ? match[1] : '';
}

function findDuplicates(values) {
  const seen = new Set();
  const duplicates = new Set();
  values.forEach((value) => {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  });
  return [...duplicates];
}

function targetFile(root, target) {
  return path.join(
    root,
    'content',
    'KSSR_Syllabus',
    `Primary${target.grade}`,
    'English',
    `Unit${target.unit}`,
    'index.html',
  );
}

function assertPage(condition, errors, label, message) {
  if (!condition) errors.push(`${label}: ${message}`);
}

function verifyScripts(html, errors, label) {
  const requiredOrder = [
    '@supabase/supabase-js@2',
    'js/auth-access.js',
    'js/progress-tracker.js',
    'js/kssr-classroom-core.js',
    'js/kssr-classroom-runtime.js',
    'window.KSSR_UNIT_CONFIG',
    'KssrClassroomRuntime.start(window.KSSR_UNIT_CONFIG)',
  ];
  let previous = -1;
  requiredOrder.forEach((token) => {
    const index = html.indexOf(token);
    assertPage(index >= 0, errors, label, `missing script token ${token}`);
    if (index >= 0) {
      assertPage(index > previous, errors, label, `script token out of order: ${token}`);
      previous = index;
    }
  });

  const inlineScripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)];
  inlineScripts.forEach((match, index) => {
    if (!match[1].trim()) return;
    try {
      acorn.parse(match[1], { ecmaVersion: 'latest', sourceType: 'script', allowAwaitOutsideFunction: true });
    } catch (error) {
      errors.push(`${label}: inline script ${index + 1} syntax error: ${error.message}`);
    }
  });
}

function verifyTarget(root, target) {
  const file = targetFile(root, target);
  const label = `Primary ${target.grade} Unit ${target.unit}`;
  const errors = [];
  if (!fs.existsSync(file)) return { errors: [`${label}: missing index.html`], activityCount: 0 };
  const html = fs.readFileSync(file, 'utf8');
  const lower = html.toLocaleLowerCase('en');

  assertPage(
    html.includes(`data-world="${target.world}"`),
    errors,
    label,
    `missing data-world="${target.world}"`,
  );
  assertPage(html.includes('data-classroom-app'), errors, label, 'missing classroom app root');
  assertPage(html.includes('../../../shared/kssr-classroom.css'), errors, label, 'missing shared classroom CSS');

  const moduleId = `kssr-p${target.grade}-en-unit${target.unit}`;
  const moduleUrl = `content/KSSR_Syllabus/Primary${target.grade}/English/Unit${target.unit}/index.html`;
  assertPage(html.includes(`data-module-id="${moduleId}"`), errors, label, `missing module id ${moduleId}`);
  assertPage(html.includes(`data-module-name="${target.name}"`), errors, label, `missing module name ${target.name}`);
  assertPage(html.includes(`data-module-url="${moduleUrl}"`), errors, label, `missing module URL ${moduleUrl}`);
  assertPage(
    html.includes('data-home-link href="../../../../../index.html"'),
    errors,
    label,
    'Home link must return to the root index.html',
  );

  [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*>/gi)].forEach((match) => {
    const source = match[1].split('?')[0];
    if (/^(?:https?:)?\/\//i.test(source)) return;
    const scriptPath = path.resolve(path.dirname(file), source);
    assertPage(fs.existsSync(scriptPath), errors, label, `missing local script ${match[1]}`);
  });

  const blocks = [...html.matchAll(/<article\b([^>]*\bclass="[^"]*\bquestion-card\b[^"]*"[^>]*)>([\s\S]*?)<\/article>/gi)];
  assertPage(blocks.length === target.pages.length, errors, label, `expected ${target.pages.length} activity cards, found ${blocks.length}`);

  const ids = [];
  const pages = [];
  blocks.forEach((match, index) => {
    const tag = `<article ${match[1]}>`;
    const content = match[2];
    const expectedPage = target.pages[index];
    const expectedId = `unit-${target.unit}-p${String(expectedPage).padStart(3, '0')}-01`;
    const activityId = getAttribute(tag, 'data-activity-id');
    const questionId = getAttribute(tag, 'data-question-id');
    const sourcePage = Number(getAttribute(tag, 'data-source-page'));
    const questionType = getAttribute(tag, 'data-question-type');
    const marking = getAttribute(tag, 'data-marking');

    ids.push(activityId);
    pages.push(sourcePage);
    assertPage(activityId === expectedId, errors, label, `activity ${index + 1} id must be ${expectedId}`);
    assertPage(questionId === expectedId, errors, label, `activity ${index + 1} question id must be ${expectedId}`);
    assertPage(sourcePage === expectedPage, errors, label, `activity ${expectedId} source page must be ${expectedPage}`);
    assertPage(/^[a-z]+(?:_[a-z]+)*$/.test(questionType), errors, label, `activity ${expectedId} has invalid question type`);
    assertPage(['objective', 'guided', 'teacher_review'].includes(marking), errors, label, `activity ${expectedId} has invalid marking mode`);
    assertPage(content.includes('data-action="help"'), errors, label, `activity ${expectedId} missing Help`);
    assertPage(content.includes('data-action="check"'), errors, label, `activity ${expectedId} missing Check`);
    assertPage(content.includes('data-feedback'), errors, label, `activity ${expectedId} missing feedback`);
    assertPage(content.includes('data-hint-level="1"'), errors, label, `activity ${expectedId} missing bilingual hint`);
    assertPage(content.includes('data-hint-level="2"'), errors, label, `activity ${expectedId} missing scaffold`);

    if (marking === 'objective') {
      assertPage(Boolean(getAttribute(tag, 'data-answer-contract')), errors, label, `objective activity ${expectedId} missing answer contract`);
    } else {
      assertPage(
        content.includes('data-checklist') || content.includes('data-scaffold'),
        errors,
        label,
        `${marking} activity ${expectedId} missing checklist or scaffold`,
      );
    }
  });

  assertPage(findDuplicates(ids).length === 0, errors, label, 'duplicate activity ids');
  assertPage(JSON.stringify(pages) === JSON.stringify(target.pages), errors, label, 'source pages are missing or out of order');

  target.tokens.forEach((token) => {
    assertPage(lower.includes(token.toLocaleLowerCase('en')), errors, label, `missing content token "${token}"`);
  });

  const requiredHooks = [
    'id="profileGate"',
    'data-profile-list',
    'data-active-profile',
    'id="progressBar"',
    'id="progressStatus"',
    'data-sync-status',
    'data-action="mute"',
    'data-action="previous"',
    'data-action="switch-profile"',
    'data-action="reset-view"',
    'data-home-link',
    'data-tutor-hold',
    'id="teacherSummary"',
    'data-summary-student',
    'data-summary-completed',
    'data-summary-errors',
    'data-summary-help',
    'data-summary-open',
    'data-profile-editor',
  ];
  requiredHooks.forEach((hook) => assertPage(html.includes(hook), errors, label, `missing UI hook ${hook}`));

  const unfinishedMarkers = ['TO' + 'DO', 'TB' + 'D', 'PLACE' + 'HOLDER'];
  const forbiddenCopy = ['OCR-derived', 'Source page', 'workbook draft', 'Read the source text', ...unfinishedMarkers];
  forbiddenCopy.forEach((copy) => assertPage(!html.includes(copy), errors, label, `contains forbidden copy ${copy}`));
  assertPage(!/[\u2013\u2014]/.test(html), errors, label, 'contains a forbidden long dash character');
  assertPage(!/class="[^"]*\bcorrect\b/.test(html), errors, label, 'pre-marks a correct option in HTML');

  const htmlIds = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const duplicateHtmlIds = findDuplicates(htmlIds);
  assertPage(duplicateHtmlIds.length === 0, errors, label, `duplicate HTML ids: ${duplicateHtmlIds.join(', ')}`);
  assertPage(/@media\s*\(prefers-reduced-motion:\s*reduce\)/.test(html), errors, label, 'missing unit-level reduced-motion rules');
  assertPage(/@media\s*\(max-width:\s*820px\)/.test(html), errors, label, 'missing explicit iPad portrait collapse');

  verifyScripts(html, errors, label);
  return { errors, activityCount: blocks.length };
}

function selectTargets(options) {
  return TARGETS.filter((target) => {
    if (options.grade && target.grade !== options.grade) return false;
    if (options.units && !options.units.includes(target.unit)) return false;
    return true;
  });
}

function verifyRedesign(options = {}) {
  const root = options.root || REPO_ROOT;
  const targets = selectTargets(options);
  const errors = [];
  let activityCount = 0;

  const sharedCssPath = path.join(root, 'content', 'KSSR_Syllabus', 'shared', 'kssr-classroom.css');
  const sharedCss = fs.existsSync(sharedCssPath) ? fs.readFileSync(sharedCssPath, 'utf8') : '';
  [
    '.profile-gate-card',
    '.lesson-progress #progressBar',
    '.card-actions > button',
    '.teacher-summary .summary-card',
    '[data-profile-editor]',
    '@media (max-width: 820px)',
  ].forEach((token) => {
    if (!sharedCss.includes(token)) errors.push(`Shared classroom CSS missing ${token}`);
  });

  targets.forEach((target) => {
    const result = verifyTarget(root, target);
    errors.push(...result.errors);
    activityCount += result.activityCount;
  });

  const portalPath = path.join(root, 'index.html');
  const schemaPath = path.join(root, 'db', 'schema.sql');
  const registryPath = path.join(root, 'db', 'archive', 'modules_registry.sql');
  const portal = fs.existsSync(portalPath) ? fs.readFileSync(portalPath, 'utf8') : '';
  const schema = fs.existsSync(schemaPath) ? fs.readFileSync(schemaPath, 'utf8') : '';
  const registry = fs.existsSync(registryPath) ? fs.readFileSync(registryPath, 'utf8') : '';
  targets.forEach((target) => {
    const moduleId = `kssr-p${target.grade}-en-unit${target.unit}`;
    if (!portal.includes(`data-module-id="${moduleId}"`)) errors.push(`Portal missing module card ${moduleId}`);
    if (!schema.includes(`'${moduleId}'`)) errors.push(`db/schema.sql missing module ${moduleId}`);
    if (!registry.includes(`'${moduleId}'`)) errors.push(`db/archive/modules_registry.sql missing module ${moduleId}`);
  });

  const worlds = targets.map((target) => target.world);
  if (findDuplicates(worlds).length > 0) errors.push('Target manifest contains duplicate worlds');
  if (targets.length === 0) errors.push('No redesign targets selected');
  if (errors.length > 0) throw new Error(`FAIL verify_kssr_unit_redesign errors=${errors.length}\n${errors.join('\n')}`);
  return { fileCount: targets.length, activityCount };
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--grade') {
      options.grade = Number(argv[index + 1]);
      index += 1;
    } else if (arg === '--units') {
      options.units = argv[index + 1].split(',').map(Number);
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  if (options.grade && ![3, 6].includes(options.grade)) throw new Error('Grade must be 3 or 6');
  if (options.units && options.units.some((unit) => !Number.isInteger(unit))) throw new Error('Units must be comma-separated integers');
  return options;
}

function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    const result = verifyRedesign(options);
    console.log(`PASS verify_kssr_unit_redesign files=${result.fileCount} activities=${result.activityCount}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

if (require.main === module) main();

module.exports = { TARGETS, parseArgs, selectTargets, verifyRedesign, verifyTarget };
