-- Add RLS policy for clients to view their own payments
CREATE POLICY "Clients can view their own payments" 
ON public.payments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM clients c 
    JOIN users u ON u.email = c.email 
    WHERE c.id = payments.client_id 
    AND u.id = auth.uid()
  )
);

-- Add RLS policy for clients to view their own payment requests  
CREATE POLICY "Clients can view their own payment requests" 
ON public.payment_requests 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM clients c 
    JOIN users u ON u.email = c.email 
    WHERE c.id = payment_requests.client_id 
    AND u.id = auth.uid()
  )
);