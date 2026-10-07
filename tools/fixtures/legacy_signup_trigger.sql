-- Regression fixture from e8d5348. Never apply to a live database.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_syllabus TEXT;
    v_unlocked_modules TEXT[];
BEGIN
    IF COALESCE(NEW.is_anonymous, FALSE) THEN
        RETURN NEW;
    END IF;

    v_syllabus := NEW.raw_user_meta_data->>'syllabus';
    IF v_syllabus IS NOT NULL AND v_syllabus <> '' THEN
        v_unlocked_modules := ARRAY[v_syllabus];
    ELSE
        v_unlocked_modules := ARRAY[]::TEXT[];
    END IF;

    INSERT INTO public.user_profiles (
        id, email, tier, tier_level, fullname, phone, syllabus,
        age, gender, role, unlocked_modules
    )
    VALUES (
        NEW.id,
        NEW.email,
        'member',
        1,
        NEW.raw_user_meta_data->>'fullname',
        NEW.raw_user_meta_data->>'phone',
        v_syllabus,
        NULLIF(NEW.raw_user_meta_data->>'age', '')::INTEGER,
        NEW.raw_user_meta_data->>'gender',
        NEW.raw_user_meta_data->>'role',
        v_unlocked_modules
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        fullname = COALESCE(public.user_profiles.fullname, EXCLUDED.fullname),
        phone = COALESCE(public.user_profiles.phone, EXCLUDED.phone),
        syllabus = COALESCE(public.user_profiles.syllabus, EXCLUDED.syllabus),
        age = COALESCE(public.user_profiles.age, EXCLUDED.age),
        gender = COALESCE(public.user_profiles.gender, EXCLUDED.gender),
        role = COALESCE(public.user_profiles.role, EXCLUDED.role),
        unlocked_modules = COALESCE(public.user_profiles.unlocked_modules, EXCLUDED.unlocked_modules);
    RETURN NEW;
END;
$$;