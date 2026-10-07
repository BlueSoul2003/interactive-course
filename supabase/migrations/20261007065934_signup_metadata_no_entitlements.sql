-- Signup metadata is demographic input, never an entitlement source.
-- Preserve existing profiles, administrator status and explicitly issued grants.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF COALESCE(NEW.is_anonymous, FALSE) THEN
        RETURN NEW;
    END IF;

    INSERT INTO public.user_profiles (
        id, email, tier, tier_level, fullname, phone, syllabus,
        age, gender, role, unlocked_modules
    )
    VALUES (
        NEW.id, NEW.email, 'member', 1,
        NEW.raw_user_meta_data->>'fullname',
        NEW.raw_user_meta_data->>'phone',
        NEW.raw_user_meta_data->>'syllabus',
        NULLIF(NEW.raw_user_meta_data->>'age', '')::INTEGER,
        NEW.raw_user_meta_data->>'gender',
        NEW.raw_user_meta_data->>'role',
        ARRAY[]::TEXT[]
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        fullname = COALESCE(public.user_profiles.fullname, EXCLUDED.fullname),
        phone = COALESCE(public.user_profiles.phone, EXCLUDED.phone),
        syllabus = COALESCE(public.user_profiles.syllabus, EXCLUDED.syllabus),
        age = COALESCE(public.user_profiles.age, EXCLUDED.age),
        gender = COALESCE(public.user_profiles.gender, EXCLUDED.gender),
        role = COALESCE(public.user_profiles.role, EXCLUDED.role);
    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
