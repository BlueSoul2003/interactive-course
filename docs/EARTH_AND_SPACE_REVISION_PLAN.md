# Year 4 Topic 7 — Earth and Space Revision

Status: implemented locally, 2026-09-05. The user approved building the complete bank directly and requested an independent hidden side-drawer writing board. Publication to GitHub was authorised on 2026-09-06.

## Basis and scope

The existing `content/IGCSE_Syllabus/Year4/Science/Topic7_Earth_and_Space/index.html` and its slides/worksheet are the teaching baseline. The original HTML has 50 mixed-format questions. The worksheet text and all 15 slide thumbnails were reviewed before authoring. The portal's Year 4 classification is retained without inferring secondary IGCSE examination depth from its folder name.

`Planet_Earth_Revision` is the functional reference: 100 MCQs, 50 cloze questions, saved progress, teacher notes and pen scratchpad. Its cloze questions each have three blanks. This unit uses 50 typed questions with one or two purposeful blanks. Questions and explanations are English, with optional Chinese vocabulary support.

Create a separate `Earth_and_Space_Revision` module alongside the existing Topic 7 lesson. Keep the original lesson available.

## Question blueprint

| Strand | MCQ | Fill in the blank |
| --- | ---: | ---: |
| Earth: shape, axis, rotation and orbit | 20 | 10 |
| Day/night, apparent Sun movement and shadows | 25 | 12 |
| Solar System: Sun, planet order, inner/outer planets | 25 | 13 |
| Moons, asteroids, comets and meteorites | 20 | 10 |
| Earth supporting life, Milky Way and model limitations | 10 | 5 |
| Total | 100 | 50 |

Final difficulty: 60 core recall, 60 application and 30 reasoning questions across both formats. There are 43 questions using a diagram, observation or small data table within the 150. Each MCQ answer position appears 25 times in a deterministic shuffled order.

Each question needs a stable ID, strand, difficulty, prompt, answer, concise explanation and relevant misconception. MCQs have four distinct options and exactly one defensible answer. Fill answers allow case/whitespace normalization and explicit acceptable variants; do not accept arbitrary fuzzy matches. Record both question completion and blank-level feedback when a question has two blanks.

Review inherited scientific wording rather than copying answers blindly: specify viewpoint for clockwise/anticlockwise rotation, specify the reference for axial tilt, and verify comet-tail and habitability explanations using authoritative astronomy sources. Do not add moon phases, eclipses or detailed seasons unless confirmed by the teaching materials.

## Visual and classroom direction

Proposed direction: a light science fieldbook with a restrained midnight-blue navigation band, warm white working area, dark ink, solar amber and Earth blue accents. Use an inviting illustrated cover, but use clear scientific SVG diagrams for questions. Keep text and scientific labels separate from decorative artwork. Label schematic size/distance where relevant.

The existing source stacks prompt, a topic illustration, answer panel and scratchpad. Redesign the question workspace around the relationship between evidence and answer:

- Desktop/tablet landscape: collapsible question navigator; diagram and prompt beside the answer area; feedback directly below the answer.
- Phone/portrait: prompt, relevant diagram, answer, feedback; question navigator becomes a drawer.
- The writing board is an independent hidden side drawer, opened from the screen edge or Ctrl+Alt+B. It expands for teaching and keeps handwriting/typed notes across question changes and reloads. Pen, eraser, colour, width, undo and confirmed clearing are provided. Resetting question progress keeps the board.
- At 1366 × 768 and 1024 × 768, ordinary short MCQs should show prompt and all options without scrolling. Long questions may scroll naturally. At 390px width, no horizontal overflow.
- Start page has one prominent Continue/Start action, five topic entries and a clear MCQ/fill selector. Keep detailed reports behind a secondary action.
- Use large readable question text, at least 44px controls, visible keyboard focus, text/icons alongside correctness colors, optional sound and reduced-motion support. No full-screen correctness flashes or forced automatic next question.

Useful interactive diagrams: rotate a globe to explore day/night; move a Sun-height control to compare shadows under a stated simplified model; inspect a labelled Solar System map. Keep exploration separate from scored attempts where it would reveal the answer. All 150 scored items remain MCQ or fill-in-the-blank.

## Learning flow and integration

Choose a topic, practise a manageable set of roughly 10 questions, review explanations and revisit mistakes. Track first-attempt correctness separately from eventual completion. Provide topic practice, mixed practice and wrong-answer review. Preserve teacher answers/notes, optional pen input, resume and an understandable progress report.

Use the current static HTML/CSS/JavaScript approach with separate question data and rendering code. Reuse suitable navigation/progress utilities, with a unique module ID and storage namespace. Verify actual portal registration and access requirements before integration. Any required database change must be additive and scoped; do not replay archived registry scripts. Existing unrelated uncommitted changes must be preserved.

## Build order and acceptance

1. Read Topic 7 PDFs, confirm learning boundaries and finalize the 150-item blueprint.
2. Build the full 100-MCQ + 50-fill bank directly, per the user's follow-up. Review real desktop/tablet/phone renders of the complete module.
3. Complete and independently check all 150 items for science, language, ambiguity, duplicates, acceptable answers and diagram consistency.
4. Complete practice modes, progress, teacher controls and portal integration.
5. Verify exact counts, unique IDs, answer validity, filtering and shuffling, first-attempt scoring, mistake review, reload/resume, module isolation and relevant existing navigation checks. Visually verify long prompts, wrong answers, fill input and expanded pen board at target sizes; check keyboard operation and reduced motion.

Delivered locally: `content/IGCSE_Syllabus/Year4/Science/Earth_and_Space_Revision/`, with separate data, grading core, visuals, application, optional SDK sync, teaching models and styles. The homepage card and schema seed row use `igcse-y4-sci-earth-space-revision`.

Verification: exact topic/type/difficulty totals; four-option validity and balanced positions; all accepted fill variants; first-attempt scoring, retries and stale-save/reset merge logic; 150 real browser submissions; drawer handwriting/undo/persistence; desktop 1366×768, tablet 1024×768 and phone 390×844; partial fill feedback, resume, reduced motion and existing navigation/Planet Earth regression checks. Cloud service calls are isolated in browser tests; live cross-device sync and live registry state are not verified by these tests.

Scientific corrections use NASA Earth and comet references linked in the module: viewpoint-dependent rotation direction, axial tilt reference, comet sublimation and reduced activity farther from the Sun, and careful wording about the evidence for life elsewhere.

Release integration (2026-09-06): based on the latest GitHub main to retain intervening course changes. Year 4 now has seven learning modules and five revision/practice modules on the same route, with responsive two-column grouping. Arclight Grid Crisis and Operation Seven are retained in the practice column. The new module is in the generated launcher manifest and its live registry row is active/protected under `igcse_y4_science`; the anonymous launch check returns authentication_required. No entitlements or existing access modes were changed.

Parity additions: optional sound and cancellable four-second correct-answer advance; teacher reset shortcut Ctrl+Alt+R; original lesson/slides/worksheet/answer-key links; exact return-route navigation; progress restoration deferred outside the auth callback to avoid lock re-entry. The 150-question flow, auto-advance/cancellation, teacher shortcut, launcher manifest, launch/return route, grouping, navigation and existing Year 4 regression checks are verified. Browser account decisions are mocked; no student account was used for cross-device testing.

Publish through the existing main-branch GitHub Pages setup. Printable worksheets and live multiplayer remain outside scope.
