# Karangan Rakan Sebaya Quality Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Karangan Rakan Sebaya carousel reliable for touch, persistence, and assistive technology while adding executable regression coverage and correcting module-registry documentation.

**Architecture:** Keep the lesson's carousel logic inline, but separate rendering from intentional persistence through an explicit `persist` option. Exercise the real inline script with Node's built-in test runner, Acorn, `vm`, and a focused fake DOM; wire that verifier into the normal navigation verification chain. Keep `db/schema.sql` as the only active module-registry source and restore the archive file to historical status.

**Tech Stack:** Static HTML, vanilla JavaScript, Node.js `node:test`, `node:assert`, `node:vm`, Acorn 8, npm scripts, Supabase documentation.

## Global Constraints

- Do not modify `content/SPM_Syllabus/Form5/BM/Karangan_Rakan_Sebaya/slides.html` or any unrelated tracked or untracked file.
- Keep `currentSlide` zero-based in memory and persist `step` as a one-based integer.
- Initial rendering and restored-progress rendering must not persist.
- Button, keyboard, and accepted horizontal-swipe navigation must call `ProgressTracker.save` immediately.
- Preserve the canonical module ID `spm-bm-karangan-rakan-sebaya` and canonical URL `content/SPM_Syllabus/Form5/BM/Karangan_Rakan_Sebaya/index.html`.
- Preserve the current shared-script order: Supabase SDK, `auth-access.js`, `navigation.js`, then `progress-tracker.js`.
- Do not connect to or mutate the live Supabase project.

---

## File Map

- Create `tools/verify_karangan_rakan_sebaya.js`: parse and execute the real lesson script in a deterministic fake browser environment.
- Modify `content/SPM_Syllabus/Form5/BM/Karangan_Rakan_Sebaya/index.html`: implement directional touch handling, immediate intentional persistence, and carousel accessibility state.
- Modify `package.json`: expose the focused verifier and include it in `verify:navigation`.
- Modify `docs/HOW_TO_ADD_A_NEW_MODULE.md`: replace active `modules_registry.sql` instructions with `db/schema.sql` instructions.
- Modify `docs/SYSTEM_LOG.md`: name `db/schema.sql` as the active module registry.
- Modify `db/archive/modules_registry.sql`: remove the post-archive Karangan Rakan Sebaya row.

---

### Task 1: Add the failing carousel behavior verifier

**Files:**
- Create: `tools/verify_karangan_rakan_sebaya.js`
- Test: `tools/verify_karangan_rakan_sebaya.js`

**Interfaces:**
- Consumes: the inline script containing `function updateSlider` in the real lesson HTML.
- Produces: `createHarness()` returning `{ sandbox, slides, slider, indicator, saveCalls, autoSaveCalls, dispatch }` for behavior tests.

- [ ] **Step 1: Create the focused verifier**

