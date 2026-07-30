# Navigation Architecture Design

Date: 2026-07-05

## Goal

Improve navigation between the academy landing page, syllabus layers, hub pages, and individual modules so learners can move back smoothly to the exact place they came from. The design must work with the current static GitHub Pages setup, vanilla HTML/JavaScript modules, Supabase auth/access scripts, and the existing folder-based content structure.

## Current Problems

The project currently has two disconnected navigation systems:

- The root landing page uses in-page functions such as `switchSyllabus`, `showLessons`, and `showSubjects` to show and hide `.syllabus-content` and `.view-layer` sections.
- Individual module pages manually hard-code relative links such as `../../../../../index.html`.

This creates several issues:

- Browser Back/Forward does not understand the active syllabus or lesson layer.
- A module's Home/Back link usually returns to the root homepage instead of the exact subject/year list.
- Relative paths are manually counted, which is easy to break when modules move.
- University modules already need different return targets, such as a faculty hub, but that rule is handled manually per page.
- Home button styling and placement are inconsistent across modules.

## Recommended Approach

Use a central navigation layer without migrating the whole site to a single-page app.

Add a shared `js/navigation.js` that owns route parsing, route writing, module source context, and common Back/Home behavior. Keep the existing static HTML pages and module files, but make navigation state explicit and recoverable.

This gives the project a backbone for smoother navigation while avoiding a risky full rewrite.

## Route Model

Root landing page routes use hash URLs so GitHub Pages continues to serve the same static `index.html`.

Canonical route shape:

```text
/#/<level>/<syllabus>/<layer>
```

Examples:

```text
/#/secondary/spm/spm-bm
/#/secondary/igcse/igcse-science-y8
/#/primary/kssr/kssr-english-y3
```

Rules:

- `level` is `secondary` or `primary`.
- `syllabus` maps to an existing `.syllabus-content` id, such as `spm`, `uec`, `igcse`, `sg`, or `kssr`.
- `layer` maps to an existing `.view-layer` id.
- If `layer` is missing or invalid, the route falls back to `<syllabus>-subjects`.
- If the whole hash is missing or invalid, the landing page falls back to its current default view.

## Landing Page Behavior

The root `index.html` should keep the current visual structure but delegate state synchronization to `js/navigation.js`.

The navigation helper should:

- Read the initial hash route on page load.
- Activate the correct level, tab row, syllabus tab, syllabus content, and view layer.
- Update the hash route when the learner changes syllabus or opens a lesson layer.
- Listen for `hashchange` so browser Back/Forward restores the correct layer.
- Store scroll position per route in `sessionStorage`.
- Restore scroll when returning from a module to a route that was previously visited.

Existing functions can remain as compatibility wrappers:

- `switchSyllabus(event, syllabusId)` should call the navigation helper.
- `showLessons(syllabusId, lessonContainerId)` should call the navigation helper.
- `showSubjects(syllabusId)` should call the navigation helper with `<syllabus>-subjects`.

This keeps old inline `onclick` markup working while moving the actual state logic into one shared place.

## Module Entry Behavior

When the learner clicks a module card from the landing page, the link should carry its source route.

Example:

```text
content/IGCSE_Syllabus/Year8/Science/Chapter1_Respiration/index.html?from=%23/secondary/igcse/igcse-science-y8
```

The helper should enhance eligible module links at runtime:

- Target links are module cards with `data-module-id`.
- The current hash route becomes the encoded `from` query parameter.
- The current scroll position is saved before navigation.
- Existing auth/access checks should continue to run because `data-module-id` remains on the card.

If a card already has query parameters, `from` should be appended without removing existing parameters.

## Module Back/Home Behavior

Modules should use a shared navigation script instead of each page deciding its own return target.

On module load, `js/navigation.js` should:

- Read `from` from the module URL.
- If `from` is a valid root hash route, build a return URL to the root landing page with that hash.
- If `from` is missing, use a fallback target.
- Expose a small API for existing pages, such as `Navigation.getReturnUrl()` and `Navigation.goBack()`.
- Optionally auto-enhance existing links with known classes such as `.home-btn-fixed`, `.home-btn`, `.back-link`, and links whose text is Home, Exit, or Back to Home.

