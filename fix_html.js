const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace('<option value="Admin" id="optRoleAdmin">Admin</option>', '');
html = html.replace("document.getElementById('optRoleAdmin').innerText = t.roleAdmin;", '');
fs.writeFileSync('index.html', html);
console.log('Fixed HTML');
