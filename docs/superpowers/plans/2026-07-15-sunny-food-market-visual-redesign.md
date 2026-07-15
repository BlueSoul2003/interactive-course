# Sunny Food Market Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add safe Emoji-first learning visuals and a collapsed settings panel to KSSR Primary 3 English Unit 6 without leaking answers.

**Architecture:** Keep the change local to the existing standalone Unit 6 HTML page and use its shared classroom runtime for student state, sound, and checking. Add one focused Node verification script that treats visual-answer leakage and the collapsed controls as content contracts, then include it in the existing KSSR redesign verification command.

**Tech Stack:** Static HTML/CSS, existing vanilla JavaScript classroom runtime, Node.js `assert`, npm scripts

## Global Constraints

- Scope is `content/KSSR_Syllabus/Primary3/English/Unit6/index.html` only for production UI changes.
- Approved visual direction is Emoji-first, cute, and simple.
- Every `data-choice` answer remains text-only.
- Emoji may be question-source information, neutral support, or after-answer reinforcement only.
- The settings disclosure is closed on first load.
- No new runtime dependency or remote image request is introduced.
- Preserve the existing bilingual English/Simplified Chinese copy style.
- Preserve shared-iPad profiles, progress persistence, sound feedback, and teacher hold.

---

### Task 1: Encode the visual-safety contract

**Files:**
- Create: `tools/verify_kssr_sunny_food_market.js`
- Modify: `package.json`
- Test: `tools/verify_kssr_sunny_food_market.js`

**Interfaces:**
- Consumes: Unit 6 HTML and its semantic `data-*` attributes.
- Produces: `npm run verify:sunny-food-market`, returning exit code 0 only when the accepted settings and visual-evidence rules are present.

- [ ] **Step 1: Write the failing verification script**

```js
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'content', 'KSSR_Syllabus', 'Primary3', 'English', 'Unit6', 'index.html');
const html = fs.readFileSync(file, 'utf8');
const emoji = /\p{Extended_Pictographic}/u;

assert.match(html, /<details class="settings-menu">/);
assert.doesNotMatch(html, /<details class="settings-menu"[^>]*\sopen(?:\s|>)/);
assert.match(html, /class="settings-panel"/);
for (const action of ['mute', 'previous', 'switch-profile', 'reset-view']) {
  assert.match(html, new RegExp(`class="settings-panel"[\\s\\S]*data-action="${action}"`));
}
assert.match(html, /class="settings-panel"[\s\S]*data-tutor-hold/);

for (const match of html.matchAll(/<button\b[^>]*\bdata-choice\b[^>]*>([\s\S]*?)<\/button>/g)) {
  const label = match[1].replace(/<[^>]+>/g, '');
  assert.equal(emoji.test(label), false, `Answer choice contains an emoji: ${label.trim()}`);
}

assert.match(html, /data-visual-role="question-source"[^>]*aria-label="one apple"/);
assert.match(html, /data-visual-role="question-source"[^>]*aria-label="oranges in one basket"/);
assert.match(html, /data-visual-role="question-source"[^>]*aria-label="three bowls"/);
assert.doesNotMatch(html, /R I C E|B R E A D|C H I C K E N|placeholder="rice,/);

const streetFood = html.match(/<article[^>]*data-activity-id="unit-6-p049-01"[\s\S]*?<\/article>/)?.[0] || '';
const beforeFeedback = streetFood.split('<div data-feedback')[0];
assert.equal(beforeFeedback.includes('🍢'), false, 'Satay emoji appears before the answer is checked');
assert.match(html, /\.question-card\[data-question-type="street_food_matching"\]\s+\[data-feedback\]\[data-type="success"\]::before/);

console.log('Sunny Food Market visual-safety checks passed.');
```

- [ ] **Step 2: Add the package command**

```json
"verify:sunny-food-market": "node tools/verify_kssr_sunny_food_market.js"
```

Append `&& npm run verify:sunny-food-market` to `verify:kssr-redesign` so the contract runs with the existing suite.

- [ ] **Step 3: Run the test and verify RED**

Run: `npm run verify:sunny-food-market`
Expected: FAIL because Unit 6 has no collapsed `settings-menu` yet.

### Task 2: Add safe learning visuals and collapsed settings

**Files:**
- Modify: `content/KSSR_Syllabus/Primary3/English/Unit6/index.html`
- Test: `tools/verify_kssr_sunny_food_market.js`

**Interfaces:**
- Consumes: Existing `KssrClassroomRuntime` actions and feedback `data-type` values.
- Produces: `.settings-menu`, `.settings-panel`, `[data-visual-role="question-source"]`, and success-only CSS emoji reinforcement.

- [ ] **Step 1: Replace the expanded toolbar with a disclosure**

