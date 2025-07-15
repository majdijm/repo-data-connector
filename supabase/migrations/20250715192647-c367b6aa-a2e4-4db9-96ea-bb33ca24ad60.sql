-- Create auth users for existing public.users
-- This will allow them to log in with their credentials

-- Insert users into auth.users for each user in public.users
-- Note: In production, you would normally create users through Supabase Auth first,
-- but for this setup we need to sync existing users

-- Create a function to create auth users
CREATE OR REPLACE FUNCTION create_auth_user_for_existing_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_record RECORD;
    auth_user_id UUID;
BEGIN
    -- Loop through all users in public.users
    FOR user_record IN 
        SELECT id, email, name, password 
        FROM public.users 
        WHERE email NOT LIKE '%@supabase%'
    LOOP
        -- Check if user already exists in auth.users
        SELECT id INTO auth_user_id
        FROM auth.users 
        WHERE email = user_record.email;
        
        -- If user doesn't exist in auth, create them
        IF auth_user_id IS NULL THEN
            -- Insert into auth.users
            INSERT INTO auth.users (
                id,
                instance_id,
                email,
                encrypted_password,
                email_confirmed_at,
                created_at,
                updated_at,
                aud,
                role,
                raw_app_meta_data,
                raw_user_meta_data,
                is_super_admin,
                confirmation_token,
                email_change_token_new,
                recovery_token
            ) VALUES (
                user_record.id,
                '00000000-0000-0000-0000-000000000000',
                user_record.email,
                crypt(user_record.password, gen_salt('bf')),
                now(),
                now(),
                now(),
                'authenticated',
                'authenticated',
                '{"provider":"email","providers":["email"]}',
                jsonb_build_object('name', user_record.name),
                false,
                '',
                '',
                ''
            ) ON CONFLICT (id) DO UPDATE SET
                email = EXCLUDED.email,
                encrypted_password = EXCLUDED.encrypted_password,
                raw_user_meta_data = EXCLUDED.raw_user_meta_data,
                updated_at = now();
                
            -- Also insert into auth.identities
            INSERT INTO auth.identities (
                id,
                user_id,
                identity_data,
                provider,
                last_sign_in_at,
                created_at,
                updated_at
            ) VALUES (
                gen_random_uuid(),
                user_record.id,
                jsonb_build_object(
                    'sub', user_record.id::text,
                    'email', user_record.email,
                    'name', user_record.name,
                    'email_verified', true,
                    'phone_verified', false
                ),
                'email',
                now(),
                now(),
                now()
            ) ON CONFLICT (provider, user_id) DO UPDATE SET
                identity_data = EXCLUDED.identity_data,
                updated_at = now();
        END IF;
    END LOOP;
END;
$$;

-- Execute the function
SELECT create_auth_user_for_existing_users();

-- Drop the function after use
DROP FUNCTION create_auth_user_for_existing_users();