
-- Drop existing policies
DROP POLICY IF EXISTS "Team members can manage comments on assigned jobs" ON public.job_comments;

-- Create more permissive policies for team members
CREATE POLICY "Team members can view all job comments" 
  ON public.job_comments 
  FOR SELECT 
  USING (
    get_current_user_role() = ANY(ARRAY['photographer', 'designer', 'editor'])
  );

-- Team members can insert comments on any job
CREATE POLICY "Team members can insert job comments" 
  ON public.job_comments 
  FOR INSERT 
  WITH CHECK (
    get_current_user_role() = ANY(ARRAY['photographer', 'designer', 'editor'])
  );

-- Team members can update their own comments
CREATE POLICY "Team members can update their own comments" 
  ON public.job_comments 
  FOR UPDATE 
  USING (
    (get_current_user_role() = ANY(ARRAY['photographer', 'designer', 'editor'])) 
    AND (user_id = auth.uid())
  );

-- Team members can delete their own comments
CREATE POLICY "Team members can delete their own comments" 
  ON public.job_comments 
  FOR DELETE 
  USING (
    (get_current_user_role() = ANY(ARRAY['photographer', 'designer', 'editor'])) 
    AND (user_id = auth.uid())
  );
