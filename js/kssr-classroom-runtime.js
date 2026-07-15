(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.KssrClassroomRuntime = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';

  const ACTIVE_PROFILE_KEY = 'kssr-active-profile:v1';
  const MUTED_KEY = 'kssr-classroom-muted:v1';
  const SYNC_DELAY = 900;

  function safeParse(value, fallback) {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch (_error) {
      return fallback;
    }
  }

  function isTextControl(element) {
    return element && ['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName);
  }

  function collectResponse(card) {
    const selectedChoices = [...card.querySelectorAll('[data-choice][aria-pressed="true"]')]
      .map((button) => button.dataset.value);
    if (selectedChoices.length === 1) return selectedChoices[0];
    if (selectedChoices.length > 1) return selectedChoices;

    const selectedMulti = [...card.querySelectorAll('[data-multi-choice][aria-pressed="true"]')]
      .map((button) => button.dataset.value);
    if (selectedMulti.length > 0) return selectedMulti;

    const controls = [...card.querySelectorAll('[data-response]')];
    if (controls.length === 0) return '';

    const checkboxes = controls.filter((control) => control.type === 'checkbox');
    if (checkboxes.length > 0) return checkboxes.filter((control) => control.checked).map((control) => control.value);

    const radios = controls.filter((control) => control.type === 'radio');
    if (radios.length > 0) return radios.find((control) => control.checked)?.value || '';

    if (controls.length === 1) return controls[0].value;
    return controls.map((control) => control.value);
  }

  function restoreResponse(card, response) {
    [...card.querySelectorAll('[data-choice], [data-multi-choice]')].forEach((button) => {
      const pressed = Array.isArray(response)
        ? response.includes(button.dataset.value)
        : response === button.dataset.value;
      button.setAttribute('aria-pressed', pressed ? 'true' : 'false');
    });

    const controls = [...card.querySelectorAll('[data-response]')];
    controls.forEach((control, index) => {
      if (control.type === 'checkbox' || control.type === 'radio') {
        control.checked = Array.isArray(response) ? response.includes(control.value) : response === control.value;
      } else if (Array.isArray(response)) {
        control.value = response[index] || '';
      } else {
        control.value = response == null ? '' : response;
      }
    });
  }

  function start(config) {
    const Core = root.KssrClassroomCore;
    const document = root.document;
    if (!Core || !document) throw new Error('KSSR classroom core and document are required');

    const app = document.querySelector('[data-classroom-app]');
    if (!app) throw new Error('Missing [data-classroom-app] root');

    const activities = config.activities || [];
    const activityById = Object.fromEntries(activities.map((activity) => [activity.id, activity]));
    const cards = [...app.querySelectorAll('.question-card[data-activity-id]')];
    const cardById = Object.fromEntries(cards.map((card) => [card.dataset.activityId, card]));
    const storage = root.localStorage;
    let profiles = loadProfiles();
    let activeProfile = null;
    let state = null;
    let remoteEnvelope = { schemaVersion: Core.SCHEMA_VERSION, profiles: {} };
    let tracker = null;
    let syncTimer = null;
    let actionLocked = false;
    let muted = storage.getItem(MUTED_KEY) === 'true';
    let audioContext = null;
    let tutorHoldTimer = null;

    const profileGate = document.getElementById('profileGate');
    const profileList = app.querySelector('[data-profile-list]');
    const profileLabel = app.querySelector('[data-active-profile]');
    const progressBar = document.getElementById('progressBar');
    const progressStatus = document.getElementById('progressStatus');
    const syncStatus = app.querySelector('[data-sync-status]');
    const summaryPanel = document.getElementById('teacherSummary');

    function loadProfiles() {
      const saved = safeParse(storage.getItem(Core.profileKey()), null);
      if (saved && Array.isArray(saved.profiles) && saved.profiles.length === 2) return saved.profiles;
      const timestamp = new Date().toISOString();
      const initial = [
        Core.createProfile('profile-1', 'Student 1', 'A', timestamp),
        Core.createProfile('profile-2', 'Student 2', 'B', timestamp),
      ];
      storage.setItem(Core.profileKey(), JSON.stringify({ schemaVersion: 1, profiles: initial }));
      return initial;
    }

    function saveProfiles() {
      storage.setItem(Core.profileKey(), JSON.stringify({ schemaVersion: 1, profiles }));
    }

    function renderProfiles() {
      if (!profileList) return;
      profileList.replaceChildren();
      profiles.forEach((profile) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'profile-card';
        button.dataset.profileId = profile.id;
        const avatar = document.createElement('span');
        avatar.className = 'profile-avatar';
        avatar.textContent = profile.avatar;
        const name = document.createElement('span');
        name.className = 'profile-name';
        name.textContent = profile.name;
        const action = document.createElement('span');
        action.className = 'profile-action';
        action.textContent = 'Start / 开始';
        button.append(avatar, name, action);
        button.addEventListener('click', () => selectProfile(profile.id));
        profileList.append(button);
      });
    }

    function stateRecord(profileId) {
      return safeParse(storage.getItem(Core.unitKey(config.moduleId, profileId)), null);
    }

    function loadState(profileId) {
      const record = stateRecord(profileId);
      const base = Core.createUnitState(activities.map((activity) => activity.id));
      if (!record || !record.state) return base;
      return {
        ...base,
        ...record.state,
        activityOrder: base.activityOrder,
        attempts: { ...base.attempts, ...(record.state.attempts || {}) },
        hintLevel: { ...base.hintLevel, ...(record.state.hintLevel || {}) },
        drafts: { ...base.drafts, ...(record.state.drafts || {}) },
        results: { ...base.results, ...(record.state.results || {}) },
        helpRequests: [...new Set(record.state.helpRequests || [])],
      };
    }

    function saveLocal(options = {}) {
      if (!activeProfile || !state) return;
      const updatedAt = state.updatedAt || new Date().toISOString();
      storage.setItem(
        Core.unitKey(config.moduleId, activeProfile.id),
        JSON.stringify({ updatedAt, state }),
      );
      if (options.sync !== false) scheduleSync();
    }

    function localEnvelope() {
      const envelope = { schemaVersion: Core.SCHEMA_VERSION, profiles: {} };
      profiles.forEach((profile) => {
        const record = stateRecord(profile.id);
        if (record && record.state) envelope.profiles[profile.id] = record;
      });
      return envelope;
    }

    function installMergedEnvelope(envelope) {
      Object.entries(envelope.profiles || {}).forEach(([profileId, record]) => {
        if (record && record.state) {
          storage.setItem(Core.unitKey(config.moduleId, profileId), JSON.stringify(record));
        }
      });
    }

    function setSyncStatus(text, pending) {
      if (!syncStatus) return;
      syncStatus.textContent = text;
      syncStatus.dataset.pending = pending ? 'true' : 'false';
    }

    async function syncCloud() {
      if (!tracker || !root.navigator.onLine) {
        setSyncStatus('Saved on iPad / 已存于 iPad', true);
        return;
      }
      const merged = Core.mergeEnvelopes(localEnvelope(), remoteEnvelope);
      try {
        await tracker.save(merged);
        remoteEnvelope = merged;
        installMergedEnvelope(merged);
        setSyncStatus('Saved / 已保存', false);
      } catch (_error) {
        setSyncStatus('Sync pending / 等待同步', true);
      }
    }

    function scheduleSync() {
      root.clearTimeout(syncTimer);
      syncTimer = root.setTimeout(syncCloud, SYNC_DELAY);
    }

    function selectProfile(profileId) {
      if (activeProfile && activeProfile.id !== profileId) {
        saveLocal({ sync: false });
      }
      activeProfile = profiles.find((profile) => profile.id === profileId);
      if (!activeProfile) return;
      storage.setItem(ACTIVE_PROFILE_KEY, profileId);
      state = loadState(profileId);
      if (profileGate) profileGate.hidden = true;
      app.dataset.profileReady = 'true';
      if (profileLabel) profileLabel.textContent = activeProfile.name;
      renderActivity();
      document.dispatchEvent(new CustomEvent('kssr:profile-changed', { detail: { profileId } }));
    }

    function currentCard() {
      return state ? cardById[state.activeActivityId] : null;
    }

    function completedCount() {
      return Object.values(state.results || {}).filter((result) => result.status !== 'skipped').length;
    }

    function updateProgress() {
      const completed = completedCount();
      const total = state.activityOrder.length;
      const percent = total ? Math.round((completed / total) * 100) : 0;
      if (progressBar) {
        progressBar.style.setProperty('--progress', `${percent}%`);
        progressBar.setAttribute('aria-valuenow', String(percent));
      }
      if (progressStatus) progressStatus.textContent = `${completed}/${total} complete / 已完成`;
    }

    function renderHints(card, activityId) {
      const level = state.hintLevel[activityId] || 0;
      card.querySelectorAll('[data-hint-level]').forEach((hint) => {
        hint.hidden = Number(hint.dataset.hintLevel) > level;
      });
    }

    function renderActivity() {
      if (!state) return;
      cards.forEach((card) => { card.hidden = card.dataset.activityId !== state.activeActivityId; });
      updateProgress();

      if (!state.activeActivityId) {
        openSummary(false);
        return;
      }

      const card = currentCard();
      if (!card) return;
      restoreResponse(card, state.drafts[state.activeActivityId]);
      renderHints(card, state.activeActivityId);
      card.querySelector('[data-feedback]')?.replaceChildren();
      card.scrollIntoView({ behavior: root.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    }

    function feedback(card, message, type) {
      const element = card.querySelector('[data-feedback]');
      if (!element) return;
      element.textContent = message;
      element.dataset.type = type;
      element.setAttribute('role', type === 'retry' ? 'alert' : 'status');
    }

    function playCue(type) {
      if (muted) return;
      const AudioCtor = root.AudioContext || root.webkitAudioContext;
      if (!AudioCtor) return;
      audioContext ||= new AudioCtor();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const frequencies = { success: 660, retry: 230, help: 390, complete: 780 };
      oscillator.frequency.value = frequencies[type] || 440;
      oscillator.type = 'sine';
      gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.035, audioContext.currentTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.16);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.18);
    }

    function speak(button) {
      if (muted || !root.speechSynthesis) return;
      const text = button.dataset.speak || button.closest('.question-card')?.querySelector('[data-speak-text]')?.textContent;
      if (!text) return;
      root.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.trim());
      utterance.lang = 'en-MY';
      utterance.rate = 0.88;
      utterance.volume = 0.55;
      root.speechSynthesis.speak(utterance);
    }

    function lockAction(callback) {
      if (actionLocked) return;
      actionLocked = true;
      Promise.resolve(callback()).finally(() => {
        root.setTimeout(() => { actionLocked = false; }, 260);
      });
    }

    function checkCurrent() {
      const card = currentCard();
      const activity = activityById[state.activeActivityId];
      if (!card || !activity) return;
      const response = collectResponse(card);
      state = Core.saveDraft(state, activity.id, response);
      const evaluation = Core.evaluateResponse(activity, response);

      if (!evaluation.complete) {
        feedback(card, 'Try this part first. 请先完成这一题。', 'retry');
        playCue('retry');
        saveLocal();
        return;
      }

      if (evaluation.correct === false) {
        state = Core.recordAttempt(state, activity.id, false);
        feedback(card, 'Look once more. 再观察一次。', 'retry');
        renderHints(card, activity.id);
        playCue('retry');
        saveLocal();
        return;
      }

      state = Core.recordAttempt(state, activity.id, true);
      state = Core.completeActivity(state, activity.id, {
        status: evaluation.status === 'correct' ? 'completed' : evaluation.status,
        response,
      });
      feedback(card, evaluation.correct ? 'Well spotted! 答对了！' : 'Saved for teacher review. 已保存给老师查看。', 'success');
      playCue('success');
      saveLocal();
      document.dispatchEvent(new CustomEvent('kssr:activity-completed', { detail: { activityId: activity.id } }));
      root.setTimeout(renderActivity, 520);
    }

    function saveDraftFrom(card) {
      if (!activeProfile || !state || card.dataset.activityId !== state.activeActivityId) return;
      state = Core.saveDraft(state, card.dataset.activityId, collectResponse(card));
      saveLocal();
    }

    function askForHelp() {
      const card = currentCard();
      if (!card) return;
      state = Core.requestHelp(state, card.dataset.activityId);
      card.querySelector('[data-skip]')?.removeAttribute('hidden');
      feedback(card, 'Teacher help noted. You may continue later. 已记录老师协助。', 'help');
      playCue('help');
      saveLocal();
    }

    function skipCurrent() {
      const card = currentCard();
      if (!card) return;
      state = Core.completeActivity(state, card.dataset.activityId, {
        status: 'skipped',
        response: collectResponse(card),
      });
      saveLocal();
      renderActivity();
    }

    function goPrevious() {
      if (!state) return;
      const currentIndex = state.activeActivityId
        ? state.activityOrder.indexOf(state.activeActivityId)
        : state.activityOrder.length;
      const previous = state.activityOrder[Math.max(0, currentIndex - 1)];
      state = { ...state, activeActivityId: previous, updatedAt: new Date().toISOString() };
      saveLocal();
      renderActivity();
    }

    function openProfileGate() {
      if (activeProfile && !root.confirm('Switch student? Current work is saved.\n要更换学生吗？当前内容已保存。')) return;
      saveLocal({ sync: false });
      if (profileGate) profileGate.hidden = false;
      app.dataset.profileReady = 'false';
    }

    function renameProfiles(container) {
      profiles = profiles.map((profile) => {
        const input = container.querySelector(`[data-profile-name="${profile.id}"]`);
        return input && input.value.trim()
          ? Core.createProfile(profile.id, input.value.trim(), profile.avatar)
          : profile;
      });
      saveProfiles();
      renderProfiles();
      if (activeProfile) activeProfile = profiles.find((profile) => profile.id === activeProfile.id);
      if (profileLabel && activeProfile) profileLabel.textContent = activeProfile.name;
    }

    function openSummary(tutorMode) {
      if (!summaryPanel || !state) return;
      const summary = Core.buildSummary(state);
      summaryPanel.hidden = false;
      summaryPanel.querySelector('[data-summary-student]').textContent = activeProfile?.name || '';
      summaryPanel.querySelector('[data-summary-completed]').textContent = `${summary.completed}/${summary.total}`;
      summaryPanel.querySelector('[data-summary-errors]').textContent = summary.repeatedErrors.join(', ') || 'None / 无';
      summaryPanel.querySelector('[data-summary-help]').textContent = summary.helpRequests.join(', ') || 'None / 无';
      summaryPanel.querySelector('[data-summary-open]').textContent = summary.openResponses.join(', ') || 'None / 无';
      summaryPanel.dataset.tutorMode = tutorMode ? 'true' : 'false';
      if (tutorMode) {
        const editor = summaryPanel.querySelector('[data-profile-editor]');
        if (editor) {
          profiles.forEach((profile) => {
            const input = editor.querySelector(`[data-profile-name="${profile.id}"]`);
            if (input) input.value = profile.name;
          });
        }
      }
      playCue('complete');
      document.dispatchEvent(new CustomEvent('kssr:summary-opened', { detail: summary }));
    }

    function closeSummary() {
      if (summaryPanel) summaryPanel.hidden = true;
    }

    function toggleMute(button) {
      muted = !muted;
      storage.setItem(MUTED_KEY, String(muted));
      button.setAttribute('aria-pressed', muted ? 'true' : 'false');
      button.textContent = muted ? 'Sound off / 静音' : 'Sound on / 声音';
      if (muted) root.speechSynthesis?.cancel();
    }

    function resetView() {
      document.documentElement.style.zoom = '1';
      root.scrollTo({ top: 0, behavior: 'auto' });
      currentCard()?.scrollIntoView({ behavior: 'auto', block: 'start' });
    }

    app.addEventListener('click', (event) => {
      const choice = event.target.closest('[data-choice], [data-multi-choice]');
      if (choice) {
        const card = choice.closest('.question-card');
        if (choice.hasAttribute('data-choice')) {
          card.querySelectorAll('[data-choice]').forEach((button) => button.setAttribute('aria-pressed', 'false'));
        }
        choice.setAttribute('aria-pressed', choice.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
        saveDraftFrom(card);
        return;
      }

      const button = event.target.closest('[data-action]');
      if (!button) return;
      const action = button.dataset.action;
      if (action === 'check') lockAction(checkCurrent);
      if (action === 'help') lockAction(askForHelp);
      if (action === 'skip') lockAction(skipCurrent);
      if (action === 'previous') lockAction(goPrevious);
      if (action === 'switch-profile') lockAction(openProfileGate);
      if (action === 'mute') toggleMute(button);
      if (action === 'speak') speak(button);
      if (action === 'reset-view') resetView();
      if (action === 'close-summary') closeSummary();
      if (action === 'save-profiles') {
        renameProfiles(summaryPanel);
        closeSummary();
      }
    });

    app.addEventListener('input', (event) => {
      if (!isTextControl(event.target)) return;
      const card = event.target.closest('.question-card');
      if (card) saveDraftFrom(card);
    });

    app.querySelectorAll('[data-home-link]').forEach((link) => {
      link.addEventListener('click', (event) => {
        if (!root.confirm('Leave this unit? Your work is saved.\n要离开这个单元吗？内容已保存。')) event.preventDefault();
        else saveLocal({ sync: false });
      });
    });

    const tutorButton = app.querySelector('[data-tutor-hold]');
    if (tutorButton) {
      const beginHold = () => {
        tutorButton.dataset.holding = 'true';
        tutorHoldTimer = root.setTimeout(() => {
          tutorButton.dataset.holding = 'false';
          openSummary(true);
        }, 1500);
      };
      const cancelHold = () => {
        tutorButton.dataset.holding = 'false';
        root.clearTimeout(tutorHoldTimer);
      };
      tutorButton.addEventListener('pointerdown', beginHold);
      ['pointerup', 'pointerleave', 'pointercancel'].forEach((name) => tutorButton.addEventListener(name, cancelHold));
    }

    app.addEventListener('gesturestart', (event) => event.preventDefault());
    let lastTouchEnd = 0;
    app.addEventListener('touchend', (event) => {
      const now = Date.now();
      if (now - lastTouchEnd < 300 && !isTextControl(event.target)) event.preventDefault();
      lastTouchEnd = now;
    }, { passive: false });

    root.addEventListener('online', syncCloud);
    root.addEventListener('offline', () => setSyncStatus('Saved on iPad / 已存于 iPad', true));
    root.addEventListener('pagehide', () => saveLocal({ sync: false }));
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') saveLocal({ sync: false });
    });

    if (root.ProgressTracker?.init) {
      root.ProgressTracker.init(async (readyTracker) => {
        tracker = readyTracker;
        remoteEnvelope = Core.normalizeEnvelope(await readyTracker.load());
        const merged = Core.mergeEnvelopes(localEnvelope(), remoteEnvelope);
        installMergedEnvelope(merged);
        remoteEnvelope = merged;
        if (activeProfile) {
          state = loadState(activeProfile.id);
          renderActivity();
        }
      });
    }

    renderProfiles();
    app.querySelectorAll('[data-action="mute"]').forEach((button) => {
      button.setAttribute('aria-pressed', muted ? 'true' : 'false');
      button.textContent = muted ? 'Sound off / 静音' : 'Sound on / 声音';
    });
    if (profileGate) profileGate.hidden = false;

    return {
      selectProfile,
      syncCloud,
      getState: () => state,
      getProfiles: () => [...profiles],
    };
  }

  return { start, collectResponse, restoreResponse };
});
