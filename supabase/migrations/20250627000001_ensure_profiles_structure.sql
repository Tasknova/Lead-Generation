-- Ensure profiles table has all required columns
DO $$
BEGIN
    -- Add full_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='full_name') THEN
        ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
    END IF;
    
    -- Add avatar_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='avatar_url') THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
    END IF;
    
    -- Ensure email column exists and is properly typed
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='email') THEN
        ALTER TABLE public.profiles ADD COLUMN email TEXT;
    END IF;
    
    -- Ensure phone column exists and is properly typed
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='phone') THEN
        ALTER TABLE public.profiles ADD COLUMN phone TEXT;
    END IF;
END$$;

-- Update existing profiles with data from auth.users if missing
UPDATE public.profiles p
SET
  full_name = COALESCE(p.full_name, u.raw_user_meta_data ->> 'full_name', ''),
  avatar_url = COALESCE(p.avatar_url, u.raw_user_meta_data ->> 'avatar_url', ''),
  email = COALESCE(p.email, u.email, '')
FROM auth.users u
WHERE p.id = u.id; 