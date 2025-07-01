
-- Create packages table
CREATE TABLE public.packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  duration_months INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create client_packages table to assign packages to clients
CREATE TABLE public.client_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, package_id, start_date)
);

-- Add package-related columns to jobs table
ALTER TABLE public.jobs ADD COLUMN package_included BOOLEAN DEFAULT false;
ALTER TABLE public.jobs ADD COLUMN extra_cost NUMERIC DEFAULT 0;
ALTER TABLE public.jobs ADD COLUMN extra_cost_reason TEXT;

-- Add Row Level Security to packages table
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

-- Packages policies - admins and receptionists can manage
CREATE POLICY "Admins can manage all packages"
  ON public.packages
  FOR ALL
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Receptionists can manage all packages"
  ON public.packages
  FOR ALL
  USING (get_current_user_role() = 'receptionist');

CREATE POLICY "Team members can view packages"
  ON public.packages
  FOR SELECT
  USING (get_current_user_role() = ANY(ARRAY['photographer', 'designer', 'editor']));

-- Add Row Level Security to client_packages table
ALTER TABLE public.client_packages ENABLE ROW LEVEL SECURITY;

-- Client packages policies
CREATE POLICY "Admins can manage all client packages"
  ON public.client_packages
  FOR ALL
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Receptionists can manage all client packages"
  ON public.client_packages
  FOR ALL
  USING (get_current_user_role() = 'receptionist');

CREATE POLICY "Team members can view client packages"
  ON public.client_packages
  FOR SELECT
  USING (get_current_user_role() = ANY(ARRAY['photographer', 'designer', 'editor']));

-- Insert default packages
INSERT INTO public.packages (name, description, price, duration_months) VALUES
('Monthly Package', 'Basic monthly photography package', 300, 1),
('3 Month Standard', 'Standard 3-month photography package', 700, 3),
('3 Month Premium', 'Premium 3-month photography package with extras', 2000, 3),
('6 Month Package', '6-month comprehensive photography package', 2000, 6);
