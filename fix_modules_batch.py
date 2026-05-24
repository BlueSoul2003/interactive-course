#!/usr/bin/env python3
"""
fix_modules_batch.py
====================
Batch-fixes all content module index.html files to resolve the two
progress-tracking bugs identified in the bug report:

Bug 2a: _saveProgress() guarded by deprecated getActiveStudent() which
        always returns null — so autoSave is never called.
        FIX: Remove the getActiveStudent() guard; autoSave is already a
             no-op for guests.

Bug 2c: Supabase CDN + auth-access.js not loaded in module pages, so
        _getClient() returns null and all saves are silent no-ops.
        FIX: Inject CDN + auth-access.js before progress-tracker.js.

Bug 2c (cont): data-module-id values missing or wrong canonical IDs.
        FIX: Add/correct data-module-id, data-module-name, data-module-url
             for each module.

Run from the repo root:
    python fix_modules_batch.py
"""

import os
import re

ROOT = os.path.dirname(os.path.abspath(__file__))
CONTENT = os.path.join(ROOT, "content")

# ── Canonical ID map ─────────────────────────────────────────────────────────
# Maps the absolute path (relative to content/) → canonical module data
# (id from schema.sql, human name, relative URL from repo root)
MODULES = {
    # IGCSE Year 4 Science
    "IGCSE_Syllabus/Year4/Science/Topic1_Life_Processes_Ecosystems/index.html": {
        "id":   "igcse-y4-sci-topic1",
        "name": "Topic 1: Life Processes & Ecosystems",
        "url":  "content/IGCSE_Syllabus/Year4/Science/Topic1_Life_Processes_Ecosystems/index.html",
    },
    "IGCSE_Syllabus/Year4/Science/Topic2_Living_Things/index.html": {
        "id":   "igcse-y4-sci-topic2",
        "name": "Topic 2: Living Things in Their Environment",
        "url":  "content/IGCSE_Syllabus/Year4/Science/Topic2_Living_Things/index.html",
    },
    "IGCSE_Syllabus/Year4/Science/Topic3_States_of_Matter/index.html": {
        "id":   "igcse-y4-sci-topic3",
        "name": "Topic 3: States of Matter",
        "url":  "content/IGCSE_Syllabus/Year4/Science/Topic3_States_of_Matter/index.html",
    },
    "IGCSE_Syllabus/Year4/Science/Topic7_Earth_and_Space/index.html": {
        "id":   "igcse-y4-sci-topic7",
        "name": "Topic 7: Earth and Space",
        "url":  "content/IGCSE_Syllabus/Year4/Science/Topic7_Earth_and_Space/index.html",
    },
    # IGCSE Year 8 Science
    "IGCSE_Syllabus/Year8/Science/Chapter1_Respiration/index.html": {
        "id":   "igcse-y8-sci-ch1",
        "name": "Chapter 1: Respiration & Breathing",
        "url":  "content/IGCSE_Syllabus/Year8/Science/Chapter1_Respiration/index.html",
    },
    "IGCSE_Syllabus/Year8/Science/Chapter2_Properties_of_Materials/index.html": {
        "id":   "igcse-y8-sci-ch2",
        "name": "Chapter 2: Properties of Materials",
        "url":  "content/IGCSE_Syllabus/Year8/Science/Chapter2_Properties_of_Materials/index.html",
    },
    "IGCSE_Syllabus/Year8/Science/Chapter4_Ecosystems/index.html": {
        "id":   "igcse-y8-sci-ch4",
        "name": "Chapter 4: Ecosystems",
        "url":  "content/IGCSE_Syllabus/Year8/Science/Chapter4_Ecosystems/index.html",
    },
    "IGCSE_Syllabus/Year8/Science/Chapter5_Materials_and_Cycles/index.html": {
        "id":   "igcse-y8-sci-ch5",
        "name": "Chapter 5: Materials and Cycles on Earth",
        "url":  "content/IGCSE_Syllabus/Year8/Science/Chapter5_Materials_and_Cycles/index.html",
    },
    "IGCSE_Syllabus/Year8/Science/Chapter6_Light_and_Space/index.html": {
        "id":   "igcse-y8-sci-ch6",
        "name": "Chapter 6: Light and Space",
        "url":  "content/IGCSE_Syllabus/Year8/Science/Chapter6_Light_and_Space/index.html",
    },
    # KSSR Primary 3 English
    "KSSR_Syllabus/Primary3/English/Unit1/index.html": {
        "id":   "kssr-p3-en-unit1",
        "name": "Unit 1: Getting Smart",
        "url":  "content/KSSR_Syllabus/Primary3/English/Unit1/index.html",
    },
    "KSSR_Syllabus/Primary3/English/Unit2/index.html": {
        "id":   "kssr-p3-en-unit2",
        "name": "Unit 2: City Heroes",
        "url":  "content/KSSR_Syllabus/Primary3/English/Unit2/index.html",
    },
    "KSSR_Syllabus/Primary3/English/Unit3/index.html": {
        "id":   "kssr-p3-en-unit3",
        "name": "Unit 3: Housework",
        "url":  "content/KSSR_Syllabus/Primary3/English/Unit3/index.html",
    },
    "KSSR_Syllabus/Primary3/English/Unit4/index.html": {
        "id":   "kssr-p3-en-unit4",
        "name": "Unit 4: The Four Seasons",
        "url":  "content/KSSR_Syllabus/Primary3/English/Unit4/index.html",
    },
    # KSSR Primary 6 English
    "KSSR_Syllabus/Primary6/English/Unit1/index.html": {
        "id":   "kssr-p6-en-unit1",
        "name": "Unit 1: Scenario Practice",
        "url":  "content/KSSR_Syllabus/Primary6/English/Unit1/index.html",
    },
    "KSSR_Syllabus/Primary6/English/Unit2/index.html": {
        "id":   "kssr-p6-en-unit2",
        "name": "Unit 2: Interactive Reading",
        "url":  "content/KSSR_Syllabus/Primary6/English/Unit2/index.html",
    },
    "KSSR_Syllabus/Primary6/English/Unit3/index.html": {
        "id":   "kssr-p6-en-unit3",
        "name": "Unit 3: Outdoor Activities",
        "url":  "content/KSSR_Syllabus/Primary6/English/Unit3/index.html",
    },
    "KSSR_Syllabus/Primary6/English/Unit4/index.html": {
        "id":   "kssr-p6-en-unit4",
        "name": "Unit 4: Interactive Worksheet",
        "url":  "content/KSSR_Syllabus/Primary6/English/Unit4/index.html",
    },
    # SPM Form 2 Math
    "SPM_Syllabus/Form2/Math/KSSM_Revision1/index.html": {
        "id":   "spm-math-kssm-revision1",
        "name": "KSSM Form 2 Math: Intensive Revision 1",
        "url":  "content/SPM_Syllabus/Form2/Math/KSSM_Revision1/index.html",
    },
    # SPM Form 5 BM
    "SPM_Syllabus/Form5/BM/Kesalahan_Ejaan/index.html": {
        "id":   "spm-bm-kesalahan-ejaan",
        "name": "Sistem特訓: 錯別字 Debug",
        "url":  "content/SPM_Syllabus/Form5/BM/Kesalahan_Ejaan/index.html",
    },
    "SPM_Syllabus/Form5/BM/Karangan/index.html": {
        "id":   "spm-bm-karangan",
        "name": "Modul Karangan SPM 1",
        "url":  "content/SPM_Syllabus/Form5/BM/Karangan/index.html",
    },
    "SPM_Syllabus/Form5/BM/Rumusan/index.html": {
        "id":   "spm-bm-rumusan",
        "name": "Rumusan 极简通关训练",
        "url":  "content/SPM_Syllabus/Form5/BM/Rumusan/index.html",
    },
    # SPM Form 5 English
    "SPM_Syllabus/Form5/English/Social_Media_Masterclass/index.html": {
        "id":   "spm-en-social-media",
        "name": "Social Media Masterclass",
        "url":  "content/SPM_Syllabus/Form5/English/Social_Media_Masterclass/index.html",
    },
    "SPM_Syllabus/Form5/English/My_Dream_Holiday/index.html": {
        "id":   "spm-en-dream-holiday",
        "name": "My Dream Holiday",
        "url":  "content/SPM_Syllabus/Form5/English/My_Dream_Holiday/index.html",
    },
    "SPM_Syllabus/Form5/English/Storytellers_Toolkit/index.html": {
        "id":   "spm-en-storytellers-toolkit",
        "name": "The Storyteller's Toolkit",
        "url":  "content/SPM_Syllabus/Form5/English/Storytellers_Toolkit/index.html",
    },
    "SPM_Syllabus/Form5/English/Advice_Expert/index.html": {
        "id":   "spm-en-advice-expert",
        "name": "The Advice Expert",
        "url":  "content/SPM_Syllabus/Form5/English/Advice_Expert/index.html",
    },
    "SPM_Syllabus/Form5/English/Speech_Writing/index.html": {
        "id":   "spm-en-speech-writing",
        "name": "The Public Speaker",
        "url":  "content/SPM_Syllabus/Form5/English/Speech_Writing/index.html",
    },
    # Singapore Year 4 Math
    "Singapore_Syllabus/Year4/Math/Chapter2_Whole_Number/index.html": {
        "id":   "sg-y4-math-whole-number",
        "name": "Chapter 2: Whole Numbers (Part 2)",
        "url":  "content/Singapore_Syllabus/Year4/Math/Chapter2_Whole_Number/index.html",
    },
    "Singapore_Syllabus/Year4/Math/Review1/index.html": {
        "id":   "sg-y4-math-review1",
        "name": "Review 1: Whole Numbers Review",
        "url":  "content/Singapore_Syllabus/Year4/Math/Review1/index.html",
    },
    "Singapore_Syllabus/Year4/Math/Chapter3_Pokemon_Gym/index.html": {
        "id":   "sg-y4-math-pokemon-gym",
        "name": "Chapter 3: Whole Numbers (Part 3)",
        "url":  "content/Singapore_Syllabus/Year4/Math/Chapter3_Pokemon_Gym/index.html",
    },
    "Singapore_Syllabus/Year4/Math/Chapter4_Data_Graphs/index.html": {
        "id":   "sg-y4-math-data-graphs",
        "name": "Chapter 4: Data & Graphs (Campaign)",
        "url":  "content/Singapore_Syllabus/Year4/Math/Chapter4_Data_Graphs/index.html",
    },
    "Singapore_Syllabus/Year4/Math/Chapter5_Fractions/index.html": {
        "id":   "sg-y4-math-fractions",
        "name": "Chapter 5: Fraction Quest",
        "url":  "content/Singapore_Syllabus/Year4/Math/Chapter5_Fractions/index.html",
    },
    "Singapore_Syllabus/Year4/Math/Chapter6_Angles/index.html": {
        "id":   "sg-y4-math-angles",
        "name": "Chapter 6: Angle Quest",
        "url":  "content/Singapore_Syllabus/Year4/Math/Chapter6_Angles/index.html",
    },
    # UEC Senior English
    "UEC_Syllabus/Senior/English/Reading/index.html": {
        "id":   "uec-en-reading",
        "name": "Reading Comprehension",
        "url":  "content/UEC_Syllabus/Senior/English/Reading/index.html",
    },
    "UEC_Syllabus/Senior/English/Grammar/index.html": {
        "id":   "uec-en-grammar",
        "name": "Grammar & Usage",
        "url":  "content/UEC_Syllabus/Senior/English/Grammar/index.html",
    },
    "UEC_Syllabus/Senior/English/Summary/index.html": {
        "id":   "uec-en-summary",
        "name": "Summary Writing",
        "url":  "content/UEC_Syllabus/Senior/English/Summary/index.html",
    },
    "UEC_Syllabus/Senior/English/Teen_CEO_Simulator/index.html": {
        "id":   "uec-en-teen-ceo",
        "name": "Teen CEO Simulator Pro",
        "url":  "content/UEC_Syllabus/Senior/English/Teen_CEO_Simulator/index.html",
    },
    "UEC_Syllabus/Senior/English/AI_CoFounder_Simulator/index.html": {
        "id":   "uec-en-ai-cofounder",
        "name": "The AI Co-Founder Simulator",
        "url":  "content/UEC_Syllabus/Senior/English/AI_CoFounder_Simulator/index.html",
    },
    "UEC_Syllabus/Senior/English/Pricing_Strategy/index.html": {
        "id":   "uec-en-pricing-strategy",
        "name": "The Profit Playbook Pro",
        "url":  "content/UEC_Syllabus/Senior/English/Pricing_Strategy/index.html",
    },
    "UEC_Syllabus/Senior/English/The_Master_Negotiator/index.html": {
        "id":   "uec-en-master-negotiator",
        "name": "The Master Negotiator",
        "url":  "content/UEC_Syllabus/Senior/English/The_Master_Negotiator/index.html",
    },
    "UEC_Syllabus/Senior/English/Rich_Teen_Simulator/index.html": {
        "id":   "uec-en-rich-teen-simulator",
        "name": "Rich Teen Simulator",
        "url":  "content/UEC_Syllabus/Senior/English/Rich_Teen_Simulator/index.html",
    },
}

