const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const navJs = fs.readFileSync(path.join(root, 'js', 'navigation.js'), 'utf8');

assert.match(indexHtml, /<script src="js\/navigation\.js\?v=1\.0\.0"><\/script>/, 'index.html should load js/navigation.js before auth-access.js');
assert.match(indexHtml, /Navigation\.initRootNavigation\(\)/, 'index.html should initialize root navigation');
assert.match(indexHtml, /Navigation\.navigateRoot\(/, 'legacy wrapper functions should delegate to Navigation.navigateRoot');

const syllabusIds = [...indexHtml.matchAll(/<div id="([^"]+)" class="syllabus-content/g)].map(match => match[1]);
assert.deepStrictEqual(
  syllabusIds.sort(),
  ['igcse', 'kssr', 'sg', 'spm', 'uec'],
  'known syllabus ids should remain stable'
);

const layerIds = [...indexHtml.matchAll(/<div id="([^"]+)" class="view-layer/g)].map(match => match[1]);
for (const requiredLayer of [
  'spm-subjects',
  'spm-bm',
  'igcse-subjects',
  'igcse-science-y8',
  'sg-year4',
  'kssr-english-y3'
]) {
  assert.ok(layerIds.includes(requiredLayer), `missing route layer: ${requiredLayer}`);
}

assert.match(navJs, /function applyRootRoute/, 'Navigation should implement applyRootRoute');
assert.match(navJs, /function navigateRoot/, 'Navigation should implement navigateRoot');
assert.match(navJs, /function initRootNavigation/, 'Navigation should implement initRootNavigation');
assert.match(navJs, /hashchange/, 'Navigation should listen for hashchange');

console.log('Navigation integration verification passed.');
