# KSSR Primary English New Unit Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the nine batch-generated KSSR Primary English workbook pages with content-specific, bilingual, student-led 30-minute learning experiences that safely separate two pupils' progress on one shared iPad.

**Architecture:** Keep the nine unit pages as handcrafted static HTML with unit-owned composition and visual language. Share only a small UMD-style state core and browser runtime for two-profile persistence, local/cloud merge, audio, safe navigation, retries, and tutor summaries; enhance semantic activity markup instead of generating all pages from one visual template.

**Tech Stack:** Static HTML5, CSS, vanilla JavaScript, Web Audio API, browser Speech Synthesis, localStorage, existing Supabase `ProgressTracker`, Node.js `assert` verification scripts, Acorn JavaScript parsing, existing navigation/auth scripts.

## Global Constraints

- Redesign only Primary 3 Unit 6–10 and Primary 6 Unit 7–10.
- Primary 3 Unit 1–5 and Primary 6 Unit 1–6 must remain byte-for-byte unchanged.
- Use `_drafts/kssr_english_workbooks/primary3/workbook.json` and `_drafts/kssr_english_workbooks/primary6/workbook.json` as the content sources; do not re-audit the PDFs.
- Retain `sourcePage`, `itemId`, and `questionType` traceability for every transformed activity.
- English is visually primary; Chinese instructions and hints are collapsed until requested.
- Each unit must have a distinct content-led world, composition, activity language, and completion treatment; shared code must not become a visual page generator.
- One main task appears at a time, with no raw OCR blobs, dummy controls, false automatic marking, dead ends, or answer leakage before submission.
- Two local classroom profiles share one admin account without progress crossover.
- Local saves happen immediately; cloud saves merge a versioned two-profile envelope through the existing `ProgressTracker` row.
- Audio never autoplays, starts quiet, persists mute state, and has complete visual/text fallbacks.
- iPad interactions resist double-tap zoom, pinch mistakes, repeated submissions, accidental Home navigation, and accidental teacher-setting access.
- Touch targets are at least 48 by 48 CSS pixels, text meets WCAG AA contrast, color is not the sole state indicator, and reduced motion remains fully usable.
- No new framework, database schema, student accounts, global admin dashboard, background music, microphone recording, leaderboard, or reward economy.

---

## File Structure

### Create

- `js/kssr-classroom-core.js` — pure profile, envelope merge, attempt, state, and summary functions usable from Node and the browser.
- `js/kssr-classroom-runtime.js` — DOM enhancement, localStorage, ProgressTracker adapter, audio/speech, safe navigation, and profile/tutor UI.
- `content/KSSR_Syllabus/shared/kssr-classroom.css` — shared accessibility, touch sizing, profile chooser, mission chrome, feedback, and reduced-motion rules only.
- `tools/fixtures/kssr-protected-unit-hashes.json` — immutable baseline hashes for the eleven protected pages.
- `tools/verify_kssr_protected_units.js` — checks protected hashes.
- `tools/verify_kssr_classroom_core.js` — behavior tests for pure state and merge functions.
- `tools/verify_kssr_unit_redesign.js` — static structure, content mapping, answer policy, unique-world, script-order, and syntax checks for nine redesigned pages.

### Replace

- `content/KSSR_Syllabus/Primary3/English/Unit6/index.html`
- `content/KSSR_Syllabus/Primary3/English/Unit7/index.html`
- `content/KSSR_Syllabus/Primary3/English/Unit8/index.html`
- `content/KSSR_Syllabus/Primary3/English/Unit9/index.html`
- `content/KSSR_Syllabus/Primary3/English/Unit10/index.html`
- `content/KSSR_Syllabus/Primary6/English/Unit7/index.html`
- `content/KSSR_Syllabus/Primary6/English/Unit8/index.html`
- `content/KSSR_Syllabus/Primary6/English/Unit9/index.html`
- `content/KSSR_Syllabus/Primary6/English/Unit10/index.html`

### Modify

- `tools/verify_kssr_workbook_pages.js` — accept redesigned semantic activity markup while retaining the live totals of 40 Primary 3 and 36 Primary 6 source activities.
- `package.json` — add `verify:kssr-redesign` without changing existing scripts.

---

### Task 1: Lock Protected Units With Hash Verification

**Files:**
- Create: `tools/fixtures/kssr-protected-unit-hashes.json`
- Create: `tools/verify_kssr_protected_units.js`
- Modify: `package.json`

**Interfaces:**
- Consumes: repository-relative protected HTML paths and expected SHA-256 values.
- Produces: `verifyProtectedUnits(root = repoRoot): { fileCount: number }` and the `npm run verify:kssr-protected` command.

- [ ] **Step 1: Write the failing protected-unit verifier**

