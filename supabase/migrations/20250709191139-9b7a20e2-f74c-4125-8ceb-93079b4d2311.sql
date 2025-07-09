
-- Drop the existing conflicting policies to avoid conflicts
DROP POLICY IF EXISTS "Photographers can update workflow jobs for completion" ON public.jobs;
DROP POLICY IF EXISTS "Photographers can reassign completed workflow jobs" ON public.jobs;

-- Create a comprehensive policy for photographers updating workflow jobs
CREATE POLICY "Photographers can update their assigned workflow jobs" 
ON public.jobs 
FOR UPDATE 
USING (
  (get_current_user_role() = 'photographer') 
  AND (assigned_to = auth.uid()) 
  AND (workflow_stage IS NOT NULL)
);

-- Also allow photographers to update status and assignment for workflow progression
CREATE POLICY "Photographers can progress workflow jobs" 
ON public.jobs 
FOR UPDATE 
USING (
  (get_current_user_role() = 'photographer') 
  AND (assigned_to = auth.uid()) 
  AND (workflow_stage IS NOT NULL)
  AND (status = ANY(ARRAY['pending', 'in_progress', 'review']))
) 
WITH CHECK (
  (get_current_user_role() = 'photographer')
  AND (status = ANY(ARRAY['pending', 'in_progress', 'review', 'completed']))
);
