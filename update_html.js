const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
const regex = /(<a href="content\/SPM_Syllabus\/Form5\/[^"]+"[^>]*class="card[^"]*")/g;
html = html.replace(regex, '$1 data-bundle="spm_form5"');
fs.writeFileSync('index.html', html);
console.log('Updated index.html');