```javascript
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const acorn = require('acorn');

const root = path.resolve(__dirname, '..');
const lessonPath = path.join(
  root,
  'content',
  'SPM_Syllabus',
  'Form5',
  'BM',
  'Karangan_Rakan_Sebaya',
  'index.html'
);
const html = fs.readFileSync(lessonPath, 'utf8');
const inlineScripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
  .map(match => match[1])
  .filter(source => source.trim());
const lessonScript = inlineScripts.find(source => source.includes('function updateSlider'));

function createElement() {
  const attributes = new Map();
  return {
    style: {},
    disabled: false,
    inert: false,
    innerText: '',
    setAttribute(name, value) {
      attributes.set(name, String(value));
    },
    getAttribute(name) {
      return attributes.has(name) ? attributes.get(name) : null;
    },
    removeAttribute(name) {
      attributes.delete(name);
    }
  };
}

function createHarness() {
  const listeners = new Map();
  const slides = [createElement(), createElement(), createElement()];
  const slider = createElement();
  const prevBtn = createElement();
  const nextBtn = createElement();
  const indicator = createElement();
  const saveCalls = [];
  const autoSaveCalls = [];
  const elements = {
    slider,
    prevBtn,
    nextBtn,
    slideIndicator: indicator
  };

  const window = {
    addEventListener(type, handler) {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(handler);
    }
  };
  const document = {
    getElementById(id) {
      return elements[id] || null;
    },
    querySelectorAll(selector) {
      return selector === '.slide-item' ? slides : [];
    }
  };
  const ProgressTracker = {
    save(data) {
      saveCalls.push(data);
      return Promise.resolve();
    },
    autoSave(data, delayMs) {
      autoSaveCalls.push({ data, delayMs });
    },
    init() {}
  };
  const sandbox = {
    window,
    document,
    ProgressTracker,
    console,
    setTimeout,
    clearTimeout
  };
  sandbox.globalThis = sandbox;

  vm.runInNewContext(lessonScript, sandbox, { filename: lessonPath });

  function dispatch(type, event) {
    for (const handler of listeners.get(type) || []) handler(event);
  }

  return {
    sandbox,
    slides,
    slider,
    indicator,
    saveCalls,
    autoSaveCalls,
    dispatch
  };
}

test('lesson inline JavaScript parses', () => {
  assert.ok(lessonScript, 'lesson should contain its carousel script');
  acorn.parse(lessonScript, { ecmaVersion: 'latest', sourceType: 'script' });
});

test('initial rendering does not save and user navigation saves immediately', () => {
  const harness = createHarness();

  assert.deepEqual(harness.saveCalls, []);
  assert.deepEqual(harness.autoSaveCalls, []);

  harness.sandbox.nextSlide();

  assert.deepEqual(harness.saveCalls, [{ step: 2, score: 0 }]);
  assert.deepEqual(harness.autoSaveCalls, []);
});

test('vertical touch movement does not navigate', () => {
  const harness = createHarness();
  harness.dispatch('touchstart', {
    changedTouches: [{ screenX: 100, screenY: 100 }]
  });
  harness.dispatch('touchend', {
    changedTouches: [{ screenX: 40, screenY: 260 }]
  });

  assert.equal(harness.slider.style.transform, 'translateX(-0vw)');
});

test('horizontal touch movement navigates exactly one slide', () => {
  const harness = createHarness();
  harness.dispatch('touchstart', {
    changedTouches: [{ screenX: 100, screenY: 100 }]
  });
  harness.dispatch('touchend', {
    changedTouches: [{ screenX: 20, screenY: 110 }]
  });

  assert.equal(harness.slider.style.transform, 'translateX(-100vw)');
});

test('only the active slide is exposed to assistive technology', () => {
  const harness = createHarness();

  assert.equal(harness.slides[0].getAttribute('aria-hidden'), 'false');
  assert.equal(harness.slides[0].inert, false);
  assert.equal(harness.slides[1].getAttribute('aria-hidden'), 'true');
  assert.equal(harness.slides[1].inert, true);

  harness.sandbox.nextSlide();

  assert.equal(harness.slides[0].getAttribute('aria-hidden'), 'true');
  assert.equal(harness.slides[0].inert, true);
  assert.equal(harness.slides[1].getAttribute('aria-hidden'), 'false');
  assert.equal(harness.slides[1].inert, false);
});

test('carousel markup exposes status semantics', () => {
  assert.match(
    html,
    /<div id="slider"[^>]*role="region"[^>]*aria-roledescription="carousel"/
  );
  assert.match(
    html,
    /<div[^>]*id="slideIndicator"[^>]*aria-live="polite"/
  );
});

test('shared integration references remain intact', () => {
  assert.match(html, /navigation\.js\?v=1\.0\.0/);
  assert.match(html, /data-module-id="spm-bm-karangan-rakan-sebaya"/);
  assert.match(
    html,
    /data-module-url="content\/SPM_Syllabus\/Form5\/BM\/Karangan_Rakan_Sebaya\/index\.html"/
  );
  assert.ok(
    html.indexOf('@supabase/supabase-js@2') < html.indexOf('auth-access.js')
  );
  assert.ok(
    html.indexOf('auth-access.js') < html.indexOf('progress-tracker.js')
  );
});
```

- [ ] **Step 2: Run the verifier and confirm RED**

Run:

```powershell
node --test tools/verify_karangan_rakan_sebaya.js
```

Expected: the syntax and existing integration-reference tests pass, while persistence, vertical touch, accessibility state, and carousel-markup tests fail for the reviewed reasons.

