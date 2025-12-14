-- Create profiles table for user authentication
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  backup_phrase TEXT NOT NULL,
  last_active_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (true);

-- Anyone can insert (for registration)
CREATE POLICY "Anyone can register"
ON public.profiles
FOR INSERT
WITH CHECK (true);

-- Create function to update last_active_at
CREATE OR REPLACE FUNCTION public.update_last_active()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_active_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger to update last_active on any update
CREATE TRIGGER update_profiles_last_active
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_last_active();

-- Create function to delete inactive users (called by cron)
CREATE OR REPLACE FUNCTION public.delete_inactive_users()
RETURNS void AS $$
BEGIN
  DELETE FROM public.profiles
  WHERE last_active_at < now() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SET search_path = public;