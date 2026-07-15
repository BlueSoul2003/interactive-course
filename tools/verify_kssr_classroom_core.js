const assert = require('assert');
const Core = require('../js/kssr-classroom-core');

assert.equal(Core.SCHEMA_VERSION, 1);

const profile = Core.createProfile('p1', 'Alicia', 'cat', '2026-07-15T00:00:00.000Z');
assert.deepEqual(profile, {
  id: 'p1',
  name: 'Alicia',
  avatar: 'cat',
  updatedAt: '2026-07-15T00:00:00.000Z',
});

assert.deepEqual(Core.normalizeEnvelope(null), { schemaVersion: 1, profiles: {} });
assert.deepEqual(Core.normalizeEnvelope({ schemaVersion: 7, profiles: [] }), { schemaVersion: 1, profiles: {} });

const unit = Core.createUnitState(['a1', 'a2']);
assert.deepEqual(unit.activityOrder, ['a1', 'a2']);
assert.equal(unit.activeActivityId, 'a1');
assert.deepEqual(unit.attempts, {});

const drafted = Core.saveDraft(unit, 'a1', 'My unfinished answer', '2026-07-15T00:00:00.000Z');
assert.equal(drafted.drafts.a1, 'My unfinished answer');
assert.deepEqual(unit.drafts, {}, 'saveDraft must not mutate prior state');

const first = Core.recordAttempt(unit, 'a1', false, '2026-07-15T00:00:00.000Z');
assert.equal(first.attempts.a1, 1);
assert.equal(first.hintLevel.a1, 0);
assert.deepEqual(unit.attempts, {}, 'recordAttempt must not mutate prior state');

const second = Core.recordAttempt(first, 'a1', false, '2026-07-15T00:00:01.000Z');
assert.equal(second.attempts.a1, 2);
assert.equal(second.hintLevel.a1, 1);

const third = Core.recordAttempt(second, 'a1', false, '2026-07-15T00:00:02.000Z');
assert.equal(third.attempts.a1, 3);
assert.equal(third.hintLevel.a1, 2);

const fourth = Core.recordAttempt(third, 'a1', false, '2026-07-15T00:00:03.000Z');
assert.equal(fourth.hintLevel.a1, 2, 'hint level must remain clamped');

const helped = Core.requestHelp(fourth, 'a1', '2026-07-15T00:00:04.000Z');
const helpedTwice = Core.requestHelp(helped, 'a1', '2026-07-15T00:00:05.000Z');
assert.deepEqual(helpedTwice.helpRequests, ['a1']);

const finished = Core.completeActivity(
  helpedTwice,
  'a1',
  { status: 'completed', response: 'milk' },
  '2026-07-15T00:00:06.000Z',
);
assert.equal(finished.activeActivityId, 'a2');
assert.equal(finished.results.a1.response, 'milk');
assert.equal(helpedTwice.results.a1, undefined, 'completeActivity must not mutate prior state');

const local = {
  schemaVersion: 1,
  profiles: {
    p1: { updatedAt: '2026-07-15T00:00:05.000Z', state: finished },
  },
};
const remote = {
  schemaVersion: 1,
  profiles: {
    p1: { updatedAt: '2026-07-15T00:00:01.000Z', state: unit },
    p2: { updatedAt: '2026-07-15T00:00:06.000Z', state: unit },
  },
};
const merged = Core.mergeEnvelopes(local, remote);
assert.equal(merged.profiles.p1.updatedAt, '2026-07-15T00:00:05.000Z');
assert.ok(merged.profiles.p2);
assert.notStrictEqual(merged.profiles, local.profiles);

const summary = Core.buildSummary(finished);
assert.equal(summary.completed, 1);
assert.equal(summary.total, 2);
assert.deepEqual(summary.helpRequests, ['a1']);
assert.deepEqual(summary.repeatedErrors, ['a1']);
assert.deepEqual(summary.hintsUsed, ['a1']);
assert.equal(summary.resumeActivityId, 'a2');

assert.equal(Core.profileKey(), 'kssr-classroom-profiles:v1');
assert.equal(
  Core.unitKey('kssr-p3-en-unit6', 'p1'),
  'kssr-unit-progress:kssr-p3-en-unit6:p1:v1',
);
assert.equal(Core.evaluateResponse({ kind: 'choice', answer: 'b' }, 'b').correct, true);
assert.equal(
  Core.evaluateResponse({ kind: 'text', acceptedAnswers: ['there is'] }, ' There   is ').correct,
  true,
);
assert.equal(
  Core.evaluateResponse({ kind: 'multi', answer: ['dairy', 'protein'] }, ['protein', 'dairy']).correct,
  true,
);
assert.equal(
  Core.evaluateResponse({ marking: 'teacher_review' }, 'My paragraph').status,
  'teacher_review',
);
assert.equal(Core.evaluateResponse({ marking: 'guided' }, 'First draft').status, 'guided');

console.log('PASS verify_kssr_classroom_core');
