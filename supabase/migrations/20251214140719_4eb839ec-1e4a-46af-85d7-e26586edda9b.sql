-- Remove backup_phrase column since Supabase Auth handles password recovery via email
ALTER TABLE public.profiles DROP COLUMN IF EXISTS backup_phrase;

-- Drop the verification function that's no longer needed
DROP FUNCTION IF EXISTS public.verify_backup_phrase(TEXT);