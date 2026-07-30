# Inbox Organization and Tuition Module Publishing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Organize every new GregOS inbox file, integrate two tuition HTML lessons with navigation and cloud progress, expose both Chemistry PDFs publicly, and deploy the verified result to GitHub Pages.

**Architecture:** Non-course files move directly to their canonical GregOS folders and are indexed by the nearest overview note. Course changes are mirrored into the protected canonical checkout for local organization, while a clean isolated worktree from the latest `origin/main` produces the deployment commit so unrelated dirty and divergent work cannot leak into GitHub Pages.

**Tech Stack:** Markdown/Obsidian, static HTML/CSS/JavaScript, Supabase progress SDK, Node.js verification scripts, Git, GitHub Pages

## Global Constraints

- Preserve the protected path `C:\GregOS\03_Tutoring_Factory\02_Interactive_Course_Project\interactive-course-main`.
- Preserve every pre-existing modified or untracked file in the canonical course checkout.
- Both Chemistry PDFs, including the teacher answer scheme, must be publicly downloadable from GitHub Pages.
- Retain both HTML lessons' existing curriculum, questions, visual identity, and classroom controls.
- Use canonical IDs `spm-chem-ch5-consumer-industrial` and `igcse-y4-sci-command-centre` everywhere.
- Do not execute the archived full registry SQL because it truncates and reseeds shared tables and deletes activation PINs.
- Stage explicit deployment paths only; never use `git add -A` in the dirty canonical checkout.
- Leave only final human lesson-quality review and the safe Supabase registry action to the user.

---

### Task 0: Create a Clean Deployment Worktree

**Files:**
- Create worktree: `C:\GregOS\03_Tutoring_Factory\02_Interactive_Course_Project\interactive-course-main\.worktrees\inbox-course-modules`
- Preserve checkout: `C:\GregOS\03_Tutoring_Factory\02_Interactive_Course_Project\interactive-course-main`

**Interfaces:**
- Consumes: latest `origin/main`
- Produces: clean branch `agent/inbox-course-modules` for all deployable course edits

- [ ] **Step 1: Confirm current repository state**

Run `git status -sb`, record the current `registration` branch and unrelated dirty files, and confirm the repository is already the main checkout rather than a linked worktree.

- [ ] **Step 2: Fetch the deployment base**

Run:

```powershell
git fetch origin main
```

Expected: `origin/main` resolves successfully.

- [ ] **Step 3: Create the isolated worktree**

Run:

```powershell
git worktree add .worktrees/inbox-course-modules -b agent/inbox-course-modules origin/main
```

Expected: the new worktree is clean and its branch points at the current `origin/main`.

- [ ] **Step 4: Establish the mirroring rule**

All GitHub-deployable edits are implemented and tested in the isolated worktree. New course assets are also placed at the same relative paths in the protected canonical checkout so the locally organized GregOS project remains usable. Portal, registry, and README edits are applied as the same narrow patch in both locations; unrelated canonical-checkout differences remain untouched.

### Task 1: Add a Publication Contract Verifier

**Files:**
- Create: `tools/verify_inbox_course_modules.js`
- Create: `tools/verify_navigation_core.js` from the tested `registration` implementation
- Create: `js/navigation.js` after its core test fails on the clean branch
- Modify: `package.json`
- Test: `tools/verify_inbox_course_modules.js`
- Test: `tools/verify_navigation_core.js`

**Interfaces:**
- Consumes: repository root, portal `index.html`, both target module pages, two PDF paths, and `db/archive/modules_registry.sql`
- Produces: exit code `0` with `Inbox course module verification passed.` or a non-zero assertion failure naming the missing contract

- [ ] **Step 1: Write the failing verification script**

Create a Node script that:

```javascript
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
```

Add this script to `package.json`:

```json
"verify:navigation-core": "node tools/verify_navigation_core.js",
"verify:inbox-course-modules": "node tools/verify_inbox_course_modules.js"
```

- [ ] **Step 2: Run the verifier and confirm RED**

Run:

```powershell
npm run verify:inbox-course-modules
```

Expected: failure beginning with `Missing required publication file` because the new module folders do not yet exist.

- [ ] **Step 3: Run the navigation test and confirm RED**

Copy `tools/verify_navigation_core.js` from the tested `registration` checkout, then run:

```powershell
npm run verify:navigation-core
```

Expected: failure because `js/navigation.js` does not exist on the clean `main` branch.

- [ ] **Step 4: Add the shared navigation helper and confirm GREEN**

Copy the reviewed `js/navigation.js` implementation from the `registration` checkout, load `js/navigation.js?v=1.0.0` on the root landing page before `auth-access.js`, and rerun:

```powershell
npm run verify:navigation-core
```

Expected: `Navigation core verification passed.`

