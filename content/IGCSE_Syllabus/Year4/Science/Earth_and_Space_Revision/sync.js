/* Optional integration with the existing course progress SDK. Local practice does not depend on it. */
(function () {
  'use strict';
  const tracker = window.ProgressTracker, app = window.EarthSpaceApp;
  if (!tracker || !app) return;
  let ready = false, pending = null;
  window.addEventListener('earth-space-save', e => {
    if (ready) tracker.autoSave(e.detail);
    else pending = e.detail;
  });
  // Leave the auth event callback before making authenticated calls (avoids auth-lock re-entry).
  tracker.init(() => { setTimeout(async () => {
    try {
      const remote = await tracker.load();
      if (remote) app.mergeRemote(remote);
    } catch (_) { /* Keep local practice available if the service cannot be reached. */ }
    ready = true;
    if (pending) { tracker.autoSave(app.cloudState()); pending = null; }
  }, 0); });
  document.addEventListener('visibilitychange', () => { if (ready && document.visibilityState === 'hidden') tracker.save(app.cloudState()).catch(() => {}); });
})();
