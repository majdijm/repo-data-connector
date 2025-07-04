
-- Drop the existing problematic policy for client contracts
DROP POLICY IF EXISTS "Clients can view their own contracts" ON public.client_contracts;

-- Create a new policy that doesn't rely on auth.users table access
-- Since we're using the users table in public schema, we should reference that instead
CREATE POLICY "Clients can view their own contracts" 
  ON public.client_contracts FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.clients c ON c.email = u.email
      WHERE c.id = client_contracts.client_id 
      AND u.id = auth.uid()
    )
  );

-- Update the payment_requests policy as well to be consistent
DROP POLICY IF EXISTS "Clients can view their own payment requests" ON public.payment_requests;

CREATE POLICY "Clients can view their own payment requests" 
  ON public.payment_requests FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.clients c ON c.email = u.email
      WHERE c.id = payment_requests.client_id 
      AND u.id = auth.uid()
    )
  );
