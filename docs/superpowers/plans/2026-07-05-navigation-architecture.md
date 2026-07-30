# Navigation Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a shared navigation layer that lets learners return from modules to the exact syllabus/layer they came from while making root-page Back/Forward navigation URL-driven.

**Architecture:** Add `js/navigation.js` as the central navigation module with pure route helpers plus browser integration hooks. Keep existing static HTML and inline navigation functions as compatibility wrappers, then progressively enhance module links and existing Home/Back controls at runtime.

**Tech Stack:** Vanilla JavaScript, static HTML, GitHub Pages hash routing, Node.js verification scripts using built-in `assert`, existing Supabase scripts unchanged.

## Global Constraints

- Preserve GitHub Pages static hosting.
- Preserve existing direct links to modules.
- Preserve Supabase auth and password recovery flows.
- Preserve `AuthAccess.applyAccessControl()` behavior on landing page cards.
- Preserve `ProgressTracker` module IDs and saved progress URLs.
- Preserve existing inline `onclick` navigation until markup can be cleaned later.
- Do not migrate to a front-end framework or full single-page app.
- Route shape is `/#/<level>/<syllabus>/<layer>`.
- `level` values are exactly `secondary` and `primary`.
- Known root syllabus ids are `spm`, `uec`, `igcse`, `sg`, and `kssr`.
- K-12 modules without source context fall back to the root `index.html`.
- University modules without source context fall back to an inferred faculty hub, then `content/University/index.html`.

---

## File Structure

- Create `js/navigation.js`
  - Owns route parsing, route formatting, root route application, module source context, return URL building, scroll-memory helpers, and runtime link/control enhancement.
- Create `tools/verify_navigation_core.js`
  - Unit-style Node verification for pure route helpers and return URL logic.
- Create `tools/verify_navigation_integration.js`
  - Static DOM-string verification that root `index.html` exposes valid syllabus/layer ids, loads the navigation script, and uses compatibility wrappers.
- Create `tools/verify_module_navigation_links.js`
  - Static scan that verifies the first-pass representative module pages load `js/navigation.js`.
- Modify `index.html`
  - Load `js/navigation.js`.
  - Replace body of existing `switchSyllabus`, `showLessons`, `showSubjects`, and `switchLevel` with compatibility wrappers that delegate to `Navigation`.
  - Initialize navigation after DOM content and existing auth setup have access to cards.
- Modify selected existing module pages for the first pass
  - Add `js/navigation.js` with the correct relative path to high-value representative modules:
    - `content/IGCSE_Syllabus/Year8/Science/Chapter1_Respiration/index.html`
    - `content/SPM_Syllabus/Form5/BM/Rumusan/index.html`
    - `content/Singapore_Syllabus/Year4/Math/Chapter2_Whole_Number/index.html`
    - `content/University/Physics/Kinematics_Simulator/index.html`
  - These cover K-12, nested subject/year routes, and University hub fallback.
- Modify `docs/HOW_TO_ADD_A_NEW_MODULE.md`
  - Replace manual folder-depth Home button guidance with shared navigation script guidance while preserving progress tracker setup.
- Modify `README.md`
  - Add a short routing note for developers.

---

### Task 1: Pure Navigation Helper Tests

**Files:**
- Create: `tools/verify_navigation_core.js`
- Create: `js/navigation.js`

**Interfaces:**
- Produces: `window.Navigation.parseRouteHash(hash: string): { valid: boolean, level: string|null, syllabus: string|null, layer: string|null }`
- Produces: `window.Navigation.formatRoute(level: string, syllabus: string, layer: string): string`
- Produces: `window.Navigation.isRootRouteHash(hash: string): boolean`
- Produces: `window.Navigation.withSourceContext(href: string, routeHash: string): string`
- Produces: `window.Navigation.getRelativeRootPrefix(pathname: string): string`
- Produces: `window.Navigation.buildReturnUrl(options: object): string`

- [ ] **Step 1: Write the failing core verification script**

Create `tools/verify_navigation_core.js`:

```javascript
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const navPath = path.join(root, 'js', 'navigation.js');
assert.ok(fs.existsSync(navPath), 'js/navigation.js should exist');

const sandbox = {
  window: {
    location: {
      pathname: '/interactive-course/content/IGCSE_Syllabus/Year8/Science/Chapter1_Respiration/index.html',
      search: '',
      hash: '',
      origin: 'https://bluesoul2003.github.io'
    },
    history: { pushState() {}, replaceState() {} },
    addEventListener() {},
    sessionStorage: {
      _data: {},
      getItem(key) { return this._data[key] || null; },
      setItem(key, value) { this._data[key] = String(value); }
    }
  },
  document: {
    addEventListener() {},
    querySelectorAll() { return []; },
    getElementById() { return null; },
    body: { appendChild() {} },
    createElement() {
      return {
        className: '',
        setAttribute() {},
        addEventListener() {},
        style: {},
        dataset: {}
      };
    }
  },
  URL,
  URLSearchParams,
  console
};
sandbox.globalThis = sandbox;

vm.runInNewContext(fs.readFileSync(navPath, 'utf8'), sandbox, { filename: navPath });
const Navigation = sandbox.window.Navigation;

assert.ok(Navigation, 'Navigation should be attached to window');

assert.deepStrictEqual(
  Navigation.parseRouteHash('#/secondary/igcse/igcse-science-y8'),
  { valid: true, level: 'secondary', syllabus: 'igcse', layer: 'igcse-science-y8' }
);

assert.deepStrictEqual(
  Navigation.parseRouteHash('/#/primary/kssr/kssr-english-y3'),
  { valid: true, level: 'primary', syllabus: 'kssr', layer: 'kssr-english-y3' }
);

assert.deepStrictEqual(
  Navigation.parseRouteHash('#/wrong/spm/spm-bm'),
  { valid: false, level: null, syllabus: null, layer: null }
);

assert.strictEqual(
  Navigation.formatRoute('secondary', 'spm', 'spm-bm'),
  '#/secondary/spm/spm-bm'
);

assert.strictEqual(
  Navigation.isRootRouteHash('#/secondary/sg/sg-year4'),
  true
);

assert.strictEqual(
  Navigation.isRootRouteHash('#/secondary/not-real/sg-year4'),
  false
);

assert.strictEqual(
  Navigation.withSourceContext('content/A/index.html', '#/secondary/spm/spm-bm'),
  'content/A/index.html?from=%23%2Fsecondary%2Fspm%2Fspm-bm'
);

assert.strictEqual(
  Navigation.withSourceContext('content/A/index.html?mode=quiz', '#/primary/kssr/kssr-english-y3'),
  'content/A/index.html?mode=quiz&from=%23%2Fprimary%2Fkssr%2Fkssr-english-y3'
);

assert.strictEqual(
  Navigation.getRelativeRootPrefix('/interactive-course/content/IGCSE_Syllabus/Year8/Science/Chapter1_Respiration/index.html'),
  '../../../../../'
);

assert.strictEqual(
  Navigation.buildReturnUrl({
    pathname: '/interactive-course/content/IGCSE_Syllabus/Year8/Science/Chapter1_Respiration/index.html',
    search: '?from=%23%2Fsecondary%2Figcse%2Figcse-science-y8'
  }),
  '../../../../../index.html#/secondary/igcse/igcse-science-y8'
);

assert.strictEqual(
  Navigation.buildReturnUrl({
    pathname: '/interactive-course/content/SPM_Syllabus/Form5/BM/Rumusan/index.html',
    search: ''
  }),
  '../../../../../index.html'
);

assert.strictEqual(
  Navigation.buildReturnUrl({
    pathname: '/interactive-course/content/University/Physics/Kinematics_Simulator/index.html',
    search: ''
  }),
  '../../physics-hub.html'
);

console.log('Navigation core verification passed.');
```

- [ ] **Step 2: Run the failing verification**

Run:

```powershell
node tools\verify_navigation_core.js
```

Expected before implementation:

```text
AssertionError [ERR_ASSERTION]: js/navigation.js should exist
```

- [ ] **Step 3: Add the minimal `js/navigation.js` pure helper implementation**

Create `js/navigation.js`:

```javascript
(function () {
    'use strict';

    const VALID_LEVELS = new Set(['secondary', 'primary']);
    const VALID_SYLLABUSES = new Set(['spm', 'uec', 'igcse', 'sg', 'kssr']);
    const ROUTE_PREFIX = '#/';

    function normalizeHash(hash) {
        const value = String(hash || '').trim();
        const hashIndex = value.indexOf('#/');
        return hashIndex >= 0 ? value.slice(hashIndex) : value;
    }

    function parseRouteHash(hash) {
        const normalized = normalizeHash(hash);
        if (!normalized.startsWith(ROUTE_PREFIX)) {
            return { valid: false, level: null, syllabus: null, layer: null };
        }

        const parts = normalized.slice(2).split('/').filter(Boolean);
        const [level, syllabus, layer] = parts;
        if (parts.length < 2 || !VALID_LEVELS.has(level) || !VALID_SYLLABUSES.has(syllabus)) {
            return { valid: false, level: null, syllabus: null, layer: null };
        }

        return {
            valid: true,
            level,
            syllabus,
            layer: layer || `${syllabus}-subjects`
        };
    }

    function formatRoute(level, syllabus, layer) {
        return `#/${level}/${syllabus}/${layer || `${syllabus}-subjects`}`;
    }

    function isRootRouteHash(hash) {
        return parseRouteHash(hash).valid;
    }

    function withSourceContext(href, routeHash) {
        const [base, hash = ''] = String(href).split('#');
        const separator = base.includes('?') ? '&' : '?';
        return `${base}${separator}from=${encodeURIComponent(routeHash)}${hash ? `#${hash}` : ''}`;
    }

    function stripSitePrefix(pathname) {
        return String(pathname || '')
            .replace(/^\/interactive-course\//, '')
            .replace(/^\//, '');
    }

    function getRelativeRootPrefix(pathname) {
        const relativePath = stripSitePrefix(pathname);
        const parts = relativePath.split('/').filter(Boolean);
        const folderDepth = Math.max(parts.length - 1, 0);
        return '../'.repeat(folderDepth);
    }

    function buildUniversityFallback(pathname) {
        const relativePath = stripSitePrefix(pathname);
        const parts = relativePath.split('/');
        const universityIndex = parts.indexOf('University');
        const faculty = parts[universityIndex + 1];
        const foldersAfterFaculty = Math.max(parts.length - universityIndex - 3, 0);
        const prefixToUniversity = '../'.repeat(foldersAfterFaculty + 1);

        if (faculty && faculty.toLowerCase() === 'physics') {
            return `${prefixToUniversity}physics-hub.html`;
        }

        return `${prefixToUniversity}index.html`;
    }

    function getSearchParam(search, key) {
        const params = new URLSearchParams(String(search || '').replace(/^\?/, ''));
        return params.get(key);
    }

    function buildReturnUrl(options) {
        const pathname = options?.pathname || window.location.pathname;
        const search = options?.search || window.location.search;
        const from = getSearchParam(search, 'from');
        const rootPrefix = getRelativeRootPrefix(pathname);

        if (from && isRootRouteHash(from)) {
            return `${rootPrefix}index.html${from}`;
        }

        if (stripSitePrefix(pathname).startsWith('content/University/')) {
            return buildUniversityFallback(pathname);
        }

        return `${rootPrefix}index.html`;
    }

    window.Navigation = {
        parseRouteHash,
        formatRoute,
        isRootRouteHash,
        withSourceContext,
        getRelativeRootPrefix,
        buildReturnUrl
    };
})();
```

- [ ] **Step 4: Run the core verification**

Run:

```powershell
node tools\verify_navigation_core.js
```

Expected:

```text
Navigation core verification passed.
```

- [ ] **Step 5: Commit Task 1**

Run:

```powershell
git -c safe.directory=C:/GregOS/03_Tutoring_Factory/02_Interactive_Course_Project/interactive-course-main add js/navigation.js tools/verify_navigation_core.js
git -c safe.directory=C:/GregOS/03_Tutoring_Factory/02_Interactive_Course_Project/interactive-course-main commit -m "Add navigation route helpers"
```

Expected:

```text
[registration <sha>] Add navigation route helpers
```

---

### Task 2: Root Landing Page Hash Routing

**Files:**
- Modify: `js/navigation.js`
- Modify: `index.html`
- Create: `tools/verify_navigation_integration.js`

**Interfaces:**
- Consumes: `Navigation.parseRouteHash`, `Navigation.formatRoute`
- Produces: `Navigation.applyRootRoute(route: object): boolean`
- Produces: `Navigation.navigateRoot(level: string, syllabus: string, layer: string, options?: { replace?: boolean }): void`
- Produces: `Navigation.initRootNavigation(): void`

- [ ] **Step 1: Write the failing integration verification**

Create `tools/verify_navigation_integration.js`:

```javascript
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const navJs = fs.readFileSync(path.join(root, 'js', 'navigation.js'), 'utf8');