---

### Task 2: Implement carousel behavior and accessibility

**Files:**
- Modify: `content/SPM_Syllabus/Form5/BM/Karangan_Rakan_Sebaya/index.html:53,267-366`
- Modify: `package.json:2-7`
- Test: `tools/verify_karangan_rakan_sebaya.js`

**Interfaces:**
- Consumes: `ProgressTracker.save(data): Promise<void>` and the existing DOM element IDs.
- Produces: `updateSlider({ persist?: boolean }): void`, with `nextSlide()` and `prevSlide()` requesting persistence.

- [ ] **Step 1: Implement directional touch recognition**

Replace the existing touch block with:

```javascript
        // Touch Support (Swipe)
        let touchStartX = 0;
        let touchStartY = 0;
        const minSwipeDistance = 50;

        window.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        window.addEventListener('touchend', e => {
            const touchEndX = e.changedTouches[0].screenX;
            const touchEndY = e.changedTouches[0].screenY;
            const xDiff = touchEndX - touchStartX;
            const yDiff = touchEndY - touchStartY;

            if (Math.abs(xDiff) <= Math.abs(yDiff) || Math.abs(xDiff) <= minSwipeDistance) {
                return;
            }

            if (xDiff < 0) nextSlide();
            else prevSlide();
        }, { passive: true });
```

- [ ] **Step 2: Verify the touch tests turn GREEN**

Run:

```powershell
node --test --test-name-pattern="touch movement" tools/verify_karangan_rakan_sebaya.js
```

Expected: both touch tests pass; unrelated tests are skipped.

- [ ] **Step 3: Separate rendering from immediate intentional persistence**

Replace `updateSlider`, `nextSlide`, and `prevSlide` with:

```javascript
        function saveCurrentProgress() {
            if (typeof ProgressTracker === 'undefined' || !ProgressTracker.save) return;

            ProgressTracker.save({
                step: currentSlide + 1,
                score: 0
            }).catch(error => {
                console.error('[Karangan Rakan Sebaya] progress save failed:', error);
            });
        }

        function updateSlider({ persist = false } = {}) {
            slider.style.transform = `translateX(-${currentSlide * 100}vw)`;
            slideIndicator.innerText = `Slaid ${currentSlide + 1} / ${totalSlides}`;

            prevBtn.disabled = currentSlide === 0;
            nextBtn.disabled = currentSlide === totalSlides - 1;

            if (persist) saveCurrentProgress();
        }

        function nextSlide() {
            if (currentSlide < totalSlides - 1) {
                currentSlide++;
                updateSlider({ persist: true });
            }
        }

        function prevSlide() {
            if (currentSlide > 0) {
                currentSlide--;
                updateSlider({ persist: true });
            }
        }
```

In the progress-restoration callback, replace the duplicated transform, indicator, and button assignments with:

```javascript
                        updateSlider();
```

- [ ] **Step 4: Verify the persistence test turns GREEN**

Run:

```powershell
node --test --test-name-pattern="rendering does not save" tools/verify_karangan_rakan_sebaya.js
```

Expected: the persistence test passes with one immediate `{ step: 2, score: 0 }` save and zero debounced saves.

- [ ] **Step 5: Add carousel markup semantics**

Replace the slider opening tag with:

```html
    <div id="slider"
         role="region"
         aria-roledescription="carousel"
         aria-label="Slaid Karangan Rakan Sebaya"
         class="flex transition-transform duration-500 ease-in-out h-screen w-full">
```

Replace the indicator opening tag with:

```html
        <div class="text-gray-600 font-bold"
             id="slideIndicator"
             aria-live="polite"
             aria-atomic="true">
```

Add this block inside `updateSlider`, after the button disabled-state assignments and before persistence:

```javascript
            slides.forEach((slide, index) => {
                const isActive = index === currentSlide;
                slide.setAttribute('role', 'group');
                slide.setAttribute('aria-roledescription', 'slide');
                slide.setAttribute('aria-label', `Slaid ${index + 1} daripada ${totalSlides}`);
                slide.setAttribute('aria-hidden', String(!isActive));
                slide.inert = !isActive;
            });
```