- [ ] **Step 5: Commit the verifier and navigation helper in the isolated deployment worktree**

Commit message:

```text
test: define inbox course module publication contract
```

### Task 2: Organize Non-Course Inbox Files and Index Them

**Files:**
- Move: `99_Inbox/AI 聊天收尾Prompt.md` → `_Templates/AI Chat Closing Prompt.md`
- Move: `99_Inbox/AQSolotl Internship RF_Microwave Measurement Preparation.md` → `05_AQSolotl_Internship/learning-notes/RF Microwave Measurement Preparation.md`
- Move: `99_Inbox/Bursa Investment Quiz 2026.md` → `06_Knowledge_Library/Business_and_Finance/Investment_and_Personal_Finance/Bursa Investment Quiz 2026.md`
- Move: `99_Inbox/Cosmos Series 32 - GREGORY HONG SHYANG ZHAO.pdf` → `01_University_Physics_Study/Learning_Portfolio/Certificates/Cosmos of Curiosity Series 32 - Quantum Engineering - 2026-07-23.pdf`
- Create: `_Templates/Templates.md`
- Create: `01_University_Physics_Study/Learning_Portfolio/Certificates/Certificates.md`
- Create: `06_Knowledge_Library/Business_and_Finance/Investment_and_Personal_Finance/Investment and Personal Finance.md`
- Modify: `01_University_Physics_Study/Learning_Portfolio/Learning Portfolio.md`
- Modify: `05_AQSolotl_Internship/AQSolotl Internship Workspace.md`
- Modify: `05_AQSolotl_Internship/learning-notes/Internship Learning Notes.md`
- Modify: `06_Knowledge_Library/Business_and_Finance/Business and Finance.md`
- Modify: `99_Inbox/GregOS Inbox.md`

**Interfaces:**
- Consumes: four classified inbox artifacts
- Produces: canonical files plus human-readable overview links

- [ ] **Step 1: Move the four classified artifacts**

Create the `Certificates` directory, then move each file to the exact path above. Do not alter the substantive note or PDF content.

- [ ] **Step 2: Write local overview notes**

Use short Markdown indexes with explicit relative links:

```markdown
# Templates

- [[AI Chat Closing Prompt]]: reusable checklist prompt for preserving valuable outcomes before deleting an AI conversation.
- [[AI Chat Content Template]]: shorter note structure for a saved conversation.
- [[Daily Note]] and [[Quick Capture]]: general GregOS capture templates.
```

```markdown
# Certificates

- [[Cosmos of Curiosity Series 32 - Quantum Engineering - 2026-07-23.pdf|Cosmos of Curiosity Series 32 — Quantum Engineering]]: participation certificate for the 23 July 2026 dialogue featuring Prof. William D. Phillips and Prof. Peter Zoller.
```

```markdown
# Investment and Personal Finance

Long-term references for investing, market structure, financial analysis, technical analysis, and personal finance.

- [[Bursa Investment Quiz 2026]]: Bursa Malaysia market rules, Islamic capital market concepts, valuation formulas, technical analysis, and quiz answers.
```

- [ ] **Step 3: Update parent overviews**

Add one concise “Current resources” or equivalent bullet to each listed parent overview. Update `GregOS Inbox.md` with a `Last processed: 2026-07-27` line and state that only the inbox overview should remain after the current batch.

- [ ] **Step 4: Verify organization**

Run a read-only existence check for every destination and assert the four original inbox paths no longer exist.

Expected: all destination checks are `True`; all four source checks are `False`.

### Task 3: Move and Integrate Both Course Modules

**Files:**
- Move: `99_Inbox/Chapter5_Chemistry_Interactive_Slideshow.html` → `content/SPM_Syllabus/Form5/Chemistry/Chapter5_Consumer_and_Industrial_Chemistry/index.html`
- Move: `99_Inbox/Form5_Chemistry_Chapter5_Student_Final.pdf` → `content/SPM_Syllabus/Form5/Chemistry/Chapter5_Consumer_and_Industrial_Chemistry/student_workbook.pdf`
- Move: `99_Inbox/Form5_Chemistry_Chapter5_Teacher_Final.pdf` → `content/SPM_Syllabus/Form5/Chemistry/Chapter5_Consumer_and_Industrial_Chemistry/teacher_answer_scheme.pdf`
- Move: `99_Inbox/eason_science_command_centre_v4.html` → `content/IGCSE_Syllabus/Year4/Science/Science_Command_Centre/index.html`
- Modify: both new `index.html` files

**Interfaces:**
- Consumes: existing module state APIs (`save()`/`show()` for Chemistry and mission/question state for Science Command Centre)
- Produces: portal-compatible modules with Back navigation and recoverable progress

