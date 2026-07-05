const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const navJs = fs.readFileSync(path.join(root, 'js', 'navigation.js'), 'utf8');

assert.match(indexHtml, /<script src="js\/navigation\.js\?v=1\.0\.0"><\/script>/, 'index.html should load js/navigation.js before auth-access.js');
assert.match(indexHtml, /Navigation\.init\(\)/, 'index.html should initialize shared navigation');
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

function createElement(id, className = '', attributes = {}) {
  const classes = new Set(className.split(/\s+/).filter(Boolean));
  const element = {
    id,
    className,
    attributes,
    children: [],
    style: {},
    classList: {
      toggle(name, force) {
        const shouldHave = force === undefined ? !classes.has(name) : Boolean(force);
        if (shouldHave) classes.add(name);
        else classes.delete(name);
        element.className = [...classes].join(' ');
      },
      contains(name) {
        return classes.has(name);
      }
    },
    getAttribute(name) {
      return this.attributes[name] || '';
    },
    querySelectorAll(selector) {
      const matches = [];
      const wantedClass = selector.startsWith('.') ? selector.slice(1) : null;
      function visit(node) {
        if (wantedClass && node.classList.contains(wantedClass)) matches.push(node);
        node.children.forEach(visit);
      }
      this.children.forEach(visit);
      return matches;
    }
  };
  return element;
}

function createFakeDocument() {
  const elements = new Map();
  function add(element, parent = null) {
    elements.set(element.id, element);
    if (parent) parent.children.push(element);
    return element;
  }

  const secondaryTabs = add(createElement('secondary-tabs'));
  add(createElement('tab-spm', 'tab-btn active', { onclick: "switchSyllabus(event, 'spm')" }), secondaryTabs);
  add(createElement('tab-igcse', 'tab-btn', { onclick: "switchSyllabus(event, 'igcse')" }), secondaryTabs);

  const primaryTabs = add(createElement('primary-tabs'));
  add(createElement('tab-kssr', 'tab-btn', { onclick: "switchSyllabus(event, 'kssr')" }), primaryTabs);

  add(createElement('btn-level-secondary', 'active'));
  add(createElement('btn-level-primary'));

  const spm = add(createElement('spm', 'syllabus-content active'));
  add(createElement('spm-subjects', 'view-layer active'), spm);
  add(createElement('spm-bm', 'view-layer'), spm);

  const igcse = add(createElement('igcse', 'syllabus-content'));
  add(createElement('igcse-subjects', 'view-layer'), igcse);
  add(createElement('igcse-science-y8', 'view-layer'), igcse);

  const kssr = add(createElement('kssr', 'syllabus-content'));
  add(createElement('kssr-subjects', 'view-layer'), kssr);
  add(createElement('kssr-english-y3', 'view-layer'), kssr);

  return {
    title: 'Test',
    getElementById(id) {
      return elements.get(id) || null;
    },
    querySelectorAll(selector) {
      const wantedClass = selector.startsWith('.') ? selector.slice(1) : null;
      return [...elements.values()].filter(element => wantedClass && element.classList.contains(wantedClass));
    }
  };
}

const fakeDocument = createFakeDocument();
const sandbox = {
  window: {
    location: { hash: '', pathname: '/interactive-course/index.html', search: '' },
    history: { replaceState() {} },
    addEventListener() {}
  },
  document: fakeDocument,
  URLSearchParams,
  console
};
sandbox.globalThis = sandbox;

vm.runInNewContext(navJs, sandbox, { filename: path.join(root, 'js', 'navigation.js') });
const Navigation = sandbox.window.Navigation;

assert.deepStrictEqual(
  Object.assign({}, Navigation.parseRouteHash('#/primary/spm/spm-bm')),
  { valid: false, level: null, syllabus: null, layer: null },
  'level/syllabus mismatches should be invalid'
);

Navigation.applyRootRoute({ valid: true, level: 'secondary', syllabus: 'spm', layer: 'igcse-science-y8' });
assert.ok(fakeDocument.getElementById('spm-subjects').classList.contains('active'), 'cross-syllabus layers should fall back to syllabus subjects');
assert.ok(!fakeDocument.getElementById('spm-bm').classList.contains('active'), 'non-target SPM layer should stay inactive');

console.log('Navigation integration verification passed.');
