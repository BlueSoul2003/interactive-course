const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const sources = [
  'index.html',
  'content/University/index.html',
  'content/University/adult-english-hub.html',
];

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function getAttribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'));
  return match ? match[2].trim() : null;
}

const modules = new Map();

for (const source of sources) {
  const absoluteSource = path.join(root, source);
  const html = fs.readFileSync(absoluteSource, 'utf8');
  const anchors = html.matchAll(/<a\b[^>]*\bdata-module-id\s*=\s*(["']).*?\1[^>]*>[\s\S]*?<\/a>/gi);

  for (const match of anchors) {
    const anchor = match[0];
    const openingTag = anchor.slice(0, anchor.indexOf('>') + 1);
    const id = getAttribute(openingTag, 'data-module-id');
    const href = getAttribute(openingTag, 'href');
    if (!id || !href) throw new Error(`Missing module ID or href in ${source}`);
    if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) throw new Error(`Invalid module ID: ${id}`);
    if (/^(?:[a-z]+:|\/\/|#)/i.test(href)) throw new Error(`Unsafe module href for ${id}: ${href}`);

    const relativePath = path.posix.normalize(path.posix.join(path.posix.dirname(source), href.replace(/\\/g, '/')));
    if (!relativePath.startsWith('content/') || relativePath.includes('../')) {
      throw new Error(`Module path escapes the content directory for ${id}: ${relativePath}`);
    }
    if (!fs.existsSync(path.join(root, relativePath))) {
      throw new Error(`Module target does not exist for ${id}: ${relativePath}`);
    }

    const titleMatch = anchor.match(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/i);
    const title = decodeHtml((titleMatch ? titleMatch[1] : id).replace(/<[^>]+>/g, ''));
    const existing = modules.get(id);
    if (existing && existing.path !== relativePath) {
      throw new Error(`Conflicting paths for ${id}: ${existing.path} and ${relativePath}`);
    }
    modules.set(id, { id, title, path: relativePath });
  }
}

const output = {
  schemaVersion: 1,
  generatedFrom: sources,
  modules: [...modules.values()].sort((a, b) => a.id.localeCompare(b.id)),
};

const target = path.join(root, 'resources', 'module-manifest.json');
fs.writeFileSync(target, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(`Wrote ${output.modules.length} module routes to ${path.relative(root, target)}`);
