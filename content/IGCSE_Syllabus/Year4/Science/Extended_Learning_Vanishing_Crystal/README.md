# The Vanishing Crystal

A flexible Science Explorers / Extended Learning investigation with a 50-question reserve for a 60-minute class. English student content, selected Chinese vocabulary, and Chinese teacher guidance. The student controls the interface and writes with a stylus; the tutor guides discussion.

## Open and teach

Visual direction: **Gummy Science Lab** — cream paper, peach accents, mint-blue experiments, lavender pressable controls and an original CSS water-drop companion. `gummy.css` supplies the visual skin without changing lesson logic or saved progress. The mascot reacts subtly to visible feedback; motion respects the existing reduced-motion setting. Desktop 1366×900 and all 17 screens at 390×844 were checked for layout and horizontal overflow.

Open `index.html` through a local HTTP preview or GitHub Pages. Direct file opening supports the lesson and drawing tools, but embedded YouTube may reject a missing HTTP origin; timestamped YouTube links remain available.

- 17 screens: prediction, material comparison, four vocabulary reveals, transfer question, drawing, video, particle model, misconceptions, optional fair test, filtering, recovery task, evaporation, three independent exit questions and reflection.
- For a quick learner, allow roughly 25–35 minutes for the core investigation, 20–30 minutes for the final-page challenge and 5 minutes for reflection. Adjust to the explanations the student gives; 50 questions are a reserve, not a requirement to finish in one hour. The fair-test screen remains optional.
- **Last page / Your discoveries:** choose **10 / 20 / 30 / 40 / 50** questions before starting. The bank contains 20 Apply, 20 Investigate and 10 Stretch questions, each with four options and one best answer. Every ten-question share includes 4 / 4 / 2 from those levels. Questions are sampled without replacement within a round and presented by level; a new round can repeat questions from earlier rounds.
- Check an answer to reveal its explanation. Submissions lock to preserve first attempts. Skip and return, end early, review submitted answers, or continue unanswered questions. Scores show correct / submitted separately from submitted / selected; unsubmitted choices are not graded. The round, question order and position survive reload. Replacing a round asks for confirmation and leaves lesson work intact; export first if you need the old round.
- During an active challenge, the writing board saves notes by question. Arrow keys move between questions when focus is outside a control; teacher view also shows the current challenge answer. Lesson reflection and exit results remain available in the expandable section below the challenge.
- **Ctrl + Alt + T** opens teacher guidance and manual written-answer criteria. This is a convenience, not an access boundary: answers are included in the static files.
- **Writing board** saves a separate drawing and typed note on each screen. Pen, eraser, undo, clear with confirmation and PNG download are supported.
- Answers, initial attempts, corrected results, text, drawing strokes and teacher review ticks are saved locally under `science-explorers-vanishing-crystal-v1`. No student names, account services or cloud sync are used. Export the lesson record as JSON from the final page or teacher view. The JSON is an archive, not an importable backup.
- Exit results distinguish first attempts from corrected answers. Written work is reviewed by the tutor; visiting a screen does not count as mastery.

## Curriculum and model boundaries

Cambridge Primary Science **0097, Stage 5** is the curriculum basis, presented as an extension from the existing Year 4 course rather than a new student-facing year label. Main objectives: **5Cm.01, 5Cc.01–03**, with a small connection to **5ESp.02**; the optional test-design activity supports **5TWSp.04**. This is one bridge lesson, not complete Stage 5 coverage.

Teaching diagrams and all 50 challenge questions are original. Salt markers represent particles from the salt, not salt molecules or a literal depiction of hydration. Colours, number of symbols and elapsed time are illustrative. Ordinary filter paper is specified: the lesson does not claim that every separation membrane passes dissolved salt. Evaporation does not require boiling. Practical work is optional; the lesson does not require children to operate heating equipment.

The challenge includes application, conservation of mass, fair tests and data interpretation. Stretch questions introduce solubility limits using explicitly fictional data, crystallisation, distillation, mass percentage, ratios, diffusion and dynamic equilibrium. These are optional extensions, **not a claim that all these topics are Stage 5 requirements**. Unfamiliar concepts are introduced in the question or explanation and should be discussed with the tutor.

References:

