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
const studentPage = read("content/University/Adult_English/Friendship/index.html");
const studentScript = read("content/University/Adult_English/Friendship/friendship.js");
const teacherPage = read("content/University/Adult_English/teacher.html");
const teacherScript = read("content/University/Adult_English/teacher.js");
const edgeFunction = read("supabase/functions/friendship-course-api/index.ts");
const migration = read("supabase/migrations/202608120001_friendship_multi_student.sql");

expect(universityIndex.includes('href="adult-english-hub.html"'), "University portal does not link to Adult English");
expect((hub.match(/class="course/g) || []).length === 7, "Adult English hub must contain exactly seven course cards");
expect(studentPage.includes("youtube-nocookie.com/embed/aGedUxTAfBk"), "Friendship page does not contain the approved YouTube video");
expect(studentPage.includes('data-slide="welcome"') && studentPage.includes('data-slide="video"') && studentPage.includes('data-slide="reflect"') && studentPage.includes('data-slide="quiz"'), "Friendship page is missing a lesson section");
expect(!studentPage.includes("teacher.html"), "Student page must not link to the teacher dashboard");
expect(!studentPage.includes("Teacher Access Key"), "Student page exposes teacher access wording");
expect(teacherPage.includes('type="password"'), "Teacher dashboard must use a password-style access input");
expect(teacherScript.includes("sessionStorage"), "Teacher key must be held in sessionStorage");
expect(!teacherScript.includes("localStorage"), "Teacher dashboard must not persist its key in localStorage");
expect(edgeFunction.includes('verify') || edgeFunction.includes("Deno.serve"), "Friendship API source is missing");
expect(edgeFunction.includes("friendship_quiz_attempts") && edgeFunction.includes("friendship_class_sessions"), "Friendship API does not support attempts and class sessions");
expect(migration.includes("enable row level security") && migration.includes("revoke all"), "Friendship tables are missing RLS hardening");

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

for (const [file, source] of [["friendship.js", studentScript], ["teacher.js", teacherScript]]) {
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

console.log("Adult English verification passed: seven courses, moved modules, student lesson, teacher access and multi-student API source are present.");
