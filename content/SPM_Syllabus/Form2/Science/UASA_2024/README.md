# UASA Sains Tingkatan 2 — classroom presentation

## Approved English / Simplified Chinese classroom — 2026-10-10

The current portal card opens [the approved English / Simplified Chinese classroom](english_chinese.html) under the existing `spm-sci-f2-uasa-2024` module and `spm_form2` bundle. The earlier [Malay presentation](index.html) remains available at its existing URL. No registry, account, grant or paid-topic settings change.

This self-contained teaching page covers the same 31 main questions in 59 screens with 130 reveals. It adds Chinese question guidance and choice labels, English model answers, local responses/notes, understanding/review markers and note export. Space reveals one segment; the separate Next control / right arrow advances. Answers hide on navigation and reload. The embedded original 30-page public school PDF and 11-page school scheme open from Sources. Public source annotations are hidden in the classroom images, retained in the embedded original.

The new version repairs the old A20 crop's missing B/D options and preserves extra printed mark labels. All 30 PDF pages match the earlier source in extracted text and pixel rendering with annotations disabled. School-scheme errors are distinguished from scientific model answers, including B3's ambiguous force pictures, B4(d) chemotherapy, C1(c) fixed variables, C4(d) formula labels, C5(b) kJ units and C6(b)(i) pH. A4 and A14 are excluded from automatic choice grading. The student's physical print copy has not been inspected.

Verified locally in Edge: all 59 screens / 130 reveals, images, choice feedback, conditional questions, notes after reload, hidden answers, original PDF opening and 320px no horizontal overflow. Portal integration keeps the existing public Pages delivery and protected launcher; this is a teacher classroom, with local browser notes, not an account-owned assessment or a new paid product. Next: use the portal card, try A1 and C5(b), and compare the student's print copy to the embedded PDF.

Open [the classroom](index.html), or use the portal: Secondary → SPM → Science → **UASA Sains: Bilik Darjah**. It also works by opening `index.html` directly in Edge or Chrome. All lesson assets are local.

The 31 original main questions (A: 20, B: 5, C: 6) are arranged as 59 teaching screens with 130 incremental answer steps. Questions use the original pixel crops from the supplied [30-page exam](source.pdf); wording, translations, diagrams and printed errors are retained. Display-only strips remove blank margins and dotted answer-writing space, without changing the original images or PDF. Long C questions are divided by their existing subquestion labels, with original context repeated. The suggested answers are independently prepared explanations, **not an official marking scheme**.

Visual direction for this classroom: a neutral graphite interface, original white question papers, high-contrast answer text and restrained amber action cues. This choice is local to this module, rather than a default style for other courses.

All 130 answer steps retain their Malay answer and offer Traditional Chinese / English supplementary explanations. Chinese is the default; explanation language and visibility can be changed independently of answer reveal progress. Diagram labels follow the selected explanation language.

## Teaching controls

- **Space:** reveal one answer segment. After the last segment, press again to move to the next question with answers hidden.
- **← / →:** previous / next question. **Backspace:** retract one step. **H:** hide this question's answers.
- **中文 / English / 雙語:** choose Chinese, English or both explanations above the answer pane. **L:** cycle these languages. **顯示解釋 / 隱藏解釋**, or **E:** show / hide the supplementary text and explanatory diagrams, keeping already-revealed Malay answers. Switching language while explanations are hidden keeps them hidden.
- **F:** fullscreen. **+ / −:** question zoom, from 75% to 175%.
- **Auto muat:** fit ordinary questions to the available desktop height. Each new question starts in this mode. Long diagram/table questions keep readable size and scroll; manual zoom overrides fitting until the next question or another click on Auto muat.
- **Pilih soalan:** jump directly to any question; teacher notes expand separately.
- Position, completed-screen indicators, explanation language and explanation visibility are saved locally. Reloading or switching questions hides answers while retaining explanation preferences. No learner scores or cloud progress are written by this teacher presentation.

## Source limitations to explain before marking