Create `tools/verify_kssr_protected_units.js` with a CommonJS export. It must load `tools/fixtures/kssr-protected-unit-hashes.json`, hash each file using `crypto.createHash('sha256')`, collect missing or mismatched paths, throw one aggregate error, and print `PASS verify_kssr_protected_units files=11` from `main()`.

```js
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function verifyProtectedUnits(root = path.resolve(__dirname, '..')) {
  const manifest = require('./fixtures/kssr-protected-unit-hashes.json');
  const errors = [];
  for (const [relative, expected] of Object.entries(manifest)) {
    const file = path.join(root, ...relative.split('/'));
    if (!fs.existsSync(file)) errors.push(`${relative}: missing`);
    else if (sha256(file) !== expected) errors.push(`${relative}: changed`);
  }
  if (errors.length) throw new Error(errors.join('\n'));
  return { fileCount: Object.keys(manifest).length };
}

if (require.main === module) {
  const result = verifyProtectedUnits();
  console.log(`PASS verify_kssr_protected_units files=${result.fileCount}`);
}

module.exports = { sha256, verifyProtectedUnits };
```

- [ ] **Step 2: Run it and confirm the RED state**

Run: `node tools/verify_kssr_protected_units.js`
Expected: FAIL because `tools/fixtures/kssr-protected-unit-hashes.json` does not exist.

- [ ] **Step 3: Add the exact baseline manifest**

Create `tools/fixtures/kssr-protected-unit-hashes.json` with these eleven entries:

```json
{
  "content/KSSR_Syllabus/Primary3/English/Unit1/index.html": "d3fcdd267d0ffc54492b029571a068611e5797e9842a90daf5fb3688213d5608",
  "content/KSSR_Syllabus/Primary3/English/Unit2/index.html": "ff05c41efb2c956a556a297aa5813b339256bbe0ddf1c01a16a65a72c1071f65",
  "content/KSSR_Syllabus/Primary3/English/Unit3/index.html": "b9e8f1413bc5755e6d864b2a4e02b42d11cd002eacc1ea419fd1f39f1ae6154f",
  "content/KSSR_Syllabus/Primary3/English/Unit4/index.html": "0e2d7821dba13027ccba844ed3f26c073242321e4bb5095940c968656c0dfd6e",
  "content/KSSR_Syllabus/Primary3/English/Unit5/index.html": "db09daf6674fa2225f77b253c6862c17f4f227d519e66094f379842a41b7c8f1",
  "content/KSSR_Syllabus/Primary6/English/Unit1/index.html": "55be89e851e3937c833a513fec54ea1b05ad971d6e719aa7ffe56a91ffc8b0ba",
  "content/KSSR_Syllabus/Primary6/English/Unit2/index.html": "aef6b6e8f4b91fcca23980b1a0774736b117b6087fe79d403983d7b8bdb71633",
  "content/KSSR_Syllabus/Primary6/English/Unit3/index.html": "ed5f3c66edbcf6ed91e94437e7a3658c62353d40d0f9601ed1fbd7e61146e9e3",
  "content/KSSR_Syllabus/Primary6/English/Unit4/index.html": "68efa849035fbf7a69b7d649677fbe8df9f123e9831a77b8204dd7f93413c9d2",
  "content/KSSR_Syllabus/Primary6/English/Unit5/index.html": "b8d196f2c8a571ad5bbe53affc96ad6b477f0bd6b3635ea0b788164c827387b8",
  "content/KSSR_Syllabus/Primary6/English/Unit6/index.html": "a611d0560df51b8f6802e39a0b546127d7f7e33b774e79cfb02181e204e317dc"
}
```

Add to `package.json`:

```json
"verify:kssr-protected": "node tools/verify_kssr_protected_units.js"
```

- [ ] **Step 4: Run the GREEN verification**

Run: `npm run verify:kssr-protected`
Expected: `PASS verify_kssr_protected_units files=11`.

- [ ] **Step 5: Commit the regression guard**

```powershell
git add package.json tools/fixtures/kssr-protected-unit-hashes.json tools/verify_kssr_protected_units.js
git commit -m "test: protect existing KSSR English units"
```

---

### Task 2: Build the Pure Classroom State Core With TDD

**Files:**
- Create: `js/kssr-classroom-core.js`
- Create: `tools/verify_kssr_classroom_core.js`

**Interfaces:**
- Produces `KssrClassroomCore` in the browser and `module.exports` in Node.
- Exact exports: `SCHEMA_VERSION`, `createProfile`, `normalizeEnvelope`, `mergeEnvelopes`, `createUnitState`, `recordAttempt`, `completeActivity`, `requestHelp`, `buildSummary`.

- [ ] **Step 1: Write failing behavior tests**

Create `tools/verify_kssr_classroom_core.js` using Node `assert`. Tests must cover these exact behaviors:

