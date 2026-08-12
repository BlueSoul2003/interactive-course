const fs = require("fs");
const path = require("path");
const acorn = require("acorn");

const root = path.resolve(__dirname, "..");
const failures = [];

function read(relativePath) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) {
    failures.push(`Missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(filePath, "utf8");
}

function expect(condition, message) {
  if (!condition) failures.push(message);
}

const movedModules = [
  ["Self_Discovery", "Self-Discovery &amp; Meaningful Conversations"],
  ["Startup_Communication_Lab", "The Startup Communication Lab"],
  ["AI_at_Work", "AI at Work"],
  ["Pricing_Psychology", "Pricing Psychology &amp; Business English"],
  ["Negotiation_Communication", "Negotiation &amp; Tactical Communication"],
  ["Financial_Literacy", "Financial Literacy &amp; Life Decisions"],
];

const rootIndex = read("index.html");
const universityIndex = read("content/University/index.html");
const hub = read("content/University/adult-english-hub.html");
const teacherPage = read("content/University/Adult_English/teacher.html");
const teacherScript = read("content/University/Adult_English/teacher.js");
const edgeFunction = read("supabase/functions/friendship-course-api/index.ts");
const migration = read("supabase/migrations/202608120001_friendship_multi_student.sql");
const protectedFunction = read("supabase/functions/protected-module/index.ts");
const privateMigration = read("supabase/migrations/20260812103000_private_module_delivery.sql");
const privateBuilder = read("tools/build_private_friendship_module.js");

expect(universityIndex.includes('href="adult-english-hub.html"'), "University portal does not link to Adult English");
expect((hub.match(/class="course/g) || []).length === 7, "Adult English hub must contain exactly seven course cards");
expect(!fs.existsSync(path.join(root, "content/University/Adult_English/Friendship/index.html")), "Friendship student page must not remain in the public site");
expect(!fs.existsSync(path.join(root, "content/University/Adult_English/Friendship/friendship.js")), "Friendship student script must not remain in the public site");
expect(!fs.existsSync(path.join(root, "content/University/Adult_English/Friendship/friendship.css")), "Friendship student stylesheet must not remain in the public site");
expect(hub.includes('href="../../launcher.html?module=adult-en-friendship"'), "Friendship card must link to the private launcher");
expect(teacherPage.includes('type="password"'), "Teacher dashboard must use a password-style access input");
expect(teacherScript.includes("sessionStorage"), "Teacher key must be held in sessionStorage");
expect(!teacherScript.includes("localStorage"), "Teacher dashboard must not persist its key in localStorage");
expect(edgeFunction.includes('verify') || edgeFunction.includes("Deno.serve"), "Friendship API source is missing");
expect(edgeFunction.includes("friendship_quiz_attempts") && edgeFunction.includes("friendship_class_sessions"), "Friendship API does not support attempts and class sessions");
expect(edgeFunction.includes('Course access denied.') && edgeFunction.includes('can_launch_module'), "Friendship API does not enforce protected module access");
expect(migration.includes("enable row level security") && migration.includes("revoke all"), "Friendship tables are missing RLS hardening");
expect(protectedFunction.includes('module_packages') && protectedFunction.includes('sha256Hex'), "Protected module delivery function is incomplete");
expect(privateMigration.includes("'adult-en-friendship'") && privateMigration.includes("'protected-course-modules'"), "Friendship private package is missing from the registry migration");
expect(privateBuilder.includes('__MODULE_ACCESS_TOKEN_JSON__') && privateBuilder.includes('__MODULE_CSP_NONCE__'), "Friendship private builder is missing secure placeholders");

const oldModulePaths = ["Discovery_Journey", "Teen_CEO_Simulator", "AI_CoFounder_Simulator", "Pricing_Strategy", "The_Master_Negotiator", "Rich_Teen_Simulator"];
oldModulePaths.forEach((folder) => {
  expect(!fs.existsSync(path.join(root, "content/UEC_Syllabus/Senior/English", folder)), `Old UEC folder still exists: ${folder}`);
  expect(!rootIndex.includes(`content/UEC_Syllabus/Senior/English/${folder}`), `Root index still links to moved UEC module: ${folder}`);
});

movedModules.forEach(([folder, title]) => {
  const relativePath = `content/University/Adult_English/${folder}/index.html`;
  const html = read(relativePath);
  expect(html.includes(title), `${folder} does not use its approved Adult English title`);
  expect(html.includes(`content/University/Adult_English/${folder}/index.html`), `${folder} progress URL was not updated`);
});

for (const [file, source] of [["teacher.js", teacherScript]]) {
  try {
    acorn.parse(source, { ecmaVersion: "latest", sourceType: "script" });
  } catch (error) {
    failures.push(`${file} is not valid JavaScript: ${error.message}`);
  }
}

if (failures.length) {
  console.error("Adult English verification failed:\n- " + failures.join("\n- "));
  process.exit(1);
}

console.log("Adult English verification passed: seven courses, private Friendship delivery, teacher access and protected multi-student API are present.");
