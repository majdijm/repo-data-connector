-- Add proper RLS policy for clients to view comments on their jobs
CREATE POLICY "Clients can view comments on their jobs" 
ON public.job_comments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM jobs j 
    JOIN clients c ON c.id = j.client_id 
    JOIN users u ON u.email = c.email 
    WHERE j.id = job_comments.job_id 
    AND u.id = auth.uid()
  )
);

-- Ensure clients can add comments to their jobs
CREATE POLICY "Clients can add comments to their jobs" 
ON public.job_comments 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM jobs j 
    JOIN clients c ON c.id = j.client_id 
    JOIN users u ON u.email = c.email 
    WHERE j.id = job_comments.job_id 
    AND u.id = auth.uid()
  )
);