```js
const assert = require('assert');
const Core = require('../js/kssr-classroom-core');

assert.equal(Core.SCHEMA_VERSION, 1);

const unit = Core.createUnitState(['a1', 'a2']);
assert.deepEqual(unit.activityOrder, ['a1', 'a2']);
assert.equal(unit.activeActivityId, 'a1');

const first = Core.recordAttempt(unit, 'a1', false, '2026-07-15T00:00:00.000Z');
assert.equal(first.attempts.a1, 1);
assert.equal(first.hintLevel.a1, 0);
const second = Core.recordAttempt(first, 'a1', false, '2026-07-15T00:00:01.000Z');
assert.equal(second.hintLevel.a1, 1);
const third = Core.recordAttempt(second, 'a1', false, '2026-07-15T00:00:02.000Z');
assert.equal(third.hintLevel.a1, 2);

const helped = Core.requestHelp(third, 'a1', '2026-07-15T00:00:03.000Z');
assert.deepEqual(helped.helpRequests, ['a1']);

const finished = Core.completeActivity(helped, 'a1', { status: 'completed', response: 'milk' }, '2026-07-15T00:00:04.000Z');
assert.equal(finished.activeActivityId, 'a2');
assert.equal(finished.results.a1.response, 'milk');

const local = { schemaVersion: 1, profiles: { p1: { updatedAt: '2026-07-15T00:00:05.000Z', state: finished } } };
const remote = { schemaVersion: 1, profiles: { p1: { updatedAt: '2026-07-15T00:00:01.000Z', state: unit }, p2: { updatedAt: '2026-07-15T00:00:06.000Z', state: unit } } };
const merged = Core.mergeEnvelopes(local, remote);
assert.equal(merged.profiles.p1.updatedAt, '2026-07-15T00:00:05.000Z');
assert.ok(merged.profiles.p2);

const summary = Core.buildSummary(finished);
assert.equal(summary.completed, 1);
assert.equal(summary.total, 2);
assert.deepEqual(summary.helpRequests, ['a1']);

console.log('PASS verify_kssr_classroom_core');
```

- [ ] **Step 2: Run tests and confirm RED**

Run: `node tools/verify_kssr_classroom_core.js`
Expected: FAIL with `Cannot find module '../js/kssr-classroom-core'`.

- [ ] **Step 3: Implement the minimal immutable state core**

Create a UMD wrapper in `js/kssr-classroom-core.js`. Every state transition must return a new object, clamp hint levels to `0`, `1`, or `2`, deduplicate help requests, advance only after completion, normalize malformed envelopes to `{ schemaVersion: 1, profiles: {} }`, and merge each profile by ISO `updatedAt`.

```js
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.KssrClassroomCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const SCHEMA_VERSION = 1;
  // Implement the nine exported functions named in Interfaces.
  return { SCHEMA_VERSION, createProfile, normalizeEnvelope, mergeEnvelopes, createUnitState, recordAttempt, completeActivity, requestHelp, buildSummary };
});
```

- [ ] **Step 4: Run tests and confirm GREEN**

Run: `node tools/verify_kssr_classroom_core.js`
Expected: `PASS verify_kssr_classroom_core`.

- [ ] **Step 5: Commit the state core**

```powershell
git add js/kssr-classroom-core.js tools/verify_kssr_classroom_core.js
git commit -m "feat: add shared iPad classroom state core"
```

---

### Task 3: Add the Browser Runtime and Shared Safety CSS

**Files:**
- Create: `js/kssr-classroom-runtime.js`
- Create: `content/KSSR_Syllabus/shared/kssr-classroom.css`
- Modify: `tools/verify_kssr_classroom_core.js`

**Interfaces:**
- Consumes: `window.KssrClassroomCore`, `window.ProgressTracker`, semantic unit markup, and `window.KSSR_UNIT_CONFIG`.
- Produces: `window.KssrClassroomRuntime.start(config)` and runtime events `kssr:profile-changed`, `kssr:activity-completed`, `kssr:summary-opened`.
- Config shape: `{ moduleId, unitTitle, world, activities: [{ id, sourcePage, itemId, questionType, marking, kind, answer, acceptedAnswers, hints: { en, zh } }] }`.

- [ ] **Step 1: Extend tests for storage-key and answer evaluation helpers**

Add tests before runtime implementation for pure exports hosted by the core:

```js
assert.equal(Core.profileKey(), 'kssr-classroom-profiles:v1');
assert.equal(Core.unitKey('kssr-p3-en-unit6', 'p1'), 'kssr-unit-progress:kssr-p3-en-unit6:p1:v1');
assert.equal(Core.evaluateResponse({ kind: 'choice', answer: 'b' }, 'b').correct, true);
assert.equal(Core.evaluateResponse({ kind: 'text', acceptedAnswers: ['there is'] }, ' There is ').correct, true);
assert.equal(Core.evaluateResponse({ marking: 'teacher_review' }, 'My paragraph').status, 'teacher_review');
```