assert.match(indexHtml, /<script src="js\/navigation\.js\?v=1\.0\.0"><\/script>/, 'index.html should load js/navigation.js before auth-access.js');
assert.match(indexHtml, /Navigation\.initRootNavigation\(\)/, 'index.html should initialize root navigation');
assert.match(indexHtml, /Navigation\.navigateRoot\(/, 'legacy wrapper functions should delegate to Navigation.navigateRoot');

const syllabusIds = [...indexHtml.matchAll(/<div id="([^"]+)" class="syllabus-content/g)].map(match => match[1]);
assert.deepStrictEqual(
  syllabusIds.sort(),
  ['igcse', 'kssr', 'sg', 'spm', 'uec'],
  'known syllabus ids should remain stable'
);

const layerIds = [...indexHtml.matchAll(/<div id="([^"]+)" class="view-layer/g)].map(match => match[1]);
for (const requiredLayer of [
  'spm-subjects',
  'spm-bm',
  'igcse-subjects',
  'igcse-science-y8',
  'sg-year4',
  'kssr-english-y3'
]) {
  assert.ok(layerIds.includes(requiredLayer), `missing route layer: ${requiredLayer}`);
}

assert.match(navJs, /function applyRootRoute/, 'Navigation should implement applyRootRoute');
assert.match(navJs, /function navigateRoot/, 'Navigation should implement navigateRoot');
assert.match(navJs, /function initRootNavigation/, 'Navigation should implement initRootNavigation');
assert.match(navJs, /hashchange/, 'Navigation should listen for hashchange');

console.log('Navigation integration verification passed.');
```

- [ ] **Step 2: Run the failing integration verification**

Run:

```powershell
node tools\verify_navigation_integration.js
```

Expected before integration:

```text
AssertionError [ERR_ASSERTION]: index.html should load js/navigation.js before auth-access.js
```

- [ ] **Step 3: Extend `js/navigation.js` with root DOM integration**

Add these functions before `window.Navigation = { ... }`:

```javascript
    function getDefaultLevelForSyllabus(syllabus) {
        return syllabus === 'kssr' ? 'primary' : 'secondary';
    }

    function setActiveButton(container, selector, predicate) {
        if (!container) return;
        container.querySelectorAll(selector).forEach(button => {
            button.classList.toggle('active', predicate(button));
        });
    }

    function setLevel(level) {
        const secondaryTabs = document.getElementById('secondary-tabs');
        const primaryTabs = document.getElementById('primary-tabs');
        const secondaryButton = document.getElementById('btn-level-secondary');
        const primaryButton = document.getElementById('btn-level-primary');

        if (secondaryTabs) secondaryTabs.style.display = level === 'secondary' ? 'flex' : 'none';
        if (primaryTabs) primaryTabs.style.display = level === 'primary' ? 'flex' : 'none';
        if (secondaryButton) secondaryButton.classList.toggle('active', level === 'secondary');
        if (primaryButton) primaryButton.classList.toggle('active', level === 'primary');
    }

    function activateSyllabusTab(level, syllabus) {
        const tabs = document.getElementById(level === 'primary' ? 'primary-tabs' : 'secondary-tabs');
        setActiveButton(tabs, '.tab-btn', button => {
            const onclick = button.getAttribute('onclick') || '';
            return onclick.includes(`'${syllabus}'`) || onclick.includes(`"${syllabus}"`);
        });
    }

    function activateSyllabusContent(syllabus) {
        document.querySelectorAll('.syllabus-content').forEach(content => {
            content.classList.toggle('active', content.id === syllabus);
        });
    }

    function activateLayer(syllabus, layer) {
        const syllabusContainer = document.getElementById(syllabus);
        if (!syllabusContainer) return false;

        const fallbackLayer = `${syllabus}-subjects`;
        const targetId = document.getElementById(layer) ? layer : fallbackLayer;

        syllabusContainer.querySelectorAll('.view-layer').forEach(viewLayer => {
            viewLayer.classList.toggle('active', viewLayer.id === targetId);
        });

        return true;
    }

    function applyRootRoute(route) {
        if (!route || !route.valid) return false;
        const level = route.level || getDefaultLevelForSyllabus(route.syllabus);

        setLevel(level);
        activateSyllabusTab(level, route.syllabus);
        activateSyllabusContent(route.syllabus);
        return activateLayer(route.syllabus, route.layer || `${route.syllabus}-subjects`);
    }

    function navigateRoot(level, syllabus, layer, options = {}) {
        const routeHash = formatRoute(level || getDefaultLevelForSyllabus(syllabus), syllabus, layer);
        if (window.location.hash === routeHash) {
            applyRootRoute(parseRouteHash(routeHash));
            return;
        }

        if (options.replace) {
            window.history.replaceState(null, document.title, routeHash);
            applyRootRoute(parseRouteHash(routeHash));
            return;
        }

        window.location.hash = routeHash;
    }

    function initRootNavigation() {
        const initialRoute = parseRouteHash(window.location.hash);
        if (initialRoute.valid) {
            applyRootRoute(initialRoute);
        }

        window.addEventListener('hashchange', () => {
            const route = parseRouteHash(window.location.hash);
            if (route.valid) applyRootRoute(route);
        });
    }
