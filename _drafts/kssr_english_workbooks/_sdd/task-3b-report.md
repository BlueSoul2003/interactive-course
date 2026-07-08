# Task 3b Report: OCR Bridge With Poppler And Tesseract.js

Status: DONE_WITH_CONCERNS

## Files

- `tools/workbook_pipeline/ocr_workbooks.js`
- `_drafts/kssr_english_workbooks/primary3/raw_pages.json`
- `_drafts/kssr_english_workbooks/primary3/extraction_audit.md`
- `_drafts/kssr_english_workbooks/ocr_cache/eng.traineddata`

## What was completed

- Implemented `tools/workbook_pipeline/ocr_workbooks.js` as a resumable CLI bridge that:
  - renders one PDF page at a time with bundled `pdftoppm.exe`
  - OCRs each rendered PNG with bundled `tesseract.js`
  - updates `ocrText`, `ocrTextChars`, and `mode`
  - deletes each temporary PNG after OCR
  - rewrites the audit file after the run
- Reused `_drafts/kssr_english_workbooks/ocr_cache/eng.traineddata` via `langPath` and `cachePath`.
- Stopped after the requested smoke-test evidence and did not continue a long OCR run.

## Smoke-test verification

Ran:

```powershell
node tools/workbook_pipeline/ocr_workbooks.js --raw _drafts/kssr_english_workbooks/primary3/raw_pages.json --source-pdf hardcopy/KSSR_Syllabus/Primary3/English/source_pdfs/english_p3_workbook.pdf --out _drafts/kssr_english_workbooks/primary3/raw_pages.json --pages 1 --dpi 150 --lang eng --force
```

Observed:

- exit code `0`
- `processedPages: 1`
- `totalPages: 88`
- `elapsedSeconds: 9.7`
- Primary 3 page 1 now has `ocrTextChars: 147`
- Primary 3 page 1 `mode` is now `ocr_text`
- Primary 3 audit now reports `OCR text characters: 147`

## Concerns

- Only the required smoke test was completed after interruption; Primary 3 pages 2-88 and all Primary 6 pages still need OCR.
- A full 186-page run was not started here to avoid a long silent job after the user's stop request.
- `git status` shows unrelated untracked files in this workspace, so the commit for Task 3b should stay tightly scoped.

## Exact commands to continue later

Primary 3 full OCR:

```powershell
node tools/workbook_pipeline/ocr_workbooks.js --raw _drafts/kssr_english_workbooks/primary3/raw_pages.json --source-pdf hardcopy/KSSR_Syllabus/Primary3/English/source_pdfs/english_p3_workbook.pdf --out _drafts/kssr_english_workbooks/primary3/raw_pages.json --pages all --dpi 150 --lang eng
```

Primary 6 full OCR:

```powershell
node tools/workbook_pipeline/ocr_workbooks.js --raw _drafts/kssr_english_workbooks/primary6/raw_pages.json --source-pdf hardcopy/KSSR_Syllabus/Primary6/English/source_pdfs/english_p6_workbook.pdf --out _drafts/kssr_english_workbooks/primary6/raw_pages.json --pages all --dpi 150 --lang eng
```