- [ ] **Step 2: Run tests and confirm RED**

Run: `node tools/verify_kssr_classroom_core.js`
Expected: FAIL because `profileKey`, `unitKey`, and `evaluateResponse` do not exist.

- [ ] **Step 3: Implement helpers, runtime, and shared CSS**

Add the three pure helpers to the core export. Implement `js/kssr-classroom-runtime.js` with these responsibilities:

- initialize two default profiles and the profile chooser;
- save locally on input, submission, navigation, profile switch, `pagehide`, and `visibilitychange`;
- load remote progress once, merge per profile by `updatedAt`, render the selected profile, and upload the merged envelope through `ProgressTracker.save`;
- show one `.question-card` at a time and update `#progressBar` and `#progressStatus`;
- reveal English/Chinese hint level 1 on attempt 2 and scaffold level 2 on attempt 3;
- record Help and allow Skip for now;
- evaluate only `objective` activities, while `guided` and `teacher_review` use completion checklists;
- synthesize English only after a `.speak-btn` click;
- use Web Audio for four short cues only after a user gesture;
- remember mute under `kssr-classroom-muted:v1`;
- prevent duplicate actions with a per-action lock;
- prevent double-tap/pinch mistakes inside `[data-classroom-app]` while retaining scrolling and form input;
- require confirmation for Home/profile switch and a 1.5-second hold for tutor settings;
- render the one-minute summary from `Core.buildSummary`.

Create shared CSS limited to stable chrome and safety primitives: `.profile-gate`, `.profile-card`, `.classroom-toolbar`, `.mission-progress`, `.question-card[hidden]`, `.bilingual-help`, `.feedback`, `.teacher-summary`, `.safe-action`, focus-visible styling, 48-pixel touch minimums, and reduced-motion behavior. Unit colors, hero layouts, artwork, activity layouts, and rewards must remain in each unit page.

- [ ] **Step 4: Run core tests and syntax checks**

Run:

```powershell
node tools/verify_kssr_classroom_core.js
node --check js/kssr-classroom-runtime.js
```

Expected: core PASS and runtime syntax exit code `0`.

- [ ] **Step 5: Commit shared classroom behavior**

```powershell
git add js/kssr-classroom-core.js js/kssr-classroom-runtime.js content/KSSR_Syllabus/shared/kssr-classroom.css tools/verify_kssr_classroom_core.js
git commit -m "feat: add kid-safe KSSR classroom runtime"
```

---

### Task 4: Write the Redesign Contract Before Replacing Pages

**Files:**
- Create: `tools/verify_kssr_unit_redesign.js`
- Modify: `tools/verify_kssr_workbook_pages.js`
- Modify: `package.json`

**Interfaces:**
- Consumes: nine live target pages and their inline `KSSR_UNIT_CONFIG`.
- Produces: `verifyRedesign(root = repoRoot)` plus `npm run verify:kssr-redesign`.

- [ ] **Step 1: Create a failing static verifier**

Define an exact manifest for the nine pages:

```js
const TARGETS = [
  { grade: 3, unit: 6, world: 'food-market', pages: [43,44,45,46,47,48,49,50], tokens: ['food groups','some','there are','street food','comma'] },
  { grade: 3, unit: 7, world: 'safe-town', pages: [51,52,53,54,55,56,57,58], tokens: ['sign','road safety','quarter','plural','there are'] },
  { grade: 3, unit: 8, world: 'time-travel-town', pages: [59,60,61,62,63,64,65,66], tokens: ['postcard','simple past','was','were','opposite'] },
  { grade: 3, unit: 9, world: 'holiday-explorer', pages: [67,68,69,70,71,72,73,74], tokens: ['holiday','trip essentials','simple past','but','beach'] },
  { grade: 3, unit: 10, world: 'space-observatory', pages: [75,76,77,78,79,80,81,82], tokens: ['solar system','planet','comparative','superlative','animal'] },
  { grade: 6, unit: 7, world: 'music-studio', pages: [55,56,57,58,59,60,61,62,63], tokens: ['music genre','instrument','idiom','going to','prefix'] },
  { grade: 6, unit: 8, world: 'story-library', pages: [64,65,66,67,68,69,70,71,72], tokens: ['rose','book genre','first conditional','email','golden apple'] },
  { grade: 6, unit: 9, world: 'debate-club', pages: [73,74,75,76,77,78,79,80,81], tokens: ['fact','opinion','reported speech','for','against'] },
  { grade: 6, unit: 10, world: 'detective-bureau', pages: [82,83,84,85,86,87,88,89,90], tokens: ['crime','clue','question tag','idiom','play script','escape room'] }
];
```