Fallback rules:

- K-12 modules fall back to the root `index.html`.
- University modules should prefer the closest known faculty hub when one can be inferred from metadata or path.
- If no faculty hub can be inferred, University modules fall back to `content/University/index.html`.
- The fallback must be computed by URL/path helpers, not by manually counting `../` in every module.

## University Hub Handling

University pages already have a deeper hub pattern. The design should support that without forcing K-12 rules onto it.

Recommended rules:

- University portal route: `content/University/index.html`.
- Faculty hubs can remain separate pages, such as `content/University/physics-hub.html`.
- Faculty hub module links should pass a `from` value that points back to the faculty hub.
- A University module with `from` should return to the exact hub URL.
- A University module without `from` should infer a hub from path conventions where possible, then fall back to the University portal.

This keeps faculty hubs first-class and avoids sending University learners back to the global homepage unnecessarily.

## Visual and Interaction Design

The shared module navigation control should be consistent but unobtrusive:

- Fixed position near the top-left on content pages where it does not block primary controls.
- Compact label such as `Back` when a source route exists.
- `Home` or `Academy` fallback label when the source route is missing.
- Accessible `aria-label`.
- No dependency on emoji for meaning.
- Respect print views by allowing pages to hide it with existing print utility classes.

Existing module-specific buttons can be migrated gradually. During the first implementation pass, the helper may enhance old buttons instead of replacing every button by hand.

## Compatibility

The design must preserve:

- GitHub Pages static hosting.
- Existing direct links to modules.
- Supabase auth and password recovery flows.
- `AuthAccess.applyAccessControl()` behavior on landing page cards.
- `ProgressTracker` module IDs and saved progress URLs.
- Existing inline `onclick` navigation until the markup can be cleaned later.

Direct module access must still work. A module opened without `from` should show a valid fallback Back/Home target and should not throw JavaScript errors.

## Testing Strategy

Add focused verification scripts rather than relying only on manual browser checks.

Recommended tests:

- Route parser accepts valid route hashes and rejects invalid shapes.
- Landing route resolver maps each known syllabus/layer route to existing DOM ids in `index.html`.
- Module link enhancer preserves existing href paths and appends `from`.
- Return URL builder handles:
  - K-12 module with `from`.
  - K-12 module without `from`.
  - University module with faculty hub `from`.
  - University module without `from`.
- Static scan flags new module pages that include hard-coded `../../../../../index.html` without the shared navigation script.

Manual checks after implementation:

- Open root page, navigate to `IGCSE > Science > Year 8`, enter a module, press Back, and confirm it returns to the Year 8 list.
- Use browser Back/Forward inside the root page and confirm layers restore correctly.
- Open a module directly from a fresh tab and confirm fallback navigation works.
- Test at least one University module and one K-12 module.

## Implementation Phases

Phase 1: Core route and context layer

- Add `js/navigation.js`.
- Add route parsing, route application, hash updates, and module return URL helpers.
- Wire root `index.html` to the helper while preserving existing function names.

Phase 2: Runtime link enhancement

- Enhance landing page module cards to append source context.
- Enhance module Home/Back controls where possible.
- Add fallback behavior for direct module visits.

Phase 3: Verification and cleanup

- Add verification scripts.
- Update developer documentation so new modules use the shared navigation script.
- Gradually remove duplicated hard-coded Home button CSS from modules when touching those modules for other work.

## Out of Scope

- Rewriting every module into a single app shell.
- Migrating to a front-end framework.
- Redesigning module content layouts.
- Changing Supabase auth, PIN access, or progress database schema.
- Reorganizing all existing folder paths.

## Success Criteria

The change is successful when:

- Returning from a module can restore the exact landing page layer the learner came from.
- Browser Back/Forward works for root landing page layer changes.
- Direct module links still work.
- University modules can return to faculty hubs instead of always returning to the global homepage.
- New modules no longer require manual folder-depth counting for basic Back/Home navigation.
- Verification scripts cover the central routing and return-target behavior.
