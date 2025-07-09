
-- Drop all existing conflicting policies
DROP POLICY IF EXISTS "Team members can update assigned jobs" ON public.jobs;
DROP POLICY IF EXISTS "Team members can update their workflow jobs" ON public.jobs;
DROP POLICY IF EXISTS "Photographers can manage workflow job transitions" ON public.jobs;

-- Create a single comprehensive policy for workflow updates
CREATE POLICY "Workflow job updates by assigned team members" 
ON public.jobs 
FOR UPDATE 
USING (
  -- Allow if user is assigned to the job and has appropriate role
  (assigned_to = auth.uid()) 
  AND (get_current_user_role() = ANY(ARRAY['photographer', 'designer', 'editor']))
) 
WITH CHECK (
  -- For workflow jobs, allow more permissive updates
  CASE 
    WHEN workflow_stage IS NOT NULL THEN 
      -- For workflow jobs, allow status and assignment changes by the currently assigned user
      (get_current_user_role() = ANY(ARRAY['photographer', 'designer', 'editor']))
    ELSE 
      -- For regular jobs, ensure the user remains assigned to themselves
      (assigned_to = auth.uid() AND get_current_user_role() = ANY(ARRAY['photographer', 'designer', 'editor']))
  END
);
