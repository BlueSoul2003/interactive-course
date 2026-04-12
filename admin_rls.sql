-- RLS Policies for Admin PIN Management

-- 1. Ensure Admins can Create PINs
CREATE POLICY "Admins can insert PINs" ON public.activation_pins
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND tier = 'admin'
  )
);

-- 2. Ensure Admins can View/List PINs (useful if you ever need to query them from frontend)
CREATE POLICY "Admins can view PINs" ON public.activation_pins
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND tier = 'admin'
  )
);
