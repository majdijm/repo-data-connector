
-- Drop the existing policy that's too restrictive
DROP POLICY IF EXISTS "Photographers can complete and reassign workflow jobs" ON public.jobs;

-- Create a more permissive policy for workflow job updates
CREATE POLICY "Photographers can manage workflow job transitions" 
ON public.jobs 
FOR UPDATE 
USING (
  (get_current_user_role() = 'photographer') 
  AND (workflow_stage IS NOT NULL)
  AND (assigned_to = auth.uid())
) 
WITH CHECK (
  (get_current_user_role() = 'photographer')
  AND (workflow_stage IS NOT NULL)
  -- Allow any status and assignment changes for workflow jobs
);

-- Also allow editors and designers to update their assigned workflow jobs
CREATE POLICY "Team members can update their workflow jobs" 
ON public.jobs 
FOR UPDATE 
USING (
  (get_current_user_role() = ANY(ARRAY['photographer', 'designer', 'editor']))
  AND (workflow_stage IS NOT NULL)
  AND (assigned_to = auth.uid())
) 
WITH CHECK (
  (get_current_user_role() = ANY(ARRAY['photographer', 'designer', 'editor']))
  AND (workflow_stage IS NOT NULL)
);
