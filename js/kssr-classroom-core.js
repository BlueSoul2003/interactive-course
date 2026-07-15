(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.KssrClassroomCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const SCHEMA_VERSION = 1;

  function nowIso(value) {
    return value || new Date().toISOString();
  }

  function createProfile(id, name, avatar, updatedAt) {
    return {
      id: String(id),
      name: String(name),
      avatar: String(avatar),
      updatedAt: nowIso(updatedAt),
    };
  }

  function normalizeEnvelope(value) {
    if (!value || value.schemaVersion !== SCHEMA_VERSION || !value.profiles || Array.isArray(value.profiles)) {
      return { schemaVersion: SCHEMA_VERSION, profiles: {} };
    }

    return {
      schemaVersion: SCHEMA_VERSION,
      profiles: { ...value.profiles },
    };
  }

  function timestamp(value) {
    const parsed = Date.parse(value || '');
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function mergeEnvelopes(localValue, remoteValue) {
    const local = normalizeEnvelope(localValue);
    const remote = normalizeEnvelope(remoteValue);
    const profiles = {};
    const ids = new Set([...Object.keys(remote.profiles), ...Object.keys(local.profiles)]);

    ids.forEach((id) => {
      const localProfile = local.profiles[id];
      const remoteProfile = remote.profiles[id];
      if (!remoteProfile) profiles[id] = localProfile;
      else if (!localProfile) profiles[id] = remoteProfile;
      else profiles[id] = timestamp(localProfile.updatedAt) >= timestamp(remoteProfile.updatedAt)
        ? localProfile
        : remoteProfile;
    });

    return { schemaVersion: SCHEMA_VERSION, profiles };
  }

  function createUnitState(activityIds) {
    const activityOrder = [...new Set((activityIds || []).map(String))];
    return {
      activityOrder,
      activeActivityId: activityOrder[0] || null,
      attempts: {},
      hintLevel: {},
      drafts: {},
      results: {},
      helpRequests: [],
      updatedAt: null,
    };
  }

  function saveDraft(state, activityId, response, updatedAt) {
    assertActivity(state, activityId);
    return {
      ...state,
      drafts: { ...state.drafts, [activityId]: response },
      updatedAt: nowIso(updatedAt),
    };
  }

  function assertActivity(state, activityId) {
    if (!state.activityOrder.includes(activityId)) {
      throw new Error(`Unknown activity: ${activityId}`);
    }
  }

  function recordAttempt(state, activityId, correct, updatedAt) {
    assertActivity(state, activityId);
    const attempts = (state.attempts[activityId] || 0) + 1;
    const nextHint = correct ? (state.hintLevel[activityId] || 0) : Math.min(2, Math.max(0, attempts - 1));

    return {
      ...state,
      attempts: { ...state.attempts, [activityId]: attempts },
      hintLevel: { ...state.hintLevel, [activityId]: nextHint },
      updatedAt: nowIso(updatedAt),
    };
  }

  function nextIncompleteActivity(state, completedId) {
    const start = state.activityOrder.indexOf(completedId);
    for (let offset = 1; offset <= state.activityOrder.length; offset += 1) {
      const candidate = state.activityOrder[(start + offset) % state.activityOrder.length];
      if (!state.results[candidate] && candidate !== completedId) return candidate;
    }
    return null;
  }

  function completeActivity(state, activityId, result, updatedAt) {
    assertActivity(state, activityId);
    const completedAt = nowIso(updatedAt);
    const results = {
      ...state.results,
      [activityId]: { ...result, completedAt },
    };
    const withResult = { ...state, results };

    return {
      ...withResult,
      activeActivityId: nextIncompleteActivity(withResult, activityId),
      updatedAt: completedAt,
    };
  }

  function requestHelp(state, activityId, updatedAt) {
    assertActivity(state, activityId);
    const helpRequests = state.helpRequests.includes(activityId)
      ? [...state.helpRequests]
      : [...state.helpRequests, activityId];

    return {
      ...state,
      helpRequests,
      updatedAt: nowIso(updatedAt),
    };
  }

  function buildSummary(state) {
    const resultIds = Object.keys(state.results);
    const completed = resultIds.filter((id) => state.results[id].status !== 'skipped');
    return {
      total: state.activityOrder.length,
      completed: completed.length,
      repeatedErrors: state.activityOrder.filter((id) => (state.attempts[id] || 0) > 1),
      hintsUsed: state.activityOrder.filter((id) => (state.hintLevel[id] || 0) > 0),
      helpRequests: [...state.helpRequests],
      skipped: resultIds.filter((id) => state.results[id].status === 'skipped'),
      openResponses: resultIds.filter((id) => state.results[id].status === 'teacher_review'),
      resumeActivityId: state.activeActivityId,
    };
  }

  function profileKey() {
    return 'kssr-classroom-profiles:v1';
  }

  function unitKey(moduleId, profileId) {
    return `kssr-unit-progress:${String(moduleId)}:${String(profileId)}:v1`;
  }

  function normalizeAnswer(value) {
    return String(value == null ? '' : value)
      .trim()
      .toLocaleLowerCase('en')
      .replace(/\s+/g, ' ');
  }

  function evaluateResponse(activity, response) {
    const marking = activity.marking || 'objective';
    if (marking === 'teacher_review' || marking === 'guided') {
      return {
        status: marking,
        correct: null,
        response,
        complete: normalizeAnswer(response).length > 0,
      };
    }

    if (activity.kind === 'multi') {
      const expected = (Array.isArray(activity.answer) ? activity.answer : [])
        .map(normalizeAnswer)
        .sort();
      const actual = (Array.isArray(response) ? response : [])
        .map(normalizeAnswer)
        .sort();
      const correct = expected.length === actual.length
        && expected.every((value, index) => value === actual[index]);
      return { status: correct ? 'correct' : 'retry', correct, response, complete: actual.length > 0 };
    }

    const accepted = [activity.answer, ...(activity.acceptedAnswers || [])]
      .filter((value) => value != null)
      .map(normalizeAnswer);
    const actual = normalizeAnswer(response);
    const correct = accepted.includes(actual);
    return { status: correct ? 'correct' : 'retry', correct, response, complete: actual.length > 0 };
  }

  return {
    SCHEMA_VERSION,
    createProfile,
    normalizeEnvelope,
    mergeEnvelopes,
    createUnitState,
    recordAttempt,
    completeActivity,
    requestHelp,
    buildSummary,
    saveDraft,
    profileKey,
    unitKey,
    evaluateResponse,
  };
});
