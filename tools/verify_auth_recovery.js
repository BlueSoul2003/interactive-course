const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repoRoot = path.resolve(__dirname, '..');
const authAccessSource = fs.readFileSync(path.join(repoRoot, 'js', 'auth-access.js'), 'utf8');

function loadAuthAccess(href) {
  const calls = [];
  const locationUrl = new URL(href);
  const fakeAuth = {
    exchangeCodeForSession: async (code) => {
      calls.push(['exchangeCodeForSession', code]);
      return { data: { session: { access_token: 'new-access' } }, error: null };
    },
    verifyOtp: async (payload) => {
      calls.push(['verifyOtp', payload]);
      return { data: { session: { access_token: 'verified-access' } }, error: null };
    },
    setSession: async (session) => {
      calls.push(['setSession', session]);
      return { data: { session }, error: null };
    },
    resetPasswordForEmail: async () => ({ data: {}, error: null }),
    updateUser: async () => ({ data: {}, error: null }),
    signInWithPassword: async () => ({ data: {}, error: null }),
    signUp: async () => ({ data: {}, error: null }),
    signOut: async () => ({ data: {}, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
  };

  const window = {
    location: locationUrl,
    history: {
      replacedUrl: null,
      replaceState(_state, _title, url) {
        this.replacedUrl = url;
      },
    },
    supabase: {
      createClient: () => ({
        auth: fakeAuth,
        from: () => ({
          select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }),
          insert: () => ({ select: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }),
          upsert: async () => ({ error: null }),
        }),
        rpc: async () => ({ data: null, error: null }),
      }),
    },
  };

  const context = vm.createContext({
    window,
    console,
    URL,
    URLSearchParams,
    parseInt,
    setTimeout,
  });
  vm.runInContext(authAccessSource, context, { filename: 'js/auth-access.js' });
  return { AuthAccess: window.AuthAccess, calls, window };
}

async function run() {
  {
    const { AuthAccess, calls, window } = loadAuthAccess(
      'https://bluesoul2003.github.io/interactive-course/index.html?code=recovery-code&type=recovery&keep=1'
    );
    const result = await AuthAccess.handlePasswordRecoveryRedirect();
    assert.equal(result.recovery, true);
    assert.deepEqual(calls, [['exchangeCodeForSession', 'recovery-code']]);
    assert.equal(window.history.replacedUrl, '/interactive-course/index.html?keep=1');
  }

  {
    const { AuthAccess, calls, window } = loadAuthAccess(
      'https://bluesoul2003.github.io/interactive-course/index.html#access_token=access-123&refresh_token=refresh-456&type=recovery'
    );
    const result = await AuthAccess.handlePasswordRecoveryRedirect();
    assert.equal(result.recovery, true);
    assert.deepEqual(calls, [
      ['setSession', { access_token: 'access-123', refresh_token: 'refresh-456' }],
    ]);
    assert.equal(window.history.replacedUrl, '/interactive-course/index.html');
  }

  {
    const { AuthAccess, calls, window } = loadAuthAccess(
      'https://bluesoul2003.github.io/interactive-course/index.html?token_hash=hash-123&type=recovery'
    );
    const result = await AuthAccess.handlePasswordRecoveryRedirect();
    assert.equal(result.recovery, true);
    assert.deepEqual(calls, [['verifyOtp', { token_hash: 'hash-123', type: 'recovery' }]]);
    assert.equal(window.history.replacedUrl, '/interactive-course/index.html');
  }

  {
    const { AuthAccess, calls, window } = loadAuthAccess(
      'https://bluesoul2003.github.io/interactive-course/index.html?view=home'
    );
    const result = await AuthAccess.handlePasswordRecoveryRedirect();
    assert.equal(result.recovery, false);
    assert.deepEqual(calls, []);
    assert.equal(window.history.replacedUrl, null);
  }
}

run().then(
  () => {
    console.log('Auth recovery verification passed.');
  },
  (error) => {
    console.error(error);
    process.exit(1);
  }
);
