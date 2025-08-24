-- Fix missing RLS policies that were missed in previous migration
-- Clean up and ensure all team member policies work correctly

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "team_can_view_assigned" ON public.jobs;

-- Recreate the view policy with correct name
CREATE POLICY "Team members can view assigned jobs" 
ON public.jobs 
FOR SELECT 
USING (
  (get_current_user_role() = ANY (ARRAY['photographer'::text, 'designer'::text, 'editor'::text, 'ads_manager'::text])) 
  AND (assigned_to = auth.uid())
);

-- Ensure job_comments policies are properly set
DROP POLICY IF EXISTS "Team members can update their own comments" ON public.job_comments;
DROP POLICY IF EXISTS "Team members can delete their own comments" ON public.job_comments;

CREATE POLICY "Team members can edit own comments" 
ON public.job_comments 
FOR UPDATE 
USING (
  (get_current_user_role() = ANY (ARRAY['photographer'::text, 'designer'::text, 'editor'::text, 'ads_manager'::text]))
  AND user_id = auth.uid()
);

CREATE POLICY "Team members can remove own comments" 
ON public.job_comments 
FOR DELETE 
USING (
  (get_current_user_role() = ANY (ARRAY['photographer'::text, 'designer'::text, 'editor'::text, 'ads_manager'::text]))
  AND user_id = auth.uid()
);