
-- Drop existing policies that might be conflicting
DROP POLICY IF EXISTS "Photographers can update their assigned workflow jobs" ON public.jobs;
DROP POLICY IF EXISTS "Photographers can progress workflow jobs" ON public.jobs;

-- Create a comprehensive policy that allows photographers to complete workflow jobs and reassign them
CREATE POLICY "Photographers can complete and reassign workflow jobs" 
ON public.jobs 
FOR UPDATE 
USING (
  (get_current_user_role() = 'photographer') 
  AND (workflow_stage IS NOT NULL)
  AND (
    -- Can update jobs assigned to them
    (assigned_to = auth.uid()) 
    OR 
    -- Can reassign completed workflow jobs to next stage
    (status = 'completed' AND workflow_stage IS NOT NULL)
  )
) 
WITH CHECK (
  (get_current_user_role() = 'photographer')
  AND (
    -- Allow status updates for workflow progression
    (status = ANY(ARRAY['pending', 'in_progress', 'review', 'completed']))
    AND
    -- Allow assignment changes for workflow progression
    (workflow_stage IS NOT NULL)
  )
);
