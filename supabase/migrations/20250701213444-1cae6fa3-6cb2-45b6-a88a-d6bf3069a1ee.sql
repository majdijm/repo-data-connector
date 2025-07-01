
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can read their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Enable profile creation" ON public.users;

-- Create new policies that allow proper admin access
CREATE POLICY "Admins can manage all users" 
ON public.users 
FOR ALL 
TO authenticated
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Receptionists can view and create users" 
ON public.users 
FOR SELECT 
TO authenticated
USING (get_current_user_role() IN ('admin', 'receptionist'));

CREATE POLICY "Receptionists can create users" 
ON public.users 
FOR INSERT 
TO authenticated
WITH CHECK (get_current_user_role() IN ('admin', 'receptionist'));

CREATE POLICY "Users can view their own profile" 
ON public.users 
FOR SELECT 
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" 
ON public.users 
FOR UPDATE 
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Allow service role to insert (for the trigger)
CREATE POLICY "Service role can insert users" 
ON public.users 
FOR INSERT 
TO service_role
WITH CHECK (true);
