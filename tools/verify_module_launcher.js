const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const fail = message => { throw new Error(message); };

const manifest = JSON.parse(read('resources/module-manifest.json'));
if (manifest.schemaVersion !== 1) fail('module manifest schemaVersion must be 1');
if (!Array.isArray(manifest.modules) || manifest.modules.length !== 85) {
  fail(`expected 85 manifest modules, found ${manifest.modules?.length ?? 0}`);
}

const ids = new Set();
for (const entry of manifest.modules) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(entry.id)) fail(`invalid module ID: ${entry.id}`);
  if (ids.has(entry.id)) fail(`duplicate module ID: ${entry.id}`);
  ids.add(entry.id);
  if (entry.delivery === 'private') {
    if (entry.id !== 'adult-en-friendship') fail(`unexpected private module: ${entry.id}`);
    if (Object.prototype.hasOwnProperty.call(entry, 'path')) fail(`private module exposes a public path: ${entry.id}`);
  } else {
    if (entry.delivery !== 'public') fail(`invalid delivery mode for ${entry.id}`);
    if (!entry.path.startsWith('content/') || entry.path.includes('../')) fail(`unsafe route for ${entry.id}`);
    if (!fs.existsSync(path.join(root, entry.path))) fail(`missing route for ${entry.id}: ${entry.path}`);
  }
}

for (const source of manifest.generatedFrom) {
  const html = read(source);
  const portalIds = [...html.matchAll(/data-module-id=["']([^"']+)["']/g)].map(match => match[1]);
  portalIds.forEach(id => { if (!ids.has(id)) fail(`${source} module missing from manifest: ${id}`); });
}

const launcherHtml = read('launcher.html');
['js/navigation.js', 'js/auth-access.js', 'js/module-launcher.js'].forEach(file => {
  if (!launcherHtml.includes(file)) fail(`launcher is missing ${file}`);
});

const launcherSource = read('js/module-launcher.js');
new vm.Script(launcherSource, { filename: 'module-launcher.js' });
['canLaunchModule', 'fetchProtectedModule', 'signIn', 'redeemPin', 'location.replace', 'document.write'].forEach(token => {
  if (!launcherSource.includes(token)) fail(`launcher is missing ${token}`);
});
if (/searchParams\.get\(['"](?:target|url|redirect)/.test(launcherSource)) {
  fail('launcher must not redirect to a user-controlled target');
}
if (launcherSource.includes('createObjectURL')) fail('private modules must retain the portal origin');
if (!launcherSource.includes("searchParams.get('from')")) fail('launcher must preserve the portal source route');
if (!launcherSource.includes('Navigation?.isRootRouteHash')) fail('launcher must validate the portal source route');
if (!launcherSource.includes("target.searchParams.set('from', sourceRoute)")) fail('launcher must pass source context to public modules');
if (!launcherHtml.includes('id="portal-return-link"')) fail('launcher must expose a context-aware portal return link');

const authSource = read('js/auth-access.js');
if (!authSource.includes('prepareModuleLaunchLinks')) fail('AuthAccess must expose launcher link preparation');
if (!authSource.includes("launcherUrl.searchParams.set('from', sourceRoute)")) fail('AuthAccess must preserve source context through the access gate');
if (!authSource.includes("rpc('can_launch_module'")) fail('AuthAccess must use the canonical launch RPC');
if (!authSource.includes('/functions/v1/protected-module')) fail('AuthAccess must fetch private modules from the protected endpoint');

const navigationSource = read('js/navigation.js');
if (!navigationSource.includes('link.dataset.navigationOriginalHref || link.dataset.moduleTarget')) {
  fail('Navigation must retain the original module route after AuthAccess prepares launcher links');
}
if (!navigationSource.includes('window.AuthAccess.prepareModuleLaunchLinks(document)')) {
  fail('Navigation must restore launcher links after root route changes');
}

const adultHub = read('content/University/adult-english-hub.html');
if (!adultHub.includes('../../js/auth-access.js')) fail('Adult English hub must load AuthAccess');
if (!adultHub.includes('prepareModuleLaunchLinks')) fail('Adult English hub must prepare launcher links');
if (adultHub.includes('Adult_English/Friendship/index.html')) fail('Adult English hub still exposes the Friendship public route');

const pagesWorkflow = read('.github/workflows/pages.yml');
if (!/cp\s+index\.html\s+notes\.html\s+launcher\.html\s+_site\//.test(pagesWorkflow)) {
  fail('GitHub Pages workflow must publish launcher.html');
}

const protectedFunction = read('supabase/functions/protected-module/index.ts');
const friendshipFunction = read('supabase/functions/friendship-course-api/index.ts');
const privateMigration = read('supabase/migrations/20260812103000_private_module_delivery.sql');
if (!protectedFunction.includes('can_launch_module') || !protectedFunction.includes('module_packages')) fail('protected-module must verify entitlement and package metadata');
if (!protectedFunction.includes('sha256Hex') || !protectedFunction.includes('__MODULE_ACCESS_TOKEN_JSON__')) fail('protected-module must verify and hydrate the private package');
if (!friendshipFunction.includes('Course access denied.') || !friendshipFunction.includes('adult-en-friendship')) fail('Friendship API must enforce module access');
if (!privateMigration.includes("'protected-course-modules'") || !privateMigration.includes('enable row level security')) fail('private module migration is incomplete');

console.log(`PASS verify_module_launcher (${manifest.modules.length} routes)`);
