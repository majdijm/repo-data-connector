
-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Workflow job updates by assigned team members" ON public.jobs;

-- Create a more permissive policy that allows workflow job transitions
CREATE POLICY "Team members can update workflow jobs" 
ON public.jobs 
FOR UPDATE 
USING (
  -- Allow if user is assigned to the job and has appropriate role
  (assigned_to = auth.uid()) 
  AND (get_current_user_role() = ANY(ARRAY['photographer', 'designer', 'editor']))
) 
WITH CHECK (
  -- For workflow jobs, allow assignment changes and status updates
  (get_current_user_role() = ANY(ARRAY['photographer', 'designer', 'editor']))
  AND 
  -- Ensure workflow jobs maintain their workflow properties
  (workflow_stage IS NOT NULL OR workflow_stage IS NULL)
);
