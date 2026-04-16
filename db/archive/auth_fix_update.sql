-- Allow users to update their own profiles
-- (Required for "upsert" to successfully attach demographic data if the core row was auto-created)

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can update their own profile'
    ) THEN
        CREATE POLICY "Users can update their own profile" ON public.user_profiles
        FOR UPDATE USING (auth.uid() = id);
    END IF;
END
$$;
