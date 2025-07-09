
-- Let's completely disable RLS temporarily to test, then recreate with a much simpler approach
ALTER TABLE public.jobs DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "admins_all_jobs" ON public.jobs;
DROP POLICY IF EXISTS "receptionists_all_jobs" ON public.jobs;
DROP POLICY IF EXISTS "team_view_assigned" ON public.jobs;
DROP POLICY IF EXISTS "team_update_assigned" ON public.jobs;

-- Re-enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Create extremely simple policies that should definitely work
CREATE POLICY "admin_full_access" ON public.jobs FOR ALL TO authenticated 
USING (get_current_user_role() = 'admin');

CREATE POLICY "receptionist_full_access" ON public.jobs FOR ALL TO authenticated 
USING (get_current_user_role() = 'receptionist');

-- Simple view policy for team members
CREATE POLICY "team_can_view_assigned" ON public.jobs FOR SELECT TO authenticated 
USING (
  get_current_user_role() IN ('photographer', 'designer', 'editor') 
  AND assigned_to = auth.uid()
);

-- Very permissive update policy for workflow transitions
CREATE POLICY "team_can_update_workflow" ON public.jobs FOR UPDATE TO authenticated 
USING (
  get_current_user_role() IN ('photographer', 'designer', 'editor') 
  AND assigned_to = auth.uid()
) 
WITH CHECK (true);  -- Allow any update as long as they can access the row