- [ ] **Step 6: Verify all carousel tests turn GREEN**

Run:

```powershell
node --test tools/verify_karangan_rakan_sebaya.js
```

Expected: all seven tests pass.

- [ ] **Step 7: Wire the verifier into npm scripts**

Update the scripts object to:

```json
  "scripts": {
    "build:pdf-catalog": "node tools/run_pdf_catalog.js",
    "verify:pdf-library": "node tools/verify_pdf_library.js",
    "verify:karangan-rakan-sebaya": "node --test tools/verify_karangan_rakan_sebaya.js",
    "verify:navigation": "node tools/verify_navigation_core.js && node tools/verify_navigation_integration.js && node tools/verify_module_navigation_links.js && npm run verify:karangan-rakan-sebaya",
    "verify:kssr-workbooks": "python tools/verify_kssr_workbook_json.py _drafts/kssr_english_workbooks/primary3/workbook.json _drafts/kssr_english_workbooks/primary6/workbook.json && node tools/verify_kssr_workbook_pages.js"
  }
```

- [ ] **Step 8: Verify the normal navigation chain**

Run:

```powershell
npm run verify:navigation
```

Expected: navigation core, navigation integration, module link verification, and all seven Karangan tests pass.

- [ ] **Step 9: Commit the carousel change**

```powershell
git add -- package.json tools/verify_karangan_rakan_sebaya.js content/SPM_Syllabus/Form5/BM/Karangan_Rakan_Sebaya/index.html
git commit -m "fix: harden karangan slide navigation"
```

---

### Task 3: Correct active module-registry documentation

**Files:**
- Modify: `tools/verify_karangan_rakan_sebaya.js`
- Modify: `docs/HOW_TO_ADD_A_NEW_MODULE.md:189-219`
- Modify: `docs/SYSTEM_LOG.md:81`
- Modify: `db/archive/modules_registry.sql:55`
- Test: `tools/verify_karangan_rakan_sebaya.js`

**Interfaces:**
- Consumes: repository documentation and SQL text.
- Produces: one consistent rule: `db/schema.sql` is active; `db/archive/modules_registry.sql` is historical.

- [ ] **Step 1: Add the failing documentation consistency test**

Add these constants after the lesson HTML is loaded:

```javascript
const guidePath = path.join(root, 'docs', 'HOW_TO_ADD_A_NEW_MODULE.md');
const systemLogPath = path.join(root, 'docs', 'SYSTEM_LOG.md');
const schemaPath = path.join(root, 'db', 'schema.sql');
const archivedRegistryPath = path.join(root, 'db', 'archive', 'modules_registry.sql');
const guide = fs.readFileSync(guidePath, 'utf8');
const systemLog = fs.readFileSync(systemLogPath, 'utf8');
const schema = fs.readFileSync(schemaPath, 'utf8');
const archivedRegistry = fs.readFileSync(archivedRegistryPath, 'utf8');
const moduleId = 'spm-bm-karangan-rakan-sebaya';
```

Add this test after the integration-reference test:

