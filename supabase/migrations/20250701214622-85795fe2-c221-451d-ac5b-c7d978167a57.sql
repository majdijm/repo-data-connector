
-- Drop the restrictive policies that only allow users to see their own data
DROP POLICY IF EXISTS "Users can read their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;

-- Create new policies that allow proper admin access
CREATE POLICY "Admins can view all users" 
ON public.users 
FOR SELECT 
TO authenticated
USING (get_current_user_role() = 'admin');

CREATE POLICY "Receptionists can view all users" 
ON public.users 
FOR SELECT 
TO authenticated
USING (get_current_user_role() = 'receptionist');

CREATE POLICY "Users can view their own profile" 
ON public.users 
FOR SELECT 
TO authenticated
USING (id = auth.uid());

-- Keep the existing policies for updates and inserts
CREATE POLICY "Admins can manage all users" 
ON public.users 
FOR ALL 
TO authenticated
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Receptionists can create users" 
ON public.users 
FOR INSERT 
TO authenticated
WITH CHECK (get_current_user_role() IN ('admin', 'receptionist'));
