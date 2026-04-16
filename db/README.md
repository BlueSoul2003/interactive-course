# Database Migrations

This folder contains all Supabase SQL for the interactive-course platform.

## 📄 `schema.sql` — The Only File You Need

`schema.sql` is the **single source of truth**.  
Run it once (or re-run it safely) in your Supabase SQL Editor to set up or refresh the entire database.

### What it does
| Section | Description |
|---------|-------------|
| 1 | Patches `user_profiles` — adds `unlocked_modules`, INSERT & UPDATE RLS |
| 2 | Creates `activation_pins` table with correct FK to `auth.users` |
| 3 | Creates `modules` registry table |
| 4 | Sets all RLS policies (idempotent DROP + recreate) |
| 5 | Creates `redeem_activation_pin(pin, target?)` v3 RPC — context-aware, JSONB response |
| 6 | Seeds all 40 modules (TRUNCATE + INSERT) |

### How to run
1. Open the **Supabase Dashboard → SQL Editor**
2. Paste the contents of `schema.sql`
3. Click **Run**
4. Verify with the queries at the bottom of the file

---

## 🗄️ `archive/` — Old Migration Files (Historical Reference)

These files are **no longer needed** — everything they did is merged into `schema.sql`.
They are kept here for audit/reference only.

| File | What it was |
|------|-------------|
| `setup_rbac.sql` | Initial RBAC setup (v1 — superseded) |
| `admin_rls.sql` | Admin PIN INSERT/SELECT policies (superseded) |
| `apply_rbac_migrations.sql` | Unified admin PIN policy (superseded) |
| `auth_fix.sql` | FK fix + user profile INSERT RLS (superseded) |
| `auth_fix_update.sql` | User profile UPDATE RLS (superseded) |
| `update_pin_rpc.sql` | PIN RPC v2 with context check (superseded) |
| `modules_registry.sql` | Old canonical registry — replaced by schema.sql |
| `fix_module_id.sql` | One-off data fix (already applied, disposable) |
| `sync_missing_profiles.sql` | One-off orphan profile repair (already applied, disposable) |
