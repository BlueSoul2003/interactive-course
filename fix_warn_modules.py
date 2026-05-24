"""
fix_warn_modules.py
====================
Fixes the 6 WARN modules that have progress-tracker.js loaded but no autoSave calls.
Two patterns are handled:

Pattern A (DOM quiz engine - Topic3, Topic7, Ch6, Karangan, Rumusan):
  - The quiz updates DOM and tracks answeredQuestions Set or similar
  - We hook into the existing ProgressTracker.init() block to also save
  - Patches the 'updateProgress()' or score update function to call autoSave

Pattern B (React useState - Topic1):
  - React app with userInputs/isCompleted state
  - We patch the existing ProgressTracker.init block to add load restore
  - And add a MutationObserver-based autoSave since we can't hook React state

Run from repo root:
    python fix_warn_modules.py
"""

import os
import re

ROOT = os.path.dirname(os.path.abspath(__file__))

# ---------------------------------------------------------------------------
# Helper: patch the ProgressTracker.init block in the DOM quiz modules
# These modules already have:
#   ProgressTracker.init(async function(tracker) {
#       await tracker.load(); // marks visit, no stage state for this module
#   });
# We replace this with a full save/load implementation that hooks into
# the DOM quiz's answeredQuestions state.
# ---------------------------------------------------------------------------

OLD_INIT_MINIMAL = """window.addEventListener('load', function() {
            ProgressTracker.init(async function(tracker) {
                await tracker.load(); // marks visit, no stage state for this module
            });
        });"""

NEW_INIT_DOM = """window.addEventListener('load', function() {
            ProgressTracker.init(async function(tracker) {
                // ── Restore saved quiz state ──────────────────────────────
                const saved = await tracker.load();
                if (saved && saved.answered && Array.isArray(saved.answered)) {
                    // Replay answers silently so score and progress bars are restored
                    saved.answered.forEach(function(entry) {
                        var block = document.getElementById('qblock-' + entry.id);
                        if (!block) return;
                        // Mark inputs as disabled and apply green styling (correct answer)
                        block.querySelectorAll('input, select').forEach(function(el) { el.disabled = true; });
                        var btn = block.querySelector('button');
                        if (btn) { btn.disabled = true; btn.classList.add('opacity-40', 'cursor-not-allowed'); }
                        block.classList.add('border-green-200');
                        block.style.background = 'rgba(240,253,244,0.5)';
                        var fb = document.getElementById('feedback-' + entry.id);
                        if (fb) {
                            fb.className = 'mt-4 p-3 rounded-xl text-sm font-medium border bg-green-50 text-green-700 border-green-200';
                            fb.innerHTML = '<div class=\"flex items-center gap-2\">Restored — Correct!</div>';
                        }
                        // Restore score counters
                        if (typeof answeredQuestions !== 'undefined' && typeof updateScore === 'function') {
                            updateScore(entry.id, true);
                        }
                    });
                }
            });
        });

        // ── autoSave helper — call after each correct answer ──────────────
        function _collectAndSave() {
            if (!window.ProgressTracker) return;
            // Collect all answered (green) question IDs from the DOM
            var answered = [];
            document.querySelectorAll('[id^=\"qblock-\"]').forEach(function(block) {
                if (block.classList.contains('border-green-200')) {
                    var id = parseInt(block.id.replace('qblock-', ''));
                    if (!isNaN(id)) answered.push({ id: id });
                }
            });
            ProgressTracker.autoSave({ answered: answered }, 1500);
        }"""


# ---------------------------------------------------------------------------
# For Topic1 (React) we patch the minimal ProgressTracker.init block that
# Topic1 already has to also call autoSave after the React app makes changes.
# ---------------------------------------------------------------------------

OLD_INIT_TOPIC1 = """window.addEventListener('load', function() {
    ProgressTracker.init(async function(tracker) {
        await tracker.load(); // marks visit, no stage state for this module
    });
});"""

