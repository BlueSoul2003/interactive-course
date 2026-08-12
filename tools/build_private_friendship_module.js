const fs = require('fs');
const path = require('path');

const [sourceArg, outputArg] = process.argv.slice(2);
if (!sourceArg || !outputArg) {
  throw new Error('Usage: node tools/build_private_friendship_module.js <source-directory> <output-html>');
}

const sourceDir = path.resolve(sourceArg);
const outputFile = path.resolve(outputArg);
const read = file => fs.readFileSync(path.join(sourceDir, file), 'utf8');

let html = read('index.html');
const css = read('friendship.css');
const javascript = read('friendship.js');

if (!javascript.includes('__MODULE_ACCESS_TOKEN_JSON__')) {
  throw new Error('Friendship source is missing the private access-token placeholder.');
}
if (!html.includes('<link rel="stylesheet" href="friendship.css">')) {
  throw new Error('Friendship stylesheet marker was not found.');
}
if (!html.includes('<script src="friendship.js" defer></script>')) {
  throw new Error('Friendship script marker was not found.');
}

const csp = [
  "default-src 'none'",
  "script-src 'nonce-__MODULE_CSP_NONCE__'",
  "style-src 'nonce-__MODULE_CSP_NONCE__'",
  'frame-src https://www.youtube-nocookie.com',
  'connect-src https://ycsixsyssbdovpmmhefz.supabase.co',
  "img-src data:",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ');

html = html
  .replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/, `<meta http-equiv="Content-Security-Policy" content="${csp}">`)
  .replace('<link rel="stylesheet" href="friendship.css">', `<style nonce="__MODULE_CSP_NONCE__">\n${css}\n</style>`)
  .replace('<a class="back-link" href="../index.html">Adult English</a>', '<a class="back-link" href="https://bluesoul2003.github.io/interactive-course/content/University/adult-english-hub.html">Adult English</a>')
  .replace('<script src="friendship.js" defer></script>', `<script nonce="__MODULE_CSP_NONCE__">\n${javascript}\n</script>`);

if ((html.match(/__MODULE_ACCESS_TOKEN_JSON__/g) || []).length !== 1) {
  throw new Error('Private module must contain exactly one access-token placeholder.');
}
if ((html.match(/__MODULE_CSP_NONCE__/g) || []).length < 3) {
  throw new Error('Private module CSP nonce placeholders are incomplete.');
}

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, html, 'utf8');
console.log(`Built private Friendship module (${Buffer.byteLength(html)} bytes)`);
