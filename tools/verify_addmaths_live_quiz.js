const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const moduleRoot = path.join(
    root,
    "content",
    "SPM_Syllabus",
    "Form4",
    "Additional_Mathematics",
    "Live_Quiz"
);

function read(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function readModule(filename) {
    return fs.readFileSync(path.join(moduleRoot, filename), "utf8");
}

const publicQuestionsSource = readModule("questions-public.js");
const context = { window: {} };
vm.createContext(context);
vm.runInContext(publicQuestionsSource, context);

const questions = context.window.AddMathsQuestions;
assert.equal(Array.isArray(questions), true, "Public question bank must be an array.");
assert.equal(questions.length, 40, "The public question bank must contain exactly 40 questions.");
assert.equal(new Set(questions.map((question) => question.id)).size, 40, "Question IDs must be unique.");

for (let chapter = 1; chapter <= 10; chapter += 1) {
    assert.equal(
        questions.filter((question) => question.chapter === chapter).length,
        4,
        `Chapter ${chapter} must contain exactly four questions.`
    );
}

questions.forEach((question) => {
    assert.equal(question.options.length, 4, `Question ${question.id} must have four options.`);
    assert.equal("correct_option" in question, false, "Answers must not be bundled with public questions.");
    assert.equal("explanation" in question, false, "Explanations must not be bundled with public questions.");
});

const migration = read("db/migrations/addmaths_live_quiz.sql");
const hardeningMigration = read("db/migrations/addmaths_live_quiz_hardening.sql");
const expectedAnswers = [
    1, 1, 1, 3, 1, 2, 1, 2, 0, 0,
    2, 2, 2, 1, 2, 2, 1, 2, 2, 2,
    2, 1, 0, 1, 0, 0, 2, 0, 2, 2,
    0, 1, 2, 0, 1, 2, 1, 2, 2, 2
];
const migrationAnswers = Array.from(
    migration.matchAll(/'[^']*'::jsonb,\s*([0-3]),\s*\r?\n\s*'/g),
    (match) => Number(match[1])
);
assert.deepEqual(migrationAnswers, expectedAnswers, "Migration answer key must match the verified 40-question key.");

[
    "quiz_staff",
    "quiz_questions",
    "quiz_sessions",
    "quiz_participants",
    "quiz_attempt_events",
    "ENABLE ROW LEVEL SECURITY",
    "REVOKE ALL",
    "join_addmaths_session",
    "save_addmaths_answer",
    "submit_addmaths_attempt",
    "reopen_addmaths_attempt",
    ">= 50",
    "supabase_realtime"
].forEach((marker) => {
    assert.equal(migration.includes(marker), true, `Migration is missing required marker: ${marker}`);
});

[
    "REVOKE ALL ON FUNCTION public.handle_new_user()",
    "quiz_staff_created_by_idx",
    "quiz_participants_auth_user_idx",
    "quiz_attempt_events_actor_user_idx"
].forEach((marker) => {
    assert.equal(hardeningMigration.includes(marker), true, `Hardening migration is missing: ${marker}`);
});

const studentHtml = readModule("index.html");
const teacherHtml = readModule("teacher.html");
const studentScript = readModule("student.js");
const teacherScript = readModule("teacher.js");
const sharedScript = readModule("quiz-shared.js");
const portal = read("index.html");
const authAccess = read("js/auth-access.js");
const schema = read("db/schema.sql");
const authKey = authAccess.match(/AUTH_SUPABASE_KEY\s*=\s*'([^']+)'/);
const quizKey = sharedScript.match(/SUPABASE_KEY\s*=\s*"([^"]+)"/);

assert.match(studentHtml, /questions-public\.js/);
assert.match(studentHtml, /quiz-shared\.js/);
assert.match(studentHtml, /student\.js/);
assert.match(studentHtml, /navigation\.js/);
assert.match(teacherHtml, /auth-access\.js/);
assert.match(teacherHtml, /teacher\.js/);
assert.match(teacherHtml, /navigation\.js/);
assert.match(sharedScript, /signInAnonymously/);
assert.match(studentScript, /get_addmaths_student_state/);
assert.match(studentScript, /pendingAnswerRequests:\s*new Map\(\)/);
assert.match(studentScript, /preserveQuizProgress:\s*!element\("quiz-view"\)\.hidden/);
assert.match(teacherScript, /reopen_addmaths_attempt/);
assert.match(teacherScript, /setInterval\(loadParticipants,\s*5000\)/);
assert.match(teacherScript, /starts_at:\s*now\.toISOString\(\)/);
assert.doesNotMatch(teacherScript, /started_at/);
assert.match(teacherScript, /remaining <= 0/);
assert.match(portal, /id="spm-additional-mathematics"/);
assert.match(portal, /data-module-id="spm-addmath-f4-live-quiz"/);
assert.match(portal, /data-public-module="true"/);
assert.match(authAccess, /isPublicModule/);
assert.match(schema, /spm-addmath-f4-live-quiz/);
assert.ok(authKey && quizKey, "Both account and quiz Supabase keys must be defined.");
assert.equal(quizKey[1], authKey[1], "The student quiz must use the same Supabase public key as the account system.");

const chooseAnswerSource = studentScript.slice(
    studentScript.indexOf("async function chooseAnswer"),
    studentScript.indexOf("function startCountdown")
);
assert.doesNotMatch(
    chooseAnswerSource,
    /normalizePayload/,
    "Answer-save responses must not overwrite the student's current question."
);
assert.match(
    chooseAnswerSource,
    /pendingAnswerRequests\.get\(answerKey\) === requestToken/,
    "Only the latest answer request may update the optimistic answer state."
);

console.log("Add Maths live quiz verification passed: 40 questions, secure answer split, portal entry, and database contract.");
