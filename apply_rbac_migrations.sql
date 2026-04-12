-- =======================================================================================
-- apply_rbac_migrations.sql
-- Run this in your Supabase SQL Editor to apply Admin permissions for the PIN system
-- =======================================================================================

-- 1. Ensure RLS is active on the activation_pins table (this locks it down by default)
ALTER TABLE public.activation_pins ENABLE ROW LEVEL SECURITY;

-- 2. Create the Policy: Allow ONLY admins to manage (INSERT, SELECT, UPDATE, DELETE) PINs.
-- Note: Normal users do NOT need any policy because `redeem_activation_pin` is a SECURITY DEFINER function.
CREATE POLICY "Admins can manage activation pins"
ON public.activation_pins
FOR ALL
USING (
  (SELECT tier FROM public.user_profiles WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
  (SELECT tier FROM public.user_profiles WHERE id = auth.uid()) = 'admin'
);

-- Note: Once run, you should be able to create PINs through the newly injected Admin UI Generator.