```

Then add these functions to `window.Navigation`:

```javascript
        applyRootRoute,
        navigateRoot,
        initRootNavigation
```

- [ ] **Step 4: Load and initialize `js/navigation.js` in `index.html`**

Insert this before the existing `auth-access.js` script near the bottom:

```html
    <script src="js/navigation.js?v=1.0.0"></script>
```

Then add this inside the existing `DOMContentLoaded` handler, after password recovery handling and before applying access control:

```javascript
            if (window.Navigation) {
                window.Navigation.initRootNavigation();
            }
```

- [ ] **Step 5: Replace root navigation function bodies with wrappers**

Replace the existing function bodies in `index.html` with:

```javascript
        function switchSyllabus(event, syllabusId) {
            const secondaryTabs = document.getElementById('secondary-tabs');
            const level = secondaryTabs && secondaryTabs.style.display !== 'none' ? 'secondary' : 'primary';
            if (window.Navigation) {
                window.Navigation.navigateRoot(level, syllabusId, syllabusId + '-subjects');
                return;
            }
            if (event && event.currentTarget) event.currentTarget.classList.add('active');
        }

        function showLessons(syllabusId, lessonContainerId) {
            const level = syllabusId === 'kssr' ? 'primary' : 'secondary';
            if (window.Navigation) {
                window.Navigation.navigateRoot(level, syllabusId, lessonContainerId);
                return;
            }
        }

        function showSubjects(syllabusId) {
            const level = syllabusId === 'kssr' ? 'primary' : 'secondary';
            if (window.Navigation) {
                window.Navigation.navigateRoot(level, syllabusId, syllabusId + '-subjects');
                return;
            }
        }

        function switchLevel(level) {
            const targetSyllabus = level === 'primary' ? 'kssr' : 'spm';
            if (window.Navigation) {
                window.Navigation.navigateRoot(level, targetSyllabus, targetSyllabus + '-subjects');
                return;
            }
        }
