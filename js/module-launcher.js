(function () {
  'use strict';

  const state = { moduleId: '', module: null, busy: false };
  const views = ['loading-view', 'login-form', 'pin-form'];

  function element(id) {
    return document.getElementById(id);
  }

  function showView(id) {
    views.forEach(viewId => element(viewId).classList.toggle('hidden', viewId !== id));
  }

  function setCopy(title, message, error = '') {
    element('launcher-title').textContent = title;
    element('launcher-message').textContent = message;
    element('launcher-status').textContent = error;
  }

  function setBusy(form, busy) {
    state.busy = busy;
    form.querySelectorAll('button, input').forEach(control => { control.disabled = busy; });
  }

  async function loadModule() {
    const moduleId = new URL(window.location.href).searchParams.get('module') || '';
    if (!/^[a-z0-9][a-z0-9-]{1,99}$/.test(moduleId)) {
      throw new Error('This course link is invalid. Please choose the course again from the portal.');
    }

    const response = await fetch('resources/module-manifest.json', { cache: 'no-cache' });
    if (!response.ok) throw new Error('The course directory could not be loaded. Please try again.');
    const manifest = await response.json();
    const moduleEntry = manifest.modules?.find(entry => entry.id === moduleId);
    const isPrivate = moduleEntry?.delivery === 'private';
    const isPublic = moduleEntry?.delivery === 'public'
      && typeof moduleEntry.path === 'string'
      && moduleEntry.path.startsWith('content/');
    if (!moduleEntry || (!isPrivate && !isPublic)) {
      throw new Error('This course is not registered in the launcher.');
    }

    state.moduleId = moduleId;
    state.module = moduleEntry;
    element('course-name').textContent = moduleEntry.title || moduleId;
    element('course-name').classList.remove('hidden');
  }

  async function launch() {
    if (state.module.delivery === 'private') {
      setCopy('Opening your private course', 'Access confirmed. Securely loading your lesson now.');
      showView('loading-view');
      const html = await window.AuthAccess.fetchProtectedModule(state.moduleId);
      // Replace the launcher document while retaining the portal origin. This
      // lets the private lesson call its authenticated API without a null
      // Blob origin and keeps the account token out of URLs and history.
      document.open('text/html', 'replace');
      document.write(html);
      document.close();
      return;
    }
    const target = new URL(state.module.path, new URL('./', window.location.href));
    if (target.origin !== window.location.origin || !target.pathname.includes('/content/')) {
      throw new Error('The registered course route is not safe to open.');
    }
    setCopy('Opening your course', 'Access confirmed. Your lesson is opening now.');
    showView('loading-view');
    window.location.replace(target.href);
  }

  async function checkAccess() {
    showView('loading-view');
    setCopy('Checking course access', 'Please wait while we securely prepare your lesson.');
    const decision = await window.AuthAccess.canLaunchModule(state.moduleId);

    if (decision?.allowed === true) {
      await launch();
      return;
    }

    const reason = decision?.reason || 'access_check_failed';
    const signedIn = !['authentication_required', 'anonymous_account_not_allowed'].includes(reason);
    element('sign-out-button').classList.toggle('hidden', !signedIn);

    if (reason === 'authentication_required' || reason === 'anonymous_account_not_allowed') {
      setCopy('Sign in to continue', 'Use the account assigned by your teacher, then we will open the course automatically.');
      showView('login-form');
      element('login-email').focus();
      return;
    }

    if (reason === 'not_entitled') {
      setCopy('Activation required', 'This account is signed in, but this course still needs an activation PIN.');
      showView('pin-form');
      element('pin-code').focus();
      return;
    }

    if (reason === 'profile_required') {
      setCopy('Account setup incomplete', 'Your account exists, but its learning profile is not ready.', 'Please contact your teacher to finish the account setup.');
      showView('loading-view');
      return;
    }

    throw new Error(reason === 'module_not_found'
      ? 'This course is no longer available.'
      : 'We could not confirm access to this course. Please try again.');
  }

  async function handleLogin(event) {
    event.preventDefault();
    if (state.busy) return;
    const form = event.currentTarget;
    const email = element('login-email').value.trim();
    const password = element('login-password').value;
    element('launcher-status').textContent = '';
    if (!email || !password) {
      element('launcher-status').textContent = 'Enter both your email and password.';
      return;
    }

    setBusy(form, true);
    try {
      const { error } = await window.AuthAccess.signIn(email, password);
      if (error) throw error;
      await checkAccess();
    } catch (error) {
      element('launcher-status').textContent = error?.message || 'Sign-in failed. Check your details and try again.';
    } finally {
      setBusy(form, false);
    }
  }

  async function handlePin(event) {
    event.preventDefault();
    if (state.busy) return;
    const form = event.currentTarget;
    const pin = element('pin-code').value.trim();
    element('launcher-status').textContent = '';
    if (!pin) {
      element('launcher-status').textContent = 'Enter the activation PIN from your teacher.';
      return;
    }

    setBusy(form, true);
    try {
      const result = await window.AuthAccess.redeemPin(pin, state.moduleId);
      if (result?.success === false) throw new Error(result.message || 'This PIN could not unlock the course.');
      await checkAccess();
    } catch (error) {
      element('launcher-status').textContent = error?.message || 'The PIN could not be accepted. Please check it and try again.';
    } finally {
      setBusy(form, false);
    }
  }

  async function handleSignOut() {
    element('launcher-status').textContent = '';
    try {
      await window.AuthAccess.signOut();
      element('sign-out-button').classList.add('hidden');
      await checkAccess();
    } catch (error) {
      element('launcher-status').textContent = error?.message || 'Could not switch accounts. Please try again.';
    }
  }

  async function initialise() {
    element('login-form').addEventListener('submit', handleLogin);
    element('pin-form').addEventListener('submit', handlePin);
    element('sign-out-button').addEventListener('click', handleSignOut);

    try {
      await loadModule();
      if (!window.AuthAccess || !window.supabaseClient) {
        throw new Error('The secure course connection is unavailable. Check your internet connection and reload.');
      }
      await checkAccess();
    } catch (error) {
      showView('loading-view');
      element('loading-view').classList.add('hidden');
      setCopy('Course could not be opened', 'Return to the course portal and try again.', error?.message || 'Unknown launcher error.');
    }
  }

  document.addEventListener('DOMContentLoaded', initialise, { once: true });
}());
