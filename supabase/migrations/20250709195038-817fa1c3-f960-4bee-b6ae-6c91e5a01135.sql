
-- First, let's see what policies currently exist on the jobs table
SELECT policyname, cmd, permissive, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'jobs' AND schemaname = 'public';

-- Drop ALL existing policies on jobs table to start completely fresh
DROP POLICY IF EXISTS "Admins can manage all jobs" ON public.jobs;
DROP POLICY IF EXISTS "Receptionists can manage all jobs" ON public.jobs;
DROP POLICY IF EXISTS "Team members can view assigned jobs" ON public.jobs;
DROP POLICY IF EXISTS "Team members update assigned jobs" ON public.jobs;
DROP POLICY IF EXISTS "Allow workflow job updates by assigned team members" ON public.jobs;
DROP POLICY IF EXISTS "Team members can update workflow jobs" ON public.jobs;
DROP POLICY IF EXISTS "Team members can update their workflow jobs" ON public.jobs;
DROP POLICY IF EXISTS "Photographers can manage workflow job transitions" ON public.jobs;
DROP POLICY IF EXISTS "Workflow job updates by assigned team members" ON public.jobs;

-- Recreate ALL policies from scratch with very simple logic
CREATE POLICY "admins_all_jobs" ON public.jobs FOR ALL TO authenticated 
USING (get_current_user_role() = 'admin');

CREATE POLICY "receptionists_all_jobs" ON public.jobs FOR ALL TO authenticated 
USING (get_current_user_role() = 'receptionist');

CREATE POLICY "team_view_assigned" ON public.jobs FOR SELECT TO authenticated 
USING (
  get_current_user_role() IN ('photographer', 'designer', 'editor') 
  AND assigned_to = auth.uid()
);

CREATE POLICY "team_update_assigned" ON public.jobs FOR UPDATE TO authenticated 
USING (
  get_current_user_role() IN ('photographer', 'designer', 'editor') 
  AND assigned_to = auth.uid()
) 
WITH CHECK (
  get_current_user_role() IN ('photographer', 'designer', 'editor')
);
