const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const exists = (relative) => fs.existsSync(path.join(root, relative));

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

for (const [id, modulePath] of [
  [chemistryId, `${chemistryDir}/index.html`],
  [scienceId, `${scienceDir}/index.html`],
]) {
  assert.match(portal, new RegExp(`data-module-id=["']${id}["']`), `Portal missing ${id}`);
  assert.ok(portal.includes(modulePath), `Portal missing module path ${modulePath}`);
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

assert.match(portal, /<div id="spm-chemistry" class="view-layer">/, "Missing SPM Chemistry layer");
assert.match(portal, /8 interactive modules/, "Year 4 Science count was not updated");

console.log("Inbox course module verification passed.");
