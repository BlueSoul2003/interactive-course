# PDF Resources Developer Guide

This document explains how to add downloadable PDF notes to the **Mastery Academy** landing page.

---

## 📁 Folder Structure

All PDF files must be placed inside the `resources/pdf/` directory, organized by syllabus and subject:

```
interactive-course-main/
  resources/
    pdf/
      SPM/
        BM/               ← SPM Bahasa Melayu PDFs
        Math/             ← SPM Mathematics PDFs
        Science/          ← ...
      UEC/
        English/          ← UEC English PDFs
        Math/
      IGCSE/
        English/
        Math/
      Singapore/
        Math/
        English/
      DEVELOPER_GUIDE.md  ← This file
```

---

## 📄 File Naming Convention

Use descriptive names with underscores. No spaces. Example:

| ✅ Good | ❌ Avoid |
|---|---|
| `Silir_Daksina_Sinopsis.pdf` | `sinopsis (1).pdf` |
| `Kata_Terbitan_Notes.pdf`   | `KATA TERBITAN.pdf` |
| `UEC_Reading_Guide.pdf`     | `notes.pdf` |

---

## ➕ How to Add a New PDF Entry

1. **Drop the PDF file** into the correct subfolder under `resources/pdf/`.
   - Example: `resources/pdf/SPM/BM/Nota_Komsas_Silir_Daksina.pdf`

2. **Open `index.html`** and find the JavaScript array named `pdfResources` (search for `pdfResources`).

3. **Add a new entry object** to the array following this format:

```json
{
  "syllabus": "SPM",
  "subject": "Bahasa Melayu",
  "label": "Nota KOMSAS - Silir Daksina",
  "file": "resources/pdf/SPM/BM/Nota_Komsas_Silir_Daksina.pdf"
}
```

| Key | Description |
|---|---|
| `syllabus` | The top-level group header (e.g. `SPM`, `UEC`, `IGCSE`, `Singapore`) |
| `subject` | The sub-group shown under the syllabus header |
| `label` | The user-facing download button text |
| `file` | Relative path from `index.html` to the PDF file |

4. **Save `index.html`**. The modal will automatically pick up the new entry — no further changes needed.

---

## 💡 Example — Full Array Entry Set

```javascript
const pdfResources = [
  // ── SPM ──────────────────────────────────────────────
  { syllabus: "SPM", subject: "Bahasa Melayu", label: "Peribahasa Notes",              file: "resources/pdf/SPM/BM/Peribahasa_Notes.pdf" },
  { syllabus: "SPM", subject: "Bahasa Melayu", label: "Kata Terbitan Notes",           file: "resources/pdf/SPM/BM/Kata_Terbitan_Notes.pdf" },
  { syllabus: "SPM", subject: "Bahasa Melayu", label: "Nota KOMSAS - Silir Daksina",  file: "resources/pdf/SPM/BM/Nota_Komsas_Silir_Daksina.pdf" },

  // ── UEC ──────────────────────────────────────────────
  { syllabus: "UEC", subject: "English", label: "Reading Comprehension Guide",         file: "resources/pdf/UEC/English/Reading_Guide.pdf" },
  { syllabus: "UEC", subject: "English", label: "Summary Writing Workshop",            file: "resources/pdf/UEC/English/Summary_Writing.pdf" },

  // ── IGCSE ─────────────────────────────────────────────
  // Add IGCSE entries here...

  // ── Singapore ─────────────────────────────────────────
  { syllabus: "Singapore", subject: "Mathematics Y4", label: "Whole Numbers Review",  file: "resources/pdf/Singapore/Math/Whole_Numbers_Review.pdf" },
];
```

---

## ⚠️ Notes

- The `file` path is **relative to `index.html`**, not to this guide file.
- If a PDF file doesn't exist yet, the link will still appear but download will fail. Ensure the file exists before publishing.
- PDFs are served directly as static files — no server-side processing needed.