- [ ] **Step 1: Move all four course assets**

Create both module directories and move the HTML/PDF files to the exact paths above. Copy the same four organized assets into the clean deployment worktree.

- [ ] **Step 2: Add Chemistry navigation and progress**

Add a fixed fallback:

```html
<a href="../../../../../index.html" class="home-btn-fixed">← Back</a>
```

Add scripts before `</body>` in this order:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="../../../../../js/auth-access.js"></script>
<script src="../../../../../js/navigation.js?v=1.0.0"></script>
<script src="../../../../../js/progress-tracker.js"
        data-module-id="spm-chem-ch5-consumer-industrial"
        data-module-name="Chapter 5: Consumer and Industrial Chemistry"
        data-module-url="content/SPM_Syllabus/Form5/Chemistry/Chapter5_Consumer_and_Industrial_Chemistry/index.html"></script>
```

Extend the existing `save()` function so it retains local storage and calls:

```javascript
if (window.ProgressTracker?.autoSave) {
  ProgressTracker.autoSave({
    slide: current,
    revealed: state.revealed,
    completion: Math.round(((current + 1) / TOTAL) * 100)
  }, 1500);
}
```

Initialize cloud restore:

```javascript
window.addEventListener("load", function () {
  if (!window.ProgressTracker?.init) return;
  ProgressTracker.init(async function (tracker) {
    const saved = await tracker.load();
    if (!saved) return;
    state.revealed = saved.revealed || state.revealed || {};
    const restoredSlide = Number.isInteger(saved.slide) ? saved.slide : state.lastSlide || 0;
    show(restoredSlide);
  });
});
```

- [ ] **Step 3: Add Science Command Centre navigation and progress**

Add the same fixed fallback and shared scripts, using:

```html
data-module-id="igcse-y4-sci-command-centre"
data-module-name="Science Command Centre 4.0"
data-module-url="content/IGCSE_Syllabus/Year4/Science/Science_Command_Centre/index.html"
```

Create:

```javascript
function progressSnapshot() {
  return {
    missionId: currentMissionId,
    routeChoice: currentRouteChoice,
    questionIndex: index,
    xp,
    focus,
    streak,
    wrongStreak,
    bestStreak,
    correctCount,
    wrongCount,
    seconds,
    responses: state
  };
}

function saveProgress() {
  if (window.ProgressTracker?.autoSave) {
    ProgressTracker.autoSave(progressSnapshot(), 1200);
  }
}
```

Call `saveProgress()` after mission launch, answer selection/text entry, answer check, revealed-letter changes, and previous/next question navigation. Restore scalar values and `Object.assign(state, saved.responses || {})`, then launch the saved mission with `{ routeChoice: saved.routeChoice }` and clamp the restored question index before rendering.

- [ ] **Step 4: Run the publication verifier**

Run:

```powershell
npm run verify:inbox-course-modules
```

Expected: still fails because the portal and registry have not yet been updated, but no longer reports missing module/PDF files or module integration hooks.

### Task 4: Register Portal Cards, Downloads, IDs, and Documentation

**Files:**
- Modify: `index.html`
- Modify: `db/archive/modules_registry.sql`
- Modify: `README.md`
- Modify: `C:\GregOS\03_Tutoring_Factory\Tutoring Factory.md`
- Modify: `C:\GregOS\03_Tutoring_Factory\02_Interactive_Course_Project\Interactive Course Project.md`

**Interfaces:**
- Consumes: both module paths, both IDs, and both PDF paths
- Produces: clickable portal entries, downloadable resources, lock registry rows, and updated documentation

- [ ] **Step 1: Convert the SPM Chemistry placeholder to a folder**

Replace the dead `#spm_chemistry` anchor with:

```html
<div class="card sub-chemistry" style="cursor: pointer;"
    onclick="showLessons('spm', 'spm-chemistry')">
    <div class="card-tag">SPM STEM</div>
    <h3>Chemistry</h3>
    <p>Explore Form 5 Chemistry through bilingual interactive lessons and downloadable workbooks.</p>
    <div class="card-footer">
        <div class="start-link">View Modules <span>&rarr;</span></div>
    </div>
</div>
```

Add an `spm-chemistry` view layer containing the module card and two sibling download links, with `data-module-id="spm-chem-ch5-consumer-industrial"` and `data-bundle="spm_form5"`.

- [ ] **Step 2: Add the Science Command Centre card**

Append a card to `igcse-science-y4`:

```html
<a href="content/IGCSE_Syllabus/Year4/Science/Science_Command_Centre/index.html"
    class="card sub-science" data-module-id="igcse-y4-sci-command-centre"
    data-bundle="igcse_y4_science">
    <div class="card-tag">Year 4 · Comprehensive Practice</div>
    <h3>Science Command Centre 4.0</h3>
    <p>Train scientific vocabulary, explanations, misconceptions, and reasoning through a 100-question mission system.</p>
    <div class="card-footer">
        <div class="start-link">Start Mission <span>&rarr;</span></div>
    </div>
</a>
```