```

- [ ] **Step 6: Run root integration checks**

Run:

```powershell
node tools\verify_navigation_integration.js
node tools\verify_navigation_core.js
```

Expected:

```text
Navigation integration verification passed.
Navigation core verification passed.
```

- [ ] **Step 7: Commit Task 2**

Run:

```powershell
git -c safe.directory=C:/GregOS/03_Tutoring_Factory/02_Interactive_Course_Project/interactive-course-main add index.html js/navigation.js tools/verify_navigation_integration.js
git -c safe.directory=C:/GregOS/03_Tutoring_Factory/02_Interactive_Course_Project/interactive-course-main commit -m "Add hash navigation to landing page"
```

Expected:

```text
[registration <sha>] Add hash navigation to landing page
```

---

### Task 3: Module Source Context and Return Controls

**Files:**
- Modify: `js/navigation.js`
- Modify: representative module pages listed in File Structure
- Modify: `tools/verify_navigation_core.js`

**Interfaces:**
- Consumes: `Navigation.withSourceContext`, `Navigation.buildReturnUrl`
- Produces: `Navigation.enhanceModuleLinks(): void`
- Produces: `Navigation.enhanceReturnControls(): void`
- Produces: `Navigation.goBack(): void`
- Produces: `Navigation.init(): void`

- [ ] **Step 1: Extend core verification for link enhancement markers**

Append these assertions to `tools/verify_navigation_core.js`:

```javascript
assert.strictEqual(typeof Navigation.enhanceModuleLinks, 'function', 'enhanceModuleLinks should exist');
assert.strictEqual(typeof Navigation.enhanceReturnControls, 'function', 'enhanceReturnControls should exist');
assert.strictEqual(typeof Navigation.goBack, 'function', 'goBack should exist');
assert.strictEqual(typeof Navigation.init, 'function', 'init should exist');
```

- [ ] **Step 2: Run the failing core verification**

Run:

```powershell
node tools\verify_navigation_core.js
```

Expected before implementation:

```text
AssertionError [ERR_ASSERTION]: enhanceModuleLinks should exist
```

- [ ] **Step 3: Add source-context and return-control functions**

Add these functions before `window.Navigation = { ... }` in `js/navigation.js`:

```javascript
    function getCurrentRouteHash() {
        const parsed = parseRouteHash(window.location.hash);
        if (parsed.valid) return formatRoute(parsed.level, parsed.syllabus, parsed.layer);
        return '';
    }

    function saveScrollForRoute(routeHash) {
        if (!routeHash || !window.sessionStorage) return;
        window.sessionStorage.setItem(`navigation-scroll:${routeHash}`, String(window.scrollY || 0));
    }

    function restoreScrollForRoute(routeHash) {
        if (!routeHash || !window.sessionStorage) return;
        const value = window.sessionStorage.getItem(`navigation-scroll:${routeHash}`);
        if (!value) return;
        window.setTimeout(() => window.scrollTo(0, Number(value) || 0), 0);
    }

    function enhanceModuleLinks() {
        const routeHash = getCurrentRouteHash();
        if (!routeHash) return;

        document.querySelectorAll('a.card[data-module-id]').forEach(link => {
            if (!link.href || link.dataset.navigationEnhanced === 'true') return;
            link.dataset.navigationEnhanced = 'true';
            link.addEventListener('click', () => saveScrollForRoute(routeHash));
            link.setAttribute('href', withSourceContext(link.getAttribute('href'), routeHash));
        });
    }

    function getReturnUrl() {
        return buildReturnUrl({
            pathname: window.location.pathname,
            search: window.location.search
        });
    }

    function goBack() {
        window.location.href = getReturnUrl();
    }

    function shouldEnhanceReturnLink(link) {
        const className = link.className || '';
        const text = (link.textContent || '').trim().toLowerCase();
        return (
            className.includes('home-btn') ||
            className.includes('back-link') ||
            ['home', 'exit', 'back to home', 'back to dashboard'].some(label => text.includes(label))
        );
    }

    function enhanceReturnControls() {
        if (!stripSitePrefix(window.location.pathname).startsWith('content/')) return;
        const returnUrl = getReturnUrl();
        document.querySelectorAll('a[href]').forEach(link => {
            if (!shouldEnhanceReturnLink(link)) return;
            link.setAttribute('href', returnUrl);
            link.setAttribute('data-navigation-return', 'true');
        });
    }

    function init() {
        if (document.querySelector('.syllabus-content')) {
            initRootNavigation();
            enhanceModuleLinks();
            const parsed = parseRouteHash(window.location.hash);
            if (parsed.valid) restoreScrollForRoute(formatRoute(parsed.level, parsed.syllabus, parsed.layer));
            window.addEventListener('hashchange', enhanceModuleLinks);
            return;
        }

        enhanceReturnControls();
    }
```

Add these functions to `window.Navigation`:

```javascript
        enhanceModuleLinks,
        enhanceReturnControls,
        getReturnUrl,
        goBack,
        init
```

- [ ] **Step 4: Replace root initializer call**

In `index.html`, replace:

```javascript
                window.Navigation.initRootNavigation();
```

with:

```javascript
                window.Navigation.init();
