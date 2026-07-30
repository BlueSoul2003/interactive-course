const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const catalogPath = path.join(repoRoot, 'resources', 'pdf-catalog.json');
const pagePath = path.join(repoRoot, 'notes.html');

const ignoredDirs = new Set(['.git', 'node_modules', '.agents']);

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (ignoredDirs.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.pdf')) {
      files.push(fullPath);
    }
  }

  return files;
}

function toCatalogPath(fullPath) {
  return path.relative(repoRoot, fullPath).replace(/\\/g, '/');
}

assert.ok(fs.existsSync(catalogPath), 'resources/pdf-catalog.json should exist');
assert.ok(fs.existsSync(pagePath), 'notes.html should exist');

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
assert.ok(Array.isArray(catalog.resources), 'catalog.resources should be an array');

const catalogPaths = new Set(catalog.resources.map((item) => item.file));
const pdfPaths = walk(repoRoot).map(toCatalogPath).sort();

const missing = pdfPaths.filter((file) => !catalogPaths.has(file));
assert.deepStrictEqual(missing, [], `Catalog is missing PDFs:\n${missing.join('\n')}`);

const broken = catalog.resources
  .map((item) => item.file)
  .filter((file) => !fs.existsSync(path.join(repoRoot, file)));
assert.deepStrictEqual(broken, [], `Catalog links do not exist:\n${broken.join('\n')}`);

const requiredFiles = [
  'hardcopy/SPM_Syllabus/Form3/Science/Form3_Science_Bab5_Thermochemistry_Bilingual_Student.pdf',
  'hardcopy/SPM_Syllabus/Form4/Sains_Komputer/SPM_Sains_Komputer_Java_Ch1_3_4_to_1_4_3_Student.pdf',
  'hardcopy/SPM_Syllabus/Form4/Sains_Komputer/SPM_Sains_Komputer_Java_Ch1_3_4_to_1_4_3_Teacher_Answers.pdf',
  'hardcopy/IGCSE_Syllabus/Year8/Science/IGCSE_Y8_Science_Ch8_Chemical_Reactions_Student.pdf',
  'hardcopy/IGCSE_Syllabus/Year8/Science/IGCSE_Y8_Science_Ch8_Chemical_Reactions_Tutor_Key.pdf',
];

for (const file of requiredFiles) {
  assert.ok(catalogPaths.has(file), `${file} should be included in the catalog`);
}

for (const item of catalog.resources) {
  assert.ok(item.id, `Catalog item for ${item.file} needs an id`);
  assert.ok(item.title, `Catalog item for ${item.file} needs a title`);
  assert.ok(item.syllabus, `Catalog item for ${item.file} needs a syllabus`);
  assert.ok(item.subject, `Catalog item for ${item.file} needs a subject`);
  assert.ok(item.audience, `Catalog item for ${item.file} needs an audience`);
  assert.ok(item.type, `Catalog item for ${item.file} needs a type`);
  assert.strictEqual(path.extname(item.file).toLowerCase(), '.pdf', `${item.file} should be a PDF`);
}

const notesPage = fs.readFileSync(pagePath, 'utf8');
assert.match(notesPage, /resources\/pdf-catalog\.json/);
assert.match(notesPage, /View PDF/);
assert.match(notesPage, /Download/);
assert.match(notesPage, /Add Folder/);

console.log(`PDF library verification passed for ${catalog.resources.length} catalog items.`);