```javascript
test('module registry documentation uses the active schema source', () => {
  assert.match(guide, /db\/schema\.sql/);
  assert.doesNotMatch(guide, /modules_registry\.sql/);
  assert.match(systemLog, /db\/schema\.sql/);
  assert.doesNotMatch(systemLog, /modules_registry\.sql/);
  assert.ok(schema.includes(`('${moduleId}'`));
  assert.ok(!archivedRegistry.includes(`('${moduleId}'`));
});
```

- [ ] **Step 2: Run the documentation test and confirm RED**

Run:

```powershell
node --test --test-name-pattern="registry documentation" tools/verify_karangan_rakan_sebaya.js
```

Expected: failure because active documentation still names `modules_registry.sql` and the archived registry still contains the new row.

- [ ] **Step 3: Replace the active-registry instructions in the new-module guide**

Replace Step 12 with:

```markdown
### Step 12: Register the Canonical ID in `db/schema.sql`
Your module card correctly assigns a `data-module-id` string, but you must also register that exact canonical ID in the Supabase module registry.

1. Open `db/schema.sql`, the repository's single source of truth for database setup and module seed data.
2. In **Section 6: Module seed data**, add one row whose `id` exactly matches the card's `data-module-id`.
3. Re-run the updated `db/schema.sql` in **Supabase Dashboard → SQL Editor** when intentionally refreshing the database registry.
4. Verify the row exists in `public.modules` before generating activation PINs for the new module.

Do not edit files under `db/archive/`; they are historical references and are not active migrations.
```

Replace the two Pillar 5 checklist items with:

```markdown
- [ ] **Pillar 5:** Canonical `data-module-id` added to `db/schema.sql`.
- [ ] **Pillar 5:** Updated `db/schema.sql` applied and verified in the Supabase SQL Editor.
```

- [ ] **Step 4: Correct the system log and archive snapshot**

Replace the Security Registry sentence in `docs/SYSTEM_LOG.md` with:

```markdown
5. **Security Registry (The Lock):** The `data-module-id` must be registered in `public.modules` through the active source of truth, `db/schema.sql`; otherwise Admins cannot generate PINs for it. The first module of any syllabus is automatically treated as a Free Preview.
```

Remove this row from `db/archive/modules_registry.sql`:

```sql
('spm-bm-karangan-rakan-sebaya', 'Karangan: Rakan Sebaya',       'spm', 'bm', 'spm_form5', 'Form5'),
```

- [ ] **Step 5: Verify the documentation test turns GREEN**

Run:

```powershell
node --test --test-name-pattern="registry documentation" tools/verify_karangan_rakan_sebaya.js
```

Expected: the documentation consistency test passes.

- [ ] **Step 6: Run the full focused verifier**

Run:

```powershell
npm run verify:karangan-rakan-sebaya
```

Expected: all eight tests pass.

- [ ] **Step 7: Commit the documentation correction**

```powershell
git add -- tools/verify_karangan_rakan_sebaya.js docs/HOW_TO_ADD_A_NEW_MODULE.md docs/SYSTEM_LOG.md db/archive/modules_registry.sql docs/superpowers/plans/2026-07-15-karangan-rakan-sebaya-quality-improvements.md
git commit -m "docs: align module registry guidance"
```

---

### Task 4: Run full regression verification

**Files:**
- Verify only; no intended file modifications.

**Interfaces:**
- Consumes: all changed files and existing project verifiers.
- Produces: fresh evidence that the focused behavior and existing project workflows pass without unrelated changes.

- [ ] **Step 1: Run navigation and focused verification**

```powershell
npm run verify:navigation
```

Expected: all navigation checks and all eight Karangan checks pass.

- [ ] **Step 2: Run KSSR workbook verification with the bundled Python runtime**

```powershell
& "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" tools\verify_kssr_workbook_json.py _drafts\kssr_english_workbooks\primary3\workbook.json _drafts\kssr_english_workbooks\primary6\workbook.json
node tools\verify_kssr_workbook_pages.js
```

Expected: Primary 3 and Primary 6 JSON verification passes, followed by 20 generated pages and 169 questions passing.

- [ ] **Step 3: Run the remaining existing verifiers**

```powershell
node tools\verify_pages_workflow.js
node tools\verify_auth_recovery.js
npm run verify:pdf-library
```

Expected: Pages workflow, auth recovery, and the 89-item PDF library pass.

- [ ] **Step 4: Check formatting and scope**

```powershell
git diff --check HEAD~2..HEAD
git status --short
```

Expected: no whitespace errors. Status may list pre-existing unrelated files, but none of them is staged or changed by this implementation. Confirm specifically that `slides.html` and other pre-existing untracked paths remain untouched.

- [ ] **Step 5: Review the final scoped diff**

```powershell
git diff HEAD~2..HEAD -- package.json tools/verify_karangan_rakan_sebaya.js content/SPM_Syllabus/Form5/BM/Karangan_Rakan_Sebaya/index.html docs/HOW_TO_ADD_A_NEW_MODULE.md docs/SYSTEM_LOG.md db/archive/modules_registry.sql docs/superpowers/plans/2026-07-15-karangan-rakan-sebaya-quality-improvements.md
```

Expected: only the approved carousel, verifier, npm wiring, documentation, archive cleanup, and implementation plan are present.
