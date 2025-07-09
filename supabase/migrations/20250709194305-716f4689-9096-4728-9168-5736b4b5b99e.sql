
-- First, let's see what policies currently exist and clean them up
DROP POLICY IF EXISTS "Team members can update workflow jobs" ON public.jobs;
DROP POLICY IF EXISTS "Team members can update their workflow jobs" ON public.jobs;
DROP POLICY IF EXISTS "Photographers can manage workflow job transitions" ON public.jobs;
DROP POLICY IF EXISTS "Workflow job updates by assigned team members" ON public.jobs;

-- Create a single, clear policy for workflow updates
CREATE POLICY "Allow workflow job updates by assigned team members" 
ON public.jobs 
FOR UPDATE 
USING (
  -- User must be assigned to the job and have team member role
  (assigned_to = auth.uid()) 
  AND (get_current_user_role() = ANY(ARRAY['photographer', 'designer', 'editor']))
) 
WITH CHECK (
  -- Allow any valid status and assignment changes for workflow jobs
  (get_current_user_role() = ANY(ARRAY['photographer', 'designer', 'editor']))
);
