
-- 1. Create client_contracts table for contract uploads
CREATE TABLE public.client_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  contract_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for client_contracts
ALTER TABLE public.client_contracts ENABLE ROW LEVEL SECURITY;

-- Admins and receptionists can manage all contracts
CREATE POLICY "Admins and receptionists can manage contracts" 
  ON public.client_contracts 
  FOR ALL 
  USING (get_current_user_role() = ANY(ARRAY['admin', 'receptionist']));

-- Clients can view their own contracts
CREATE POLICY "Clients can view their own contracts" 
  ON public.client_contracts 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.clients 
      WHERE clients.id = client_contracts.client_id 
      AND clients.user_id = auth.uid()
    )
  );

-- 2. Create payment_requests table for payment reminders
CREATE TABLE public.payment_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, overdue, cancelled
  requested_by UUID NOT NULL,
  paid_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for payment_requests
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

-- Admins and receptionists can manage all payment requests
CREATE POLICY "Admins and receptionists can manage payment requests" 
  ON public.payment_requests 
  FOR ALL 
  USING (get_current_user_role() = ANY(ARRAY['admin', 'receptionist']));

-- Clients can view their own payment requests
CREATE POLICY "Clients can view their own payment requests" 
  ON public.payment_requests 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.clients 
      WHERE clients.id = payment_requests.client_id 
      AND clients.user_id = auth.uid()
    )
  );

-- 3. Create salaries table for employee salaries
CREATE TABLE public.salaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  base_salary NUMERIC NOT NULL,
  effective_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for salaries
ALTER TABLE public.salaries ENABLE ROW LEVEL SECURITY;

-- Only admins and receptionists can manage salaries
CREATE POLICY "Admins and receptionists can manage salaries" 
  ON public.salaries 
  FOR ALL 
  USING (get_current_user_role() = ANY(ARRAY['admin', 'receptionist']));

-- 4. Create expenses table for business expenses
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL, -- electricity, water, rent, equipment, etc.
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  expense_date TIMESTAMP WITH TIME ZONE NOT NULL,
  receipt_file_path TEXT,
  recorded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for expenses
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Only admins and receptionists can manage expenses
CREATE POLICY "Admins and receptionists can manage expenses" 
  ON public.expenses 
  FOR ALL 
  USING (get_current_user_role() = ANY(ARRAY['admin', 'receptionist']));

-- 5. Add next_step column to jobs table for workflow management
ALTER TABLE public.jobs 
ADD COLUMN next_step TEXT, -- 'handover', 'editing', 'design'
ADD COLUMN photographer_notes TEXT;

-- 6. Create storage bucket for contracts
INSERT INTO storage.buckets (id, name, public) 
VALUES ('contracts', 'contracts', false);

-- Create storage policy for contracts - only admins/receptionists can upload
CREATE POLICY "Admins can upload contracts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'contracts' AND 
  get_current_user_role() = ANY(ARRAY['admin', 'receptionist'])
);

-- Create storage policy for contracts - admins/receptionists and clients can view
CREATE POLICY "Contracts access policy"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'contracts' AND (
    get_current_user_role() = ANY(ARRAY['admin', 'receptionist']) OR
    -- Clients can view their own contracts
    EXISTS (
      SELECT 1 FROM public.client_contracts cc
      JOIN public.clients c ON cc.client_id = c.id
      WHERE cc.file_path = storage.objects.name
      AND c.user_id = auth.uid()
    )
  )
);
