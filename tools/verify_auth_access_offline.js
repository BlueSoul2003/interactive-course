const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.resolve(__dirname, '..', 'js', 'auth-access.js'), 'utf8');
const window = {};
const context = vm.createContext({
  window,
  document: {},
  URL,
  console,
  alert() {},
});

try {
  vm.runInContext(source, context, { filename: 'auth-access.js' });
} catch (error) {
  throw new Error(`auth-access.js must initialise without the Supabase CDN: ${error.message}`);
}

if (!window.AuthAccess) throw new Error('AuthAccess API was not exposed');
if (window.supabaseClient !== null) throw new Error('Offline startup must use a null Supabase client');

console.log('PASS verify_auth_access_offline');