Change the Year 4 description from `7 interactive modules` to `8 interactive modules` and include the command centre in the summary.

- [ ] **Step 3: Register public PDFs**

Add:

```javascript
{ syllabus: "SPM", subject: "Chemistry (Form 5)", label: "Chapter 5 Consumer and Industrial Chemistry — Student Workbook", file: "content/SPM_Syllabus/Form5/Chemistry/Chapter5_Consumer_and_Industrial_Chemistry/student_workbook.pdf" },
{ syllabus: "SPM", subject: "Chemistry (Form 5)", label: "Chapter 5 Consumer and Industrial Chemistry — Teacher Answer Scheme", file: "content/SPM_Syllabus/Form5/Chemistry/Chapter5_Consumer_and_Industrial_Chemistry/teacher_answer_scheme.pdf" },
```

- [ ] **Step 4: Register canonical IDs**

Add SQL rows before the IGCSE section:

```sql
-- ── SPM Chemistry (Form 5) ────────────────────────────────────────
('spm-chem-ch5-consumer-industrial', 'Chapter 5: Consumer and Industrial Chemistry', 'spm', 'chemistry', 'spm_form5', 'Form5'),
```

Add to IGCSE Year 4:

```sql
('igcse-y4-sci-command-centre', 'Science Command Centre 4.0', 'igcse', 'science', 'igcse_y4_science', 'Year4'),
```

Update the registry verification count comment from `40` to `42`.

- [ ] **Step 5: Update readmes and verify the direct PDF registry**

Document both new modules, their IDs, routes, and public downloads in the repository README and the two GregOS tutoring overview notes.

The latest `origin/main` has no generated PDF catalog; its source of truth is the `pdfResources` array in `index.html`. Confirm both new entries point to existing PDFs through `verify_inbox_course_modules.js`.

- [ ] **Step 6: Run the publication contract and commit GREEN**

Run:

```powershell
npm run verify:inbox-course-modules
```

Expected: `Inbox course module verification passed.`

Commit message:

```text
feat: publish chemistry and science tuition modules
```

### Task 5: Full Local and Browser Verification

**Files:**
- Test: all changed course files and organized GregOS paths

**Interfaces:**
- Consumes: completed local implementation
- Produces: fresh automated and browser evidence suitable for deployment

- [ ] **Step 1: Run all relevant automated checks**

Run:

```powershell
npm run verify:inbox-course-modules
npm run verify:navigation-core
npm run verify:kssr-redesign
```

Parse each new page's inline JavaScript with Acorn after stripping HTML script tags. Expected: all commands exit `0` with no syntax error.

- [ ] **Step 2: Check the final inbox**

Verify that `99_Inbox` contains only `GregOS Inbox.md`.

- [ ] **Step 3: Serve and inspect locally**

Start a local static server from the isolated worktree. In a browser:

- open SPM → Chemistry → Chapter 5;
- download the student workbook and teacher answer scheme;
- return via Back;
- open IGCSE → Science → Year 4 → Science Command Centre;
- answer representative questions, reload, and confirm restoration;
- inspect desktop, tablet, and narrow mobile viewports.

Expected: all entry, return, download, and restoration paths work with no console errors.

### Task 6: Publish Safely to GitHub Pages

**Files:**
- Deploy: the exact isolated-worktree commit produced above

**Interfaces:**
- Consumes: verified commit based on latest `origin/main`
- Produces: fast-forward `origin/main` update and a live GitHub Pages deployment

- [ ] **Step 1: Re-fetch and prove fast-forward safety**

Run:

```powershell
git fetch origin main
git merge-base --is-ancestor origin/main HEAD
```

Expected: exit `0`. If it fails, rebase onto `origin/main` and rerun Task 5.

- [ ] **Step 2: Push the verified commit**

Run:

```powershell
git push origin HEAD:main
```

Expected: a fast-forward update to `main`.

- [ ] **Step 3: Verify deployment**

Wait for the Pages deployment to reach success, then open:

```text
https://bluesoul2003.github.io/interactive-course/
```

Repeat the live entry and download checks for both modules. Record the commit SHA and live URLs.

- [ ] **Step 4: Final handoff**

Report:

- every moved file and updated overview;
- both module IDs and live routes;
- public student and teacher PDF links;
- automated/browser verification evidence;
- unrelated dirty checkout files preserved;
- a short manual lesson-quality checklist;
- the safe Supabase registry instruction, explicitly warning not to run the destructive archived script wholesale.
