ALTER TABLE public.profiles
  ALTER COLUMN auth_user_id SET NOT NULL;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_auth_user_id_key UNIQUE (auth_user_id);