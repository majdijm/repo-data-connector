
-- Create client_contracts table for contract uploads
CREATE TABLE public.client_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  contract_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payment_requests table for payment reminders
CREATE TABLE public.payment_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, overdue, cancelled
  requested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  paid_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create salaries table for employee salaries
CREATE TABLE public.salaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  base_salary NUMERIC NOT NULL,
  bonus NUMERIC DEFAULT 0,
  effective_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create expenses table for business expenses
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL, -- office_supplies, equipment, utilities, rent, etc.
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  receipt_file_path TEXT,
  recorded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for all new tables
ALTER TABLE public.client_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- RLS policies for client_contracts
CREATE POLICY "Admins and receptionists can manage contracts" 
  ON public.client_contracts FOR ALL 
  USING (get_current_user_role() = ANY(ARRAY['admin', 'receptionist']));

CREATE POLICY "Clients can view their own contracts" 
  ON public.client_contracts FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.clients 
      WHERE clients.id = client_contracts.client_id 
      AND clients.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- RLS policies for payment_requests
CREATE POLICY "Admins and receptionists can manage payment requests" 
  ON public.payment_requests FOR ALL 
  USING (get_current_user_role() = ANY(ARRAY['admin', 'receptionist']));

CREATE POLICY "Clients can view their own payment requests" 
  ON public.payment_requests FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.clients 
      WHERE clients.id = payment_requests.client_id 
      AND clients.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- RLS policies for salaries
CREATE POLICY "Admins and receptionists can manage salaries" 
  ON public.salaries FOR ALL 
  USING (get_current_user_role() = ANY(ARRAY['admin', 'receptionist']));

-- RLS policies for expenses
CREATE POLICY "Admins and receptionists can manage expenses" 
  ON public.expenses FOR ALL 
  USING (get_current_user_role() = ANY(ARRAY['admin', 'receptionist']));

-- Create storage bucket for contracts
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
      AND c.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  )
);
