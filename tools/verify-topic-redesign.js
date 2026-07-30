const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

const root = process.cwd();
const landingHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const schemaSql = fs.readFileSync(path.join(root, 'db', 'schema.sql'), 'utf8');

const pages = [
  {
    name: 'Topic 6: Planet Earth',
    file: path.join(root, 'content', 'IGCSE_Syllabus', 'Year4', 'Science', 'Topic6_Planet_Earth', 'index.html'),
    moduleUrl: 'content/IGCSE_Syllabus/Year4/Science/Topic6_Planet_Earth/index.html',
    moduleId: 'igcse-y4-sci-topic6',
    themeClass: 'topic-earth'
  },
  {
    name: 'Topic 7: Earth and Space',
    file: path.join(root, 'content', 'IGCSE_Syllabus', 'Year4', 'Science', 'Topic7_Earth_and_Space', 'index.html'),
    moduleUrl: 'content/IGCSE_Syllabus/Year4/Science/Topic7_Earth_and_Space/index.html',
    moduleId: 'igcse-y4-sci-topic7',
    themeClass: 'topic-space'
  }
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

for (const page of pages) {
  const html = fs.readFileSync(page.file, 'utf8');
  const questionMatches = html.match(/\{\s*id:\s*\d+,\s*type:/g) || [];
  const longAnswerMatches = html.match(/expected:\s*"/g) || [];

  assert(questionMatches.length === 50, `${page.name} should keep exactly 50 original question entries`);
  assert(longAnswerMatches.length === 15, `${page.name} should keep all 15 expected long-answer entries`);
  assert(!html.includes("activeTab") && !html.includes("Presentation View"), `${page.name} should not include presentation tab state or tab label`);
  assert(!html.includes('<iframe') && !html.includes('slides.pdf'), `${page.name} should not embed or link presentation slides`);
  assert(html.includes('Worksheet.pdf'), `${page.name} should keep the worksheet link`);
  assert(html.includes('Answer_Key.pdf'), `${page.name} should keep the answer-key link`);
  assert(html.includes('playCuteSound') && html.includes('AudioContext'), `${page.name} should keep Web Audio feedback`);
  assert(html.includes('triggerCelebration') && html.includes('visual-burst'), `${page.name} should include success visual effects`);
  assert(html.includes('answer-shake'), `${page.name} should include wrong-answer visual feedback`);
  assert(html.includes(page.themeClass), `${page.name} should include its topic-specific visual theme`);
  assert(html.includes(page.moduleId), `${page.name} should keep progress tracker module id`);
  assert(html.includes(`data-module-url="${page.moduleUrl}"`), `${page.name} should keep the canonical module URL`);
  assert(html.includes('href="../../../../../index.html"'), `${page.name} should have the correct 5-level home link`);
  assert(html.indexOf('@supabase/supabase-js@2') < html.indexOf('auth-access.js'), `${page.name} should load Supabase before auth-access.js`);
  assert(html.indexOf('auth-access.js') < html.indexOf('progress-tracker.js'), `${page.name} should load auth-access.js before progress-tracker.js`);
  assert(html.includes('__applyRestoredProgress'), `${page.name} should restore saved progress from the ProgressTracker init callback`);
  assert(html.includes('saveCompletedProgress'), `${page.name} should save progress explicitly when a question is completed`);
  assert(html.includes("typeof ProgressTracker !== 'undefined'"), `${page.name} should guard ProgressTracker initialization`);
  assert(!html.includes('TODO') && !html.includes('TBD'), `${page.name} should not contain placeholders`);

  const scriptMatch = html.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);
  assert(scriptMatch, `${page.name} should include one Babel React script`);
  babel.transformSync(scriptMatch[1], {
    presets: ['@babel/preset-react'],
    filename: page.file,
    configFile: false,
    babelrc: false
  });

  assert(landingHtml.includes(`href="${page.moduleUrl}"`), `${page.name} should have a card on the root landing page`);
  assert(landingHtml.includes(`data-module-id="${page.moduleId}"`), `${page.name} landing card should expose the canonical module id`);
  assert(schemaSql.includes(`('${page.moduleId}'`), `${page.name} should be registered in db/schema.sql`);
}

console.log('Topic redesign verification passed.');
