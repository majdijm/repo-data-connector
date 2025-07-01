
-- First, let's check and fix the handle_new_user function and trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the corrected handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Insert into users table with proper field mapping
  INSERT INTO public.users (id, email, name, role, password, is_active, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    'managed_by_auth', -- Default password since auth is handled by Supabase
    true,
    NEW.created_at
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, users.name),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update the existing user with the correct ID mapping
UPDATE public.users 
SET id = '0bc6b800-e8b9-4880-8bbc-c317d096aeab'
WHERE email = 'majdijm@gmail.com';

-- Update RLS policies to ensure proper access
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Allow user creation via trigger" ON public.users;

-- Create simplified RLS policies
CREATE POLICY "Users can read their own profile" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" 
  ON public.users 
  FOR UPDATE 
  USING (auth.uid()::text = id::text);

CREATE POLICY "Enable profile creation" 
  ON public.users 
  FOR INSERT 
  WITH CHECK (auth.uid()::text = id::text OR auth.role() = 'service_role');