- [Cambridge Primary Science overview](https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-primary/curriculum/science/).
- [Stage 5 framework extract, school-hosted copy](https://www.pea.ae/linkfiles/Science_Primary_Framework/Stage5.pdf).
- [University of Hawaiʻi: Reappearing Salt](https://manoa.hawaii.edu/sealearning/grade-5/physical-science/matter-sea/activity-reappearing-salt).

## Answer sounds and streak feedback

Correct and incorrect submissions each cycle through four original Web Audio tone patterns. The music-note button toggles sound and remembers mute locally. Diagnostic predictions, empty submissions and simply reviewing an answer do not play. A fresh run counts consecutive first submissions: from two correct answers, green light fades at both viewport edges; from two incorrect answers, red light does the same, with a supportive text prompt. Corrections can sound but do not increase the streak. A different result resets the streak; a new challenge round, full lesson reset or page reload starts a fresh run. Overlays do not intercept input. Reduced motion uses text only. Sounds require browser audio support and an unmuted device; no audio files or network requests are needed.

Checked all eight distinct note patterns, streak threshold/reset, retry exclusion, mute and reduced-motion behavior with isolated logic tests. Browser checks confirmed a running audio context, two correct / two incorrect submissions, corresponding effect IDs and result states, and the mute control. Physical speaker output was not independently recorded.

## Continuous teaching animation

The original diagrams are enhanced by a local SVG animation layer (`motion.js`), using a single native animation-frame loop for the active scene. The particle model retains all eight salt markers while their positions interpolate; stirring, settling sand, filtration, melting and evaporation run as continuous teaching sequences. Water is clipped to its container. These remain qualitative models, not measured fluid simulations or 3D renders. Static SVG illustrations remain in the lesson source as a fallback if the enhancement is unavailable.

Pause/resume and replay controls are provided. Repeated Stir / Run filter actions replay the model. Rapid step changes retarget from the current state; changing screens disposes the old loop and observer. Offscreen and hidden-tab motion pauses. Opening the writing board pauses the current model. The system reduced-motion preference and an explicit Less motion checkbox show the selected state without continuous motion. Answer selections use short colour transitions; revealed feedback, vocabulary and challenge headings use short native Web Animations transitions, suppressed for reduced motion. No Next.js migration, 3D textures, external animation libraries or CDN requests were introduced.

Checked in the in-app browser at desktop 1366×900 and narrow 390×844: intermediate and final particle positions, eight-marker conservation, pause stability, rapid step changes, reduced-motion control, filtration and evaporation end states, feedback, and all 17 screens for horizontal overflow, duplicate model mounts and invalid geometry. The original YouTube integration is unchanged. OS preference emulation was not available; the same reduced-motion path was exercised with the visible checkbox.

## Video integration

Original upload: [How Water Dissolves Salt — Canadian Museum of Nature](https://www.youtube.com/watch?v=xdedxfhcpWo), duration approximately 1:35.

| Classroom clip | Range | Observation prompt |
| --- | --- | --- |
| Leaving the crystal | 00:44–01:00 | Follow a particle away from the crystal. |
| Spreading through water | 01:00–01:20 | Identify the particles still present among the water. |

The original upload and sampled timestamps were visually reviewed on 2026-09-18. No captions are available. Use tutor narration and focus on distribution; ionic charges are not a learning target. No remote media is downloaded, republished or stored in this module.

The player is loaded on request from `youtube-nocookie.com`. Both URL `start`/`end` and IFrame API `startSeconds`/`endSeconds` select the clip; an additional playback-time check pauses at the boundary. A new player identity is used for each clip to avoid stale callbacks. Navigating away destroys the player. Origin comes from `location.origin`; referrer policy preserves the HTTP origin required by YouTube. Every clip also has a timestamped watch link; that external link cannot automatically stop at the end time, so the UI explicitly instructs manual pausing. YouTube outages, geographic restrictions, consent requirements, ad blockers and future embedding changes cannot be guaranteed away; the next screen is a complete local model fallback.

Implementation references: [YouTube player parameters](https://developers.google.com/youtube/player_parameters), [IFrame API](https://developers.google.com/youtube/iframe_api_reference).

## GitHub Pages integration

The module is integrated into the existing publication branch. Keep all eight runtime files together (`index.html`, `style.css`, `gummy.css`, `lesson.js`, `challenge.js`, `motion.js`, `feedback.js`, `app.js`). No build step or new dependency is needed.

- Portal location: **IGCSE → Science → Year 4 → Extended learning**.
- Card and launcher title: **The Vanishing Crystal**; tag: **Extended Learning · Gummy Science Lab**.
- Canonical ID: `igcse-y4-sci-vanishing-crystal`; bundle: `igcse_y4_science`.
- Launcher: [Open the investigation](https://bluesoul2003.github.io/interactive-course/launcher.html?module=igcse-y4-sci-vanishing-crystal&from=%23%2Fsecondary%2Figcse%2Figcse-science-y4).
- Route: `content/IGCSE_Syllabus/Year4/Science/Extended_Learning_Vanishing_Crystal/index.html`.
- Return route: `#/secondary/igcse/igcse-science-y4`, retained through the shared launcher and navigation helper.
- Registry: `db/register_vanishing_crystal.sql` adds only this module, with protected launcher access matching the existing bundle. As with the neighbouring science modules, static HTML remains publicly addressable; see the project's existing MODULE_ACCESS_BOUNDARY.md for the Phase 2 boundary. No entitlements or policies are changed.
- Publication uses the latest remote main as its base, not the older local development checkout. Future publications must keep the card, manifest and database registry in agreement.
- Recheck YouTube playback on the HTTPS Pages origin after any playback changes.

## Verification — 2026-09-18

- JavaScript syntax and all 24 multiple-choice option branches checked; all 17 screen IDs unique; three exit checks and both video ranges validated.
- Real Edge playback through a local HTTP server under `/interactive-course/`: first clip paused at 59.93 seconds; second at 80.02 seconds. Replay and manual pause checked; changing lesson screens removed the player.
- Prediction, salt/sand comparison, forward/back vocabulary reveals, particle states, both filter examples, evaporation sequence and teacher rubric exercised in the browser.
- A pen stroke and typed explanation survived a page reload. Exit scoring retained 2/3 first attempts and 3/3 after correction; reflection survived reload. Reset cancellation and full reset checked; test answers cleared for classroom use.
- Desktop 1366×768 visually inspected; all 17 screens checked at phone width 390. Video overflow discovered and corrected, then rechecked. The lesson uses vertical scrolling on phones. Available browser warnings/errors came from installed extensions, not lesson source files.
- Publication checks cover card placement, title, bundle, launcher destination, return route, asset paths, registration and navigation. Production playback is checked separately after deployment.
- Challenge addition: verified 50 unique questions and four distinct options each; 500 sampled rounds across all five sizes had the requested count, 4/4/2 balance per ten questions and no within-round duplicates. Scoring, submission locks and round restoration passed logic checks. Browser checks covered all five selectors, first-answer lock and explanation, reload persistence, skipping/backtracking, early finish with 1/2 correct and 8 unattempted, review, continuing unanswered questions, per-question note persistence, and desktop/mobile layouts.
