"""
fix_remaining_modules.py
Fixes the 5 remaining modules that call ProgressTracker.load() without init()
or have autoSave but no init() wrapper.
"""
import os
import re

ROOT = os.path.dirname(os.path.abspath(__file__))

def fix_file(path, label):
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        text = f.read()
    
    # Pattern 1: Direct async call without init()
    # window.addEventListener('load', async () => { ... ProgressTracker.load() ... });
    # Replace with proper ProgressTracker.init() pattern
    
    # Pattern 1a: Simple visit-only load
    old1a = """window.addEventListener('load', async () => {
        if (!window.ProgressTracker) return;
        await ProgressTracker.load();
        if (window.ProgressTracker) ProgressTracker.autoSave({ visited:"""
    
    # Pattern 1b: Chapter-style with no init
    # These use 'autoSave' but no init wrapper - wrap entire window.onload in init
    
    # Let's find all window.addEventListener that use ProgressTracker without init
    # and wrap them
    
    changed = False
    
    # Fix KSSR Unit4 style: direct load() call without init
    pattern_load = r'window\.addEventListener\(\'load\', async \(\) => \{([^}]*ProgressTracker\.load\(\)[^}]*)\}\);'
    match = re.search(pattern_load, text, re.DOTALL)
    if match:
        old_block = match.group(0)
        inner = match.group(1)
        
        # Wrap it in ProgressTracker.init() properly
        new_block = f"""window.addEventListener('load', function() {{
            if (!window.ProgressTracker) return;
            ProgressTracker.init(async function(tracker) {{{inner}}});
        }});"""
        
        # Replace .load() with tracker.load() inside the init callback
        new_block = new_block.replace('ProgressTracker.load()', 'tracker.load()')
        new_block = new_block.replace('await ProgressTracker.load', 'await tracker.load')
        
        new_text = text.replace(old_block, new_block, 1)
        if new_text != text:
            text = new_text
            changed = True
            print(f'[OK] Fixed direct load() pattern: {label}')
    
    # Fix Chapter1/Chapter2 style: has autoSave but no init and no window.addEventListener block
    # These have autoSave() calls scattered in JS but no init()
    # Add an init block right before the progress-tracker.js script tag
    if 'progress-tracker.js' in text and 'ProgressTracker.init' not in text and 'ProgressTracker.autoSave' in text:
        # Find the script tag and add an init block after it
        script_tag_pattern = r'(<script src="[^"]*progress-tracker\.js"[^>]*></script>)'
        match = re.search(script_tag_pattern, text)
        if match:
            old_tag = match.group(1)
            new_block = old_tag + """\n    <script>
    window.addEventListener('load', function() {
        if (!window.ProgressTracker) return;
        ProgressTracker.init(async function(tracker) {
            // Load saved progress and restore if available
            const saved = await tracker.load();
            if (saved) {
                // Module state managed by existing autoSave calls in the module code
                window.__savedProgress = saved;
                window.dispatchEvent(new CustomEvent('progressRestored', { detail: saved }));
            }
        });
    });
    </script>"""
            new_text = text.replace(old_tag, new_block, 1)
            if new_text != text:
                text = new_text
                changed = True
                print(f'[OK] Added init wrapper after tracker script tag: {label}')
    
    # Fix Karangan: has no ProgressTracker calls at all in HTML
    # The script.js fix already added it, but HTML needs init() too since 
    # script.js is loaded before progress-tracker.js and does polling
    # -> The script.js already handles this via _initProgressTracker() polling
    # So Karangan HTML actually doesn't need extra changes
    
    if changed:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(text)
    else:
        print(f'[SKIP no match] {label}')
    
    return changed


files = [
    ('content/IGCSE_Syllabus/Year8/Science/Chapter1_Respiration/index.html', 'Chapter1_Respiration'),
    ('content/IGCSE_Syllabus/Year8/Science/Chapter2_Properties_of_Materials/index.html', 'Chapter2_Properties'),
    ('content/KSSR_Syllabus/Primary3/English/Unit4/index.html', 'KSSR_P3_Unit4'),
    ('content/KSSR_Syllabus/Primary6/English/Unit4/index.html', 'KSSR_P6_Unit4'),
    ('content/Singapore_Syllabus/Year4/Math/Chapter3_Pokemon_Gym/index.html', 'Pokemon_Gym'),
]

print('=== Fixing remaining modules ===')
for path, label in files:
    if not os.path.exists(path):
        print(f'[NOT FOUND] {label}: {path}')
        continue
    fix_file(path, label)

print('\nDone.')
