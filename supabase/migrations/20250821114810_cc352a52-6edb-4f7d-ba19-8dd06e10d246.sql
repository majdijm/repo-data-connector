-- Update RLS policies to include ads_manager where team members are referenced
DROP POLICY IF EXISTS "Team members can view clients" ON clients;
CREATE POLICY "Team members can view clients" ON clients 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['photographer'::text, 'designer'::text, 'editor'::text, 'ads_manager'::text]));

DROP POLICY IF EXISTS "Team members can view packages" ON packages;
CREATE POLICY "Team members can view packages" ON packages 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['photographer'::text, 'designer'::text, 'editor'::text, 'ads_manager'::text]));

DROP POLICY IF EXISTS "Team members can view package services" ON package_services;
CREATE POLICY "Team members can view package services" ON package_services 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['photographer'::text, 'designer'::text, 'editor'::text, 'ads_manager'::text]));

DROP POLICY IF EXISTS "Team members can view feedback for assigned jobs" ON feedback;
CREATE POLICY "Team members can view feedback for assigned jobs" ON feedback 
FOR SELECT 
USING ((get_current_user_role() = ANY (ARRAY['photographer'::text, 'designer'::text, 'editor'::text, 'ads_manager'::text])) AND (EXISTS ( SELECT 1
   FROM jobs
  WHERE ((jobs.id = feedback.job_id) AND (jobs.assigned_to = auth.uid())))));

DROP POLICY IF EXISTS "Team members can view payments for assigned jobs" ON payments;
CREATE POLICY "Team members can view payments for assigned jobs" ON payments 
FOR SELECT 
USING ((get_current_user_role() = ANY (ARRAY['photographer'::text, 'designer'::text, 'editor'::text, 'ads_manager'::text])) AND (EXISTS ( SELECT 1
   FROM jobs
  WHERE ((jobs.id = payments.job_id) AND (jobs.assigned_to = auth.uid())))));

DROP POLICY IF EXISTS "Team members can manage files for assigned jobs" ON job_files;
CREATE POLICY "Team members can manage files for assigned jobs" ON job_files 
FOR ALL 
USING ((get_current_user_role() = ANY (ARRAY['photographer'::text, 'designer'::text, 'editor'::text, 'ads_manager'::text])) AND (EXISTS ( SELECT 1
   FROM jobs
  WHERE ((jobs.id = job_files.job_id) AND (jobs.assigned_to = auth.uid())))));

DROP POLICY IF EXISTS "Team members can view all job comments" ON job_comments;
CREATE POLICY "Team members can view all job comments" ON job_comments 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['photographer'::text, 'designer'::text, 'editor'::text, 'ads_manager'::text]));

DROP POLICY IF EXISTS "Team members can insert job comments" ON job_comments;
CREATE POLICY "Team members can insert job comments" ON job_comments 
FOR INSERT 
WITH CHECK (get_current_user_role() = ANY (ARRAY['photographer'::text, 'designer'::text, 'editor'::text, 'ads_manager'::text]));

DROP POLICY IF EXISTS "Team members can update their own comments" ON job_comments;
CREATE POLICY "Team members can update their own comments" ON job_comments 
FOR UPDATE 
USING ((get_current_user_role() = ANY (ARRAY['photographer'::text, 'designer'::text, 'editor'::text, 'ads_manager'::text])) AND (user_id = auth.uid()));

DROP POLICY IF EXISTS "Team members can delete their own comments" ON job_comments;
CREATE POLICY "Team members can delete their own comments" ON job_comments 
FOR DELETE 
USING ((get_current_user_role() = ANY (ARRAY['photographer'::text, 'designer'::text, 'editor'::text, 'ads_manager'::text])) AND (user_id = auth.uid()));

DROP POLICY IF EXISTS "team_can_view_assigned" ON jobs;
CREATE POLICY "team_can_view_assigned" ON jobs 
FOR SELECT 
USING ((get_current_user_role() = ANY (ARRAY['photographer'::text, 'designer'::text, 'editor'::text, 'ads_manager'::text])) AND (assigned_to = auth.uid()));

DROP POLICY IF EXISTS "team_can_update_workflow" ON jobs;
CREATE POLICY "team_can_update_workflow" ON jobs 
FOR UPDATE 
USING ((get_current_user_role() = ANY (ARRAY['photographer'::text, 'designer'::text, 'editor'::text, 'ads_manager'::text])) AND (assigned_to = auth.uid()))
WITH CHECK (true);

DROP POLICY IF EXISTS "Team members can view other team members" ON users;
CREATE POLICY "Team members can view other team members" ON users 
FOR SELECT 
USING ((get_current_user_role() = ANY (ARRAY['photographer'::text, 'designer'::text, 'editor'::text, 'ads_manager'::text])) AND (role = ANY (ARRAY['photographer'::text, 'designer'::text, 'editor'::text, 'ads_manager'::text])));