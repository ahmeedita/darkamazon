-- Remove password_hash column (no longer needed with Supabase Auth)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS password_hash;

-- Create a security definer function to verify backup phrases without exposing them
CREATE OR REPLACE FUNCTION public.verify_backup_phrase(phrase TEXT)
RETURNS TABLE(profile_id UUID, auth_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.auth_user_id
  FROM public.profiles p
  WHERE p.backup_phrase = lower(trim(phrase));
END;
$$;

-- Update SELECT policy to use a more restrictive approach
-- We'll create a view that excludes sensitive columns
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Create policy that still allows SELECT but we'll use a view in the app
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth_user_id = auth.uid());

-- Add DELETE policy for GDPR compliance
CREATE POLICY "Users can delete own profile" 
ON public.profiles 
FOR DELETE 
USING (auth_user_id = auth.uid());