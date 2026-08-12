# Protected Module Access Boundary

Status: accepted, Phase 2 launcher

## Decision

GitHub Pages remains the public portal. Locked teaching content will move behind a Supabase-backed Module Launcher. Supabase Auth identifies the account, `can_launch_module(module_id)` makes the canonical server-side decision, and protected packages will be served from private storage in a later phase.

Access is explicit:

- `public` and `demo` modules may launch without an account.
- Admin accounts may launch every active module.
- Teachers need an active teacher entitlement for the relevant module, bundle, or syllabus.
- Students need an active student entitlement granted by PIN or an administrator.
- Parent and guest accounts have no protected-module access by default.

The five modules that were previously free only because they appeared first in each syllabus are recorded as `demo`. HTML order is no longer an access rule.

## Phase 1 compatibility

`module_entitlements` becomes the auditable grant store. Existing values in `user_profiles.unlocked_modules` are copied into it and remain readable as a temporary fallback. Phase 1 does not redirect or remove existing module URLs, so current classes continue working while the new decision path is tested.

Client code may ask for a decision but may not write entitlements. New grants, revocation, expiry, teacher assignment, private module packaging, and the Module Launcher are later phases.

## Phase 2 launcher

Normal course links on the main portal and Adult English hub now pass through `launcher.html?module=<canonical-id>`. A checked-in manifest maps canonical IDs to same-origin course routes; the browser cannot supply an arbitrary redirect target. The launcher checks `can_launch_module()`, requests sign-in when needed, accepts an activation PIN for signed-in accounts, rechecks access, and then opens the registered route.

The launcher is the single UX entry point, but public-repository HTML is still directly addressable. The first genuinely protected pilot must remove that module package from GitHub Pages and serve it from private storage through a short-lived server-issued launch URL.

## Phase 3 Friendship pilot

`adult-en-friendship` is the first private package. Its student HTML, CSS, and JavaScript source are kept in the SSD-only tutoring materials area and built into one HTML template. The template is uploaded to the private `protected-course-modules` bucket, recorded in the server-only `module_packages` registry, and removed from the GitHub Pages artifact.

The authenticated `protected-module` Edge Function rechecks `can_launch_module()`, downloads the exact registered object with the service role, verifies its SHA-256 digest, injects the current session token and a per-response CSP nonce, and returns a no-store response. The launcher replaces its own document with that response while retaining the portal origin, so authenticated API calls work and the token is not placed in a query string or browser history.

Friendship student quiz actions now also require the same signed-in account and module entitlement. Existing teacher dashboard operations remain on their separate teacher-key authentication path.

## Security boundary

UI locks are presentation only. A module is not protected until its HTML and assets are absent from the public deployment and the private launcher validates a current Supabase session and entitlement before returning its content. Friendship now meets this boundary; the remaining modules still use public routes until migrated individually.
