-- Update RLS policy for session_payments to allow employees to view their approved payments
DROP POLICY IF EXISTS "Users can manage their own session payments" ON public.session_payments;

-- Create separate policies for better granular control
CREATE POLICY "Users can view their own session payments" 
ON public.session_payments 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own session payments" 
ON public.session_payments 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own pending session payments" 
ON public.session_payments 
FOR UPDATE 
USING (user_id = auth.uid() AND status = 'pending');

-- Keep the admin/manager policy as is
-- This ensures employees can see their approved payments but can only edit pending ones