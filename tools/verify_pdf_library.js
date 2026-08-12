const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const pagePath = path.join(repoRoot, 'notes.html');
const portalPath = path.join(repoRoot, 'index.html');
const migrationPath = path.join(repoRoot, 'db', 'migrations', 'secure_pdf_library.sql');
const profileMigrationPath = path.join(repoRoot, 'db', 'migrations', 'harden_user_profile_privileges.sql');
const adminFunctionPath = path.join(repoRoot, 'supabase', 'functions', 'pdf-library-admin', 'index.ts');
const ignoredDirs = new Set(['.git', 'node_modules', '.agents']);

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoredDirs.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(fullPath));
    else if (entry.isFile()) files.push(fullPath);
  }
  return files;
}

assert.ok(fs.existsSync(pagePath), 'notes.html should exist');
assert.ok(fs.existsSync(migrationPath), 'private PDF migration should exist');
assert.ok(fs.existsSync(profileMigrationPath), 'account privilege migration should exist');
assert.ok(fs.existsSync(adminFunctionPath), 'admin upload function should exist');
assert.ok(!fs.existsSync(path.join(repoRoot, 'resources', 'pdf-catalog.json')), 'public PDF catalogue must not exist');

const pdfPaths = walk(repoRoot).filter((file) => path.extname(file).toLowerCase() === '.pdf');
assert.deepStrictEqual(pdfPaths, [], `PDF files must stay outside the public repository:\n${pdfPaths.join('\n')}`);

const notesPage = fs.readFileSync(pagePath, 'utf8');
assert.match(notesPage, /AuthAccess\.signIn/);
assert.match(notesPage, /from\('pdf_resources'\)/);
assert.match(notesPage, /createSignedUrl/);
assert.match(notesPage, /uploadToSignedUrl/);
assert.match(notesPage, /pdf-library-admin/);
assert.match(notesPage, /course-pdfs/);
assert.doesNotMatch(notesPage, /pdf-catalog\.json/);
assert.doesNotMatch(notesPage, /href=["'][^"']+\.pdf/i);

const portalPage = fs.readFileSync(portalPath, 'utf8');
assert.match(portalPage, /href="notes\.html"[^>]*>[^<]*PDF Library/);
assert.doesNotMatch(portalPage, /openPdfModal/);

const migration = fs.readFileSync(migrationPath, 'utf8');
assert.match(migration, /public\.pdf_resources/);
assert.match(migration, /enable row level security/i);
assert.match(migration, /public\s*=\s*false/i);
assert.match(migration, /storage\.objects/);
assert.match(migration, /is_anonymous/);

const profileMigration = fs.readFileSync(profileMigrationPath, 'utf8');
assert.match(profileMigration, /revoke update on public\.user_profiles from authenticated/i);
assert.match(profileMigration, /grant update \(fullname, phone, syllabus, age, gender, role\)/i);

const adminFunction = fs.readFileSync(adminFunctionPath, 'utf8');
assert.match(adminFunction, /profile\?\.tier !== 'admin'/);
assert.match(adminFunction, /createSignedUploadUrl/);

console.log('Private PDF library verification passed. No PDFs are stored in the public repository.');
