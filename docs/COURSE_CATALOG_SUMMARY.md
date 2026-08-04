# Interactive Course Catalog Summary

Last updated: 2026-08-04

這份文件是 interactive course 專案的課程管理地圖。它不是開發 SOP，而是給你快速理解「現在網站裡到底有哪些課、放在哪裡、屬於哪個 syllabus / 年級 / 科目」用的總覽。

## Quick View

| Area | Current Coverage | Notes |
| --- | --- | --- |
| Main portal | `index.html` | 所有正式 course card 的入口。 |
| Notes / PDF library | `notes.html`, `resources/pdf-catalog.json` | PDF catalogue 目前由工具掃描產生，最後驗證為 91 items。 |
| Static course content | `content/` | 目前有 78 個 `index.html` 頁面，包含正式課、revision、hub、工具頁。 |
| Printable hardcopy | `hardcopy/` | 放 printable notes、worksheet、teacher answers 等 PDF。 |
| Course management SOP | `docs/HOW_TO_ADD_A_NEW_MODULE.md` | 新增 module 時跟這份走。 |
| Revision module SOP | `docs/HOW_TO_CREATE_A_REVISION_MODULE.md` | 做 revision / practice module 時跟這份走。 |
| Live quiz operations | `docs/ADDMATHS_LIVE_QUIZ_SETUP.md` | Form 4 Additional Mathematics 實時測驗的權限、資料庫設定與驗證指南。 |

## Course Structure Rules

| Type | Folder Pattern | Example |
| --- | --- | --- |
| SPM | `content/SPM_Syllabus/FormX/Subject/Module_Name/index.html` | `content/SPM_Syllabus/Form3/Science/Bab5_Termokimia/index.html` |
| UEC | `content/UEC_Syllabus/Senior/Subject/Module_Name/index.html` | `content/UEC_Syllabus/Senior/English/Reading/index.html` |
| IGCSE | `content/IGCSE_Syllabus/YearX/Subject/Topic_Name/index.html` | `content/IGCSE_Syllabus/Year8/Science/Chapter1_Respiration/index.html` |
| Singapore | `content/Singapore_Syllabus/YearX/Subject/Chapter_Name/index.html` | `content/Singapore_Syllabus/Year4/Math/Chapter5_Fractions/index.html` |
| KSSR | `content/KSSR_Syllabus/PrimaryX/Subject/UnitX/index.html` | `content/KSSR_Syllabus/Primary3/English/Unit6/index.html` |
| University | `content/University/Subject/Module_Name/index.html` | `content/University/Physics/Kinematics_Simulator/index.html` |
| Mini tools | `content/Mini_Games/*.html` | `content/Mini_Games/focus_games.html` |

## SPM

### SPM Form 2 Mathematics

| Module | Type | Route |
| --- | --- | --- |
| KSSM Form 2 Math: Intensive Revision 1 | Revision / KBAT practice | `content/SPM_Syllabus/Form2/Math/KSSM_Revision1/index.html` |

### SPM Form 3 Science

| Module | Type | Route |
| --- | --- | --- |
| Bab 5: Termokimia (Thermochemistry) | Teacher presentation / interactive slides | `content/SPM_Syllabus/Form3/Science/Bab5_Termokimia/index.html` |

### SPM Form 4 Additional Mathematics

| Module | Type | Coverage | Student Route | Teacher Route |
| --- | --- | --- | --- | --- |
| Form 4 Additional Mathematics Live Quiz | Teacher-led live quiz | 40 verified MCQs across Chapters 1-10 | `content/SPM_Syllabus/Form4/Additional_Mathematics/Live_Quiz/index.html` | `content/SPM_Syllabus/Form4/Additional_Mathematics/Live_Quiz/teacher.html` |

Management notes:

- Portal module id: `spm-addmath-f4-live-quiz`; bundle: `spm_form4`.
- Students join with a session code, name, and optional student ID. They do not need a normal Interactive Course account.
- Teachers use the existing account system and must have a `teacher` or `admin` entry in `quiz_staff`.
- Teachers control question order, option order, duration, late joining, and when results are released.
- Teacher tools include waiting rooms, join links and QR codes, live monitoring, chapter analysis, CSV export, and reopening attempts.
- Questions are public, but answer keys and explanations remain in Supabase.
- Interface languages: English and Simplified Chinese.
- Database setup: `db/migrations/addmaths_live_quiz.sql` followed by `db/migrations/addmaths_live_quiz_hardening.sql`.
- Operations and access guide: `docs/ADDMATHS_LIVE_QUIZ_SETUP.md`.
- Verification: `npm run verify:addmaths-live-quiz` and `npm run verify:navigation`.

### SPM Form 5 English

| Module | Focus | Route |
| --- | --- | --- |
| Social Media Masterclass | Argumentative writing | `content/SPM_Syllabus/Form5/English/Social_Media_Masterclass/index.html` |
| My Dream Holiday | Descriptive writing | `content/SPM_Syllabus/Form5/English/My_Dream_Holiday/index.html` |
| The Storyteller's Toolkit | Narrative writing | `content/SPM_Syllabus/Form5/English/Storytellers_Toolkit/index.html` |
| The Advice Expert | Informal letter / advice writing | `content/SPM_Syllabus/Form5/English/Advice_Expert/index.html` |
| The Public Speaker | Speech and talk writing | `content/SPM_Syllabus/Form5/English/Speech_Writing/index.html` |

### SPM Form 5 Bahasa Melayu

| Module | Focus | Route |
| --- | --- | --- |
| Sistem Latihan: Kesalahan Ejaan | Ejaan / spelling traps | `content/SPM_Syllabus/Form5/BM/Kesalahan_Ejaan/index.html` |
| Peribahasa Mastery | Peribahasa | `content/SPM_Syllabus/Form5/BM/Peribahasa/index.html` |
| Morfologi Mastery | Kata terbitan | `content/SPM_Syllabus/Form5/BM/Kata_Terbitan/index.html` |
| Novel Silir Daksina | KOMSAS novel | `content/SPM_Syllabus/Form5/BM/KOMSAS/Novel_Silir_Daksina/index.html` |
| Modul Karangan SPM 1 | Karangan formula / structure | `content/SPM_Syllabus/Form5/BM/Karangan/index.html` |
| Rumusan | Summary writing | `content/SPM_Syllabus/Form5/BM/Rumusan/index.html` |
| SPM Reading Comprehension | Pemahaman / KOMSAS reading | `content/SPM_Syllabus/Form5/BM/Reading_Comprehension/index.html` |
| Imbuhan Alchemy | Imbuhan / morphology logic | `content/SPM_Syllabus/Form5/BM/Imbuhan_Alchemy/index.html` |
| SPM Tatabahasa Master | Tatabahasa quiz | `content/SPM_Syllabus/Form5/BM/Tatabahasa_Master/index.html` |
| Karangan: Rakan Sebaya | Karangan carousel module | `content/SPM_Syllabus/Form5/BM/Karangan_Rakan_Sebaya/index.html` |

### SPM Form 5 Chemistry

| Module | Type | Route |
| --- | --- | --- |
| Chapter 5: Consumer and Industrial Chemistry | Bilingual lesson + workbook support | `content/SPM_Syllabus/Form5/Chemistry/Chapter5_Consumer_and_Industrial_Chemistry/index.html` |
| Student workbook | PDF | `content/SPM_Syllabus/Form5/Chemistry/Chapter5_Consumer_and_Industrial_Chemistry/student_workbook.pdf` |
| Teacher answer scheme | PDF | `content/SPM_Syllabus/Form5/Chemistry/Chapter5_Consumer_and_Industrial_Chemistry/teacher_answer_scheme.pdf` |

### SPM Subjects Visible But Not Yet Built

These subject cards exist as future placeholders or non-module anchors:

| Subject | Current Status |
| --- | --- |
| Chinese | Card exists, no formal module folder listed in `content/SPM_Syllabus/`. |
| Sejarah | Card exists, no formal module folder listed in `content/SPM_Syllabus/`. |
| Physics | Card exists, no formal SPM Physics module folder listed in `content/SPM_Syllabus/`. University Physics exists separately. |
| Biology | Card exists, no formal module folder listed in `content/SPM_Syllabus/`. |

## UEC Senior English