- A1, A3 and A4 reference diagrams absent from the PDF. A1 and A3 remain answerable from the text/options. **A4 has no definitive answer** without organism X; B is only conditional on X being a decomposer.
- **A14:** the printed switch is open, so the drawn circuit gives **0 A**, absent from the options. Option **C, 4 A**, is correct only after assuming the switch is closed.
- **B3:** the first two activity pictures do not uniquely specify one force. Elastic force for the ball and friction for cutting are presented as the expected matching under explicit assumptions, pending the official scheme.
- **B4(a):** Malay *Panau* and English *Smallpox* are different conditions. The Malay statement is false; the English version can be true. Pityriasis versicolor does not spread between people. Notes explicitly distinguish the two.
- C1 varies coil turns according to the Malay text and results table, despite its English introduction mentioning current. Steel is a possible replacement core but retains magnetisation; soft iron is better for rapid switching.
- C3(a) jumps from (i) to (iii); that printed label is retained. The food chain and number pyramid are a plausible example, not numerical population data inferred from the drawing.
- **C5(b): 5030 kJ** is the original breakfast plus the additional food; additional food alone is 2970 kJ. The printed `150g kJ` is treated as **150 g per plate**. Use the supplied table values.
- C6(a) has an introductory statement with blank space/marks but no separate question instruction. No missing question is invented. C6(a)(iii)'s blanket claim about Malaysian desalination is not treated as a verified current fact.
- C6(c)'s bottle filter removes some suspended particles; it does not demonstrate safe drinking water or removal of dissolved substances / all microbes.

## Evidence used for sensitive or ambiguous points

