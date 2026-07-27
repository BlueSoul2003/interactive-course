# Inbox Organization and Tuition Module Publishing Design

**Date:** 2026-07-27  
**Status:** Approved design  
**Scope:** GregOS inbox organization and the `interactive-course` GitHub Pages site

## 1. Goal

Understand every new file in `99_Inbox`, move it to one canonical GregOS location, update the relevant local overview notes, and publish both tuition HTML files as first-class modules on the Interactive Learning Portal. The finished GitHub Pages site must expose clickable cards for both modules and public downloads for both Chemistry workbooks, including the teacher answer scheme.

## 2. Inbox Classification

| Inbox file | Canonical destination | Reason |
|---|---|---|
| `AI 聊天收尾Prompt.md` | `_Templates/AI Chat Closing Prompt.md` | Reusable vault-wide prompt rather than project-specific content |
| `AQSolotl Internship RF_Microwave Measurement Preparation.md` | `05_AQSolotl_Internship/learning-notes/RF Microwave Measurement Preparation.md` | Internship-specific spectrum analyzer, phase-noise, and equipment-selection learning note |
| `Bursa Investment Quiz 2026.md` | `06_Knowledge_Library/Business_and_Finance/Investment_and_Personal_Finance/Bursa Investment Quiz 2026.md` | Long-term investment and Malaysian market reference, not venture-specific finance |
| `Cosmos Series 32 - GREGORY HONG SHYANG ZHAO.pdf` | `01_University_Physics_Study/Learning_Portfolio/Certificates/Cosmos of Curiosity Series 32 - Quantum Engineering - 2026-07-23.pdf` | Evidence of participation in a quantum-engineering learning event |
| `Chapter5_Chemistry_Interactive_Slideshow.html` | `interactive-course-main/content/SPM_Syllabus/Form5/Chemistry/Chapter5_Consumer_and_Industrial_Chemistry/index.html` | Form 5 Chemistry interactive teaching module |
| `Form5_Chemistry_Chapter5_Student_Final.pdf` | `interactive-course-main/content/SPM_Syllabus/Form5/Chemistry/Chapter5_Consumer_and_Industrial_Chemistry/student_workbook.pdf` | Public student download paired with the Chemistry module |
| `Form5_Chemistry_Chapter5_Teacher_Final.pdf` | `interactive-course-main/content/SPM_Syllabus/Form5/Chemistry/Chapter5_Consumer_and_Industrial_Chemistry/teacher_answer_scheme.pdf` | Public teacher-answer download paired with the Chemistry module |
| `eason_science_command_centre_v4.html` | `interactive-course-main/content/IGCSE_Syllabus/Year4/Science/Science_Command_Centre/index.html` | Cambridge Primary Science Year 4 interactive practice module |

`99_Inbox/GregOS Inbox.md` remains in place as the inbox overview. After processing, no content file listed above remains in `99_Inbox`.

## 3. Portal Navigation

### SPM Chemistry

- Convert the existing placeholder Chemistry subject card on the SPM subject screen into a folder action that opens a new `spm-chemistry` layer.
- Add one Chemistry module card for Chapter 5: Consumer and Industrial Chemistry.
- The module card uses canonical ID `spm-chem-ch5-consumer-industrial` and bundle `spm_form5`.
- Place two sibling download buttons below the module card:
  - Student Workbook
  - Teacher Answer Scheme
- Register both PDFs in the global `pdfResources` menu under `SPM > Chemistry (Form 5)`.

### IGCSE Year 4 Science

- Update the Year 4 Science summary from seven to eight modules.
- Add an eighth card named `Science Command Centre 4.0` to the existing `igcse-science-y4` layer.
- The card uses canonical ID `igcse-y4-sci-command-centre` and bundle `igcse_y4_science`.

All links use clean relative paths and remain compatible with the portal's existing hash-route and PIN-lock behavior.

## 4. Module Integration

### Shared requirements

Both modules:

- retain their current teaching content, visual identity, questions, and classroom controls;
- add a visible Home/Back fallback link;
- load `navigation.js?v=1.0.0` before `progress-tracker.js`;
- load the Supabase client and `auth-access.js` in the established order;
- declare a canonical module ID, readable name, and exact module URL;
- restore saved progress only after `ProgressTracker.init()` completes;
- save on meaningful student actions without blocking the lesson if cloud persistence is unavailable.

