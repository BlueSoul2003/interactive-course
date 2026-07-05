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
  Object.assign({}, Navigation.parseRouteHash('#/secondary/igcse/igcse-science-y8')),
  { valid: true, level: 'secondary', syllabus: 'igcse', layer: 'igcse-science-y8' }
);

assert.deepStrictEqual(
  Object.assign({}, Navigation.parseRouteHash('/#/primary/kssr/kssr-english-y3')),
  { valid: true, level: 'primary', syllabus: 'kssr', layer: 'kssr-english-y3' }
);

assert.deepStrictEqual(
  Object.assign({}, Navigation.parseRouteHash('#/wrong/spm/spm-bm')),
  { valid: false, level: null, syllabus: null, layer: null }
);

assert.deepStrictEqual(
  Object.assign({}, Navigation.parseRouteHash('#/primary/spm/spm-bm')),
  { valid: false, level: null, syllabus: null, layer: null }
);

assert.deepStrictEqual(
  Object.assign({}, Navigation.parseRouteHash('#/secondary/kssr/kssr-english-y3')),
  { valid: false, level: null, syllabus: null, layer: null }
);

assert.deepStrictEqual(
  Object.assign({}, Navigation.parseRouteHash('#/secondary/spm')),
  { valid: false, level: null, syllabus: null, layer: null }
);

assert.deepStrictEqual(
  Object.assign({}, Navigation.parseRouteHash('#/secondary/spm/spm-bm/extra')),
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

assert.strictEqual(
  Navigation.buildReturnUrl({
    pathname: '/interactive-course/content/University/Japanese/Family/index.html',
    search: ''
  }),
  '../../japanese-hub.html'
);

assert.strictEqual(
  Navigation.buildReturnUrl({
    pathname: '/interactive-course/content/University/Chemistry/Organic/index.html',
    search: ''
  }),
  '../../chemistry-hub.html'
);

assert.strictEqual(
  Navigation.buildReturnUrl({
    pathname: '/interactive-course/content/University/index.html',
    search: ''
  }),
  'index.html'
);

assert.strictEqual(typeof Navigation.enhanceModuleLinks, 'function', 'enhanceModuleLinks should exist');
assert.strictEqual(typeof Navigation.enhanceReturnControls, 'function', 'enhanceReturnControls should exist');
assert.strictEqual(typeof Navigation.goBack, 'function', 'goBack should exist');
assert.strictEqual(typeof Navigation.init, 'function', 'init should exist');

console.log('Navigation core verification passed.');
