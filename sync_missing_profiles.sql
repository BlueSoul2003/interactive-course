-- sync_missing_profiles.sql
-- Run this in your Supabase SQL Editor!

-- This script finds any test accounts in Supabase Auth that failed 
-- to successfully create a profile during the earlier bug, 
-- and manually injects them into user_profiles so they work perfectly!

INSERT INTO public.user_profiles (id, email, tier, tier_level, unlocked_modules)
SELECT id, email, 'member', 1, '{}'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.user_profiles);
