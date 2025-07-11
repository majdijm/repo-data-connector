
-- Add RLS policy to allow clients to view their own jobs
CREATE POLICY "Clients can view their own jobs" 
  ON public.jobs 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 
      FROM users u 
      JOIN clients c ON c.email = u.email 
      WHERE u.id = auth.uid() 
      AND c.id = jobs.client_id
    )
  );
