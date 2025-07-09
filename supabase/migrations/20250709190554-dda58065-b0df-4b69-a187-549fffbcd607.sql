
-- Allow photographers to update jobs when completing workflow steps
-- This policy allows photographers to update jobs assigned to them for workflow progression
CREATE POLICY "Photographers can update workflow jobs for completion" 
ON public.jobs 
FOR UPDATE 
USING (
  (get_current_user_role() = 'photographer') 
  AND (assigned_to = auth.uid()) 
  AND (workflow_stage IS NOT NULL)
  AND (status = ANY(ARRAY['pending', 'in_progress', 'review']))
);

-- Allow photographers to reassign jobs during workflow completion
-- This is needed when a photographer completes their work and assigns it to the next person
CREATE POLICY "Photographers can reassign completed workflow jobs" 
ON public.jobs 
FOR UPDATE 
USING (
  (get_current_user_role() = 'photographer') 
  AND (assigned_to = auth.uid()) 
  AND (workflow_stage = 'photo_session')
  AND (workflow_order = 1)
);
