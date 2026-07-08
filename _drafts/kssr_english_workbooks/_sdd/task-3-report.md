# Task 3 Report: Extraction Pipeline With OCR Gate

Status: DONE_WITH_CONCERNS

## Files

- `tools/workbook_pipeline/extract_workbooks.py`
- `tools/workbook_pipeline/test_extract_workbooks.py`
- `_drafts/kssr_english_workbooks/primary3/raw_pages.json`
- `_drafts/kssr_english_workbooks/primary6/raw_pages.json`
- `_drafts/kssr_english_workbooks/primary3/extraction_audit.md`
- `_drafts/kssr_english_workbooks/primary6/extraction_audit.md`

## Brief check

The Task 3 implementation matches the brief and the controller note:

- `tools/workbook_pipeline/extract_workbooks.py` extracts per-page embedded text metadata with `pdfplumber`.
- The script writes `raw_pages.json` and `extraction_audit.md` before enforcing the OCR gate.
- The gate returns exit code `3` when the first five pages are image-only and no OCR CLI is available.
- Both workbook PDFs in this environment are fully image-only, so the gate is expected to fire.

## Focused verification

Ran the focused unit test for the OCR gate and page-count failure path with the bundled Python runtime:

```powershell
& 'C:/Users/hong0/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe' -m unittest tools.workbook_pipeline.test_extract_workbooks
```

Observed result:

- 2 tests passed
- verified output files are written before returning exit code `3`
- verified page-count mismatches raise `SystemExit`

## Extraction probes

Ran the required extraction commands with the bundled Python runtime and captured the explicit exit codes:

```powershell
& 'C:/Users/hong0/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe' tools/workbook_pipeline/extract_workbooks.py --source-pdf hardcopy/KSSR_Syllabus/Primary3/English/source_pdfs/english_p3_workbook.pdf --out-dir _drafts/kssr_english_workbooks/primary3 --expected-pages 88 --book-id kssr-primary3-english-workbook
```

- wrote `_drafts/kssr_english_workbooks/primary3/raw_pages.json`
- wrote `_drafts/kssr_english_workbooks/primary3/extraction_audit.md`
- detected 88 pages
- exited with code `3`

```powershell
& 'C:/Users/hong0/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe' tools/workbook_pipeline/extract_workbooks.py --source-pdf hardcopy/KSSR_Syllabus/Primary6/English/source_pdfs/english_p6_workbook.pdf --out-dir _drafts/kssr_english_workbooks/primary6 --expected-pages 98 --book-id kssr-primary6-english-workbook
```

- wrote `_drafts/kssr_english_workbooks/primary6/raw_pages.json`
- wrote `_drafts/kssr_english_workbooks/primary6/extraction_audit.md`
- detected 98 pages
- exited with code `3`

## Output summary

- `primary3/raw_pages.json` contains 88 page entries.
- `primary6/raw_pages.json` contains 98 page entries.
- Both audits show `Embedded text characters: 0`.
- Both audits show `OCR command available: no`.

## Concerns

- `tesseract` and `ocrmypdf` are still unavailable on `PATH` in this environment, so normalization should remain blocked until an OCR route is approved and installed or exposed.
- The current PDFs are image-only across all pages, so later tasks cannot rely on embedded PDF text.
