const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const workflowPath = path.join(repoRoot, '.github', 'workflows', 'pages.yml');
const workflow = fs.readFileSync(workflowPath, 'utf8');

assert.match(workflow, /name:\s*Deploy static site to GitHub Pages/);
assert.match(workflow, /branches:\s*\[\s*registration\s*\]/);
assert.match(workflow, /contents:\s*read/);
assert.match(workflow, /pages:\s*write/);
assert.match(workflow, /id-token:\s*write/);
assert.match(workflow, /actions\/checkout@v7/);
assert.match(workflow, /actions\/configure-pages@v6/);
assert.match(workflow, /actions\/upload-pages-artifact@v5/);
assert.match(workflow, /actions\/deploy-pages@v5/);

console.log('Pages workflow verification passed.');
