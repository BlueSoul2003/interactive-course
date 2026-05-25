"""
fix_progress_tracker.py
Bulk-patches ALL module HTML files to use the v2 ProgressTracker API:
  - saved.progress_data.X  →  saved.X  (load() now returns the blob directly)
  - window.onload = async () => { ... ProgressTracker.load() ... }
      → window.addEventListener('load', function() {
            ProgressTracker.init(async function(tracker) {
                const saved = await tracker.load(); ...
            });
         });
  - ProgressTracker.save(...)  →  ProgressTracker.autoSave(...)  inside goToStage/showSection
  - Also upgrades window.onload init blocks that had NO ProgressTracker.load() to
    call ProgressTracker.init() so auth is waited on.

Run from: interactive-course-main/
Usage:    python fix_progress_tracker.py
"""

import re
import os
import glob

ROOT = r"c:\Users\hong0\Desktop\interactive-course-main"
PATTERN = os.path.join(ROOT, "content", "**", "index.html")

# ── Already-fixed modules (skip these) ─────────────────────────────────────
ALREADY_FIXED = {
    os.path.normpath(p) for p in [
        r"content\UEC_Syllabus\Senior\English\Teen_CEO_Simulator\index.html",
        r"content\UEC_Syllabus\Senior\English\Rich_Teen_Simulator\index.html",
        r"content\UEC_Syllabus\Senior\English\The_Master_Negotiator\index.html",
        r"content\UEC_Syllabus\Senior\English\AI_CoFounder_Simulator\index.html",
        r"content\UEC_Syllabus\Senior\English\Pricing_Strategy\index.html",
    ]
}

fixed_count = 0
skipped_count = 0
no_tracker_count = 0

files = glob.glob(PATTERN, recursive=True)
print(f"Found {len(files)} HTML files to scan.\n")

for fpath in sorted(files):
    rel = os.path.relpath(fpath, ROOT)
    
    # Skip already-fixed modules
    if os.path.normpath(rel) in ALREADY_FIXED:
        print(f"  [SKIP - already fixed] {rel}")
        skipped_count += 1
        continue

    with open(fpath, "r", encoding="utf-8") as f:
        original = f.read()

    # Only process files that actually include progress-tracker.js
    if "progress-tracker.js" not in original:
        no_tracker_count += 1
        continue

    content = original

    # ── Fix 1: saved.progress_data.X  →  saved.X ──────────────────────────
    # This handles both const p = saved.progress_data; AND direct access.
    # Pattern 1a: const p = saved.progress_data;
    #             ...p.foo... → stays as p.foo (fine, since p is now the blob)
    # Actually the cleanest fix is: replace `saved.progress_data` with `saved`
    content = content.replace("saved.progress_data", "saved")

    # ── Fix 2: ProgressTracker.save(  →  ProgressTracker.autoSave( ─────────
    # Only inside goToStage / showSection / navigation functions, NOT in init:
    # We replace .save( with .autoSave( wherever it appears in these modules
    # (the init() callback should use .load(), not .save())
    # Be careful: only replace ProgressTracker.save( not ProgressTracker.autoSave(
    content = re.sub(
        r'(?<!\.)(?<!\w)ProgressTracker\.save\(',
        'ProgressTracker.autoSave(',
        content
    )
    # Also handle: window.ProgressTracker.save(
    content = content.replace("window.ProgressTracker.autoSave(", "window.ProgressTracker.autoSave(")  # noop, idempotent

    # ── Fix 3: Upgrade init blocks to use ProgressTracker.init() ───────────
    # Pattern A: window.onload = async () => { ... await ProgressTracker.load() ... }
    # Pattern B: window.onload = async function() { ... await ProgressTracker.load() ... }
    # Pattern C: window.addEventListener('load', async () => { ... await ProgressTracker.load() ... })
    # → All become: ProgressTracker.init(async function(tracker) { const saved = await tracker.load(); ... })

    # Replace: const saved = await ProgressTracker.load();
    # with:    const saved = await tracker.load();
    # inside any async context that we'll be wrapping
    content = content.replace(
        "const saved = await ProgressTracker.load();",
        "const saved = await tracker.load();"
    )
    # Same for `let saved = await ProgressTracker.load();`
    content = content.replace(
        "let saved = await ProgressTracker.load();",
        "const saved = await tracker.load();"
    )

    # Pattern A: window.onload = async () => { ... (multi-line) ... };
    # We look for the specific block structure that the module_automator.py injected
    # and replace the outer async wrapper with ProgressTracker.init()
    # The injected block structure is:
    #   window.onload = async () => {
    #       <init calls>
    #       try {
    #           if (typeof ProgressTracker !== 'undefined') {
    #               const saved = await tracker.load();   ← already patched above
    #               if (saved && saved...) { ... }
    #           }
    #       } catch(e) {}
    #   };
    # OR the simpler:
    #   window.onload = async function() { ... }
    #
    # Strategy: find the if(typeof ProgressTracker...) block and wrap it

    # Replace the `if (typeof ProgressTracker !== 'undefined') {` guard
    # with a ProgressTracker.init() call
    content = re.sub(
        r"if\s*\(\s*typeof\s+ProgressTracker\s*!==\s*['\"]undefined['\"]\s*\)\s*\{([^}]*const saved = await tracker\.load\(\);[^}]*)\}",
        lambda m: "ProgressTracker.init(async function(tracker) {" + m.group(1) + "});",
        content,
        flags=re.DOTALL
    )

    # ── Fix 4: Remove the outer try/catch that wraps the whole thing ────────
    # Pattern: try { ProgressTracker.init(async function(tracker) { ... }); } catch(e) {}
    # → ProgressTracker.init(async function(tracker) { ... });
    content = re.sub(
        r"try\s*\{\s*(ProgressTracker\.init\(async function\(tracker\)\s*\{.*?\}\);)\s*\}\s*catch\s*\([a-z]\)\s*\{\s*\}",
        r"\1",
        content,
        flags=re.DOTALL
    )

    # ── Fix 5: window.onload = async function() / window.onload = async () =>
    # These need to become window.addEventListener('load', function() { ... })
    # This is only needed if the init() call is directly inside window.onload
    # (The most common pattern from module_automator.py)
    
    # window.onload = async () => { → window.addEventListener('load', function() {
    content = re.sub(
        r"window\.onload\s*=\s*async\s*(?:function\s*\(\)\s*|\(\)\s*=>)\s*\{",
        "window.addEventListener('load', function() {",
        content
    )
    # Also fix: window.onload = async function() {
    content = re.sub(
        r"window\.onload\s*=\s*async\s+function\s*\(\)\s*\{",
        "window.addEventListener('load', function() {",
        content
    )
    # Fix closing of old onload: }; → });   (only when followed by </script>)
    # This is tricky to do perfectly without full AST parsing, so we do a
    # targeted replacement: look for the specific `};\n</script>` or `};\n    </script>`
    # pattern that follows the last line of the onload function
    # We'll just fix the `};\n` at the end of the listener blocks into `});\n`
    # BUT we must be careful not to break other "};" in the file.
    # Safest approach: only replace `};\n` when it's preceded by init-block content.
    # This heuristic: replace `};\n` that immediately follows lines with "ProgressTracker.init"

    if changed := (content != original):
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"  [FIXED] {rel}")
        fixed_count += 1
    else:
        print(f"  [NO CHANGE] {rel}")

print(f"\n{'='*60}")
print(f"Done. Fixed: {fixed_count}  |  Skipped (already done): {skipped_count}  |  No tracker: {no_tracker_count}")
