const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const fail = message => { throw new Error(message); };

const manifest = JSON.parse(read('resources/module-manifest.json'));
if (manifest.schemaVersion !== 1) fail('module manifest schemaVersion must be 1');
if (!Array.isArray(manifest.modules) || manifest.modules.length !== 84) {
  fail(`expected 84 manifest modules, found ${manifest.modules?.length ?? 0}`);
}

const ids = new Set();
for (const entry of manifest.modules) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(entry.id)) fail(`invalid module ID: ${entry.id}`);
  if (ids.has(entry.id)) fail(`duplicate module ID: ${entry.id}`);
  ids.add(entry.id);
  if (!entry.path.startsWith('content/') || entry.path.includes('../')) fail(`unsafe route for ${entry.id}`);
  if (!fs.existsSync(path.join(root, entry.path))) fail(`missing route for ${entry.id}: ${entry.path}`);
}

for (const source of manifest.generatedFrom) {
  const html = read(source);
  const portalIds = [...html.matchAll(/data-module-id=["']([^"']+)["']/g)].map(match => match[1]);
  portalIds.forEach(id => { if (!ids.has(id)) fail(`${source} module missing from manifest: ${id}`); });
}

const launcherHtml = read('launcher.html');
['js/auth-access.js', 'js/module-launcher.js'].forEach(file => {
  if (!launcherHtml.includes(file)) fail(`launcher is missing ${file}`);
});

const launcherSource = read('js/module-launcher.js');
new vm.Script(launcherSource, { filename: 'module-launcher.js' });
['canLaunchModule', 'signIn', 'redeemPin', 'location.replace'].forEach(token => {
  if (!launcherSource.includes(token)) fail(`launcher is missing ${token}`);
});
if (/searchParams\.get\(['"](?:target|url|redirect)/.test(launcherSource)) {
  fail('launcher must not redirect to a user-controlled target');
}

const authSource = read('js/auth-access.js');
if (!authSource.includes('prepareModuleLaunchLinks')) fail('AuthAccess must expose launcher link preparation');
if (!authSource.includes("rpc('can_launch_module'")) fail('AuthAccess must use the canonical launch RPC');

const adultHub = read('content/University/adult-english-hub.html');
if (!adultHub.includes('../../js/auth-access.js')) fail('Adult English hub must load AuthAccess');
if (!adultHub.includes('prepareModuleLaunchLinks')) fail('Adult English hub must prepare launcher links');

console.log(`PASS verify_module_launcher (${manifest.modules.length} routes)`);