| Module | Focus | Route |
| --- | --- | --- |
| Reading Comprehension | Paper 2 Section A | `content/UEC_Syllabus/Senior/English/Reading/index.html` |
| Grammar & Usage | Paper 2 Section B | `content/UEC_Syllabus/Senior/English/Grammar/index.html` |
| Summary Writing | Paper 2 Section B | `content/UEC_Syllabus/Senior/English/Summary/index.html` |
| The Discovery Journey | Interactive workshop | `content/UEC_Syllabus/Senior/English/Discovery_Journey/index.html` |
| Teen CEO Simulator Pro | Business / simulation | `content/UEC_Syllabus/Senior/English/Teen_CEO_Simulator/index.html` |
| The AI Co-Founder Simulator | AI / business simulation | `content/UEC_Syllabus/Senior/English/AI_CoFounder_Simulator/index.html` |
| The Profit Playbook Pro | Pricing / business English | `content/UEC_Syllabus/Senior/English/Pricing_Strategy/index.html` |
| The Master Negotiator | Negotiation / speaking logic | `content/UEC_Syllabus/Senior/English/The_Master_Negotiator/index.html` |
| Rich Teen Simulator | Financial literacy / reading logic | `content/UEC_Syllabus/Senior/English/Rich_Teen_Simulator/index.html` |

### UEC Subjects Visible But Not Yet Built

| Subject | Current Status |
| --- | --- |
| Bahasa Malaysia | Card exists, no formal module folder listed. |
| Advanced Mathematics | Card exists, no formal module folder listed. |
| General Science | Card exists, no formal module folder listed. |
| Chinese | Card exists, no formal module folder listed. |
| History | Card exists, no formal module folder listed. |
| Chemistry | Card exists, no formal module folder listed. |

## IGCSE

### IGCSE English

| Module | Focus | Route |
| --- | --- | --- |
| CEO Masterclass (Time Heist) | IGCSE ESL / time management theme | `content/IGCSE_Syllabus/English/CEO_Masterclass/index.html` |

### IGCSE Year 4 Science

| Module | Focus | Route |
| --- | --- | --- |
| Topic 1: Life Processes & Ecosystems | Life processes / ecosystems | `content/IGCSE_Syllabus/Year4/Science/Topic1_Life_Processes_Ecosystems/index.html` |
| Topic 2: Living Things in Their Environment | Living things / environment | `content/IGCSE_Syllabus/Year4/Science/Topic2_Living_Things/index.html` |
| Topic 3: States of Matter | Matter | `content/IGCSE_Syllabus/Year4/Science/Topic3_States_of_Matter/index.html` |
| Topic 4: Energy and Light | Energy / light | `content/IGCSE_Syllabus/Year4/Science/Topic4_Energy_and_Light/index.html` |
| Topic 5: Electricity and Circuits | Electricity | `content/IGCSE_Syllabus/Year4/Science/Topic5_Electricity/index.html` |
| Topic 6: Planet Earth | Earth science | `content/IGCSE_Syllabus/Year4/Science/Topic6_Planet_Earth/index.html` |
| Topic 7: Earth and Space | Space / astronomy basics | `content/IGCSE_Syllabus/Year4/Science/Topic7_Earth_and_Space/index.html` |
| Science Command Centre 4.0 | Comprehensive practice / mission system | `content/IGCSE_Syllabus/Year4/Science/Science_Command_Centre/index.html` |

### IGCSE Year 8 Science

| Module | Focus | Route |
| --- | --- | --- |
| Chapter 1: Respiration & Breathing | Biology / respiration | `content/IGCSE_Syllabus/Year8/Science/Chapter1_Respiration/index.html` |
| Chapter 2: Properties of Materials | Materials | `content/IGCSE_Syllabus/Year8/Science/Chapter2_Properties_of_Materials/index.html` |
| Chapter 3: Forces and Energy | Physics / forces / energy | `content/IGCSE_Syllabus/Year8/Science/Chapter3_Forces_and_Energy/index.html` |
| Chapter 4: Ecosystems | Biology / ecosystems | `content/IGCSE_Syllabus/Year8/Science/Chapter4_Ecosystems/index.html` |
| Chapter 5: Materials and Cycles on Earth | Earth cycles / materials | `content/IGCSE_Syllabus/Year8/Science/Chapter5_Materials_and_Cycles/index.html` |
| Chapter 6: Light and Space | Light / space | `content/IGCSE_Syllabus/Year8/Science/Chapter6_Light_and_Space/index.html` |
| Chapter 7: Diet and Growth | Biology / diet / growth | `content/IGCSE_Syllabus/Year8/Science/Chapter7_Diet_and_Growth/index.html` |
| Chapter 7: Diet and Growth MCQ | MCQ quiz | `content/IGCSE_Syllabus/Year8/Science/Chapter7_Diet_and_Growth_MCQ/index.html` |