# ── Regex patterns ───────────────────────────────────────────────────────────

# Matches the progress-tracker.js <script> tag (with or without existing data attrs)
# Captures indentation and the path prefix (e.g. "../../../../../")
PT_PATTERN = re.compile(
    r'([ \t]*)<script([^>]*)src="([^"]*js/progress-tracker\.js)"([^>]*)>',
    re.IGNORECASE,
)

# Matches the deprecated getActiveStudent() save guard
SAVE_GUARD_PATTERN = re.compile(
    r'if\s*\(\s*window\.ProgressTracker\s*&&\s*ProgressTracker\.getActiveStudent\(\)\s*\)',
    re.IGNORECASE,
)

CDN_TAG   = '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>'
AUTH_TAG  = '<script src="{prefix}js/auth-access.js"></script>'


def build_tracker_tag(indent, prefix, module):
    """Build a corrected progress-tracker.js script tag with all required data attrs."""
    return (
        f'{indent}<script src="{prefix}js/progress-tracker.js"\n'
        f'{indent}        data-module-id="{module["id"]}"\n'
        f'{indent}        data-module-name="{module["name"]}"\n'
        f'{indent}        data-module-url="{module["url"]}"></script>'
    )


def fix_file(rel_path, module):
    abs_path = os.path.join(CONTENT, rel_path.replace("/", os.sep))
    if not os.path.exists(abs_path):
        print(f"  [SKIP] File not found: {rel_path}")
        return False

    with open(abs_path, "r", encoding="utf-8") as f:
        original = f.read()

    text = original
    changed = False

    # ── 1. Fix / inject the progress-tracker script tag ──────────────────────
    match = PT_PATTERN.search(text)
    if match:
        indent   = match.group(1)
        prefix   = match.group(3).split("js/progress-tracker.js")[0]  # e.g. "../../../../../"

        # Build the replacement tracker tag with canonical data attrs
        new_tracker = build_tracker_tag(indent, prefix, module)

        # Check if CDN already present just above tracker tag
        cdn_already = CDN_TAG in text
        auth_already = f'{prefix}js/auth-access.js' in text

        # Replace the entire existing tracker tag
        def replacer(m):
            lines = []
            if not cdn_already:
                lines.append(f'{indent}{CDN_TAG}')
            if not auth_already:
                lines.append(f'{indent}{AUTH_TAG.format(prefix=prefix)}')
            lines.append(new_tracker)
            return "\n".join(lines)

        text = PT_PATTERN.sub(replacer, text, count=1)
        changed = True
    else:
        print(f"  [WARN] No progress-tracker.js tag found in: {rel_path}")

    # ── 2. Fix deprecated _saveProgress() guard ───────────────────────────────
    if SAVE_GUARD_PATTERN.search(text):
        text = SAVE_GUARD_PATTERN.sub(
            "if (window.ProgressTracker)",
            text
        )
        changed = True

    # ── 3. Write file if changed ─────────────────────────────────────────────
    if changed and text != original:
        with open(abs_path, "w", encoding="utf-8") as f:
            f.write(text)
        return True
    return False


def main():
    print(f"Fixing {len(MODULES)} module files...\n")
    fixed = 0
    skipped = 0
    for rel_path, module in MODULES.items():
        result = fix_file(rel_path, module)
        if result:
            print(f"  [OK] Fixed: {rel_path}")
            fixed += 1
        else:
            print(f"  [--] No change: {rel_path}")
            skipped += 1

    print(f"\nDone. {fixed} files fixed, {skipped} unchanged/skipped.")


if __name__ == "__main__":
    main()