```html
<nav class="classroom-toolbar market-toolbar" aria-label="Lesson controls">
  <a class="toolbar-button" data-home-link href="../../../../../index.html">Home / 主页</a>
  <div class="toolbar-status">
    <span class="active-profile">Shopper: <b data-active-profile>Student</b></span>
    <div class="lesson-progress">...</div>
    <span class="sync-status" data-sync-status>Saved on iPad</span>
  </div>
  <details class="settings-menu">
    <summary>⚙ Settings / 设置</summary>
    <div class="settings-panel">
      <button type="button" data-action="mute">Sound on / 声音</button>
      <button type="button" data-action="previous">Back / 上一题</button>
      <button type="button" data-action="switch-profile">Switch / 换学生</button>
      <button type="button" data-action="reset-view">Reset view / 重置</button>
      <button type="button" class="tutor-hold" data-tutor-hold>Hold for teacher / 老师长按</button>
    </div>
  </details>
</nav>
```

- [ ] **Step 2: Add scoped responsive styles**

Add styles for `.toolbar-status`, `.settings-menu`, `.settings-panel`, `.visual-prompt`, `.picture-targets`, `.letter-blanks`, `.bowl-row`, and success feedback. Use minimum 48-pixel settings targets, an absolute desktop panel, an in-flow tablet panel, and `prefers-reduced-motion` protection.

Use post-answer selectors in this form:

```css
.question-card [data-feedback][data-type="success"]::before { display:inline-grid; }
.question-card[data-question-type="street_food_matching"] [data-feedback][data-type="success"]::before { content:'🍢'; }
```

- [ ] **Step 3: Add question-source visuals without decorating choices**

```html
<div class="visual-prompt" data-visual-role="question-source" role="img" aria-label="one apple">
  <span aria-hidden="true">🍎</span>
</div>
```

Use the same semantic pattern for the oranges and three bowls. Convert the spelling answer tiles to picture targets with blank letter counts. Use neutral `📖`, `❓`, and `✍️` task markers only where they do not identify an answer.

- [ ] **Step 4: Run the focused verification and verify GREEN**

Run: `npm run verify:sunny-food-market`
Expected: `Sunny Food Market visual-safety checks passed.`

- [ ] **Step 5: Run the full KSSR regression suite**

Run: `npm run verify:kssr-redesign`
Expected: all classroom-core, auth, protected-unit, redesign, and Sunny Food Market checks pass with exit code 0.

### Task 3: Verify the iPad experience and publish

**Files:**
- Review: `content/KSSR_Syllabus/Primary3/English/Unit6/index.html`
- Review: `tools/verify_kssr_sunny_food_market.js`
- Review: `package.json`

**Interfaces:**
- Consumes: The completed Unit 6 page and focused verification command.
- Produces: A pushed `codex/sunny-food-market-visuals` branch ready for GitHub review.

- [ ] **Step 1: Run static and syntax checks**

Run: `node --check tools/verify_kssr_sunny_food_market.js`
Expected: exit code 0.

Run: `npm run verify:kssr-redesign`
Expected: exit code 0 with no failed checks.

- [ ] **Step 2: Inspect the rendered page**

Serve the repository locally and inspect Unit 6 at tablet and phone widths. Confirm the settings panel starts closed, opens and closes with touch/keyboard, contains all controls, does not overflow, and the current question remains readable. Confirm every pre-answer emoji follows the question-source or neutral-support rule.

- [ ] **Step 3: Review the exact diff**

Run: `git diff --check` and `git diff --stat`
Expected: no whitespace errors and only the approved Unit 6, verification, package, and documentation files are changed.

- [ ] **Step 4: Commit implementation intentionally**

```bash
git add content/KSSR_Syllabus/Primary3/English/Unit6/index.html tools/verify_kssr_sunny_food_market.js package.json docs/superpowers/specs/2026-07-15-sunny-food-market-visual-redesign.md docs/superpowers/plans/2026-07-15-sunny-food-market-visual-redesign.md
git commit -m "Redesign Sunny Food Market visuals"
```

- [ ] **Step 5: Push the feature branch**

Run: `git push -u origin codex/sunny-food-market-visuals`
Expected: the remote branch is created and tracks `origin/codex/sunny-food-market-visuals`.

## Self-review

- Spec coverage: Every visual-evidence rule, activity treatment, collapsed setting, feedback, accessibility, and verification requirement maps to Task 1 or Task 2; publish verification maps to Task 3.
- Placeholder scan: Every step contains the exact command, markup, or selector needed for execution; no unresolved placeholders remain.
- Interface consistency: The verification script expects the same `.settings-menu`, `.settings-panel`, `data-visual-role`, `data-question-type`, and `data-feedback` names produced by Task 2.
