-- Sync the admin user's auth ID with the database record
-- Update the admin user record to use the correct auth user ID
UPDATE public.users 
SET id = '0bc6b800-e8b9-4880-8bbc-c317d096aeab'
WHERE email = 'majdijm@gmail.com';

-- Ensure the admin user has all the correct permissions
UPDATE public.users 
SET 
  role = 'admin',
  is_active = true,
  name = 'Admin User',
  updated_at = now()
WHERE email = 'majdijm@gmail.com';