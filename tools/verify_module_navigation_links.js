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

console.log('Module navigation link verification passed.');
