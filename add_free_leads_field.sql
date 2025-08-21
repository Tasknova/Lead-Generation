-- Add free_leads_used field to profiles table
-- Run this SQL in your Supabase SQL editor

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS free_leads_used BOOLEAN DEFAULT FALSE;

-- Add a comment to explain the field
COMMENT ON COLUMN public.profiles.free_leads_used IS 'Tracks whether the user has already used their 10 free leads offer';

-- Update existing profiles to have free_leads_used = false
UPDATE public.profiles 
SET free_leads_used = FALSE 
WHERE free_leads_used IS NULL;
