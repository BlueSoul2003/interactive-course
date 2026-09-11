const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const requiredFiles = [
  'index.html',
  'content/IGCSE_Syllabus/Year8/Science/Chapter1_Respiration/index.html',
  'content/SPM_Syllabus/Form5/BM/Rumusan/index.html',
  'content/Singapore_Syllabus/Year4/Math/Chapter2_Whole_Number/index.html',
  'content/University/Physics/Kinematics_Simulator/index.html'
];

for (const relativeFile of requiredFiles) {
  const html = fs.readFileSync(path.join(root, relativeFile), 'utf8');
  assert.match(
    html,
    /navigation\.js\?v=1\.0\.0/,
    `${relativeFile} should load navigation.js v1.0.0`
  );
}

const rootHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert.match(rootHtml, /data-module-id="igcse-y8-sci-ch1"/, 'representative IGCSE module card should still expose data-module-id');
assert.match(rootHtml, /data-module-id="spm-bm-rumusan"/, 'representative SPM module card should still expose data-module-id');
assert.match(rootHtml, /data-module-id="sg-y4-math-whole-number"/, 'representative SG module card should still expose data-module-id');

const chemistryStart = rootHtml.indexOf('<div id="spm-chemistry"');
const chemistryEnd = rootHtml.indexOf('UEC SYLLABUS CONTENT', chemistryStart);
assert.notStrictEqual(chemistryStart, -1, 'SPM Chemistry view should exist');
assert.notStrictEqual(chemistryEnd, -1, 'SPM Chemistry view should end before the UEC section');

const chemistryHtml = rootHtml.slice(chemistryStart, chemistryEnd);
const kertas1Start = chemistryHtml.indexOf('data-paper-group="kertas-1"');
const kertas2Start = chemistryHtml.indexOf('data-paper-group="kertas-2"');
assert.ok(kertas1Start >= 0 && kertas2Start > kertas1Start, 'Chemistry papers should group Kertas 1 before Kertas 2');

const idsIn = html => [...html.matchAll(/data-module-id="([^"]+)"/g)].map(match => match[1]);
assert.deepStrictEqual(
  idsIn(chemistryHtml.slice(kertas1Start, kertas2Start)),
  [
    'spm-chem-f5-johor-2025-k1',
    'spm-chem-f5-kedah-2025-k1',
    'spm-chem-f5-sbp-2025-k1',
    'spm-chem-f5-selangor-pintas-2025-k1',
    'spm-chem-f5-terengganu-2025-k1'
  ],
  'Kertas 1 should contain the five published student-practice modules in state order'
);
assert.deepStrictEqual(
  idsIn(chemistryHtml.slice(kertas2Start)),
  [
    'spm-chem-f5-johor-2025-k2-teacher',
    'spm-chem-f5-kedah-2025-k2-teacher',
    'spm-chem-f5-sbp-2025-k2-teacher',
    'spm-chem-f5-selangor-pintas-2025-k2-teacher',
    'spm-chem-f5-terengganu-2025-k2-teacher'
  ],
  'Kertas 2 should contain the five published teacher-slide modules in state order'
);

console.log('Module navigation link verification passed.');
