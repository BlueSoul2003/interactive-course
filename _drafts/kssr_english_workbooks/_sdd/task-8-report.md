# Task 8 Report: Promote Draft Units To Live KSSR Pages

Status: DONE

## Files changed

- `tools/workbook_pipeline/promote_workbook_units.py`
- `content/KSSR_Syllabus/Primary3/English/Unit*/index.html`
- `content/KSSR_Syllabus/Primary6/English/Unit*/index.html`
- `_drafts/kssr_english_workbooks/_sdd/task-8-report.md`

## Commands and results

```powershell
C:\Users\hong0\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe tools\workbook_pipeline\promote_workbook_units.py --source _drafts\kssr_english_workbooks\primary3\generated --target content\KSSR_Syllabus\Primary3\English
```

Result: promoted Primary 3 `Unit1` through `Unit10`.

```powershell
C:\Users\hong0\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe tools\workbook_pipeline\promote_workbook_units.py --source _drafts\kssr_english_workbooks\primary6\generated --target content\KSSR_Syllabus\Primary6\English
```

Result: promoted Primary 6 `Unit1` through `Unit10`.

Live page verification:

- Primary 3 live Unit pages: 10, question cards: 80.
- Primary 6 live Unit pages: 10, question cards: 89.
- Required scripts, module ids, question ids, question types, source pages, and duplicate id checks passed.

```powershell
node tools\verify_kssr_workbook_pages.js
```

Result: `PASS verify_kssr_workbook_pages scope=generated files=20 questions=169`.

```powershell
node tools\verify_kssr_workbook_pages.js --scope live
```

Result: `PASS verify_kssr_workbook_pages scope=live files=20 questions=169`.

```powershell
node tools\verify_kssr_workbook_pages.js --scope all
```

Result: `PASS verify_kssr_workbook_pages scope=all files=40 questions=338`.

```powershell
C:\Users\hong0\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe tools\verify_kssr_workbook_json.py _drafts\kssr_english_workbooks\primary3\workbook.json _drafts\kssr_english_workbooks\primary6\workbook.json
```

Result:

- `PASS _drafts\kssr_english_workbooks\primary3\workbook.json units=10 questions=80`
- `PASS _drafts\kssr_english_workbooks\primary6\workbook.json units=10 questions=89`

## Caveats

- Live pages now use the reviewed draft generator output, but the prompt text remains OCR-derived and should still be human-checked against `page_review.html` before treating the content as final.
- Existing `Revision1` and `Revision2` live directories were not modified.
