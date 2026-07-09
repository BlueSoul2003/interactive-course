# Task 9 Report: Publish KSSR Workbook Entry Points And PDF Catalog

Status: DONE

## Files changed

- `index.html`
- `tools/generate_pdf_catalog.py`
- `resources/pdf-catalog.json`
- `_drafts/kssr_english_workbooks/_sdd/task-9-report.md`

## Entry page updates

- Added Primary 3 English workbook cards for `Unit6` through `Unit10` under the existing KSSR English Year 3 chapter grid.
- Added Primary 6 English workbook cards for `Unit7` through `Unit10` under the existing KSSR English Year 6 chapter grid.
- Preserved existing `Revision1` and `Revision2` cards for both grades.
- Kept existing `data-module-id` and `data-bundle` naming patterns:
  - `kssr-p3-en-unit*` with `kssr_p3_english`
  - `kssr-p6-en-unit*` with `kssr_p6_english`

## PDF catalog updates

- Added KSSR inference support for `KSSR_Syllabus`.
- Added `Primary*` level inference.
- Added curated metadata for:
  - `hardcopy/KSSR_Syllabus/Primary3/English/source_pdfs/english_p3_workbook.pdf`
  - `hardcopy/KSSR_Syllabus/Primary6/English/source_pdfs/english_p6_workbook.pdf`
- Updated catalog writing to use a temp file plus atomic replace after direct overwrite hit a local `PermissionError`.

## Commands and results

```powershell
npm run build:pdf-catalog
```

Result: `Wrote resources\pdf-catalog.json with 89 PDFs.`

```powershell
npm run verify:pdf-library
```

Result: `PDF library verification passed for 89 catalog items.`

```powershell
node tools\verify_module_navigation_links.js
```

Result: `Module navigation link verification passed.`

```powershell
node tools\verify_kssr_workbook_pages.js --scope live
node tools\verify_kssr_workbook_pages.js --scope all
```

Results:

- `PASS verify_kssr_workbook_pages scope=live files=20 questions=169`
- `PASS verify_kssr_workbook_pages scope=all files=40 questions=338`

## Catalog spot check

- Primary 3 source PDF: KSSR / Primary 3 / English / Workbook / 88 pages.
- Primary 6 source PDF: KSSR / Primary 6 / English / Workbook / 98 pages.
