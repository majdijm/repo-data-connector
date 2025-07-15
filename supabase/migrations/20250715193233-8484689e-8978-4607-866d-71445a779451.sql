-- Since we can't directly modify auth tables, let's create a simpler solution
-- that aligns public.users with auth.users when users log in

-- First, update the handle_new_user trigger function to handle existing users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  existing_user_id UUID;
BEGIN
  -- Check if there's already a user in public.users with this email
  SELECT id INTO existing_user_id 
  FROM public.users 
  WHERE email = NEW.email;
  
  IF existing_user_id IS NOT NULL THEN
    -- Update existing user's ID to match the auth user ID
    UPDATE public.users 
    SET 
      id = NEW.id,
      updated_at = NOW()
    WHERE email = NEW.email;
  ELSE
    -- Insert new user as before
    INSERT INTO public.users (id, email, name, role, password, is_active, created_at)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
      COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
      'managed_by_auth',
      true,
      NEW.created_at
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create a function to manually sync existing users
-- This will be called for each existing user when they first try to log in
CREATE OR REPLACE FUNCTION public.sync_existing_user(user_email TEXT, auth_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Get the existing user by email
  SELECT * INTO user_record 
  FROM public.users 
  WHERE email = user_email;
  
  IF user_record.id IS NOT NULL THEN
    -- Update the user's ID to match the auth ID
    UPDATE public.users 
    SET 
      id = auth_user_id,
      updated_at = NOW()
    WHERE email = user_email;
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;