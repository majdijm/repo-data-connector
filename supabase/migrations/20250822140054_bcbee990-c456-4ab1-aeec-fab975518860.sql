-- Fix security warnings by setting search_path for remaining functions
CREATE OR REPLACE FUNCTION public.get_current_user_role()
 RETURNS text
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  RETURN (
    SELECT role 
    FROM public.users 
    WHERE id = auth.uid()
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.sync_existing_user(user_email text, auth_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
$function$;