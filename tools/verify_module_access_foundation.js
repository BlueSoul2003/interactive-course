const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const migrationPath = path.join(root, 'supabase', 'migrations', '20260812085950_module_access_foundation.sql');
const authPath = path.join(root, 'js', 'auth-access.js');
const decisionPath = path.join(root, 'docs', 'MODULE_ACCESS_BOUNDARY.md');
const hardeningPath = path.join(root, 'supabase', 'migrations', '20260812090227_module_access_advisor_hardening.sql');
const anonymousHardeningPath = path.join(root, 'supabase', 'migrations', '20260812090422_module_access_deny_anonymous_entitlements.sql');

assert.ok(fs.existsSync(migrationPath), 'module access foundation migration should exist');
assert.ok(fs.existsSync(decisionPath), 'module access decision record should exist');
assert.ok(fs.existsSync(hardeningPath), 'module access advisor hardening migration should exist');
assert.ok(fs.existsSync(anonymousHardeningPath), 'anonymous entitlement hardening migration should exist');

const migration = fs.readFileSync(migrationPath, 'utf8');
const auth = fs.readFileSync(authPath, 'utf8');
const hardening = fs.readFileSync(hardeningPath, 'utf8');
const anonymousHardening = fs.readFileSync(anonymousHardeningPath, 'utf8');
const registrySql = [
  fs.readFileSync(path.join(root, 'db', 'schema.sql'), 'utf8'),
  ...fs.readdirSync(path.join(root, 'supabase', 'migrations'))
    .filter((name) => name.endsWith('.sql'))
    .map((name) => fs.readFileSync(path.join(root, 'supabase', 'migrations', name), 'utf8'))
].join('\n');

assert.match(migration, /add column if not exists access_mode text/i);
assert.match(migration, /access_mode in \('public', 'demo', 'protected'\)/i);
assert.match(migration, /create table if not exists public\.module_entitlements/i);
assert.match(migration, /alter table public\.module_entitlements enable row level security/i);
assert.match(migration, /grant select on public\.module_entitlements to authenticated/i);
assert.match(migration, /revoke all on public\.module_entitlements from anon, authenticated/i);
assert.match(migration, /create or replace function public\.can_launch_module\(p_module_id text\)/i);
assert.match(migration, /security invoker/i);
assert.doesNotMatch(migration, /security definer/i);
assert.match(migration, /set search_path = ''/i);
assert.match(migration, /reason', 'authentication_required'/i);
assert.match(migration, /reason', 'not_entitled'/i);
assert.match(migration, /reason', 'legacy_entitlement'/i);
assert.match(migration, /entitlements\.expires_at > now\(\)/i);
assert.match(migration, /Social_Media_Masterclass/);
assert.match(auth, /rpc\('can_launch_module', \{ p_module_id: moduleId \}\)/);
assert.match(hardening, /module_entitlements_created_by_idx/);
assert.match(hardening, /Accounts can read permitted module entitlements/);
assert.match(hardening, /drop policy if exists "Admins can manage modules"/);
assert.match(anonymousHardening, /auth\.jwt\(\).*is_anonymous/s);

const expectedDemos = [
  'spm-en-social-media',
  'uec-en-reading',
  'igcse-en-ceo-masterclass',
  'sg-y4-math-whole-number',
  'kssr-p3-en-unit1'
];
for (const moduleId of expectedDemos) {
  assert.ok(migration.includes(`'${moduleId}'`), `legacy demo should be explicit: ${moduleId}`);
}

const portalFiles = [
  'index.html',
  'content/University/index.html',
  'content/University/adult-english-hub.html'
];
const portalModuleIds = new Set();
for (const relativePath of portalFiles) {
  const html = fs.readFileSync(path.join(root, relativePath), 'utf8');
  for (const match of html.matchAll(/data-module-id="([^"]+)"/g)) portalModuleIds.add(match[1]);
}
assert.strictEqual(portalModuleIds.size, 87, 'published portal inventory changed; review and register every new module');
for (const moduleId of portalModuleIds) {
  assert.ok(registrySql.includes(`'${moduleId}'`), `published module is missing from registry migrations: ${moduleId}`);
}

console.log(`Module access foundation verification passed: ${portalModuleIds.size} published IDs are registered; explicit access modes, RLS entitlements, legacy compatibility and canonical launch RPC are present.`);
