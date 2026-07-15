# KSSR Primary English New Unit Redesign

**Date:** 2026-07-15
**Status:** Approved design
**Audience:** One-to-two physical tutoring, with one shared iPad used in rotation

## 1. Goal

Redesign only the newly published Primary 3 and Primary 6 English workbook units as nine content-specific, student-led learning experiences. A student should be able to work independently for about 30 minutes while the tutor teaches the other student, then hand the iPad over without mixing the two students' progress.

The redesign must preserve the extracted workbook content as the source of truth, replace the current batch-generated presentation, and make every target unit feel intentionally designed around its own subject matter.

## 2. Scope

### Target units

- Primary 3 English: Unit 6 through Unit 10.
- Primary 6 English: Unit 7 through Unit 10.

### Protected units

These pre-existing custom units must not change:

- Primary 3 English: Unit 1 through Unit 5.
- Primary 6 English: Unit 1 through Unit 6.

The implementation must capture hashes for every protected `index.html` before work begins and compare them again during final verification.

### Source policy

- Use the existing Primary 3 and Primary 6 `workbook.json` files as the content source.
- Do not re-audit the original PDFs as part of this redesign.
- Retain source traceability through `sourcePage`, `itemId`, and `questionType` for every transformed activity.
- Clean OCR presentation artifacts and split page-level blobs into usable prompts, passages, choices, and response areas without inventing new workbook facts or changing the intended exercise.
- When the extracted information does not support reliable automatic marking, use guided completion or teacher-review status rather than a fabricated answer.

## 3. Design Direction

### Design read

This is a set of nine interactive workbook experiences for primary pupils using a shared classroom iPad. The visual language is cute, warm, highly legible, and content-led. Each unit receives a distinct world, composition, illustration language, and reward behavior. Shared infrastructure remains visually quiet so the result does not feel batch-produced.

### Design dials

- **Design variance: 8/10.** Unit identity should be immediately recognizable, while navigation placement stays consistent.
- **Motion intensity: 4/10.** Short feedback and completion motion only; no continuous ambient animation or scroll hijacking.
- **Visual density: 4/10.** One main task at a time, with progressive disclosure for instructions and help.

### Shared visual constraints

- Light, friendly surfaces with WCAG AA text contrast.
- Rounded, large touch targets of at least 48 by 48 CSS pixels; primary actions target 56 pixels where practical.
- No generic purple AI gradients, decorative blobs, three-card template sections, excessive emoji, glassmorphism, or decorative controls that do nothing.
- Color is never the sole carrier of correctness or state.
- Motion respects `prefers-reduced-motion` and never flashes.
- Chinese help is collapsed by default; English remains visually primary.

## 4. Thirty-Minute Student Journey

Each target unit follows the same safe rhythm without sharing the same page composition.

1. **Choose student — about 20 seconds.** Two large name-and-avatar buttons load separate progress under the same admin account.
2. **Warm-up — 3 to 4 minutes.** Visual vocabulary, a short worked example, and optional tap-to-hear English.
3. **Core missions — 18 to 20 minutes.** Four to six content-specific missions transform the workbook pages into readable, interactive activities.
4. **Challenge and retrieval — 4 to 5 minutes.** A short mixed review reuses the unit's vocabulary, grammar, reading, or writing focus.
5. **Exit summary — about 2 minutes.** Completion, repeated errors, hints used, skipped work, help requests, and open responses are summarized and saved.

The active mission, current profile, sound state, and response state persist through reloads.

## 5. Nine Content-Specific Worlds

### Primary 3 Unit 6 — Food Market Adventure

- Visual world: market awnings, shopping baskets, pantry shelves, fridge zones, and street-food stalls.
- Content focus: food groups, food names, countable presentation, `some/any`, `there is/are`, street food, commas, and `and`.
- Activity language: stock the correct shelf, build a food sentence, inspect a food grid, compare street-food cards, and repair a menu sentence.
- Feedback: correct items land in a basket or shelf; the final reward completes a market picnic.

### Primary 3 Unit 7 — Safe Town Rangers

- Visual world: an illustrated town map, road signs, pool rules, clocks, and ranger badges.
- Content focus: signs and rules, directions, road safety, time and location, plural animals, `there is/are`, and chronological order.
- Activity language: follow a route, interpret a sign, sort safe and unsafe rules, rebuild a road rule, set a clock stop, and order a daily route.
- Feedback: each completed mission lights one safe stop on the town map.

### Primary 3 Unit 8 — Time-Travel Town

- Visual world: a split past-and-present town, postcard desk, location map, and time portal.
- Content focus: places, postcard comprehension, visit order, simple past, past-versus-present objects, `was/were`, and adjective opposites.
- Activity language: read a postcard, plot a family trip, compare two eras, complete a past-tense scene, and assemble a visit paragraph.
- Feedback: the town changes from past to present as the student advances.

### Primary 3 Unit 9 — Holiday Explorer

- Visual world: a travel map, suitcase, beach and winter destination cards, and itinerary trail.
- Content focus: holiday reading, activities by location, trip essentials, regular and irregular simple past, positive and negative past forms, conjunctions, and sequence.
- Activity language: select a destination clue, pack a suitcase, conjugate a travel action, repair a travel diary, and order a beach trip.
- Feedback: stamps fill a passport; the final route is shown as a completed journey.

