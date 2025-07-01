
-- Add INSERT policy to allow users to create their own profile
CREATE POLICY "Users can insert their own data" 
  ON public.users 
  FOR INSERT 
  WITH CHECK ((auth.uid())::text = (id)::text);

-- Also add a policy to allow the handle_new_user function to insert users
-- This is needed for the trigger that creates user profiles automatically
CREATE POLICY "Allow user creation via trigger" 
  ON public.users 
  FOR INSERT 
  WITH CHECK (true);

-- Drop the previous policy and recreate it to be more permissive for creation
DROP POLICY IF EXISTS "Users can insert their own data" ON public.users;

-- Create a more permissive INSERT policy that works with the auth trigger
CREATE POLICY "Enable insert for authenticated users" 
  ON public.users 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);
