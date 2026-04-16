-- =======================================================================================
-- update_pin_rpc.sql
-- Run this ONCE in your Supabase SQL Editor.
-- This updates the PIN redemption to enforce that you must be on the CORRECT module tab.
-- =======================================================================================

DROP FUNCTION IF EXISTS redeem_activation_pin(VARCHAR);
DROP FUNCTION IF EXISTS redeem_activation_pin(VARCHAR, VARCHAR);

CREATE OR REPLACE FUNCTION redeem_activation_pin(p_pin_code VARCHAR, p_target_module VARCHAR DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id           UUID;
  v_modules_to_unlock TEXT[];
  v_current_modules   TEXT[];
  v_new_modules       TEXT[];
  v_invalid_ids       TEXT[];
  v_mod_id            TEXT;
  v_target_syllabus   TEXT;
  v_target_bundle     TEXT;
  v_matches_context   BOOLEAN;
  v_intended_titles   TEXT;
BEGIN
  -- 1. Must be authenticated
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 2. Lock PIN row and fetch module list (reject used PINs)
  SELECT modules_to_unlock INTO v_modules_to_unlock
  FROM public.activation_pins
  WHERE pin_code = p_pin_code AND is_used = FALSE
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or already used PIN';
  END IF;

  -- CONTEXT CHECK: If user clicked a specific locked module, verify the PIN applies to it
  IF p_target_module IS NOT NULL THEN
     SELECT syllabus, bundle INTO v_target_syllabus, v_target_bundle
     FROM public.modules WHERE id = p_target_module;

     v_matches_context := FALSE;
     IF '*' = ANY(v_modules_to_unlock) THEN
         v_matches_context := TRUE;
     ELSIF p_target_module = ANY(v_modules_to_unlock) THEN
         v_matches_context := TRUE;
     ELSIF v_target_bundle = ANY(v_modules_to_unlock) THEN
         v_matches_context := TRUE;
     ELSIF v_target_syllabus = ANY(v_modules_to_unlock) THEN
         v_matches_context := TRUE;
     END IF;

     -- If the PIN doesn't unlock the card they clicked, block it and give a friendly error
     IF NOT v_matches_context THEN
         -- find names of what it DOES unlock
         SELECT string_agg(title, ', ') INTO v_intended_titles
         FROM public.modules
         WHERE id = ANY(v_modules_to_unlock) OR bundle = ANY(v_modules_to_unlock) OR syllabus = ANY(v_modules_to_unlock);

         IF v_intended_titles IS NULL THEN
            v_intended_titles := array_to_string(v_modules_to_unlock, ', ');
         END IF;

         RAISE EXCEPTION 'PIN_MISMATCH: This PIN is meant for "%". Please navigate to the correct module to unlock it.', v_intended_titles;
     END IF;
  END IF;

  -- 3. Validate every module ID in the PIN against the registry
  v_invalid_ids := ARRAY[]::TEXT[];
  FOREACH v_mod_id IN ARRAY v_modules_to_unlock LOOP
    IF v_mod_id <> '*' AND NOT EXISTS (
      SELECT 1 FROM public.modules WHERE id = v_mod_id AND is_active = TRUE
    ) THEN
      v_invalid_ids := array_append(v_invalid_ids, v_mod_id);
    END IF;
  END LOOP;

  IF array_length(v_invalid_ids, 1) > 0 THEN
    RAISE EXCEPTION 'PIN contains invalid module IDs: %', array_to_string(v_invalid_ids, ', ');
  END IF;

  -- 4. Mark PIN as used
  UPDATE public.activation_pins
  SET is_used = TRUE, used_by = v_user_id, used_at = NOW()
  WHERE pin_code = p_pin_code;

  -- 5. Fetch current user's unlocked modules
  SELECT unlocked_modules INTO v_current_modules
  FROM public.user_profiles WHERE id = v_user_id;

  IF v_current_modules IS NULL THEN
    v_current_modules := '{}'::TEXT[];
  END IF;

  -- 6. Merge arrays, removing duplicates
  SELECT ARRAY(
    SELECT DISTINCT unnest(v_current_modules || v_modules_to_unlock)
  ) INTO v_new_modules;

  -- 7. Persist the updated unlocked list
  UPDATE public.user_profiles
  SET unlocked_modules = v_new_modules
  WHERE id = v_user_id;

  -- 8. Return rich JSON so the frontend knows exactly what was unlocked
  RETURN jsonb_build_object(
    'success',          TRUE,
    'newly_unlocked',   to_jsonb(v_modules_to_unlock),
    'all_unlocked',     to_jsonb(v_new_modules)
  );
END;
$$;
