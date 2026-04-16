-- =======================================================================================
-- setup_rbac.sql
-- Run this in your Supabase SQL Editor to set up the RBAC & PIN Logic
-- =======================================================================================

-- 1. Add unlocked_modules to existing user_profiles table (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema='public' AND table_name='user_profiles' AND column_name='unlocked_modules') THEN
        ALTER TABLE public.user_profiles ADD COLUMN unlocked_modules TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- 2. Activation PINs Table
CREATE TABLE IF NOT EXISTS public.activation_pins (
  pin_code VARCHAR(50) PRIMARY KEY,
  modules_to_unlock TEXT[] NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_by UUID REFERENCES public.user_profiles(id) NULL,
  used_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.activation_pins ENABLE ROW LEVEL SECURITY;

-- 2b. Make sure Admins can create and view PINs
CREATE POLICY "Admins can insert PINs" ON public.activation_pins
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND tier = 'admin'
  )
);

CREATE POLICY "Admins can view PINs" ON public.activation_pins
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND tier = 'admin'
  )
);

-- 3. Stored Procedure (RPC) to atomically redeem a PIN
CREATE OR REPLACE FUNCTION redeem_activation_pin(p_pin_code VARCHAR)
RETURNS TEXT[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_modules_to_unlock TEXT[];
  v_current_modules TEXT[];
  v_new_modules TEXT[];
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Lock the row and fetch PIN info
  SELECT modules_to_unlock INTO v_modules_to_unlock
  FROM public.activation_pins
  WHERE pin_code = p_pin_code AND is_used = FALSE
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or already used PIN';
  END IF;

  -- Mark PIN as used
  UPDATE public.activation_pins
  SET is_used = TRUE, used_by = v_user_id, used_at = NOW()
  WHERE pin_code = p_pin_code;

  -- Fetch current user profile
  SELECT unlocked_modules INTO v_current_modules FROM public.user_profiles WHERE id = v_user_id;
  
  IF v_current_modules IS NULL THEN
    v_current_modules := '{}'::TEXT[];
  END IF;

  -- Combine arrays & remove duplicates
  SELECT ARRAY(SELECT DISTINCT unnest(v_current_modules || v_modules_to_unlock)) INTO v_new_modules;

  -- Update user profile
  UPDATE public.user_profiles SET unlocked_modules = v_new_modules WHERE id = v_user_id;

  RETURN v_new_modules;
END;
$$;
