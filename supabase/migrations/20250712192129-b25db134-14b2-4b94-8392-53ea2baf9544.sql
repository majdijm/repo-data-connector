
-- Update RLS policy for job_files to allow clients to view final files for their jobs
DROP POLICY IF EXISTS "Clients can view final files for their jobs" ON public.job_files;

CREATE POLICY "Clients can view final files for their jobs" 
  ON public.job_files FOR SELECT 
  USING (
    is_final = true AND EXISTS (
      SELECT 1 FROM public.jobs j
      JOIN public.clients c ON c.id = j.client_id
      JOIN public.users u ON u.email = c.email
      WHERE j.id = job_files.job_id 
      AND u.id = auth.uid()
    )
  );
