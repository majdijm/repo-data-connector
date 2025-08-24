-- Fix function search path and comprehensive workflow permissions
-- Update function to have proper search path
DROP FUNCTION IF EXISTS public.get_current_user_role();

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

-- Comprehensive RLS policy fixes for jobs table
-- Drop all existing policies to rebuild them correctly
DROP POLICY IF EXISTS "Clients can view their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Managers can manage all jobs" ON public.jobs;
DROP POLICY IF EXISTS "Team members can view assigned jobs" ON public.jobs;
DROP POLICY IF EXISTS "admin_full_access" ON public.jobs;
DROP POLICY IF EXISTS "receptionist_full_access" ON public.jobs;
DROP POLICY IF EXISTS "team_can_update_workflow" ON public.jobs;

-- Create comprehensive job policies
CREATE POLICY "admin_full_access" 
ON public.jobs 
FOR ALL 
USING (get_current_user_role() = 'admin');

CREATE POLICY "manager_full_access" 
ON public.jobs 
FOR ALL 
USING (get_current_user_role() = 'manager');

CREATE POLICY "receptionist_full_access" 
ON public.jobs 
FOR ALL 
USING (get_current_user_role() = 'receptionist');

-- Clients can view their own jobs
CREATE POLICY "client_view_own_jobs" 
ON public.jobs 
FOR SELECT 
USING (
  get_current_user_role() = 'client' 
  AND EXISTS (
    SELECT 1 FROM public.clients c 
    JOIN public.users u ON u.email = c.email 
    WHERE u.id = auth.uid() AND c.id = jobs.client_id
  )
);

-- Team members can view all jobs (not just assigned ones)
CREATE POLICY "team_view_jobs" 
ON public.jobs 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['photographer', 'designer', 'editor', 'ads_manager']));

-- Team members can update jobs they are assigned to
CREATE POLICY "team_update_assigned_jobs" 
ON public.jobs 
FOR UPDATE 
USING (
  get_current_user_role() = ANY (ARRAY['photographer', 'designer', 'editor', 'ads_manager'])
  AND assigned_to = auth.uid()
);

-- Fix job_files policies for better team access
DROP POLICY IF EXISTS "Team members can manage files for assigned jobs" ON public.job_files;

CREATE POLICY "team_manage_job_files" 
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

-- Fix job_comments policies for team collaboration
DROP POLICY IF EXISTS "Team members can view all job comments" ON public.job_comments;
DROP POLICY IF EXISTS "Team members can insert job comments" ON public.job_comments;

CREATE POLICY "team_view_job_comments" 
ON public.job_comments 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['photographer', 'designer', 'editor', 'ads_manager']));

CREATE POLICY "team_insert_job_comments" 
ON public.job_comments 
FOR INSERT 
WITH CHECK (
  get_current_user_role() = ANY (ARRAY['photographer', 'designer', 'editor', 'ads_manager'])
  AND user_id = auth.uid()
);

-- Calendar events policies for task management
DROP POLICY IF EXISTS "Users can create their own calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can update their own calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can delete their own calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can view their own calendar events" ON public.calendar_events;

CREATE POLICY "team_view_calendar_events" 
ON public.calendar_events 
FOR SELECT 
USING (
  get_current_user_role() = ANY (ARRAY['photographer', 'designer', 'editor', 'ads_manager'])
  OR user_id = auth.uid()
);

CREATE POLICY "team_manage_calendar_events" 
ON public.calendar_events 
FOR ALL 
USING (
  get_current_user_role() = ANY (ARRAY['admin', 'manager', 'receptionist'])
  OR user_id = auth.uid()
);

-- Notification policies for workflow distribution
DROP POLICY IF EXISTS "Users can manage their own notifications" ON public.notifications;

CREATE POLICY "users_manage_own_notifications" 
ON public.notifications 
FOR ALL 
USING (user_id = auth.uid());

CREATE POLICY "admins_manage_all_notifications" 
ON public.notifications 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['admin', 'manager', 'receptionist']));