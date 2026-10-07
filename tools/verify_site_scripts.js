// Parse the scripts shipped by Pages before publishing. Never executes course code.
const fs = require('node:fs');
const path = require('node:path');
const acorn = require('acorn');
const babel = require('@babel/core');
const root = path.resolve(__dirname, '..');

function attr(tag, name) {
  const match = tag.match(new RegExp('(?:^|\\s)' + name + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))', 'i'));
  return match ? (match[1] ?? match[2] ?? match[3]) : '';
}
function parse(code, type = '') {
  if (type === 'text/babel' || type === 'text/jsx') {
    babel.transformSync(code, { configFile: false, babelrc: false, presets: [require.resolve('@babel/preset-react')] });
  } else {
    acorn.parse(code, { ecmaVersion: 'latest', sourceType: type === 'module' ? 'module' : 'script', allowHashBang: true });
  }
}
function checkHtml(text, filename) {
  const errors = []; let count = 0;
  // Observed encoding damage removed '<' from closing tags, nesting hidden sections.
  if (/\?\/(?:div|span)>/i.test(text)) errors.push(`${filename}: damaged closing tag`);
  const scripts = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
  for (const match of text.matchAll(scripts)) {
    const type = attr(match[1], 'type').toLowerCase().split(';')[0].trim();
    if (attr(match[1], 'src') || !['', 'module', 'text/javascript', 'application/javascript', 'text/babel', 'text/jsx'].includes(type)) continue;
    count++;
    try { parse(match[2], type); }
    catch (error) {
      const bodyStart = match.index + match[0].indexOf('>') + 1;
      const line = text.slice(0, bodyStart).split('\n').length + (error.loc?.line || 1) - 1;
      errors.push(`${filename}:${line}: ${error.message}`);
    }
  }
  return { errors, count };
}
function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const p = path.join(dir, entry.name);
    return entry.isDirectory() ? files(p) : [p];
  });
}
function main() {
  const shipped = ['index.html', 'notes.html', 'launcher.html', 'orders.html', 'learning.html', ...['content','hardcopy','js','resources'].flatMap(dir => files(path.join(root,dir)).map(p => path.relative(root,p)))];
  let htmlCount = 0, scriptCount = 0; const errors = [];
  for (const filename of shipped) {
    if (!/\.(html|js|mjs)$/i.test(filename)) continue;
    const source = fs.readFileSync(path.join(root, filename), 'utf8');
    if (/\.html$/i.test(filename)) {
      htmlCount++; const result = checkHtml(source, filename); scriptCount += result.count; errors.push(...result.errors);
    } else {
      scriptCount++;
      try { parse(source, filename.endsWith('.mjs') ? 'module' : ''); }
      catch(error) { errors.push(`${filename}: ${error.message}`); }
    }
  }
  console.log(`Checked ${htmlCount} published HTML files and ${scriptCount} scripts (including JSX).`);
  if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
  else console.log('Published script syntax passed. This does not certify runtime or commercial readiness.');
}
module.exports = { checkHtml, parse };
if (require.main === module) main();