- [NHS: pityriasis versicolor](https://www.nhs.uk/conditions/pityriasis-versicolor/) and [CDC: smallpox transmission](https://www.cdc.gov/smallpox/causes/index.html): B4(a)'s conflicting translations.
- [NCI: chemotherapy](https://www.cancer.gov/about-cancer/treatment/types/chemotherapy): B4(d), effects on rapidly dividing healthy cells.
- [CDC: Zika](https://www.cdc.gov/ZIKA/): B4(b), mosquito transmission.
- [NASA: cosmic distances](https://science.nasa.gov/universe/cosmic-distances/): A20, AU / light-year conversion.
- [OpenStax: ferromagnets and electromagnets](https://openstax.org/books/college-physics-2e/pages/22-2-ferromagnets-and-electromagnets): C1, magnetic core properties.
- [PUB: water treatment](https://www.pub.gov.sg/Public/WaterLoop/Water-Treatment): C6(b), coagulation and pH adjustment; [PUB: desalination](https://www.pub.gov.sg/Public/WaterLoop/OurWaterStory/DesalinatedWater): energy requirements.
- [WHO: household water treatment evaluation](https://www.who.int/publications/i/item/9789241548229): C6(c), removal of pathogens requires evaluated treatment performance.

## Integration and continuation

Module ID: `spm-sci-f2-uasa-2024`; existing bundle: `spm_form2`. The portal card, canonical module manifest and `db/schema.sql` seed contain this ID. Publication uses `db/register_form2_science_uasa.sql` to add only this active, protected module to the existing Form 2 bundle; existing entitlements and access rules are retained. Do not run the entire schema file to add a module. HTML delivery follows the existing public GitHub Pages hosting boundary; the portal launcher uses the existing protected access check. The main-branch Pages workflow publishes the classroom with the rest of the site. The live registry was checked on 2026-10-03: this module is active and protected in `spm_form2`; an anonymous launch correctly requires authentication. No existing entitlements or security policies were changed.

Editable sources: `index.html` (interface), `classroom.css` (visual design), `classroom.js` (controls), `data.js` (Malay answers, Chinese / English explanations, notes, crop coordinates and source SHA-256), `assets/` (question crops). Preserve `source.pdf` as the original. `question-layout.js` is display-only strip metadata; regenerate it with `python tools/build_form2_science_layout.py` from the project root (requires pdfplumber and Pillow). The generator checks that every alphanumeric source text line is retained and protects whole figures and tables.

Status 2026-10-03: local classroom and integration complete. Google Antigravity `ui-designer` completed the initial bounded CSS pass, the requested compact-layout iteration and the requested graphite visual revision, followed by Codex integration and visual review. Verified in Edge after the graphite revision: all 59 screens and 130 keyboard reveals, undo/hide, click-to-keyboard operation, question picker, reload with hidden answers, course return, teacher notes, manual zoom / automatic fitting, direct offline opening, and 1440/1366/768/390/320-width layouts. Checked key interface text contrast: all sampled labels, bilingual answers, primary action and teacher-note toggle exceed 4.5:1. At 1366×768 all 20 objective questions and 47 of 59 teaching screens fit without question scrolling; at 1440×900, 54 of 59 fit. Longer reference-heavy questions retain scrolling instead of excessive shrinking. All 85 original image crops still match the PDF renders pixel-for-pixel and the preserved source PDF matches the supplied file's SHA-256. No page errors or missing assets were observed. Mobile reveal scrolling was also checked to keep the new answer above the fixed dock.

Verification: `npm run verify:form2-science-uasa` (requires Playwright and Edge; set `PLAYWRIGHT_MODULE` to an installed Playwright package if it is not local). Existing navigation verification also passes. Live PIN redemption is outside this classroom verification; publication verification covers the module registration, anonymous launcher decision and GitHub Pages deployment separately.

Language addition verified 2026-10-03: all 130 Chinese and English explanations, Chinese / English / both display modes, hide / show without hiding Malay answers or advancing reveal progress, E / L shortcuts, translated pyramid and filter labels, preference persistence across questions and reload, responsive controls down to 320 px, and direct offline use. Original bank fields are unchanged apart from added `zh` explanation fields; all numeric values match the English versions. The 20 objective questions still fit at 1366×768.

Classroom URL: https://bluesoul2003.github.io/interactive-course/content/SPM_Syllabus/Form2/Science/UASA_2024/index.html

Next practical step: open the classroom in Edge (Ctrl+F5 if already open), try A1 and C5(b), use Space to reveal steps, then compare 中文 / English / 雙語 and E to check the pacing on the classroom projector. The source ambiguities above remain unresolved until the missing diagram / official scheme is supplied; use the conditional explanations instead of assigning those questions a definitive mark.


## English / Simplified Chinese papers and teacher editing — 2026-10-10

The portal's Tingkatan 2 section has two separate cards: `english_chinese.html` (paper 1, 59 screens / 130 steps) and `../UASA_Pelangi/english_chinese.html` (paper 2, 60 screens / 136 steps). Paper 2 is the publisher's complete [Pelangi UASA Model Paper](https://plus.pelangibooks.com/Resources/Ranger/Science/UASAMPForm2%26Ans.pdf): 16 question pages and 2 answer pages; no exam year is printed. Exact question crops and the unchanged PDF are embedded. Original answer ambiguities and scientific corrections are identified in teacher notes. Matching the PDF does not establish a match to an unseen student hardcopy.

Both English/Chinese presentations expose **老师编辑** beside each revealed B/C answer step. English and Chinese can be shortened independently; English cannot be empty. Cancel/Escape discards unsaved typing. **查看原答案** keeps the original available and **恢复原答案** removes that step's override. Edits are separate localStorage records per paper, survive navigation/reload/student-progress reset, and are included in the JSON notes export. They are local display preferences, not a server role or shared-bank editing feature. The original bank, graphics, question ordering and existing student record keys are unchanged. Offline copies and website copies have separate browser origins and therefore separate saved versions.

Paper 2 registry: `db/register_form2_science_pelangi.sql`, active/protected in existing `spm_form2`. Launcher: `launcher.html?module=spm-sci-f2-uasa-pelangi`. Paper 1 keeps its existing launcher. Public Pages hosting and existing authentication boundaries are unchanged. Verification: `npm run verify:form2-teacher-answers`; deployment status is recorded in the root README.
