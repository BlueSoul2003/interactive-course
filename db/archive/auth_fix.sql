-- Fixes for Student PIN Claiming & Registration Profile Issues

-- 1. Point the PIN 'used_by' reference directly to the root auth.users table 
-- instead of user_profiles, preventing constraint violations if profiles sync slowly.
ALTER TABLE public.activation_pins DROP CONSTRAINT IF EXISTS activation_pins_used_by_fkey;
ALTER TABLE public.activation_pins ADD CONSTRAINT activation_pins_used_by_fkey FOREIGN KEY (used_by) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. RLS Patch: Ensure newly registered users are actually allowed to INSERT 
-- their profile row (tier, syllabus, etc.) into user_profiles!
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can insert their own profile'
    ) THEN
        CREATE POLICY "Users can insert their own profile" ON public.user_profiles
        FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
END
$$;
