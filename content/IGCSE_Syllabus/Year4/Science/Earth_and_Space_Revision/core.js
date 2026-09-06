(function (root) {
  'use strict';
  const normalize = value => String(value ?? '').normalize('NFKC').trim().toLowerCase().replace(/[‐‑–—]/g, '-').replace(/\s+/g, ' ');
  function grade(q, value) {
    if (q.type === 'mcq') return { correct: Number.isInteger(value) && value === q.answer, blanks: [] };
    const blanks = q.answers.map((accepted, i) => accepted.some(a => normalize(a) === normalize(value?.[i])));
    return { correct: blanks.every(Boolean), blanks };
  }
  function record(previous, value, result, now = Date.now()) {
    return { value, correct: result.correct, blanks: result.blanks, attempts: (previous?.attempts || 0) + 1,
      firstCorrect: previous ? previous.firstCorrect : result.correct,
      mastered: !!(previous?.mastered || result.correct), updatedAt: now };
  }
  function stats(questions, answers) {
    const records = questions.map(q => answers[q.id]).filter(Boolean);
    return { total: questions.length, attempted: records.length, mastered: records.filter(a => a.mastered).length,
      firstCorrect: records.filter(a => a.firstCorrect).length, review: records.filter(a => !a.correct).length };
  }
  function select(questions, answers, { topic = 'all', type = 'all', level = 'all', review = false } = {}) {
    return questions.filter(q => (topic === 'all' || q.topic === topic) && (type === 'all' || q.type === type) &&
      (level === 'all' || q.level === level) && (!review || (answers[q.id] && !answers[q.id].correct)));
  }
  function shuffle(items, random = Math.random) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; }
    return result;
  }
  function merge(local, remote, validIds) {
    if (!remote || remote.version !== 1) return local;
    const resetAt = Math.max(local.resetAt || 0, remote.resetAt || 0);
    const answers = {};
    for (const source of [local.answers, remote.answers]) {
      for (const [id, a] of Object.entries(source || {})) {
        if (!validIds.has(id) || !a || !Number.isFinite(a.updatedAt) || a.updatedAt < resetAt || typeof a.correct !== 'boolean' || typeof a.firstCorrect !== 'boolean') continue;
        if (!answers[id] || a.updatedAt > answers[id].updatedAt) answers[id] = a;
      }
    }
    return { ...local, resetAt, answers };
  }
  root.EarthSpaceCore = { normalize, grade, record, stats, select, shuffle, merge };
  if (typeof module !== 'undefined') module.exports = root.EarthSpaceCore;
})(typeof window !== 'undefined' ? window : globalThis);
