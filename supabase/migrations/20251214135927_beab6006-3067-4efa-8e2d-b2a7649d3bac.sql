-- Update profiles table to link with auth.users
-- Add auth_user_id column to link profiles to Supabase Auth
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_auth_user_id ON public.profiles(auth_user_id);

-- Update RLS policies to use auth.uid()
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can register" ON public.profiles;

-- New RLS policies using auth.uid()
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth_user_id = auth.uid());

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth_user_id = auth.uid());

CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth_user_id = auth.uid());

-- Update cart_items RLS policies
DROP POLICY IF EXISTS "Users can view own cart" ON public.cart_items;
DROP POLICY IF EXISTS "Users can insert to own cart" ON public.cart_items;
DROP POLICY IF EXISTS "Users can update own cart" ON public.cart_items;
DROP POLICY IF EXISTS "Users can delete from own cart" ON public.cart_items;

-- New cart_items RLS policies using auth.uid() via profiles
CREATE POLICY "Users can view own cart" 
ON public.cart_items 
FOR SELECT 
USING (user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can insert to own cart" 
ON public.cart_items 
FOR INSERT 
WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can update own cart" 
ON public.cart_items 
FOR UPDATE 
USING (user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can delete from own cart" 
ON public.cart_items 
FOR DELETE 
USING (user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

-- Update orders RLS policies
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;

-- New orders RLS policies using auth.uid() via profiles
CREATE POLICY "Users can view own orders" 
ON public.orders 
FOR SELECT 
USING (user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can insert own orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can update own orders" 
ON public.orders 
FOR UPDATE 
USING (user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));