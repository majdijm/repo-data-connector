-- Fix the last function search path warning
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
$function$;