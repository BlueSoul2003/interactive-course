# Database Changes

Production Supabase changes are tracked as ordered SQL files in [`supabase/migrations`](../supabase/migrations). Their numeric prefixes match the migration versions recorded by Supabase.

## Current workflow

1. Add an idempotent migration under `supabase/migrations`.
2. Test it inside a transaction and roll it back.
3. Apply it through the Supabase migration workflow.
4. Verify the live schema, RLS behavior, and Supabase advisors.

`db/schema.sql` is a historical baseline for the original account, PIN, and module registry. It contains destructive reseeding statements and does not include every current production module or later access-control migration. Do not run it wholesale against production.

`db/archive/` is historical reference only. In particular, archived registry scripts may truncate modules or remove activation PINs.

## Module access

The protected-module foundation begins with:

- `20260812085950_module_access_foundation.sql`
- `20260812090227_module_access_advisor_hardening.sql`
- `20260812090422_module_access_deny_anonymous_entitlements.sql`

The accepted boundary and phased rollout are documented in [`docs/MODULE_ACCESS_BOUNDARY.md`](../docs/MODULE_ACCESS_BOUNDARY.md).