For each target, assert:

- one canonical module ID and module URL;
- `data-world` equals the manifest world;
- exactly one `.question-card` for every expected source page, with unique `data-question-id`, `data-source-page`, `data-question-type`, `data-marking`, and `data-activity-id`;
- every required content token appears case-insensitively;
- `KSSR_UNIT_CONFIG`, `KssrClassroomRuntime.start`, core/runtime/shared CSS, navigation, Supabase, auth, and progress scripts appear in safe order;
- profile gate, mute, Help, Chinese help, Previous, Continue, Home confirmation, tutor hold, progress, summary, and reset-view hooks exist;
- forbidden copy does not appear: `OCR-derived`, `Source page`, `workbook draft`, `Read the source text`, or common unfinished-work markers; construct marker constants from split string fragments inside the verifier so the plan and production pages never contain those markers verbatim;
- objective cards expose a non-empty answer contract; guided/teacher-review cards expose a checklist or scaffold;
- scripts parse with Acorn and no duplicate HTML IDs exist;
- nine `data-world` values are unique.

Implement optional CLI filters `--grade 3|6` and `--units 6,7,8` so each unit batch can run RED/GREEN independently. With no filters, verify all nine targets. The required page script order is `navigation.js`, Supabase CDN, `auth-access.js`, `progress-tracker.js` with its canonical data attributes, `kssr-classroom-core.js`, `kssr-classroom-runtime.js`, unit config, then `KssrClassroomRuntime.start(window.KSSR_UNIT_CONFIG)`.

- [ ] **Step 2: Run the verifier and confirm RED**

Run: `node tools/verify_kssr_unit_redesign.js`
Expected: FAIL on all nine existing batch-generated pages.

- [ ] **Step 3: Update the legacy workbook verifier contract**

Keep the existing live totals at 40 and 36. Allow either legacy `.question-card[data-question-id]` or redesigned `.question-card[data-activity-id]`, but require both metadata sets on redesigned targets. Do not relax module ID, navigation, duplicate ID, reduced motion, or source-page checks.

Add scripts:

```json
"verify:kssr-redesign": "node tools/verify_kssr_classroom_core.js && node tools/verify_kssr_protected_units.js && node tools/verify_kssr_unit_redesign.js",
"verify:kssr-workbooks": "python tools/verify_kssr_workbook_json.py _drafts/kssr_english_workbooks/primary3/workbook.json _drafts/kssr_english_workbooks/primary6/workbook.json && node tools/verify_kssr_workbook_pages.js"
```

- [ ] **Step 4: Confirm RED still describes missing implementation**

Run: `npm run verify:kssr-redesign`
Expected: core and protected checks pass; redesign verifier fails only on target-page requirements.

- [ ] **Step 5: Commit the test contract**

```powershell
git add package.json tools/verify_kssr_unit_redesign.js tools/verify_kssr_workbook_pages.js
git commit -m "test: define KSSR unit redesign contract"
```

---

### Task 5: Redesign Primary 3 Units 6–8

**Files:**
- Replace: `content/KSSR_Syllabus/Primary3/English/Unit6/index.html`
- Replace: `content/KSSR_Syllabus/Primary3/English/Unit7/index.html`
- Replace: `content/KSSR_Syllabus/Primary3/English/Unit8/index.html`

**Interfaces:**
- Consumes: shared CSS/core/runtime and workbook items `unit-6-p043-01` through `unit-8-p066-01`.
- Produces: three complete `KSSR_UNIT_CONFIG` objects and 24 semantic activity cards.

- [ ] **Step 1: Implement Unit 6 Food Market Adventure**

Use `data-world="food-market"`, warm cream/tomato/leaf colors, awning shapes, basket progress, and these eight source-bound activities:

| Page | Item ID | Activity | Marking |
|---|---|---|---|
| 43 | `unit-6-p043-01` | Read three food-group cards and match statements to dairy, fruit/vegetables, or protein | objective |
| 44 | `unit-6-p044-01` | Identify correctly spelt food names on a market path | guided |
| 45 | `unit-6-p045-01` | Build `some`/`there is`/`there are` food-location sentences | objective |
| 46 | `unit-6-p046-01` | Sort dishes into soup, local meal, fast food, or dessert groups | objective |
| 47 | `unit-6-p047-01` | Repair the upside-down/unclear restaurant passage using a bilingual scaffold | guided |
| 48 | `unit-6-p048-01` | Answer grid questions with `Yes, there is/are` and `No, there isn't/aren't` | objective |
| 49 | `unit-6-p049-01` | Compare three street-food text cards | objective |
| 50 | `unit-6-p050-01` | Rewrite lists using commas and `and` | guided |

