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

## Fix after review

The task review found that the fallback minimum was not satisfied: when full OCR is deferred, the task requires at least the first 3 pages of each book. I also made the runtime paths configurable while keeping the workstation defaults.

### Code/config fix

- `POPPLER_BIN`, `TESSERACT_JS_PATH`, and `OCR_CACHE_DIR` can now be overridden with environment variables.
- Added `tools/workbook_pipeline/test_ocr_workbooks_env.js` to verify those overrides fail against the requested override paths before the raw JSON is read.

### Verification commands

```powershell
node tools\workbook_pipeline\test_ocr_workbooks_env.js
```

Result: passed, `ocr_workbooks env override tests passed`.

```powershell
node tools\workbook_pipeline\ocr_workbooks.js --raw _drafts\kssr_english_workbooks\primary3\raw_pages.json --source-pdf hardcopy\KSSR_Syllabus\Primary3\English\source_pdfs\english_p3_workbook.pdf --out _drafts\kssr_english_workbooks\primary3\raw_pages.json --pages 1-3 --dpi 150 --lang eng --force
```

Result: passed, processed 3 pages, total pages remained 88, total OCR chars became 1858, elapsed 32.4 seconds.

```powershell
node tools\workbook_pipeline\ocr_workbooks.js --raw _drafts\kssr_english_workbooks\primary6\raw_pages.json --source-pdf hardcopy\KSSR_Syllabus\Primary6\English\source_pdfs\english_p6_workbook.pdf --out _drafts\kssr_english_workbooks\primary6\raw_pages.json --pages 1-3 --dpi 150 --lang eng --force
```

Result: passed, processed 3 pages, total pages remained 98, total OCR chars became 2575, elapsed 17.8 seconds.

```powershell
node -e "const fs=require('fs'); for (const [label,file,expected] of [['p3','_drafts/kssr_english_workbooks/primary3/raw_pages.json',88],['p6','_drafts/kssr_english_workbooks/primary6/raw_pages.json',98]]) { const data=JSON.parse(fs.readFileSync(file,'utf8')); const chars=data.pages.slice(0,3).map(p=>p.ocrTextChars); const modes=data.pages.slice(0,3).map(p=>p.mode); const total=data.pages.reduce((s,p)=>s+Number(p.ocrTextChars||0),0); console.log(label, JSON.stringify({pages:data.pages.length, expected, chars, modes, total})); if (data.pages.length !== expected || chars.some(c=>!(c>0))) process.exit(1); }"
```

Result:

- Primary 3: 88 pages, first 3 OCR chars `[147, 134, 1577]`, first 3 modes all `ocr_text`, total OCR chars `1858`.
- Primary 6: 98 pages, first 3 OCR chars `[495, 382, 1698]`, first 3 modes all `ocr_text`, total OCR chars `2575`.

```powershell
Get-ChildItem -Recurse -File _drafts\kssr_english_workbooks | Where-Object { $_.Extension -eq '.png' } | Select-Object -ExpandProperty FullName
```

Result: no output; no rendered PNGs were left in the repo.

### Notes

- `_drafts/kssr_english_workbooks/ocr_cache/eng.traineddata` is cached for `tesseract.js`; provenance/license should be reviewed before redistributing it outside this project.
- 150 DPI OCR is visibly noisy, but it is enough to unblock manual normalization and page-review tooling. Full content extraction still needs human review before it becomes learner-facing material.

## Full OCR continuation

After the Task 3b review was approved, the controller continued the same OCR bridge in chunks to process the rest of both books.

### Primary 3 full run

Processed ranges:

- `4-13`: processed 10 pages, total OCR chars 10683, elapsed 67.9 seconds.
- `14-23`: processed 10 pages, total OCR chars 19001, elapsed 44.1 seconds.
- `24-33`: processed 10 pages, total OCR chars 27790, elapsed 49.4 seconds.
- `34-43`: processed 10 pages, total OCR chars 37322, elapsed 41.8 seconds.
- `44-53`: processed 10 pages, total OCR chars 44739, elapsed 32.9 seconds.
- `54-63`: processed 10 pages, total OCR chars 51343, elapsed 38.5 seconds.
- `64-73`: processed 10 pages, total OCR chars 59151, elapsed 38.0 seconds.
- `74-83`: processed 10 pages, total OCR chars 69273, elapsed 41.0 seconds.
- `84-88`: processed 5 pages, total OCR chars 83358, elapsed 32.2 seconds.

Final assertion: Primary 3 has 88 pages, 88 OCR pages with text, zero empty OCR pages, and 83358 total OCR characters.

### Primary 6 full run

Processed ranges:

- `4-13`: processed 10 pages, total OCR chars 12926, elapsed 37.5 seconds.
- `14-23`: processed 10 pages, total OCR chars 21902, elapsed 43.1 seconds.
- `24-33`: processed 10 pages, total OCR chars 31058, elapsed 40.6 seconds.
- `34-43`: processed 10 pages, total OCR chars 40935, elapsed 41.2 seconds.
- `44-53`: processed 10 pages, total OCR chars 51268, elapsed 41.0 seconds.
- `54-63`: processed 10 pages, total OCR chars 62384, elapsed 45.4 seconds.
- `64-73`: processed 10 pages, total OCR chars 71916, elapsed 42.2 seconds.
- `74-83`: processed 10 pages, total OCR chars 81499, elapsed 42.9 seconds.
- `84-93`: processed 10 pages, total OCR chars 96908, elapsed 51.4 seconds.
- `94-98`: processed 5 pages, total OCR chars 111456, elapsed 31.1 seconds.

Final assertion: Primary 6 has 98 pages, 98 OCR pages with text, zero empty OCR pages, and 111456 total OCR characters.

### Final verification

```powershell
node -e "const fs=require('fs'); for (const [label,file,expected] of [['p3','_drafts/kssr_english_workbooks/primary3/raw_pages.json',88],['p6','_drafts/kssr_english_workbooks/primary6/raw_pages.json',98]]) { const data=JSON.parse(fs.readFileSync(file,'utf8')); const zero=data.pages.filter(p=>!(Number(p.ocrTextChars||0)>0)).map(p=>p.page); const total=data.pages.reduce((s,p)=>s+Number(p.ocrTextChars||0),0); console.log(label, JSON.stringify({pages:data.pages.length, expected, ocrPages:data.pages.length-zero.length, zeroPages:zero, total})); if(data.pages.length!==expected || zero.length) process.exit(1); }"
```

Result:

- Primary 3: `{"pages":88,"expected":88,"ocrPages":88,"zeroPages":[],"total":83358}`
- Primary 6: `{"pages":98,"expected":98,"ocrPages":98,"zeroPages":[],"total":111456}`

```powershell
Get-ChildItem -Recurse -File _drafts\kssr_english_workbooks | Where-Object { $_.Extension -eq '.png' } | Select-Object -ExpandProperty FullName
```

Result: no output; no rendered PNGs were left in the repo.
