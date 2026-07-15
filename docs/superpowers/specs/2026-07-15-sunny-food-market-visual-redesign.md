# Sunny Food Market Visual Redesign Specification

**Date:** 2026-07-15
**Scope:** KSSR Primary 3 English, Unit 6 only
**Approved direction:** Emoji-first, cute and simple, with the settings controls collapsed by default

## Goal

Make Sunny Food Market easier for a Primary 3 learner to use independently on a shared iPad during a 30-minute one-to-two tutoring lesson. Add useful visual cues and retain the existing sound feedback, without allowing an emoji or illustration to reveal the correct answer.

## Visual evidence policy

Every visual must have exactly one of these roles:

1. **Question source:** information the learner is meant to observe, such as one apple to classify or three bowls to count.
2. **Neutral support:** navigation or task-type orientation, such as Settings, Listen, Read, or a question mark. It must not distinguish the correct answer.
3. **After-answer reinforcement:** the matching food emoji may appear only after a correct response has been checked.

The following are prohibited:

- Repeating the target emoji beside the correct answer choice.
- Giving only the correct answer a visual cue.
- Showing a food image before an audio-only or clue-only answer when that image identifies the answer.
- Displaying the completed spelling words or a completed word in the response placeholder.
- Using decorative food emoji in a question when they prime its correct answer without being part of the question source.

All `data-choice` buttons in this unit remain text-only. Informative visuals use `role="img"` and an explicit `aria-label`; decorative visuals use `aria-hidden="true"`.

## Activity treatment

| Activity | Visual treatment | Leakage protection |
| --- | --- | --- |
| Food groups | Show one apple in the prompt. | Category choices remain text-only. |
| Spelling path | Show rice, bread, and chicken as three picture targets with blank letter counts. | Remove `R I C E`, `B R E A D`, `C H I C K E N` and the `rice, ...` placeholder. Audio may pronounce the target words but does not spell them. |
| Grammar choice | Show several oranges in one basket as the sentence stimulus. | Grammar choices remain text-only. |
| Protein group | Use the written dish names as the evidence. | Do not add food emoji to the choices. |
| Reading response | Use a neutral reading symbol only. | Do not illustrate Mina's ordered foods before the learner answers. |
| Count the bowls | Show exactly three bowl symbols as the required counting stimulus. | Answer choices remain text-only. |
| Street food clue | Use a neutral clue/listen symbol before checking. | Do not show satay or a skewer before the learner answers; reveal it only after success. |
| Punctuation rewrite | Use a neutral receipt/writing symbol only. | Do not add food pictures that reproduce the shopping list. |

## Settings behavior

The sticky lesson bar keeps only these items visible:

- Home
- Active shopper
- Unit progress and save status
- A labelled `Settings / 设置` disclosure button

Sound, Previous, Switch student, Reset view, and Teacher hold stay inside a native collapsed disclosure panel. The panel is closed on first load, can be opened with touch or keyboard, has at least 48-pixel targets on iPad, and never obscures the current question at common tablet widths.

## Feedback and focus

- Preserve the runtime's distinct success, retry, help, and completion sounds.
- Give success feedback a brief visual pop and reveal an activity-appropriate emoji only after `data-type="success"` exists.
- Respect `prefers-reduced-motion`.
- Keep answer buttons high contrast, large, and free from unnecessary decoration.
- Preserve the existing viewport lock and reset-view behavior to reduce accidental zoom problems.

## Acceptance criteria

- The settings panel is collapsed in the HTML by default and contains all five secondary controls.
- No answer choice in Unit 6 contains an emoji.
- Spelling answers are not printed before response submission.
- The apple, oranges, and three bowls are marked as question-source visuals.
- Satay is absent from the street-food prompt as an emoji and appears only as post-success reinforcement.
- Existing KSSR redesign, protected-unit, authentication, and classroom-core checks remain green.
- The page is manually checked at tablet and phone widths for overflow, touch targets, and settings-panel behavior.
