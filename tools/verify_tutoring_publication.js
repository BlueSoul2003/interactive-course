const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const portal = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const modules = [
  ['spm-sk-f4-bab1', 'content/SPM_Syllabus/Form4/Sains_Komputer/Bab1_Pengaturcaraan/index.html'],
  ['spm-sk-f4-bab2', 'content/SPM_Syllabus/Form4/Sains_Komputer/Bab2_Pangkalan_Data/index.html'],
  ['spm-sk-f4-bab3', 'content/SPM_Syllabus/Form4/Sains_Komputer/Bab3_Interaksi_Manusia_dan_Komputer/index.html'],
  ['spm-sk-f5-bab1', 'content/SPM_Syllabus/Form5/Sains_Komputer/Bab1_Pengkomputeran/index.html'],
  ['spm-sk-f5-bab2', 'content/SPM_Syllabus/Form5/Sains_Komputer/Bab2_Pangkalan_Data_Lanjutan/index.html'],
  ['spm-sk-f5-bab3', 'content/SPM_Syllabus/Form5/Sains_Komputer/Bab3_Pengaturcaraan_Berasaskan_Web/index.html'],
  ['spm-sci-f3-bab6-elektrik', 'content/SPM_Syllabus/Form3/Science/Bab6_Elektrik_dan_Kemagnetan/index.html'],
  ['spm-sci-f3-bab7-tenaga', 'content/SPM_Syllabus/Form3/Science/Bab7_Tenaga_dan_Kuasa/index.html'],
  ['igcse-y4-sci-operation-seven', 'content/IGCSE_Syllabus/Year4/Science/Operation_Seven_Challenge/index.html'],
];

for (const [id, relative] of modules) {
  const absolute = path.join(root, relative);
  assert.ok(fs.existsSync(absolute), `Missing module: ${relative}`);
  const html = fs.readFileSync(absolute, 'utf8');
  assert.match(html, /<title>[^<]+<\/title>/i, `${relative} needs a title`);
  assert.ok(html.includes('href="../../../../../index.html"'), `${relative} needs a course portal link`);
  assert.ok(portal.includes(`href="${relative}"`), `Portal missing link to ${relative}`);
  assert.ok(portal.includes(`data-module-id="${id}"`), `Portal missing module id ${id}`);
  const cardStart = portal.lastIndexOf('<a ', portal.indexOf(`data-module-id="${id}"`));
  const cardEnd = portal.indexOf('>', cardStart);
  assert.ok(portal.slice(cardStart, cardEnd).includes('data-public-module="true"'), `${id} must be publicly accessible`);
}

const operationSeven = fs.readFileSync(path.join(root, modules[8][1]), 'utf8');
assert.ok(!/\beason\b/i.test(operationSeven), 'Operation Seven must not expose the student name');

const privatePdfPattern = /(?:source_pdfs|past.?paper|paper[_ -]?[12]|answer|teacher|tutor|jawapan|skema|Modul_Kuasa|Rumusan_Latihan|Silir Daksina)/i;

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (['.git', 'node_modules', '.agents'].includes(entry.name)) return [];
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(absolute);
    if (entry.isFile() && entry.name.toLowerCase().endsWith('.pdf')) return [absolute];
    return [];
  });
}

const privatePdfs = walk(root)
  .map((file) => path.relative(root, file).replace(/\\/g, '/'))
  .filter((file) => privatePdfPattern.test(file));
assert.deepStrictEqual(privatePdfs, [], `Private PDFs found in public tree:\n${privatePdfs.join('\n')}`);

console.log(`Tutoring publication verification passed for ${modules.length} modules.`);
