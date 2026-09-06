const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const folder = path.join(root, 'content/IGCSE_Syllabus/Year4/Science/Earth_and_Space_Revision');
const context = { window: {} };
for (const file of ['data.js', 'visuals.js']) vm.runInNewContext(fs.readFileSync(path.join(folder, file), 'utf8'), context);
const d = context.window.EARTH_SPACE_DATA, core = require(path.join(folder, 'core.js'));
const prompts = new Set(), ids = new Set(), levels = {}, positions = [0, 0, 0, 0];
assert.equal(d.questions.length, 150);
for (const t of d.topics) for (const type of ['mcq', 'fill']) assert.equal(d.questions.filter(q => q.topic === t.id && q.type === type).length, t[type]);
for (const q of d.questions) {
  assert(!ids.has(q.id), `Duplicate ID ${q.id}`); ids.add(q.id);
  assert(!prompts.has(q.prompt), `Duplicate prompt ${q.id}`); prompts.add(q.prompt);
  assert(['core', 'apply', 'stretch'].includes(q.level)); levels[q.level] = (levels[q.level] || 0) + 1;
  assert(q.explanation?.length > 20, `${q.id} needs an explanation`);
  if (q.visual) assert(context.window.EARTH_SPACE_VISUALS[q.visual], `Unknown evidence ${q.id}`);
  if (q.type === 'mcq') {
    assert.equal(q.options.length, 4); assert.equal(new Set(q.options).size, 4); assert(q.options.every(x => typeof x === 'string' && x.length));
    assert(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4); positions[q.answer]++;
    for (let i = 0; i < 4; i++) assert.equal(core.grade(q, i).correct, i === q.answer);
    assert.equal(core.grade(q, null).correct, false);
  } else {
    assert.equal(q.prompt.match(/___/g).length, q.answers.length); assert(q.answers.length >= 1 && q.answers.length <= 2);
    assert(q.answers.every(a => a.length && a.every(x => x.trim())));
    for (let i = 0; i < q.answers.length; i++) for (const variant of q.answers[i]) {
      const answer = q.answers.map(a => a[0]); answer[i] = `  ${variant.toUpperCase()}  `;
      assert(core.grade(q, answer).correct, `${q.id}: rejected variant ${variant}`);
    }
    assert(!core.grade(q, q.answers.map(() => '')).correct);
    assert(!core.grade(q, q.answers.map(() => 'incorrect')).correct);
  }
}
assert.deepEqual(levels, { core: 60, apply: 60, stretch: 30 });
assert.deepEqual(positions, [25, 25, 25, 25]);
assert(d.questions.filter(q => q.visual).length >= 25);
const q = d.questions[0];
const wrong = core.record(null, (q.answer + 1) % 4, { correct: false, blanks: [] }, 10);
const right = core.record(wrong, q.answer, { correct: true, blanks: [] }, 20);
assert.equal(right.firstCorrect, false); assert.equal(right.attempts, 2); assert.equal(right.mastered, true);
assert.equal(core.select(d.questions, { [q.id]: wrong }, { review: true }).length, 1);
assert.equal(core.select(d.questions, { [q.id]: right }, { review: true }).length, 0);
const local = { version: 1, resetAt: 0, answers: { [q.id]: right } }, remote = { version: 1, answers: { [q.id]: wrong } };
assert.equal(core.merge(local, remote, ids).answers[q.id].updatedAt, 20, 'Stale remote must not replace newer local');
assert.equal(Object.keys(core.merge({ ...local, resetAt: 30, answers: {} }, remote, ids).answers).length, 0, 'Reset must not resurrect old answers');
assert.equal(core.stats(d.questions, { [q.id]: right }).firstCorrect, 0);
const mixed = core.shuffle(d.questions).slice(0, 10); assert.equal(new Set(mixed.map(q => q.id)).size, 10);
const html = fs.readFileSync(path.join(folder, 'index.html'), 'utf8');
for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) if (!/^https?:/.test(match[1])) assert(fs.existsSync(path.resolve(folder, match[1].split(/[?#]/)[0])), `Missing asset ${match[1]}`);
const portal = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert(portal.includes(`data-module-id="${d.id}"`));
assert(fs.readFileSync(path.join(root, 'db/schema.sql'), 'utf8').includes(`'${d.id}'`));
console.log(`PASS: 100 MCQ + 50 fill; 60 core / 60 apply / 30 stretch; ${d.questions.filter(q => q.visual).length} evidence questions; balanced answers, grading, retries, reset/merge and links.`);