```

- [ ] **Step 5: Add `js/navigation.js` to representative modules**

Add the script before `progress-tracker.js` or before `</body>` in each representative module.

For 5-level K-12 modules:

```html
    <script src="../../../../../js/navigation.js?v=1.0.0"></script>
```

For the University Kinematics simulator:

```html
    <script src="../../../../js/navigation.js?v=1.0.0"></script>
```

If a module has no existing bottom script area, place the navigation script immediately before `</body>`.

- [ ] **Step 6: Run core checks**

Run:

```powershell
node tools\verify_navigation_core.js
node --check js\navigation.js
```

Expected:

```text
Navigation core verification passed.
```

and `node --check` exits with code 0.

- [ ] **Step 7: Commit Task 3**

Run:

```powershell
git -c safe.directory=C:/GregOS/03_Tutoring_Factory/02_Interactive_Course_Project/interactive-course-main add js/navigation.js index.html tools/verify_navigation_core.js content/IGCSE_Syllabus/Year8/Science/Chapter1_Respiration/index.html content/SPM_Syllabus/Form5/BM/Rumusan/index.html content/Singapore_Syllabus/Year4/Math/Chapter2_Whole_Number/index.html content/University/Physics/Kinematics_Simulator/index.html
git -c safe.directory=C:/GregOS/03_Tutoring_Factory/02_Interactive_Course_Project/interactive-course-main commit -m "Add module return navigation context"
```

Expected:

```text
[registration <sha>] Add module return navigation context
```

---

### Task 4: Static Scans and Developer Documentation

**Files:**
- Create: `tools/verify_module_navigation_links.js`
- Modify: `docs/HOW_TO_ADD_A_NEW_MODULE.md`
- Modify: `README.md`
- Modify: `package.json`

**Interfaces:**
- Consumes: `js/navigation.js?v=1.0.0`
- Produces: `npm run verify:navigation`

- [ ] **Step 1: Write static module navigation verifier**

Create `tools/verify_module_navigation_links.js`:

```javascript
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const requiredFiles = [
  'index.html',
  'content/IGCSE_Syllabus/Year8/Science/Chapter1_Respiration/index.html',
  'content/SPM_Syllabus/Form5/BM/Rumusan/index.html',
  'content/Singapore_Syllabus/Year4/Math/Chapter2_Whole_Number/index.html',
  'content/University/Physics/Kinematics_Simulator/index.html'
];

for (const relativeFile of requiredFiles) {
  const html = fs.readFileSync(path.join(root, relativeFile), 'utf8');
  assert.match(
    html,
    /navigation\.js\?v=1\.0\.0/,
    `${relativeFile} should load navigation.js v1.0.0`
  );
}

const rootHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert.match(rootHtml, /data-module-id="igcse-y8-sci-ch1"/, 'representative IGCSE module card should still expose data-module-id');
assert.match(rootHtml, /data-module-id="spm-bm-rumusan"/, 'representative SPM module card should still expose data-module-id');
assert.match(rootHtml, /data-module-id="sg-y4-math-whole-number"/, 'representative SG module card should still expose data-module-id');

console.log('Module navigation link verification passed.');
```

- [ ] **Step 2: Add package scripts**

Modify `package.json` scripts to:

```json
{
  "scripts": {
    "build:pdf-catalog": "node tools/run_pdf_catalog.js",
    "verify:pdf-library": "node tools/verify_pdf_library.js",
    "verify:navigation": "node tools/verify_navigation_core.js && node tools/verify_navigation_integration.js && node tools/verify_module_navigation_links.js"
  },
  "dependencies": {
    "@babel/core": "^7.29.7",
    "@babel/preset-react": "^7.29.7",
    "acorn": "^8.17.0",
    "acorn-jsx": "^5.3.2"
  }
}
```

- [ ] **Step 3: Update module creation docs**

In `docs/HOW_TO_ADD_A_NEW_MODULE.md`, replace the local navigation section with this wording:

```markdown
## Pillar 3: Local Navigation (Exit)

Use the shared navigation helper instead of hand-counting folder depth for every Home button.

Add this script near the bottom of the module, before `progress-tracker.js` when both scripts are present:

```html
<script src="../../../../../js/navigation.js?v=1.0.0"></script>
```

The `../` prefix still depends on the module folder depth, but it is now used only to load the shared helper. The helper reads the `from` query parameter added by the landing page and rewrites existing Home/Back links to return to the exact syllabus layer the learner came from.

