"""
fix_remaining_react.py - Fix Topic7, Chapter6, Karangan which have a slightly different
init block format (no leading whitespace before window.addEventListener).
"""
import os

ROOT = os.path.dirname(os.path.abspath(__file__))

# The exact text found in Topic7 and Chapter6 (no leading spaces)
OLD_REACT_INIT = """window.addEventListener('load', function() {
    ProgressTracker.init(async function(tracker) {
        await tracker.load(); // marks visit, no stage state for this module
    });
});"""

NEW_REACT_INIT = """window.addEventListener('load', function() {
    ProgressTracker.init(async function(tracker) {
        // Restore saved progress
        const saved = await tracker.load();
        if (saved && saved.completedIndices) {
            window.__restoredProgress = saved.completedIndices;
        }
    });

    // MutationObserver: autosave 2s after any DOM completion event
    let _saveTimer = null;
    const observer = new MutationObserver(function() {
        clearTimeout(_saveTimer);
        _saveTimer = setTimeout(function() {
            if (!window.ProgressTracker) return;
            // Collect all green-highlighted (correct) answers across both DOM and React modules
            const completed = [];
            // React pattern: isCompleted state reflected as bg-green-100 class on button
            document.querySelectorAll('.bg-green-100, .bg-emerald-100').forEach(function(el) {
                var qEl = el.closest('[class*=\"max-w\"]') || el.parentElement;
                if (qEl) {
                    var idx = qEl.dataset ? qEl.dataset.qidx : null;
                    if (idx !== null && idx !== undefined) completed.push(parseInt(idx));
                }
            });
            ProgressTracker.autoSave({ completedIndices: completed, ts: Date.now() }, 0);
        }, 2000);
    });
    observer.observe(document.getElementById('root') || document.body,
        { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
});"""


# Karangan has a completely different structure - it's a BM writing module
# Let's check what pattern it actually uses for its ProgressTracker block
OLD_KARANGAN_INIT = """window.addEventListener('load', function() {
    ProgressTracker.init(async function(tracker) {
        await tracker.load();
    });
});"""

NEW_KARANGAN_INIT = """window.addEventListener('load', function() {
    ProgressTracker.init(async function(tracker) {
        const saved = await tracker.load();
        if (saved) {
            // Restore any saved text content
            if (saved.content && typeof saved.content === 'object') {
                Object.keys(saved.content).forEach(function(id) {
                    var el = document.getElementById(id);
                    if (el && saved.content[id]) el.value = saved.content[id];
                });
            }
        }
    });

    // autoSave: collect all textarea content every 3s after change
    function _saveTextContent() {
        if (!window.ProgressTracker) return;
        var content = {};
        document.querySelectorAll('textarea[id]').forEach(function(ta) {
            if (ta.value.trim()) content[ta.id] = ta.value;
        });
        ProgressTracker.autoSave({ content: content, ts: Date.now() }, 3000);
    }
    document.addEventListener('input', function(e) {
        if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
            _saveTextContent();
        }
    });
});"""


def patch_file(path, old_str, new_str, label):
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()
    if old_str not in text:
        # Try stripping to find approximate match
        print('[SKIP no exact match] ' + label)
        # Print what the actual init block looks like
        import re
        m = re.search(r'window\.addEventListener.*?ProgressTracker\.init.*?}\);', text, re.DOTALL)
        if m:
            print('  Found block: ' + repr(m.group(0)[:200]))
        return False
    new_text = text.replace(old_str, new_str, 1)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_text)
    print('[OK] Patched: ' + label)
    return True


files_react = [
    'content/IGCSE_Syllabus/Year4/Science/Topic7_Earth_and_Space/index.html',
    'content/IGCSE_Syllabus/Year8/Science/Chapter6_Light_and_Space/index.html',
]

files_karangan = [
    'content/SPM_Syllabus/Form5/BM/Karangan/index.html',
]

print('=== Patching React modules (no-indent pattern) ===')
for fpath in files_react:
    if not os.path.exists(fpath):
        print('[SKIP] ' + fpath)
        continue
    label = fpath.replace('content/', '')
    patch_file(fpath, OLD_REACT_INIT, NEW_REACT_INIT, label)

print('\n=== Patching Karangan (writing module) ===')
for fpath in files_karangan:
    if not os.path.exists(fpath):
        print('[SKIP] ' + fpath)
        continue
    label = fpath.replace('content/', '')
    ok = patch_file(fpath, OLD_KARANGAN_INIT, NEW_KARANGAN_INIT, label)
    if not ok:
        # try the other pattern
        ok2 = patch_file(fpath, OLD_REACT_INIT, NEW_KARANGAN_INIT, label + ' (react pattern)')

print('\nDone.')