Unit 6 must not reuse a generic card grid as its hero; the market counter and basket progress are its main composition.

- [ ] **Step 2: Implement Unit 7 Safe Town Rangers**

Use `data-world="safe-town"`, blue/yellow road colors, a route-map layout, road/pool/classroom sign illustrations made with CSS/SVG, and these activities:

| Page | Item ID | Activity | Marking |
|---|---|---|---|
| 51 | `unit-7-p051-01` | Replace pictorial route signs with words and reconstruct the route | guided |
| 52 | `unit-7-p052-01` | Interpret six public-rule signs | objective |
| 53 | `unit-7-p053-01` | Sort rules by classroom, street, pool, and library | objective |
| 54 | `unit-7-p054-01` | Reorder road-safety words and restore capitalization/full stops | guided |
| 55 | `unit-7-p055-01` | Construct time-and-location sentences | guided |
| 56 | `unit-7-p056-01` | Supply irregular and regular animal plurals | objective |
| 57 | `unit-7-p057-01` | Build `There's`/`There are` coordinate sentences | objective |
| 58 | `unit-7-p058-01` | Order six times from morning to afternoon | objective |

- [ ] **Step 3: Implement Unit 8 Time-Travel Town**

Use `data-world="time-travel-town"`, teal/orange past-present split scenes, postcard and portal motifs, and these activities:

| Page | Item ID | Activity | Marking |
|---|---|---|---|
| 59 | `unit-8-p059-01` | Name places from a coordinate map | guided |
| 60 | `unit-8-p060-01` | Read Rosli's postcard and answer comprehension questions | objective |
| 61 | `unit-8-p061-01` | Order the family's Saturday/Sunday places | objective |
| 62 | `unit-8-p062-01` | Write two simple-past sentences per scene | teacher_review |
| 63 | `unit-8-p063-01` | Match past and present objects | objective |
| 64 | `unit-8-p064-01` | Choose `was`, `wasn't`, `were`, or `weren't` | objective |
| 65 | `unit-8-p065-01` | Assemble Linda's visit paragraph | guided |
| 66 | `unit-8-p066-01` | Match adjectives to their opposites in past scenes | objective |

- [ ] **Step 4: Run targeted verification**

Run:

```powershell
node tools/verify_kssr_unit_redesign.js --grade 3 --units 6,7,8
node tools/verify_kssr_workbook_pages.js --scope live
node tools/verify_kssr_protected_units.js
```

Expected: targeted redesign PASS, live workbook still reports 76 total questions, protected PASS.

- [ ] **Step 5: Commit Primary 3 Units 6–8**

```powershell
git add content/KSSR_Syllabus/Primary3/English/Unit6/index.html content/KSSR_Syllabus/Primary3/English/Unit7/index.html content/KSSR_Syllabus/Primary3/English/Unit8/index.html
git commit -m "feat: redesign Primary 3 English units 6 to 8"
```

---

### Task 6: Redesign Primary 3 Units 9–10

**Files:**
- Replace: `content/KSSR_Syllabus/Primary3/English/Unit9/index.html`
- Replace: `content/KSSR_Syllabus/Primary3/English/Unit10/index.html`

**Interfaces:**
- Consumes: shared runtime and workbook items `unit-9-p067-01` through `unit-10-p082-01`.
- Produces: two configs and 16 source-bound activity cards.

- [ ] **Step 1: Implement Unit 9 Holiday Explorer**

Use `data-world="holiday-explorer"`, coral/turquoise travel-map composition, suitcase packing interaction, passport-stamp progress, and page activities 67–74 in this order: Redang reading, activity/location sorting, essentials packing, regular past forms, past-tense winter passage, positive/negative rewriting, `but`/`and` compounds, and Lily's beach-trip sequence. Use objective marking for pages 67, 68, 69, 70, and 74; guided marking for 71–73.

- [ ] **Step 2: Implement Unit 10 Space and Animal Observatory**

Use `data-world="space-observatory"`, a light lavender/ink observatory rather than a dark game screen, orbit progress, and page activities 75–82 in this order: diary reading, planet labels and true/false, adjective-form table, comparative/superlative choices, antonym correction, animal riddles, animal-fact true/false, and comparative animal reports. Use teacher review for the diary response, guided marking for the adjective table/report, and objective marking for the remaining activities.

- [ ] **Step 3: Run targeted verification**

Run:

```powershell
node tools/verify_kssr_unit_redesign.js --grade 3 --units 9,10
node tools/verify_kssr_workbook_pages.js --scope live
node tools/verify_kssr_protected_units.js
```

Expected: targeted redesign PASS, Primary 3 target count remains 40, protected PASS.

