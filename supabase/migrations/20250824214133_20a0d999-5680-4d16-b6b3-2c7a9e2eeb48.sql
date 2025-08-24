-- Fix RLS policies for jobs table to ensure photographers can update their assigned tasks
DROP POLICY IF EXISTS "team_can_update_workflow" ON public.jobs;

-- Create comprehensive policies for team members (photographers, designers, editors, ads_managers)
CREATE POLICY "Team members can view assigned jobs" 
ON public.jobs 
FOR SELECT 
USING (
  (get_current_user_role() = ANY (ARRAY['photographer'::text, 'designer'::text, 'editor'::text, 'ads_manager'::text])) 
  AND (assigned_to = auth.uid())
);

CREATE POLICY "Team members can update assigned jobs" 
ON public.jobs 
FOR UPDATE 
USING (
  (get_current_user_role() = ANY (ARRAY['photographer'::text, 'designer'::text, 'editor'::text, 'ads_manager'::text])) 
  AND (assigned_to = auth.uid())
);

-- Fix job_files RLS policies to ensure assigned team members can upload files
DROP POLICY IF EXISTS "Team members can manage files for assigned jobs" ON public.job_files;

CREATE POLICY "Team members can insert files for assigned jobs" 
ON public.job_files 
FOR INSERT 
WITH CHECK (
  (get_current_user_role() = ANY (ARRAY['photographer'::text, 'designer'::text, 'editor'::text, 'ads_manager'::text])) 
  AND EXISTS (
    SELECT 1 FROM jobs 
    WHERE jobs.id = job_files.job_id 
    AND jobs.assigned_to = auth.uid()
  )
);

CREATE POLICY "Team members can view files for assigned jobs" 
ON public.job_files 
FOR SELECT 
USING (
  (get_current_user_role() = ANY (ARRAY['photographer'::text, 'designer'::text, 'editor'::text, 'ads_manager'::text])) 
  AND EXISTS (
    SELECT 1 FROM jobs 
    WHERE jobs.id = job_files.job_id 
    AND jobs.assigned_to = auth.uid()
  )
);

CREATE POLICY "Team members can update files for assigned jobs" 
ON public.job_files 
FOR UPDATE 
USING (
  (get_current_user_role() = ANY (ARRAY['photographer'::text, 'designer'::text, 'editor'::text, 'ads_manager'::text])) 
  AND EXISTS (
    SELECT 1 FROM jobs 
    WHERE jobs.id = job_files.job_id 
    AND jobs.assigned_to = auth.uid()
  )
);

-- Ensure job comments work properly for team members
DROP POLICY IF EXISTS "Team members can insert job comments" ON public.job_comments;
DROP POLICY IF EXISTS "Team members can view all job comments" ON public.job_comments;

CREATE POLICY "Team members can insert comments for assigned jobs" 
ON public.job_comments 
FOR INSERT 
WITH CHECK (
  (get_current_user_role() = ANY (ARRAY['photographer'::text, 'designer'::text, 'editor'::text, 'ads_manager'::text]))
  AND EXISTS (
    SELECT 1 FROM jobs 
    WHERE jobs.id = job_comments.job_id 
    AND jobs.assigned_to = auth.uid()
  )
);

CREATE POLICY "Team members can view comments for assigned jobs" 
ON public.job_comments 
FOR SELECT 
USING (
  (get_current_user_role() = ANY (ARRAY['photographer'::text, 'designer'::text, 'editor'::text, 'ads_manager'::text]))
  AND EXISTS (
    SELECT 1 FROM jobs 
    WHERE jobs.id = job_comments.job_id 
    AND jobs.assigned_to = auth.uid()
  )
);

CREATE POLICY "Team members can update their own comments" 
ON public.job_comments 
FOR UPDATE 
USING (
  (get_current_user_role() = ANY (ARRAY['photographer'::text, 'designer'::text, 'editor'::text, 'ads_manager'::text]))
  AND user_id = auth.uid()
);

CREATE POLICY "Team members can delete their own comments" 
ON public.job_comments 
FOR DELETE 
USING (
  (get_current_user_role() = ANY (ARRAY['photographer'::text, 'designer'::text, 'editor'::text, 'ads_manager'::text]))
  AND user_id = auth.uid()
);