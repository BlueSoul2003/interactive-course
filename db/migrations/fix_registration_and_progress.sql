-- ============================================================================
-- db/migrations/fix_registration_and_progress.sql
--
-- Fixes two database-level root causes identified in the bug report:
--
--   1. Missing SELECT policy on user_profiles
--      Without it, Supabase's upsert conflict-check cannot read existing rows
--      (RLS filters them out), causing profile writes to fail silently.
--
--   2. Missing after-insert trigger on auth.users
--      Guarantees a user_profiles row is always created even if the frontend
--      upsert races against email-confirmation (session not yet active).
--
-- Safe to re-run — all statements are idempotent.
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================================


-- ── Fix 1: Add SELECT policy on user_profiles ────────────────────────────────
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename  = 'user_profiles'
          AND policyname = 'Users can read their own profile'
    ) THEN
        CREATE POLICY "Users can read their own profile"
        ON public.user_profiles
        FOR SELECT
        USING (auth.uid() = id);

        RAISE NOTICE 'Created SELECT policy on user_profiles';
    ELSE
        RAISE NOTICE 'SELECT policy on user_profiles already exists — skipping';
    END IF;
END $$;


-- ── Fix 2: Create safety-net trigger for new user registration ───────────────
-- This function runs automatically whenever a new row is inserted into auth.users.
-- It creates the public.user_profiles row with sensible defaults, so the profile
-- always exists even if the frontend upsert fails due to a timing race.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, tier, tier_level)
    VALUES (NEW.id, NEW.email, 'member', 1)
    ON CONFLICT (id) DO NOTHING;  -- never overwrite a richer profile written by the frontend
    RETURN NEW;
END;
$$;

-- Drop and recreate trigger so the function update takes effect
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_new_user();


-- ── Verification queries (run manually after applying): ──────────────────────
--
--   -- Should include "Users can read their own profile":
--   SELECT policyname, cmd FROM pg_policies WHERE tablename = 'user_profiles';
--
--   -- Should return the trigger:
--   SELECT trigger_name FROM information_schema.triggers
--   WHERE event_object_table = 'users' AND trigger_name = 'on_auth_user_created';
--
-- ============================================================================