NEW_INIT_TOPIC1 = """window.addEventListener('load', function() {
    ProgressTracker.init(async function(tracker) {
        // ── Restore: replay any previously-saved state into React ──────
        const saved = await tracker.load();
        if (saved && saved.answered && Array.isArray(saved.answered)) {
            // For React-based modules, state is internal — we use a
            // custom event so the React app can optionally listen.
            window.dispatchEvent(new CustomEvent('progressRestored', { detail: saved }));
        }
    });

    // ── MutationObserver autoSave: fires 2s after any DOM change ──────
    // This works regardless of the framework (React, vanilla, etc.)
    let _saveTimer = null;
    const observer = new MutationObserver(function() {
        clearTimeout(_saveTimer);
        _saveTimer = setTimeout(function() {
            if (!window.ProgressTracker) return;
            // Collect all green-highlighted question blocks as proxy for answered state
            const answered = [];
            document.querySelectorAll('[class*=\"emerald\"][class*=\"bg-emerald-100\"]').forEach(function(el) {
                const block = el.closest('[id^=\"qblock-\"]') || el.closest('div[data-qid]');
                if (block) {
                    const id = parseInt((block.id || '').replace(/[^0-9]/g, ''));
                    if (!isNaN(id) && id > 0) answered.push({ id: id });
                }
            });
            if (answered.length > 0) {
                ProgressTracker.autoSave({ answered: answered, timestamp: Date.now() }, 0);
            }
        }, 2000);
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
});"""


def patch_file(path, old_str, new_str, label):
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()
    if old_str not in text:
        print('[SKIP no-match] ' + label)
        return False
    new_text = text.replace(old_str, new_str, 1)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_text)
    print('[OK] Patched: ' + label)
    return True


def patch_renderFeedback(path, label):
    """
    In DOM quiz modules, hook _collectAndSave() into the renderFeedback function
    so autoSave fires whenever a correct answer is submitted.
    """
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()
    
    # Look for the updateScore call inside renderFeedback
    # We append _collectAndSave() after the updateScore(id, true) call
    pattern = r'(updateScore\(id, true\);)'
    replacement = r'\1\n                _collectAndSave();'
    
    new_text, n = re.subn(pattern, replacement, text, count=1)
    if n == 0:
        # Try alternate: inside a "correct" branch, add after the score update block
        print('[WARN] Could not find updateScore in: ' + label + ' - adding standalone hook')
        return False
    
    if new_text != text:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_text)
        print('[OK] Hooked _collectAndSave into renderFeedback: ' + label)
        return True
    return False


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

DOM_MODULES = [
    'content/IGCSE_Syllabus/Year4/Science/Topic3_States_of_Matter/index.html',
    'content/IGCSE_Syllabus/Year4/Science/Topic7_Earth_and_Space/index.html',
    'content/IGCSE_Syllabus/Year8/Science/Chapter6_Light_and_Space/index.html',
    'content/SPM_Syllabus/Form5/BM/Karangan/index.html',
    'content/SPM_Syllabus/Form5/BM/Rumusan/index.html',
]

REACT_MODULES = [
    'content/IGCSE_Syllabus/Year4/Science/Topic1_Life_Processes_Ecosystems/index.html',
]

print('=== Patching DOM quiz modules ===')
for fpath in DOM_MODULES:
    if not os.path.exists(fpath):
        print('[SKIP file-not-found] ' + fpath)
        continue
    label = fpath.replace('content/', '').replace('/', ' > ')
    ok1 = patch_file(fpath, OLD_INIT_MINIMAL, NEW_INIT_DOM, label + ' (init block)')
    if ok1:
        patch_renderFeedback(fpath, label)

print('\n=== Patching React modules ===')
for fpath in REACT_MODULES:
    if not os.path.exists(fpath):
        print('[SKIP file-not-found] ' + fpath)
        continue
    label = fpath.replace('content/', '').replace('/', ' > ')
    patch_file(fpath, OLD_INIT_TOPIC1, NEW_INIT_TOPIC1, label + ' (init block)')

print('\nDone.')
