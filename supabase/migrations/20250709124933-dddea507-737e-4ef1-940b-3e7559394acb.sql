
-- Add policy to allow team members to view other team members for job assignment
CREATE POLICY "Team members can view other team members" 
ON public.users 
FOR SELECT 
TO authenticated
USING (
  get_current_user_role() = ANY(ARRAY['photographer', 'designer', 'editor']) 
  AND role = ANY(ARRAY['photographer', 'designer', 'editor'])
);
