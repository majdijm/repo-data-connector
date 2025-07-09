
-- First, let's completely clean up all job update policies and start fresh
DROP POLICY IF EXISTS "Allow workflow job updates by assigned team members" ON public.jobs;
DROP POLICY IF EXISTS "Team members can update workflow jobs" ON public.jobs;
DROP POLICY IF EXISTS "Team members can update their workflow jobs" ON public.jobs;
DROP POLICY IF EXISTS "Photographers can manage workflow job transitions" ON public.jobs;
DROP POLICY IF EXISTS "Workflow job updates by assigned team members" ON public.jobs;

-- Check what policies currently exist (this will help us debug)
-- SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE tablename = 'jobs' AND cmd = 'UPDATE';

-- Create a very permissive policy for team members to update their assigned jobs
CREATE POLICY "Team members update assigned jobs" 
ON public.jobs 
FOR UPDATE 
USING (
  -- Must be assigned to this job AND be a team member
  assigned_to = auth.uid() 
  AND get_current_user_role() IN ('photographer', 'designer', 'editor')
) 
WITH CHECK (
  -- Allow any team member to make updates (including reassignments)
  get_current_user_role() IN ('photographer', 'designer', 'editor')
);
