-- Update function with proper search path without dropping it
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM public.users 
    WHERE id = auth.uid()
  );
END;
$$;

-- Fix job policies for team members to properly edit assigned tasks
CREATE POLICY "team_view_all_jobs" 
ON public.jobs 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['photographer', 'designer', 'editor', 'ads_manager']));

CREATE POLICY "team_update_workflow_jobs" 
ON public.jobs 
FOR UPDATE 
USING (
  get_current_user_role() = ANY (ARRAY['photographer', 'designer', 'editor', 'ads_manager'])
  AND assigned_to = auth.uid()
);

-- Enhanced team file management
CREATE POLICY "team_all_job_files" 
ON public.job_files 
FOR ALL 
USING (
  get_current_user_role() = ANY (ARRAY['photographer', 'designer', 'editor', 'ads_manager'])
  AND EXISTS (
    SELECT 1 FROM public.jobs j 
    WHERE j.id = job_files.job_id 
    AND j.assigned_to = auth.uid()
  )
);

-- Team comments access
CREATE POLICY "team_all_comments" 
ON public.job_comments 
FOR ALL 
USING (
  get_current_user_role() = ANY (ARRAY['photographer', 'designer', 'editor', 'ads_manager'])
  AND (
    user_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM public.jobs j 
      WHERE j.id = job_comments.job_id 
      AND j.assigned_to = auth.uid()
    )
  )
);

-- Enhanced calendar management for task editing
CREATE POLICY "team_calendar_task_management" 
ON public.calendar_events 
FOR ALL 
USING (
  get_current_user_role() = ANY (ARRAY['photographer', 'designer', 'editor', 'ads_manager'])
  AND (
    user_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM public.jobs j 
      WHERE j.id = calendar_events.job_id 
      AND j.assigned_to = auth.uid()
    )
  )
);