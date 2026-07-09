# Task 10 Report: Preserve Existing KSSR English Units

Status: DONE

## Reason

Primary 3 `Unit1` through `Unit5` and Primary 6 `Unit1` through `Unit6` already existed before the workbook promotion. They should keep their original lesson content. Only missing workbook units should be added to live content.

## Files restored

Restored from commit `5039037`:

- `content/KSSR_Syllabus/Primary3/English/Unit1/index.html`
- `content/KSSR_Syllabus/Primary3/English/Unit2/index.html`
- `content/KSSR_Syllabus/Primary3/English/Unit3/index.html`
- `content/KSSR_Syllabus/Primary3/English/Unit4/index.html`
- `content/KSSR_Syllabus/Primary3/English/Unit5/index.html`
- `content/KSSR_Syllabus/Primary6/English/Unit1/index.html`
- `content/KSSR_Syllabus/Primary6/English/Unit2/index.html`
- `content/KSSR_Syllabus/Primary6/English/Unit3/index.html`
- `content/KSSR_Syllabus/Primary6/English/Unit4/index.html`
- `content/KSSR_Syllabus/Primary6/English/Unit5/index.html`
- `content/KSSR_Syllabus/Primary6/English/Unit6/index.html`

## Files kept as new workbook units

- Primary 3: `Unit6` through `Unit10`
- Primary 6: `Unit7` through `Unit10`

## Tool updates

- `tools/workbook_pipeline/promote_workbook_units.py` now skips existing live units by default.
- `--overwrite` is required to replace an existing `Unit*/index.html`.
- `tools/verify_kssr_workbook_pages.js --scope live` now verifies only the newly-added workbook unit range:
  - Primary 3 `Unit6` through `Unit10`: 40 question cards.
  - Primary 6 `Unit7` through `Unit10`: 36 question cards.

## Verification

```powershell
git diff --quiet 5039037 -- content/KSSR_Syllabus/Primary3/English/Unit1/index.html content/KSSR_Syllabus/Primary3/English/Unit2/index.html content/KSSR_Syllabus/Primary3/English/Unit3/index.html content/KSSR_Syllabus/Primary3/English/Unit4/index.html content/KSSR_Syllabus/Primary3/English/Unit5/index.html content/KSSR_Syllabus/Primary6/English/Unit1/index.html content/KSSR_Syllabus/Primary6/English/Unit2/index.html content/KSSR_Syllabus/Primary6/English/Unit3/index.html content/KSSR_Syllabus/Primary6/English/Unit4/index.html content/KSSR_Syllabus/Primary6/English/Unit5/index.html content/KSSR_Syllabus/Primary6/English/Unit6/index.html
```

Result: exit code `0`.

```powershell
node tools\verify_kssr_workbook_pages.js --scope generated
node tools\verify_kssr_workbook_pages.js --scope live
node tools\verify_kssr_workbook_pages.js --scope all
node tools\verify_module_navigation_links.js
```

Results:

- `PASS verify_kssr_workbook_pages scope=generated files=20 questions=169`
- `PASS verify_kssr_workbook_pages scope=live files=9 questions=76`
- `PASS verify_kssr_workbook_pages scope=all files=29 questions=245`
- `Module navigation link verification passed.`

```powershell
C:\Users\hong0\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe -m py_compile tools\workbook_pipeline\promote_workbook_units.py
```

Result: exit code `0`.
