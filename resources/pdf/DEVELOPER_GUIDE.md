# PDF Notes Library Guide

The public notes page is `notes.html`. It is powered by `resources/pdf-catalog.json`, which is generated from every PDF in this repository.

## Important GitHub Pages Detail

GitHub Pages is static hosting. The website cannot create folders or upload PDFs directly from the browser without a backend or authenticated GitHub API flow.

For this project, the safe workflow is:

1. Add a folder and PDF files in GitHub or in the local repo.
2. Run the catalogue generator.
3. Verify the library.
4. Publish to GitHub Pages.

## Recommended Folder Pattern

Use `hardcopy/` for printable notes and worksheets:

```text
hardcopy/
  SPM_Syllabus/
    Form3/
      Science/
    Form4/
      Sains_Komputer/
    Form5/
      Chemistry/
  IGCSE_Syllabus/
    Year8/
      Science/
  Singapore_Syllabus/
    Year4/
      Science/
```

Use clear PDF names with underscores:

```text
Form3_Science_Bab5_Thermochemistry_Bilingual_Student.pdf
SPM_Sains_Komputer_Java_Ch1_3_4_to_1_4_3_Teacher_Answers.pdf
IGCSE_Y8_Science_Ch8_Chemical_Reactions_Tutor_Key.pdf
```

## Generate And Verify

From the repository root:

```bash
npm run build:pdf-catalog
npm run verify:pdf-library
```

Equivalent direct commands:

```bash
python tools/generate_pdf_catalog.py
node tools/verify_pdf_library.js
```

The generator scans all `.pdf` files under the repo, reads light PDF metadata/text when possible, infers category fields, and writes `resources/pdf-catalog.json`.

## Category Rules

The generator infers:

- `syllabus` from folders such as `SPM_Syllabus`, `IGCSE_Syllabus`, `Singapore_Syllabus`, and `UEC_Syllabus`.
- `level` from folders such as `Form3`, `Form5`, `Year4`, and `Year8`.
- `subject` from folder names and PDF content, such as `Science`, `Chemistry`, `Mathematics`, `Bahasa Melayu`, or `Sains Komputer`.
- `audience` from words such as `Student`, `Teacher`, `Tutor`, `Answers`, `Jawapan`, and `Murid`.
- `type` from words such as `Worksheet`, `Slides`, `Answer Key`, `Revision`, `Notes`, and `Past Year Paper`.

For files that need exact human naming, add an entry to the `CURATED` map in `tools/generate_pdf_catalog.py`.

## The Imported Desktop PDFs

The five Desktop PDFs were imported into these static GitHub Pages paths:

```text
hardcopy/SPM_Syllabus/Form3/Science/Form3_Science_Bab5_Thermochemistry_Bilingual_Student.pdf
hardcopy/SPM_Syllabus/Form4/Sains_Komputer/SPM_Sains_Komputer_Java_Ch1_3_4_to_1_4_3_Student.pdf
hardcopy/SPM_Syllabus/Form4/Sains_Komputer/SPM_Sains_Komputer_Java_Ch1_3_4_to_1_4_3_Teacher_Answers.pdf
hardcopy/IGCSE_Syllabus/Year8/Science/IGCSE_Y8_Science_Ch8_Chemical_Reactions_Student.pdf
hardcopy/IGCSE_Syllabus/Year8/Science/IGCSE_Y8_Science_Ch8_Chemical_Reactions_Tutor_Key.pdf
```
