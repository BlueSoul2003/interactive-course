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
const parseAttributes = (openingTag) => {
  const attributes = Object.create(null);
  const source = openingTag
    .replace(/^<[A-Za-z][^\s/>]*/, "")
    .replace(/\/?>$/, "");
  const attribute =
    /([^\s"'<>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

  for (let match = attribute.exec(source); match; match = attribute.exec(source)) {
    const name = match[1].toLowerCase();
    assert.ok(
      !Object.hasOwn(attributes, name),
      `Duplicate attribute ${name} in ${openingTag}`
    );
    attributes[name] = match[2] ?? match[3] ?? match[4] ?? "";
  }

  return attributes;
};
const parseElements = (html) => {
  const rootElement = { name: "#root", children: [] };
  const stack = [rootElement];
  const tagPattern = /<(\/?)([A-Za-z][\w:-]*)([^>]*)>/g;
  const voidElements = new Set([
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
  ]);

  for (let match = tagPattern.exec(html); match; match = tagPattern.exec(html)) {
    const closing = match[1] === "/";
    const name = match[2].toLowerCase();

    if (closing) {
      const element = stack.pop();
      assert.equal(element.name, name, `Malformed HTML near ${match[0]}`);
      element.closeStart = match.index;
      element.end = tagPattern.lastIndex;
      continue;
    }

    const parent = stack.at(-1);
    const element = {
      name,
      attributes: parseAttributes(match[0]),
      children: [],
      parent,
      start: match.index,
      openEnd: tagPattern.lastIndex,
      closeStart: tagPattern.lastIndex,
      end: tagPattern.lastIndex,
    };
    parent.children.push(element);

    if (!voidElements.has(name) && !/\/>$/.test(match[0])) {
      stack.push(element);
    }
  }

  assert.equal(stack.length, 1, "Malformed HTML: unclosed element");
  return rootElement;
};
const descendants = (element) =>
  element.children.flatMap((child) => [child, ...descendants(child)]);
const directText = (html, element) => {
  let cursor = element.openEnd;
  const chunks = [];

  for (const child of element.children) {
    chunks.push(html.slice(cursor, child.start));
    cursor = child.end;
  }
  chunks.push(html.slice(cursor, element.closeStart));

  return chunks.join(" ").replace(/\s+/g, " ").trim();
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
const chemistryElements = parseElements(chemistryLayer);
const chemistryAnchors = descendants(chemistryElements).filter(
  (element) => element.name === "a"
);
const chemistryModuleCards = chemistryAnchors.filter(
  (element) =>
    element.attributes["data-module-id"] === chemistryId &&
    element.attributes.href === chemistryModulePath
);
assert.equal(
  chemistryModuleCards.length,
  1,
  "SPM Chemistry layer must contain exactly one canonical module card"
);
const chemistryModuleCard = chemistryModuleCards[0];
assert.ok(
  !descendants(chemistryModuleCard).some((element) => element.name === "a"),
  "SPM Chemistry module card must not contain nested anchors"
);
const chemistryWrapperAnchors = chemistryModuleCard.parent.children.filter(
  (element) => element.name === "a"
);
assert.deepEqual(
  chemistryWrapperAnchors.map((element) => element.attributes.href),
  [chemistryModulePath, studentWorkbookPath, teacherSchemePath],
  "SPM Chemistry wrapper must contain the module, student download, and teacher download as ordered sibling anchors"
);
for (const [element, label] of [
  [chemistryWrapperAnchors[1], "Download Student Workbook"],
  [chemistryWrapperAnchors[2], "Download Teacher Answer Scheme"],
]) {
  assert.ok(
    Object.hasOwn(element.attributes, "download"),
    `${label} must use a real download attribute`
  );
  assert.equal(directText(chemistryLayer, element), label, `${label} is incorrect`);
}
assert.match(portal, /8 interactive modules/, "Year 4 Science count was not updated");

console.log("Inbox course module verification passed.");
