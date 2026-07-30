# Task 6 Report: Generate Cute Interactive Draft Unit Pages

Status: DONE_WITH_CONCERNS

## Files changed

- `tools/workbook_pipeline/render_workbook_units.py`
- `_drafts/kssr_english_workbooks/primary3/generated/Unit*/index.html`
- `_drafts/kssr_english_workbooks/primary6/generated/Unit*/index.html`
- `_drafts/kssr_english_workbooks/_sdd/task-6-report.md`

## Design read

Reading this as a cute interactive workbook app for Primary 3 and Primary 6 self-study learners, with warm playful classroom language, static HTML, CSS tokens, and restrained interactive controls.

Dial choices:

- `DESIGN_VARIANCE: 7`
- `MOTION_INTENSITY: 4`
- `VISUAL_DENSITY: 5`

## Commands and results

```powershell
C:\Users\hong0\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe tools\workbook_pipeline\render_workbook_units.py --workbook _drafts\kssr_english_workbooks\primary3\workbook.json --out-dir _drafts\kssr_english_workbooks\primary3\generated
```

Result: generated 10 Primary 3 unit pages.

```powershell
C:\Users\hong0\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe tools\workbook_pipeline\render_workbook_units.py --workbook _drafts\kssr_english_workbooks\primary6\workbook.json --out-dir _drafts\kssr_english_workbooks\primary6\generated
```

Result: generated 10 Primary 6 unit pages.

```powershell
C:\Users\hong0\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe -m py_compile tools\workbook_pipeline\render_workbook_units.py
```

Result: passed.

Static HTML verification checked:

- Primary 3 generated file count: 10
- Primary 6 generated file count: 10
- Required script references: `js/navigation.js?v=1.0.0`, Supabase CDN, `js/auth-access.js`, `js/progress-tracker.js`
- `data-module-id`
- `data-question-id`
- `data-source-page`
- no duplicate ids
- no generated `TODO`, `TBD`, or `PLACEHOLDER` tokens
- reduced motion CSS present

Result: passed.

```powershell
C:\Users\hong0\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe tools\verify_kssr_workbook_json.py _drafts\kssr_english_workbooks\primary3\workbook.json _drafts\kssr_english_workbooks\primary6\workbook.json
```

Result:

- `PASS _drafts\kssr_english_workbooks\primary3\workbook.json units=10 questions=80`
- `PASS _drafts\kssr_english_workbooks\primary6\workbook.json units=10 questions=89`

## Generated counts

- Primary 3: 10 unit pages, 80 question cards.
- Primary 6: 10 unit pages, 89 question cards.

Sample files:

- `_drafts/kssr_english_workbooks/primary3/generated/Unit1/index.html`
- `_drafts/kssr_english_workbooks/primary6/generated/Unit1/index.html`

## Caveats

- Generated draft pages still display OCR-derived prompts. They are interactive and traceable, but Task 5 human review is still required before promotion to live `content/`.
- Complex worksheet layouts such as matching, sequencing, picture prompts, and word-bank tasks are rendered as review-friendly interactive controls rather than perfect replicas of the printed worksheet.
- No answer key is shown because the normalized workbook does not promote answer data.
