
-- Add RLS policy for clients to view their own record
CREATE POLICY "Clients can view their own record" 
ON public.clients 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.email = clients.email 
    AND users.role = 'client'
  )
);