### Primary 3 Unit 10 — Space and Animal Observatory

- Visual world: a bright observatory, solar-system track, telescope cards, and animal record panels.
- Content focus: solar-system reading, planet labels, adjective forms, comparative and superlative structures, antonyms, animal riddles, and animal comparison.
- Activity language: inspect a diary, place planets, upgrade adjectives, compare specimens, solve animal clues, and write a comparison report.
- Feedback: planets enter orbit and the observatory badge gains one star per mission.

### Primary 6 Unit 7 — Music Studio

- Visual world: instrument racks, record sleeves, a restrained mixing console, concert tickets, and lyric notes.
- Content focus: genres, instrument families, music idioms, future forms with `will` and `going to`, prefixes, passage organization, interests, and film music comprehension.
- Activity language: identify a track, sort an orchestra, tune an idiom, schedule a future performance, build a prefixed word, and analyze a music passage.
- Feedback: one studio channel activates per mission; completion produces a short non-autoplay concert sting.

### Primary 6 Unit 8 — Story Kingdom Library

- Visual world: book spines, reading nooks, character cards, story scrolls, and genre shelves.
- Content focus: pronouns and story cloze, comprehension, proverb meaning, book genres, first conditional, storytelling, email, and narration inference.
- Activity language: restore a story, question a character, shelve a genre, complete a consequence path, plan a book email, and compare narrators.
- Feedback: completed chapters restore an illustrated library mural.

### Primary 6 Unit 9 — Opinion Debate Club

- Visual world: a youth debate room, speech bubbles, evidence cards, balance scale, and writing desk.
- Content focus: fact versus opinion, language functions, supporting details, reported speech, indefinite pronouns, suffixes, argument comprehension, for-and-against reasoning, and persuasive email.
- Activity language: classify a claim, choose a response, attach evidence, report a speaker, construct both sides, and write a final position.
- Feedback: evidence tokens fill the student's case board; rewards emphasize reasoning rather than winning.

### Primary 6 Unit 10 — Junior Detective Bureau

- Visual world: case folders, clue board, evidence labels, courtroom notes, script stage, and escape-room invitation.
- Content focus: crime vocabulary, inference, event sequence, biographical reading, question tags, idioms, modals, play-script elements, and email writing.
- Activity language: decode a clue, infer from evidence, reconstruct a case, attach a question tag, distinguish idioms, inspect a school-rules scene, annotate a script, and draft an invitation.
- Feedback: clues connect into a solved case board; no violent or frightening imagery is used.

## 6. Interaction and Feedback Rules

### One-task focus

- Only one principal activity is active at a time.
- The student sees a short mission title, English instruction, optional Chinese explanation, one worked example when needed, and the response control.
- Long passages remain available in a stable reading panel while their questions advance separately.
- The interface exposes Previous, Continue, Help, Sound, and current progress in consistent positions.

### Answer progression

1. On the first incorrect attempt, show a gentle visual response and a concise observation prompt.
2. On the second incorrect attempt, reveal a bilingual hint.
3. On the third incorrect attempt, show a step-by-step scaffold and ask the student to complete the final step.
4. If the student remains stuck, record a help request and allow Skip for now.

The system never traps the student on one question and never punishes experimentation with loud sounds or loss of progress.

### Marking policy

- Objective vocabulary, grammar, choice, classification, sequence, and matching activities receive deterministic automatic marking only when the extracted task supports a reliable answer.
- Writing and open responses use word-count guidance, required-content checklists, sentence starters, and a model or review card after submission.
- Open responses are stored for the tutor; they are not labelled correct merely because text exists.
- Matching and ordering must support tap-based operation. Dragging may be an enhancement, never the only input method.

### Audio policy

- No audio autoplays.
- A speaker button uses available browser speech for English words, sentences, and short instructions.
- Success, retry, help, and completion cues are short, soft, and distinct.
- Volume begins low and mute state persists on the iPad.
- If speech or audio APIs are unavailable, equivalent text and visual feedback remain complete.

## 7. Shared-iPad Profiles and Persistence

### Profile selector

- First launch provides two default profile cards, `Student 1` and `Student 2`.
- A tutor-only long-press control allows names and avatars to be changed without creating separate Supabase accounts.
- The chosen profile is always visible during a mission.
- Switching profiles flushes pending local state before loading the other profile.

### Local-first storage

Because both pupils use the same authenticated admin account, the existing `ProgressTracker` cannot distinguish them by user ID. A small classroom profile adapter will therefore namespace all target-unit state by a stable local `profileId`.

- Profile metadata key: `kssr-classroom-profiles:v1`.
- Unit state key: `kssr-unit-progress:<moduleId>:<profileId>:v1`.
- Local state is written immediately after meaningful input and before profile switches or navigation.
- Cloud persistence uses the current per-admin, per-module `ProgressTracker` row but stores a versioned envelope:

