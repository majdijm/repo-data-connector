-- Add RLS policy to allow users to view their own salary records
CREATE POLICY "Users can view their own salary records" 
ON public.salaries 
FOR SELECT 
USING (user_id = auth.uid());