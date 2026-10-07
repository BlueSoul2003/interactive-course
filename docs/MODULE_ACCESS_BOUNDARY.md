# Protected Module Access Boundary

Status: launcher/private pilot plus additive commerce backend implemented; no offers activated (2026-10-07)

## Commercial package contract — 2026-10-07

The initial product is a topic package (for example, one SPM Mathematics chapter), with a student or teacher edition and a 1, 3, 6 or 12 calendar-month term. Orders and fixed-term authorization now implement this contract. Actual chapter packaging and sales activation remain pending.

Responsibilities:

| Component | Owns | Must not decide |
|---|---|---|
| Topic/catalog | Stable topic ID and student/teacher asset mapping | User permissions or payment status |
| Offer | Topic, edition, term, active price/currency | Account role or user-supplied price |
| Order | Buyer and immutable purchased offer/price snapshot | Grant access merely because a receipt was uploaded |
| Payment confirmation | Staff-verified TNG receipt of funds, reviewer, timestamp, reconciliation reference | Treat a screenshot as settlement |
| Fulfilment | Atomic, repeat-safe order confirmation and entitlement issue | Issue a second grant on a retried confirmation |
| Entitlement | Topic, edition, starts/expires/revoked timestamps, order origin | Derive purchase rights from editable profile metadata |
| Private delivery | Recheck account and entitlement for the requested edition and resource | Include teacher solutions in student HTML or public assets |
| Progress | Account-owned work independent of current access | Discard work automatically when access expires |

A teacher purchase includes the same topic's student activities, teaching notes, solutions, editable materials and presentation resources. It does not grant site administration or student seats. Site administration remains an independently controlled staff capability.

One payment buys a fixed term, with manual renewal. First purchases and expired renewals begin at staff confirmation. Greg approved early renewal on 2026-10-07: the same topic and edition starts at its latest paid expiry, preserving remaining time. Calendar months use Malaysia time and clamp month-end dates. Editions renew independently; changing edition is not a prorated upgrade. Expiry stops paid access; progress/answers are retained for 12 months after expiry so renewal in that window resumes the work. The later retention/deletion process must be specified and tested before enabling it; this change creates no deletion job.

Implemented interfaces: `create_course_order`, `confirm_course_order`, `revoke_course_order`, and the existing `can_launch_module`. `course_orders` stores the immutable purchase snapshot and its entitlement interval together; confirmation cannot commit a payment state without its access dates. A buyer request UUID deduplicates creation. An order lock and buyer/topic/edition advisory lock serialize confirmation; unique confirmation and normalized transaction references reject reused receipts. Client input never supplies authoritative price, expiry, buyer or role. A paid order retry returns the original interval.

`orders.html` shows the caller's orders; staff administrators can reconcile the latest 100 orders using actual received amount and transaction reference. Revocation records staff/reason/time and stops that order's access, but does not transfer money, delete progress or reschedule later paid renewals. The page is not an automatic payment gateway. Account UUIDs identify buyers; customer search, pagination, cancellation, refunds and receipt upload are later operations work.

Migration `20261007072113_commerce_orders` was applied live. All four commerce tables have RLS; clients cannot write them directly. Private functions enforce identity and role; exposed wrappers are invoker functions. Mapped topics never fall back to legacy wildcard/PIN grants; unmapped courses keep existing access. Offers require active protected modules, private buckets and existing registered objects before order creation and confirmation. This checks delivery configuration, not teaching quality or absence of a separate public copy.

Validation: `npm run verify:commerce` runs the actual migration in isolated PostgreSQL (PGlite): wrong-user RLS, anonymous and non-admin denials, snapshots, duplicate requests/receipts, confirmation rollback/retry, teacher versus student access, expiry/revocation, early/expired renewal, private-object readiness and all four terms. A live rolled-back transaction passed authenticated buyer/admin creation, retries, access, renewal and revocation. Original profiles and legacy grant digests were unchanged; no test accounts, offers, mappings or orders remain. True multi-connection contention has not yet been load-tested. Browser checks cover signed-out state and local mocked reconciliation; a real-account end-to-end payment/private launch remains a pilot gate.

The security advisor reports no new commerce-function warning. The server-only topic mapping intentionally has RLS and no client policy/grants ([advisor explanation](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy)). Existing PIN, quiz ownership and Auth password protection notices remain separate work; the site is not yet certified for general commercial release.

Migration sequence:

1. Add release checks and restore broken existing courses independently of commercial data changes.
2. Greg confirmed on 2026-10-07 that existing accounts are administrators and test students, with no paying users. Preserve those accounts/data; do not treat legacy test grants as payment evidence. Validate new commercial topics using explicit order-linked grants before opening sales.
3. Build and transaction-test catalog, orders and fulfilment in an isolated database. Include duplicate confirmation, simultaneous confirmation, failed grant rollback, wrong account, expired/revoked access, teacher-vs-student assets and month-end durations.
4. Pilot one private topic package, then validate anonymous, unpaid, paid student, paid teacher, expired and admin access through direct URLs and APIs.
5. Migrate only reviewed legacy records; verify current classroom access and rollback before enforcing the new boundary more widely.

Keep the existing Supabase identity and launcher foundation. A browser-only paywall was rejected because public files remain retrievable. Giving teachers administrator accounts was rejected because purchase scope and staff authority are separate. A wholesale account rebuild was rejected because existing classes and progress must be preserved.

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