## Singapore Year 4 Mathematics

| Module | Type | Route |
| --- | --- | --- |
| Chapter 2: Whole Numbers (Part 2) | Core lesson | `content/Singapore_Syllabus/Year4/Math/Chapter2_Whole_Number/index.html` |
| Review 1: Whole Numbers Review | Revision | `content/Singapore_Syllabus/Year4/Math/Review1/index.html` |
| Chapter 3: Whole Numbers (Part 3) | Game-style practice | `content/Singapore_Syllabus/Year4/Math/Chapter3_Pokemon_Gym/index.html` |
| Chapter 4: Data & Graphs | Campaign / data handling | `content/Singapore_Syllabus/Year4/Math/Chapter4_Data_Graphs/index.html` |
| Chapter 5: Fraction Quest | Fractions | `content/Singapore_Syllabus/Year4/Math/Chapter5_Fractions/index.html` |
| Chapter 6: Angle Quest | Angles | `content/Singapore_Syllabus/Year4/Math/Chapter6_Angles/index.html` |

## KSSR Primary English

### KSSR Primary 3 English

| Module | Type | Route |
| --- | --- | --- |
| Unit 1: Getting Smart | Unit lesson | `content/KSSR_Syllabus/Primary3/English/Unit1/index.html` |
| Unit 2: City Heroes | Unit lesson | `content/KSSR_Syllabus/Primary3/English/Unit2/index.html` |
| Unit 3: Housework | Unit lesson | `content/KSSR_Syllabus/Primary3/English/Unit3/index.html` |
| Unit 4: The Four Seasons | Unit lesson | `content/KSSR_Syllabus/Primary3/English/Unit4/index.html` |
| Unit 5: My House Adventure | Unit lesson | `content/KSSR_Syllabus/Primary3/English/Unit5/index.html` |
| Unit 6: Sunny Food Market | Redesigned unit | `content/KSSR_Syllabus/Primary3/English/Unit6/index.html` |
| Unit 7: Little Safe Town | Redesigned unit | `content/KSSR_Syllabus/Primary3/English/Unit7/index.html` |
| Unit 8: Time-Travel Town | Redesigned unit | `content/KSSR_Syllabus/Primary3/English/Unit8/index.html` |
| Unit 9: Holiday Explorer | Redesigned unit | `content/KSSR_Syllabus/Primary3/English/Unit9/index.html` |
| Unit 10: Space Observatory | Redesigned unit | `content/KSSR_Syllabus/Primary3/English/Unit10/index.html` |
| Revision 1 (Unit 1 & 2) | Revision | `content/KSSR_Syllabus/Primary3/English/Revision1/index.html` |
| Revision 2 (Unit 3 & 4) | Revision | `content/KSSR_Syllabus/Primary3/English/Revision2/index.html` |

### KSSR Primary 6 English