- [ ] **Step 4: Commit Primary 3 Units 9–10**

```powershell
git add content/KSSR_Syllabus/Primary3/English/Unit9/index.html content/KSSR_Syllabus/Primary3/English/Unit10/index.html
git commit -m "feat: redesign Primary 3 English units 9 and 10"
```

---

### Task 7: Redesign Primary 6 Units 7–8

**Files:**
- Replace: `content/KSSR_Syllabus/Primary6/English/Unit7/index.html`
- Replace: `content/KSSR_Syllabus/Primary6/English/Unit8/index.html`

**Interfaces:**
- Consumes: shared runtime and workbook items `unit-7-p055-01` through `unit-8-p072-01`.
- Produces: two configs and 18 source-bound activity cards.

- [ ] **Step 1: Implement Unit 7 Music Studio**

Use `data-world="music-studio"`, indigo/coral instrument-rack and mixing-channel composition, and pages 55–63 in order: genre spelling, instrument family brace map, music idioms, `will/going to`, future-picture sentences, `im-/dis-` prefixes, Astro organiser, interests matching, and film-music comprehension. Keep the listening metaphor visual; do not add background music. Mark picture sentences as guided and all reliable choice/matching tasks objective.

- [ ] **Step 2: Implement Unit 8 Story Kingdom Library**

Use `data-world="story-library"`, sage/gold shelves and restored-mural progress, and pages 64–72 in order: Rose and Cactus cloze part one, cloze part two, proverb/open comprehension, genre matching, first conditional, story-planning scaffold, book email, Golden Apple comprehension, and narrator inference. Pages 66, 69, and 70 are teacher-review or guided; the cloze, matching, conditional, and comprehension activities are objective only where choices are explicit.

- [ ] **Step 3: Run targeted verification**

Run:

```powershell
node tools/verify_kssr_unit_redesign.js --grade 6 --units 7,8
node tools/verify_kssr_workbook_pages.js --scope live
node tools/verify_kssr_protected_units.js
```

Expected: targeted redesign PASS and protected PASS.

- [ ] **Step 4: Commit Primary 6 Units 7–8**

```powershell
git add content/KSSR_Syllabus/Primary6/English/Unit7/index.html content/KSSR_Syllabus/Primary6/English/Unit8/index.html
git commit -m "feat: redesign Primary 6 English units 7 and 8"
```

---

### Task 8: Redesign Primary 6 Units 9–10

**Files:**
- Replace: `content/KSSR_Syllabus/Primary6/English/Unit9/index.html`
- Replace: `content/KSSR_Syllabus/Primary6/English/Unit10/index.html`

**Interfaces:**
- Consumes: shared runtime and workbook items `unit-9-p073-01` through `unit-10-p090-01`.
- Produces: two configs and 18 source-bound activity cards.

- [ ] **Step 1: Implement Unit 9 Opinion Debate Club**

Use `data-world="debate-club"`, warm orange/ink speech-stage composition, evidence-board progress, and pages 73–81 in order: fact/opinion pairs, language-function responses, supporting details, reported speech, indefinite pronouns, suffix transformations, rainy-day argument reading, for/against table, and school-start-time email. Pages 73, 74, 80, and 81 use teacher review or guided checklists; grammar and reading items are objective only when the response contract is explicit.

- [ ] **Step 2: Implement Unit 10 Junior Detective Bureau**

Use `data-world="detective-bureau"`, parchment/blue/red case-file composition without frightening imagery, clue-board progress, and pages 82–90 in order: crime vocabulary, school-clue inference, Peterson sequence/case inference, biography reading scaffold, question tags, mystery idioms/modals, `mustn't` school-behaviour sentences, play-script elements, and escape-room invitation email. Pages 84, 85, 88, and 90 use guided or teacher-review modes; explicit vocabulary, idiom, tag, and script matching may be objective.

- [ ] **Step 3: Run targeted verification**

Run:

```powershell
node tools/verify_kssr_unit_redesign.js --grade 6 --units 9,10
node tools/verify_kssr_workbook_pages.js --scope live
node tools/verify_kssr_protected_units.js
```

Expected: targeted redesign PASS, Primary 6 target count remains 36, protected PASS.

- [ ] **Step 4: Commit Primary 6 Units 9–10**

```powershell
git add content/KSSR_Syllabus/Primary6/English/Unit9/index.html content/KSSR_Syllabus/Primary6/English/Unit10/index.html
git commit -m "feat: redesign Primary 6 English units 9 and 10"
```

---

### Task 9: Full Verification and iPad Classroom QA

**Files:**
- Read: all files changed in Tasks 1–8.
- Modify only if verification exposes a defect: target pages, shared runtime/core/CSS, or their verification scripts.

**Interfaces:**
- Produces: fresh command evidence that requirements, regression guards, content mapping, syntax, and navigation all pass.

