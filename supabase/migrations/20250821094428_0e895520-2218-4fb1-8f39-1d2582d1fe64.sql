-- Enhanced Package Management System
-- Add package services table to define what services are included in each package
CREATE TABLE public.package_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL, -- 'photo_session', 'video_editing', 'design', 'consultation', 'retouching'
  quantity_included INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add package usage tracking
CREATE TABLE public.package_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_package_id UUID NOT NULL REFERENCES public.client_packages(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  quantity_used INTEGER NOT NULL DEFAULT 1,
  usage_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add expense categories table
CREATE TABLE public.expense_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add default expense categories
INSERT INTO public.expense_categories (name, description) VALUES
('Equipment', 'Camera, lighting, and technical equipment'),
('Software', 'Editing software, subscriptions, and licenses'),
('Travel', 'Transportation and accommodation for shoots'),
('Marketing', 'Advertising, website, and promotional materials'),
('Office', 'Rent, utilities, and office supplies'),
('Professional Services', 'Legal, accounting, and consulting fees'),
('Training', 'Courses, workshops, and skill development'),
('Insurance', 'Equipment and liability insurance'),
('Maintenance', 'Equipment repair and maintenance'),
('Miscellaneous', 'Other business-related expenses');

-- Update expenses table to use categories
ALTER TABLE public.expenses ADD COLUMN category_id UUID REFERENCES public.expense_categories(id);

-- Add financial summary table for better tracking
CREATE TABLE public.financial_summary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  month_year DATE NOT NULL, -- First day of the month for easier querying
  total_billed NUMERIC DEFAULT 0,
  total_paid NUMERIC DEFAULT 0,
  total_pending NUMERIC DEFAULT 0,
  package_revenue NUMERIC DEFAULT 0,
  individual_job_revenue NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, month_year)
);

-- Add contract storage table
CREATE TABLE public.contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  contract_type TEXT NOT NULL, -- 'package', 'individual', 'retainer'
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'sent', 'signed', 'expired'
  signed_date TIMESTAMP WITH TIME ZONE,
  expiry_date TIMESTAMP WITH TIME ZONE,
  uploaded_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.package_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for package_services
CREATE POLICY "Admins can manage package services" 
ON public.package_services FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'manager'::text, 'receptionist'::text]));

CREATE POLICY "Team members can view package services" 
ON public.package_services FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['photographer'::text, 'designer'::text, 'editor'::text]));

-- RLS Policies for package_usage
CREATE POLICY "Admins can manage package usage" 
ON public.package_usage FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'manager'::text, 'receptionist'::text]));

CREATE POLICY "Clients can view their package usage" 
ON public.package_usage FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.client_packages cp 
  JOIN public.clients c ON c.id = cp.client_id 
  JOIN public.users u ON u.email = c.email 
  WHERE cp.id = package_usage.client_package_id AND u.id = auth.uid()
));

-- RLS Policies for expense_categories
CREATE POLICY "Everyone can view expense categories" 
ON public.expense_categories FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage expense categories" 
ON public.expense_categories FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'manager'::text]));

-- RLS Policies for financial_summary
CREATE POLICY "Admins can manage financial summary" 
ON public.financial_summary FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'manager'::text, 'receptionist'::text]));

CREATE POLICY "Clients can view their financial summary" 
ON public.financial_summary FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.clients c 
  JOIN public.users u ON u.email = c.email 
  WHERE c.id = financial_summary.client_id AND u.id = auth.uid()
));

-- RLS Policies for contracts
CREATE POLICY "Admins can manage contracts" 
ON public.contracts FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'manager'::text, 'receptionist'::text]));

CREATE POLICY "Clients can view their contracts" 
ON public.contracts FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.clients c 
  JOIN public.users u ON u.email = c.email 
  WHERE c.id = contracts.client_id AND u.id = auth.uid()
));

-- Add triggers for updated_at columns
CREATE TRIGGER update_package_services_updated_at
BEFORE UPDATE ON public.package_services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_summary_updated_at
BEFORE UPDATE ON public.financial_summary
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at
BEFORE UPDATE ON public.contracts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();