For a new module, include one simple fallback link:

```html
<a href="../../../../../index.html" class="home-btn-fixed">Back</a>
```

When `navigation.js` loads, it updates that fallback link automatically. If a learner opens the module directly without a source route, the fallback still works.
```

- [ ] **Step 4: Update README developer note**

Add this section after the feature list in `README.md`:

```markdown
## Navigation Routing

The landing page uses hash routes such as `/#/secondary/igcse/igcse-science-y8` to remember the active syllabus and lesson layer. Module cards are enhanced at runtime by `js/navigation.js` so a module can return to the exact list or hub that opened it.

New modules should load `js/navigation.js?v=1.0.0` before `progress-tracker.js` and keep a simple Home/Back fallback link. The helper rewrites that link when source context is available.
```

- [ ] **Step 5: Run navigation verification**

Run:

```powershell
npm run verify:navigation
```

Expected:

```text
Navigation core verification passed.
Navigation integration verification passed.
Module navigation link verification passed.
```

- [ ] **Step 6: Commit Task 4**

Run:

```powershell
git -c safe.directory=C:/GregOS/03_Tutoring_Factory/02_Interactive_Course_Project/interactive-course-main add tools/verify_module_navigation_links.js package.json docs/HOW_TO_ADD_A_NEW_MODULE.md README.md
git -c safe.directory=C:/GregOS/03_Tutoring_Factory/02_Interactive_Course_Project/interactive-course-main commit -m "Document shared navigation workflow"
```

Expected:

```text
[registration <sha>] Document shared navigation workflow
```

---

### Task 5: Browser-Level Manual Verification and Final Push

**Files:**
- No planned source changes unless a verification failure identifies a specific defect.

**Interfaces:**
- Consumes: all previous tasks.
- Produces: pushed `registration` branch ready for GitHub Pages deployment.

- [ ] **Step 1: Run all navigation checks**

Run:

```powershell
npm run verify:navigation
node tools\verify_auth_recovery.js
node --check js\navigation.js
node --check js\auth-access.js
```

Expected:

```text
Navigation core verification passed.
Navigation integration verification passed.
Module navigation link verification passed.
Auth recovery verification passed.
```

Both `node --check` commands should exit with code 0.

- [ ] **Step 2: Start a static local server**

Run:

```powershell
npx http-server . -p 4173
```

Expected:

```text
Available on:
  http://127.0.0.1:4173
```

If `npx http-server` is unavailable, run:

```powershell
python -m http.server 4173
```

Expected:

```text
Serving HTTP on :: port 4173
```

- [ ] **Step 3: Manual browser checks**

Open:

```text
http://127.0.0.1:4173/index.html#/secondary/igcse/igcse-science-y8
```

Verify:

- The IGCSE tab is active.
- The Science Year 8 layer is visible.
- Clicking the Chapter 1 Respiration card opens a URL containing `from=%23%2Fsecondary%2Figcse%2Figcse-science-y8`.
- The module Home/Back link points to `../../../../../index.html#/secondary/igcse/igcse-science-y8`.

Open:

```text
http://127.0.0.1:4173/content/University/Physics/Kinematics_Simulator/index.html
```

Verify:

- The Back link points to `../../physics-hub.html`.

- [ ] **Step 4: Final status check**

Run:

```powershell
git -c safe.directory=C:/GregOS/03_Tutoring_Factory/02_Interactive_Course_Project/interactive-course-main status --short
```

Expected:

```text

```

No output means all task commits are clean.

- [ ] **Step 5: Push**

Run:

```powershell
git -c safe.directory=C:/GregOS/03_Tutoring_Factory/02_Interactive_Course_Project/interactive-course-main push origin registration
```

Expected:

```text
registration -> registration
```

---

## Self-Review Notes

- Spec coverage: Tasks cover central `navigation.js`, hash route state, module source context, University fallback, direct module fallback, verification scripts, and developer documentation.
- Scope check: The plan does not migrate to a framework, does not reorganize content folders, and does not change Supabase auth or progress schema.
- Placeholder scan: The plan uses exact file paths, exact commands, concrete script bodies, and concrete expected outputs.
- Type consistency: All functions referenced in later tasks are introduced in Task 1, Task 2, or Task 3 with the same names.
