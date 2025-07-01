
-- Add missing foreign key constraints to ensure data integrity
-- Note: We'll use UUID references since Supabase manages auth.users

-- Update jobs table to ensure proper foreign key relationships
ALTER TABLE public.jobs 
ADD CONSTRAINT jobs_client_id_fkey 
FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;

ALTER TABLE public.jobs 
ADD CONSTRAINT jobs_assigned_to_fkey 
FOREIGN KEY (assigned_to) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE public.jobs 
ADD CONSTRAINT jobs_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;

-- Update payments table foreign keys
ALTER TABLE public.payments 
ADD CONSTRAINT payments_client_id_fkey 
FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;

ALTER TABLE public.payments 
ADD CONSTRAINT payments_job_id_fkey 
FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;

ALTER TABLE public.payments 
ADD CONSTRAINT payments_received_by_fkey 
FOREIGN KEY (received_by) REFERENCES public.users(id) ON DELETE SET NULL;

-- Update job_files table foreign keys
ALTER TABLE public.job_files 
ADD CONSTRAINT job_files_job_id_fkey 
FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;

ALTER TABLE public.job_files 
ADD CONSTRAINT job_files_uploaded_by_fkey 
FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE SET NULL;

-- Update notifications table foreign key
ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Update feedback table foreign keys
ALTER TABLE public.feedback 
ADD CONSTRAINT feedback_client_id_fkey 
FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;

ALTER TABLE public.feedback 
ADD CONSTRAINT feedback_job_id_fkey 
FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;

-- Update activity_logs table foreign key
ALTER TABLE public.activity_logs 
ADD CONSTRAINT activity_logs_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- Fix the user creation trigger to handle conflicts better
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

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
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    'managed_by_auth',
    true,
    NEW.created_at
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(NEW.raw_user_meta_data->>'name', users.name),
    role = COALESCE(NEW.raw_user_meta_data->>'role', users.role),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies to ensure proper access control
-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Users can read their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Enable profile creation" ON public.users;

-- Create comprehensive RLS policies for users table
CREATE POLICY "Users can view their own profile" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can view all users" 
  ON public.users 
  FOR SELECT 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Users can update their own profile" 
  ON public.users 
  FOR UPDATE 
  USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can update all users" 
  ON public.users 
  FOR UPDATE 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Enable user creation via auth trigger" 
  ON public.users 
  FOR INSERT 
  WITH CHECK (true);

-- Ensure clients table has proper RLS
DROP POLICY IF EXISTS "Clients can view their own data" ON public.clients;

CREATE POLICY "Clients can view their own data" 
  ON public.clients 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.email = clients.email 
      AND users.role = 'client'
    )
  );

-- Ensure team members can view jobs assigned to them
DROP POLICY IF EXISTS "Team members can view assigned jobs" ON public.jobs;
DROP POLICY IF EXISTS "Team members can update assigned jobs" ON public.jobs;

CREATE POLICY "Team members can view assigned jobs" 
  ON public.jobs 
  FOR SELECT 
  USING (
    (get_current_user_role() = ANY (ARRAY['photographer', 'designer', 'editor'])) 
    AND (assigned_to = auth.uid())
  );

CREATE POLICY "Team members can update assigned jobs" 
  ON public.jobs 
  FOR UPDATE 
  USING (
    (get_current_user_role() = ANY (ARRAY['photographer', 'designer', 'editor'])) 
    AND (assigned_to = auth.uid())
  );

-- Add policy for clients to view their own jobs
CREATE POLICY "Clients can view their own jobs" 
  ON public.jobs 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.clients 
      WHERE clients.id = jobs.client_id 
      AND EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.id = auth.uid() 
        AND users.email = clients.email 
        AND users.role = 'client'
      )
    )
  );
