const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const exists = (relative) => fs.existsSync(path.join(root, relative));
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const extractDiv = (html, openingPattern, errorMessage) => {
  const opening = openingPattern.exec(html);
  assert.ok(opening, errorMessage);

  const divTag = /<\/?div\b[^>]*>/gi;
  divTag.lastIndex = opening.index;
  let depth = 0;

  for (let tag = divTag.exec(html); tag; tag = divTag.exec(html)) {
    depth += /^<div\b/i.test(tag[0]) ? 1 : -1;
    if (depth === 0) {
      return html.slice(opening.index, divTag.lastIndex);
    }
  }

  assert.fail(`${errorMessage}: unclosed div`);
};

const chemistryDir =
  "content/SPM_Syllabus/Form5/Chemistry/Chapter5_Consumer_and_Industrial_Chemistry";
const scienceDir =
  "content/IGCSE_Syllabus/Year4/Science/Science_Command_Centre";
const chemistryId = "spm-chem-ch5-consumer-industrial";
const scienceId = "igcse-y4-sci-command-centre";

for (const relative of [
  `${chemistryDir}/index.html`,
  `${chemistryDir}/student_workbook.pdf`,
  `${chemistryDir}/teacher_answer_scheme.pdf`,
  `${scienceDir}/index.html`,
]) {
  assert.ok(exists(relative), `Missing required publication file: ${relative}`);
}

const portal = read("index.html");
const registry = read("db/archive/modules_registry.sql");

assert.ok(exists("js/navigation.js"), "Missing shared navigation helper");
assert.ok(portal.includes("js/navigation.js?v=1.0.0"), "Landing page missing navigation helper");
assert.ok(
  portal.indexOf("js/navigation.js?v=1.0.0") < portal.indexOf("auth-access.js"),
  "Landing page has incorrect navigation/auth script order"
);

for (const [id, modulePath] of [
  [chemistryId, `${chemistryDir}/index.html`],
  [scienceId, `${scienceDir}/index.html`],
]) {
  assert.match(
    portal,
    new RegExp(
      `<a\\b(?=[^>]*\\bdata-module-id=["']${id}["'])(?=[^>]*\\bhref=["']${escapeRegExp(modulePath)}["'])[^>]*>`,
      "i"
    ),
    `Portal missing ${id} card with module path ${modulePath}`
  );
  assert.ok(registry.includes(`'${id}'`), `Registry missing ${id}`);
  const moduleHtml = read(modulePath);
  assert.ok(moduleHtml.includes(`data-module-id="${id}"`), `${id} missing tracker ID`);
  assert.ok(moduleHtml.includes("navigation.js?v=1.0.0"), `${id} missing navigation helper`);
  assert.ok(moduleHtml.includes("ProgressTracker.init"), `${id} missing progress restore`);
  assert.ok(
    moduleHtml.includes("ProgressTracker.autoSave") || moduleHtml.includes("tracker.save"),
    `${id} missing progress save`
  );
  assert.ok(
    moduleHtml.indexOf("navigation.js?v=1.0.0") < moduleHtml.indexOf("progress-tracker.js"),
    `${id} has incorrect navigation/progress script order`
  );
}

for (const pdf of [
  `${chemistryDir}/student_workbook.pdf`,
  `${chemistryDir}/teacher_answer_scheme.pdf`,
]) {
  assert.ok(portal.includes(pdf), `Portal missing public PDF link ${pdf}`);
}

const chemistryLayer = extractDiv(
  portal,
  /<div\b(?=[^>]*\bid=["']spm-chemistry["'])(?=[^>]*\bclass=["'][^"']*\bview-layer\b[^"']*["'])[^>]*>/i,
  "Missing SPM Chemistry layer"
);
const chemistryModulePath = `${chemistryDir}/index.html`;
const studentWorkbookPath = `${chemistryDir}/student_workbook.pdf`;
const teacherSchemePath = `${chemistryDir}/teacher_answer_scheme.pdf`;
const moduleAnchor =
  `<a\\b(?=[^>]*\\bdata-module-id=["']${chemistryId}["'])` +
  `(?=[^>]*\\bhref=["']${escapeRegExp(chemistryModulePath)}["'])[^>]*>` +
  `[\\s\\S]*?<\\/a>`;
const downloadAnchor = (pdfPath, label) =>
  `<a\\b(?=[^>]*\\bhref=["']${escapeRegExp(pdfPath)}["'])` +
  `(?=[^>]*\\bdownload(?:\\s*=\\s*(?:["'][^"']*["']|[^\\s>]+))?(?=\\s|>))[^>]*>` +
  `\\s*${escapeRegExp(label)}\\s*(?:<span\\b[^>]*>[\\s\\S]*?<\\/span>\\s*)?<\\/a>`;
assert.match(
  chemistryLayer,
  new RegExp(
    `<div\\b[^>]*>\\s*${moduleAnchor}\\s*` +
      `${downloadAnchor(studentWorkbookPath, "Download Student Workbook")}\\s*` +
      `${downloadAnchor(teacherSchemePath, "Download Teacher Answer Scheme")}\\s*<\\/div>`,
    "i"
  ),
  "SPM Chemistry downloads must be labeled sibling anchors with exact PDF paths and download attributes"
);
assert.match(portal, /8 interactive modules/, "Year 4 Science count was not updated");

console.log("Inbox course module verification passed.");