```json
{
  "schemaVersion": 1,
  "profiles": {
    "profile-1": {
      "updatedAt": "2026-07-15T00:00:00.000Z",
      "stageId": "mission-3",
      "responses": {},
      "attempts": {},
      "hintsUsed": [],
      "helpRequests": [],
      "summary": {}
    }
  }
}
```

The adapter merges profile records by each profile's `updatedAt` value so saving one pupil does not erase the other pupil's record. The active profile selection remains local to the iPad.

### Failure handling

- If Supabase is unavailable, local work continues and a small pending-sync indicator appears.
- A later successful save merges and uploads the full profile envelope.
- If local and cloud data disagree, the newer profile record wins; records for the other profile remain untouched.
- Reload restoration must not advance a stage, replay a completion animation, or overwrite a response.

## 8. Kid-Safe Navigation

- Use `width=device-width`, a fixed initial scale, and a kid-safe interaction layer for the target pages.
- Set `touch-action: manipulation` on ordinary controls and explicitly manage touch behavior on interactive boards.
- Suppress accidental double-tap and pinch zoom within the learning app while preserving normal scrolling and text-field use.
- A visible Reset view control restores the intended layout if the browser view changes.
- Repeated taps are idempotent: checking, continuing, saving, or claiming a reward cannot run twice.
- Primary action buttons lock briefly while transitions or saves are in progress.
- Home and profile switching require confirmation; teacher settings require a long press.
- Back, Continue, and Resume current mission remain visible and use clear text labels with icons.
- The browser Back action must not discard the most recent local response.

## 9. Architecture

### Shared utilities

The nine pages may share small, focused utilities for:

- classroom profiles and local/cloud merge;
- kid-safe gestures and idempotent actions;
- soft audio and browser speech;
- mission state, attempts, hints, help requests, and exit summaries.

These utilities provide behavior, not a visual page generator. Each unit owns its structure, activity composition, illustration treatment, and reward sequence.

### Unit pages

Each target `index.html` contains or imports its own lesson configuration and custom markup. Every mission declares:

- stable mission and activity IDs;
- `sourcePage`, `itemId`, and original `questionType`;
- English instruction and optional Chinese help;
- activity-specific content and response model;
- marking mode: `objective`, `guided`, or `teacher_review`;
- hints and feedback;
- completion contribution.

Module IDs and existing navigation/progress script integration remain canonical.

### Boundaries

- Profile storage does not know workbook content.
- Mission state does not render unit-specific artwork.
- Audio feedback does not decide correctness.
- Each activity decides its marking mode and supplies semantic result data to the shared mission state.
- The exit summary consumes activity results without reaching into activity DOM internals.

## 10. Tutor Summary

At the end of a session, or through a long-press tutor control, show:

- student name and unit;
- elapsed active time and completion percentage;
- activities completed independently;
- activities with repeated errors;
- hints and scaffolds used;
- skipped activities and help requests, ordered first;
- open writing responses for quick review;
- the exact mission to resume next time.

The summary is readable in about one minute and does not introduce a separate global admin dashboard in this scope.

## 11. Verification and Acceptance

### Automated verification

- Add behavior-first tests for profile separation, local/cloud merge, profile switching, stale-data conflict resolution, retry thresholds, help requests, mute persistence, idempotent actions, and reload restoration.
- Add static checks that all nine target pages load required navigation and persistence scripts, retain canonical module IDs, and contain no placeholder or OCR-review copy.
- Verify every target workbook source section is represented exactly once in its redesigned unit and retains source metadata.
- Verify objective activities declare usable marking data and open activities declare `guided` or `teacher_review`.
- Parse every inline and shared script for JavaScript syntax errors.
- Run the existing KSSR workbook, module navigation, and relevant project verification commands.
- Compare protected-unit hashes before and after implementation.

### Browser and iPad-oriented verification

- Test portrait and landscape layouts at common iPad viewport sizes.
- Test a narrow phone viewport as a fallback, with no horizontal overflow or clipped controls.
- Complete a representative full unit using touch only.
- Exercise fast repeated taps, double taps, pinch gestures, profile switching, reload, browser Back, offline save, later sync, mute, reduced motion, and unavailable speech synthesis.
- Confirm long passages remain readable and the active task remains visible.
- Confirm no answer, option, or emphasis reveals correctness before the student submits.

### Acceptance criteria

- A pupil can complete a 30-minute path without tutor navigation help.
- Two pupils can alternate on one iPad under one admin account without answer or progress crossover.
- The tutor can identify stuck work from the exit summary in about one minute.
- Each of the nine units has a visibly and interactively distinct content-led identity.
- No target page presents raw OCR blobs, dummy controls, false automatic marking, dead ends, or accidental duplicate submissions.
- Primary 3 Unit 1–5 and Primary 6 Unit 1–6 remain byte-for-byte unchanged.

## 12. Non-Goals

- Rechecking or retranscribing the source PDFs.
- Redesigning the protected existing units.
- Creating separate Supabase accounts or a new database schema for the two pupils.
- Building a new site-wide admin dashboard.
- Continuous narration, background music, microphone recording, competitive leaderboards, or reward economies.
- Replacing the portal navigation architecture or converting the project to a framework.
