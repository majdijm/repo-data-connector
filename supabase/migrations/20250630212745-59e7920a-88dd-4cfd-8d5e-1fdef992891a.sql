
-- Update user with email majdijm@gmail.com to have admin role
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'majdijm@gmail.com';

-- If the user doesn't exist yet, insert them as admin
-- This will only insert if the email doesn't already exist
INSERT INTO public.users (email, name, role, password, is_active)
SELECT 'majdijm@gmail.com', 'Admin User', 'admin', '$2b$10$dummy.hash.placeholder', true
WHERE NOT EXISTS (
    SELECT 1 FROM public.users WHERE email = 'majdijm@gmail.com'
);
