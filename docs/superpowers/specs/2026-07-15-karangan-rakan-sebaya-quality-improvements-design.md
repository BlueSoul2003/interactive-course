# Karangan Rakan Sebaya Quality Improvements Design

## Goal

Improve the existing `Karangan_Rakan_Sebaya` lesson so touch navigation is intentional, the latest learner position is persisted reliably, the carousel exposes correct accessibility state, regressions are covered by executable tests, and the module-registration documentation uses the repository's current database source of truth.

## Scope

The implementation will modify only the published lesson page, a focused Node verification script, package verification wiring, and module-registration documentation. Existing user-created files, including `content/SPM_Syllabus/Form5/BM/Karangan_Rakan_Sebaya/slides.html`, are out of scope and must remain untouched.

The carousel will remain implemented inside the lesson HTML. Extracting a shared site-wide carousel component is intentionally deferred because only one module currently needs this behavior and a shared refactor would increase regression risk.

## Carousel State and Persistence

The lesson will keep `currentSlide` as a zero-based internal index and persist `step` as a one-based value.

`updateSlider` will accept an explicit persistence option. It will always render the current position, update navigation-button state, and synchronize accessibility attributes. It will persist only when invoked by an intentional learner navigation action.

Initial rendering and restored-progress rendering will not save. This prevents the default first slide from overwriting stored progress before authentication and progress restoration complete. `nextSlide` and `prevSlide` will request an immediate `ProgressTracker.save({ step, score: 0 })`; slide changes are infrequent enough that debouncing is unnecessary and would risk losing the last position during rapid exit.

Persistence remains a guarded enhancement: when `ProgressTracker` is unavailable, slide navigation continues without throwing.

## Touch Navigation

Touch handling will record both X and Y coordinates at touch start and touch end. A gesture will change slides only when its absolute horizontal displacement is greater than its absolute vertical displacement and exceeds a 50-pixel threshold.

The listeners will be passive because they do not call `preventDefault`. Vertical or diagonal scrolling inside a long slide will therefore retain native scrolling behavior without triggering a slide change.

## Accessibility

The slider container will be identified as a labelled carousel region. The slide indicator will use `aria-live="polite"` so changes are announced without interrupting the learner.

Every call to `updateSlider` will mark the active slide with `aria-hidden="false"` and remove its inert state. All inactive slides will use `aria-hidden="true"` and be inert. This keeps off-screen lesson content out of the accessibility and focus navigation paths while preserving the existing visual transform animation.

Previous and next controls remain native buttons, including their existing disabled states.

## Regression Verification

A focused Node verification script will read the real lesson HTML, extract its inline JavaScript, and parse it with Acorn. It will then execute that script in a `vm` context backed by a small fake DOM and fake window.

The verifier will prove these behaviors:

- the inline JavaScript is syntactically valid;
- initial rendering does not persist progress;
- a user-triggered next or previous action persists immediately with a one-based step;
- a predominantly vertical gesture does not change slides;
- a predominantly horizontal gesture changes exactly one slide;
- the active slide is exposed while inactive slides are `aria-hidden` and inert;
- the indicator is an `aria-live` status surface;
- local script and navigation references remain present.

The new verifier will be exposed through an npm script and included in the normal navigation verification chain so the earlier duplicated-JavaScript syntax regression cannot bypass routine checks again.

## Database Documentation Consistency

`db/schema.sql` remains the single source of truth for module registry seed data. The new-module guide will instruct maintainers to update and run `db/schema.sql`, matching `db/README.md`.

The historical `db/archive/modules_registry.sql` will not be presented as an active deployment mechanism. The recently added Karangan Rakan Sebaya row will be removed from that archived snapshot so it remains historical rather than appearing to be a second maintained registry.

This work will not connect to or mutate the live Supabase project. Applying the updated schema to production remains an explicit deployment operation for an authorized maintainer.

## Error Handling and Compatibility

The current static-site architecture, Tailwind CDN usage, shared navigation script, Supabase SDK order, canonical module ID, module URL, and saved-progress format will remain unchanged.

Failed progress writes continue to be handled by `ProgressTracker.save`, which logs Supabase errors without blocking navigation. Invalid restored steps will continue to be clamped to the available slide range.

## Acceptance Criteria

1. Vertical touch scrolling cannot navigate between slides.
2. Horizontal swipes over 50 pixels navigate by one slide.
3. Initial and restored rendering do not write progress.
4. Button, keyboard, and swipe navigation persist the new one-based step immediately.
5. Only the active slide is exposed to assistive technology and focus navigation.
6. The focused verifier fails against the current implementation and passes after the improvements.
7. Existing navigation, workbook, authentication, Pages, and PDF-library verifications still pass.
8. The new-module guide and database README agree that `db/schema.sql` is the active registry source.
9. No unrelated tracked or untracked files are modified.