### Chemistry progress model

Persist:

- current slide index;
- reveal state for the current slide where practical;
- completion percentage derived from the slide position.

Saving occurs after slide changes and reveal actions. Restoring progress returns to the saved slide without automatically revealing new answers or replaying completion effects.

### Science Command Centre progress model

Persist:

- selected mission;
- current question index;
- score and streak statistics;
- checked responses and revealed-letter state;
- completed question count.

Saving occurs after answer checks, text responses, navigation between questions, and mission changes. Restoring progress rebuilds the existing in-memory state before rendering the resumed question.

## 5. Supabase Registry

Update the repository registry source with:

```text
spm-chem-ch5-consumer-industrial
igcse-y4-sci-command-centre
```

The SQL file is edited only; it is not executed automatically because the archived registry script truncates and reseeds shared tables and deletes activation PINs. The final handoff will identify the exact safe manual database step needed before issuing PINs for the new modules.

## 6. Documentation Updates

Update or create the nearest overview note for every destination:

- `_Templates/Templates.md`
- `01_University_Physics_Study/Learning_Portfolio/Learning Portfolio.md`
- `01_University_Physics_Study/Learning_Portfolio/Certificates/Certificates.md`
- `05_AQSolotl_Internship/AQSolotl Internship Workspace.md`
- `05_AQSolotl_Internship/learning-notes/Internship Learning Notes.md`
- `06_Knowledge_Library/Business_and_Finance/Business and Finance.md`
- `06_Knowledge_Library/Business_and_Finance/Investment_and_Personal_Finance/Investment and Personal Finance.md`
- `03_Tutoring_Factory/Tutoring Factory.md`
- `03_Tutoring_Factory/02_Interactive_Course_Project/Interactive Course Project.md`
- `interactive-course-main/README.md`
- `99_Inbox/GregOS Inbox.md`

Each overview records what was added, where to find it, and any access distinction such as public workbook downloads.

## 7. Git and Deployment Safety

The canonical checkout is on the divergent `registration` branch and contains unrelated modified and untracked work. Implementation must preserve that work.

- Make the organized files visible in the canonical GregOS folders.
- Build and verify the deployable Git commit in an isolated worktree created from the latest `origin/main`.
- Transfer only the approved module, portal, registry, and repository-documentation changes into that worktree.
- Stage explicit paths; never stage the entire dirty checkout.
- Re-fetch immediately before publishing and require a fast-forward push to `origin/main`.
- If the remote moved, rebase the isolated commit onto the new `origin/main`, rerun verification, and then push.

This produces a GitHub Pages deployment without including unrelated local files or the divergent branch history.

## 8. Verification

Automated checks must confirm:

- both HTML files parse and all inline JavaScript is syntactically valid;
- both module folders contain `index.html`;
- portal cards point to existing module files;
- both Chemistry download links point to existing PDFs;
- both module IDs match across the landing page, module script tags, and registry source;
- required script order is correct;
- both modules implement load and save hooks;
- the existing navigation verification suite passes;
- the PDF catalog is regenerated and its verification suite passes;
- no processed content file remains in `99_Inbox`.

Browser checks must confirm:

- the SPM Chemistry subject opens and its module card is clickable;
- both Chemistry PDFs download;
- the IGCSE Year 4 Science screen shows eight modules and opens Science Command Centre;
- each module's Back control returns to the correct portal layer;
- representative progress restores after reload;
- desktop, tablet, and narrow mobile layouts have no blocking overflow or unreachable primary controls.

After pushing, verify the GitHub Pages deployment and repeat the live card/link/download checks. The user's only remaining task is the final human lesson-quality review and the database registry action needed for PIN generation.

## 9. Non-Goals

- Rewriting either lesson's curriculum or visual design.
- Hiding the teacher answer scheme; the user explicitly requested public download access.
- Reorganizing unrelated existing course modules or dirty working-tree files.
- Executing the destructive full registry SQL script automatically.
- Moving or renaming the protected `interactive-course-main` repository root.