| Module | Type | Route |
| --- | --- | --- |
| Unit 1: Scenario Practice | Unit lesson | `content/KSSR_Syllabus/Primary6/English/Unit1/index.html` |
| Unit 2: Interactive Reading | Unit lesson | `content/KSSR_Syllabus/Primary6/English/Unit2/index.html` |
| Unit 3: Outdoor Activities | Unit lesson | `content/KSSR_Syllabus/Primary6/English/Unit3/index.html` |
| Unit 4: Interactive Worksheet | Unit lesson | `content/KSSR_Syllabus/Primary6/English/Unit4/index.html` |
| Unit 5: Interactive English | Unit lesson | `content/KSSR_Syllabus/Primary6/English/Unit5/index.html` |
| Unit 6: Interactive English Adventure | Unit lesson | `content/KSSR_Syllabus/Primary6/English/Unit6/index.html` |
| Unit 7: Sound Lab Studio | Redesigned unit | `content/KSSR_Syllabus/Primary6/English/Unit7/index.html` |
| Unit 8: Lantern Story Library | Redesigned unit | `content/KSSR_Syllabus/Primary6/English/Unit8/index.html` |
| Unit 9: The Debate Club | Redesigned unit | `content/KSSR_Syllabus/Primary6/English/Unit9/index.html` |
| Unit 10: Northlight Detective Bureau | Redesigned unit | `content/KSSR_Syllabus/Primary6/English/Unit10/index.html` |
| Revision 1 (Unit 1 & 2) | Revision | `content/KSSR_Syllabus/Primary6/English/Revision1/index.html` |
| Revision 2 (Unit 1 & 2 Grammar) | Revision | `content/KSSR_Syllabus/Primary6/English/Revision2/index.html` |

## University

| Page | Type | Route |
| --- | --- | --- |
| University Hub | Hub | `content/University/index.html` |
| Physics: Kinematics Simulator | Interactive simulator | `content/University/Physics/Kinematics_Simulator/index.html` |
| Japanese: Family | Language module | `content/University/Japanese/Family/index.html` |

## Mini Tools

| Tool | Type | Route |
| --- | --- | --- |
| Focus Games | Mini games / attention reset | `content/Mini_Games/focus_games.html` |

## PDF / Hardcopy Management

| Area | Purpose |
| --- | --- |
| `resources/pdf-catalog.json` | Auto-generated list consumed by `notes.html`. |
| `resources/pdf/` | Older direct PDF notes library. |
| `hardcopy/` | Newer printable notes, worksheets, student PDFs, teacher answers. |
| `content/**/source_pdfs/` | Source PDFs tied to specific lesson folders. |
| `content/**/Worksheet.pdf`, `Answer_Key.pdf`, `slides.pdf` | Per-module downloadable lesson resources. |

When adding or moving PDFs:

1. Put the PDF in the correct `hardcopy/`, `resources/pdf/`, or module folder.
2. Run `npm run build:pdf-catalog`.
3. Run `npm run verify:pdf-library`.
4. Commit both the PDF and the updated `resources/pdf-catalog.json`.

## Management Checklist For New Courses

Use this whenever you add a new course.

| Step | What To Check |
| --- | --- |
| 1 | Course has a stable folder under the correct syllabus / level / subject. |
| 2 | Main HTML is named `index.html`. |
| 3 | Root `index.html` has a card with clear syllabus, year/form, chapter/unit, and title. |
| 4 | Card has a stable `data-module-id` and correct `data-bundle`. |
| 5 | Module is added to `db/schema.sql` if it needs activation/progress tracking. |
| 6 | Module loads shared scripts: `auth-access.js`, `navigation.js`, `progress-tracker.js` where needed. |
| 7 | PDF resources are added to the catalogue if any are included. |
| 8 | Run `npm run verify:navigation`. |
| 9 | Run `npm run verify:pdf-library` if PDFs changed. |
| 10 | Update this summary document. |

## Current Gaps / Backlog

| Gap | Why It Matters |
| --- | --- |
| Some subject cards are placeholders | SPM Chinese, Sejarah, Physics, Biology and several UEC subjects have cards but no formal module route yet. |
| Course metadata is split | Module id, title, route, database seed, and PDF catalogue are still spread across `index.html`, `db/schema.sql`, and `resources/pdf-catalog.json`. |
| Some old routes may differ from folder index files | Example: older KOMSAS links may point to a specific HTML page inside the folder instead of the folder `index.html`. |
| Summary needs manual updates | This document is a management aid; it is not generated automatically yet. |
| Live quiz setup has external state | The Add Maths module also depends on Supabase migrations, anonymous sign-in, and `quiz_staff` permissions; the HTML files alone are not the complete deployment. |

## Recommended Next Improvement

Long term, create one canonical `resources/modules.json` and generate:

- root landing cards,
- database seed rows,
- navigation verification data,
- this course summary.

That would make the whole course catalogue much easier to keep consistent.