- [ ] **Step 1: Run all deterministic checks**

Run:

```powershell
npm run verify:kssr-protected
npm run verify:kssr-redesign
npm run verify:kssr-workbooks
npm run verify:navigation
npm run verify:pdf-library
```

Expected: every command exits `0`; redesign reports 9 files and 76 activities; protected reports 11 unchanged files.

- [ ] **Step 2: Start a local static server**

Run: `python -m http.server 4173`
Expected: server listens on `http://localhost:4173` without modifying repository files.

- [ ] **Step 3: Verify representative units in a browser**

Open and test:

- `content/KSSR_Syllabus/Primary3/English/Unit6/index.html`
- `content/KSSR_Syllabus/Primary3/English/Unit10/index.html`
- `content/KSSR_Syllabus/Primary6/English/Unit7/index.html`
- `content/KSSR_Syllabus/Primary6/English/Unit10/index.html`

At 1024×768 landscape, 768×1024 portrait, and 390×844 fallback, confirm profile choice, one-task focus, bilingual help, audio opt-in, retry scaffolds, Help/Skip, profile switching, refresh restoration, Home confirmation, tutor hold, summary, mute persistence, no horizontal overflow, and reduced motion.

- [ ] **Step 4: Exercise shared-iPad failure paths**

For one representative unit:

1. Complete an activity as Student 1.
2. Switch to Student 2 and confirm Student 1's response is absent.
3. Add a Student 2 response, reload, and confirm it restores.
4. Simulate offline mode, complete another response, and confirm local persistence plus pending-sync UI.
5. Restore connectivity and confirm the merged envelope retains both profiles.
6. Fast-tap Check and Continue and confirm no duplicate completion or skipped activity.
7. Attempt double-tap and pinch inside the app and confirm the learning view remains usable.

- [ ] **Step 5: Re-run fresh full verification after any fixes**

Run the five commands from Step 1 again. Do not claim completion from browser observations alone.

- [ ] **Step 6: Commit final verified fixes if any**

```powershell
git add package.json js/kssr-classroom-core.js js/kssr-classroom-runtime.js content/KSSR_Syllabus/shared/kssr-classroom.css content/KSSR_Syllabus/Primary3/English/Unit6/index.html content/KSSR_Syllabus/Primary3/English/Unit7/index.html content/KSSR_Syllabus/Primary3/English/Unit8/index.html content/KSSR_Syllabus/Primary3/English/Unit9/index.html content/KSSR_Syllabus/Primary3/English/Unit10/index.html content/KSSR_Syllabus/Primary6/English/Unit7/index.html content/KSSR_Syllabus/Primary6/English/Unit8/index.html content/KSSR_Syllabus/Primary6/English/Unit9/index.html content/KSSR_Syllabus/Primary6/English/Unit10/index.html tools/fixtures/kssr-protected-unit-hashes.json tools/verify_kssr_protected_units.js tools/verify_kssr_classroom_core.js tools/verify_kssr_unit_redesign.js tools/verify_kssr_workbook_pages.js
git commit -m "fix: verify KSSR shared-iPad learning experience"
```

---

## Self-Review

### Spec coverage

- Exact target/protected scope: Tasks 1 and 4–9.
- Nine distinct worlds and content mappings: Tasks 5–8.
- Thirty-minute one-task journey, hints, Help/Skip, and summary: Tasks 2–3 and every unit task.
- Bilingual on demand and opt-in audio: Tasks 3–8.
- Two profiles under one admin account, local-first save, merge, offline behavior: Tasks 2–3 and Task 9.
- Kid-safe iPad navigation and repeated-tap behavior: Task 3 and Task 9.
- Reliable versus open-response marking: Task 3, Task 4 verifier, and explicit marking tables in Tasks 5–8.
- Source traceability and no raw OCR: Task 4 and each unit activity table.
- Automated and visual verification: Tasks 1–4 and Task 9.

### Placeholder scan

- The plan contains no unfinished placeholder, deferred validation, or unspecified target unit.
- Every target source page has an explicit activity and marking policy.

### Type consistency

- `KssrClassroomCore` export names are identical in Tasks 2–3.
- The cloud envelope uses `schemaVersion`, `profiles`, `updatedAt`, and `state` consistently.
- Runtime config and verifier use `id`, `sourcePage`, `itemId`, `questionType`, `marking`, `kind`, `answer`, `acceptedAnswers`, and `hints` consistently.
- DOM traceability uses `data-activity-id`, `data-question-id`, `data-source-page`, `data-question-type`, and `data-marking` consistently.

## Execution Handoff

This plan is intended for **Inline Execution** in the current session using `executing-plans`, because the user confirmed execution and did not request subagent delegation.
