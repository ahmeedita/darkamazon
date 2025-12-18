-- Add recovery_phrase_hash column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN recovery_phrase_hash text;

-- Add index for faster lookups during recovery
CREATE INDEX idx_profiles_recovery_phrase ON public.profiles(recovery_phrase_hash);