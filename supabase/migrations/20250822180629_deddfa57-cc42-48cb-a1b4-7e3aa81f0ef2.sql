-- Create session payments table for employee out-session tracking
CREATE TABLE public.session_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  session_count INTEGER NOT NULL DEFAULT 1,
  rate_per_session NUMERIC(10,2) NOT NULL,
  total_amount NUMERIC(10,2) GENERATED ALWAYS AS (session_count * rate_per_session) STORED,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  approved_by UUID REFERENCES public.users(id),
  approved_at TIMESTAMPTZ,
  month_year DATE NOT NULL, -- First day of the month this payment belongs to
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT
);

-- Create monthly salaries table for recurring salary management
CREATE TABLE public.monthly_salaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  month_year DATE NOT NULL, -- First day of the month
  base_salary NUMERIC(10,2) NOT NULL,
  session_payments_total NUMERIC(10,2) DEFAULT 0,
  bonuses NUMERIC(10,2) DEFAULT 0,
  deductions NUMERIC(10,2) DEFAULT 0,
  total_salary NUMERIC(10,2) GENERATED ALWAYS AS (base_salary + COALESCE(session_payments_total, 0) + COALESCE(bonuses, 0) - COALESCE(deductions, 0)) STORED,
  payment_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'paid')),
  processed_by UUID REFERENCES public.users(id),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  UNIQUE(user_id, month_year)
);

-- Create monthly financial summary table
CREATE TABLE public.monthly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month_year DATE NOT NULL UNIQUE, -- First day of the month
  total_revenue NUMERIC(12,2) DEFAULT 0,
  total_expenses NUMERIC(12,2) DEFAULT 0,
  total_salaries NUMERIC(12,2) DEFAULT 0,
  total_session_payments NUMERIC(12,2) DEFAULT 0,
  net_profit NUMERIC(12,2) GENERATED ALWAYS AS (COALESCE(total_revenue, 0) - COALESCE(total_expenses, 0) - COALESCE(total_salaries, 0) - COALESCE(total_session_payments, 0)) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.session_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for session_payments
CREATE POLICY "Users can manage their own session payments" 
ON public.session_payments 
FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Admins and managers can manage all session payments" 
ON public.session_payments 
FOR ALL
USING (get_current_user_role() = ANY (ARRAY['admin', 'manager', 'receptionist']));

-- RLS Policies for monthly_salaries
CREATE POLICY "Users can view their own monthly salaries" 
ON public.monthly_salaries 
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins and managers can manage all monthly salaries" 
ON public.monthly_salaries 
FOR ALL
USING (get_current_user_role() = ANY (ARRAY['admin', 'manager', 'receptionist']));

-- RLS Policies for monthly_reports
CREATE POLICY "Admins and managers can manage monthly reports" 
ON public.monthly_reports 
FOR ALL
USING (get_current_user_role() = ANY (ARRAY['admin', 'manager']));

-- Create triggers for updated_at
CREATE TRIGGER update_session_payments_updated_at
BEFORE UPDATE ON public.session_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_monthly_salaries_updated_at
BEFORE UPDATE ON public.monthly_salaries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_monthly_reports_updated_at
BEFORE UPDATE ON public.monthly_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update monthly salary with session payments
CREATE OR REPLACE FUNCTION public.update_monthly_salary_session_payments()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  session_total NUMERIC;
BEGIN
  -- Calculate total approved session payments for the month
  SELECT COALESCE(SUM(total_amount), 0) INTO session_total
  FROM session_payments 
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
    AND month_year = COALESCE(NEW.month_year, OLD.month_year)
    AND status = 'approved';
  
  -- Update or insert monthly salary record
  INSERT INTO monthly_salaries (user_id, month_year, base_salary, session_payments_total)
  SELECT 
    COALESCE(NEW.user_id, OLD.user_id),
    COALESCE(NEW.month_year, OLD.month_year),
    COALESCE(s.base_salary, 0),
    session_total
  FROM salaries s 
  WHERE s.user_id = COALESCE(NEW.user_id, OLD.user_id)
  ORDER BY s.effective_date DESC
  LIMIT 1
  ON CONFLICT (user_id, month_year) 
  DO UPDATE SET 
    session_payments_total = session_total,
    updated_at = now();
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger to update monthly salary when session payments change
CREATE TRIGGER update_monthly_salary_on_session_change
AFTER INSERT OR UPDATE OR DELETE ON public.session_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_monthly_salary_session_payments();

-- Function to create notifications for payments
CREATE OR REPLACE FUNCTION public.create_payment_notifications()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  client_user_id UUID;
  admin_users RECORD;
BEGIN
  -- Get client user ID if exists
  IF NEW.client_id IS NOT NULL THEN
    SELECT u.id INTO client_user_id
    FROM users u
    JOIN clients c ON c.email = u.email
    WHERE c.id = NEW.client_id;
  END IF;
  
  -- Notify client if user account exists
  IF client_user_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, message, related_job_id)
    VALUES (
      client_user_id,
      'Payment Recorded',
      'A payment of $' || NEW.amount || ' has been recorded for your account.',
      NEW.job_id
    );
  END IF;
  
  -- Notify all admin and receptionist users
  FOR admin_users IN 
    SELECT id FROM users WHERE role IN ('admin', 'receptionist')
  LOOP
    INSERT INTO notifications (user_id, title, message, related_job_id)
    VALUES (
      admin_users.id,
      'New Payment Recorded',
      'Payment of $' || NEW.amount || ' recorded by ' || (SELECT name FROM users WHERE id = NEW.received_by),
      NEW.job_id
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Trigger for payment notifications
CREATE TRIGGER create_payment_notifications_trigger
AFTER INSERT ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.create_payment_notifications();

-- Function to create notifications for payment requests
CREATE OR REPLACE FUNCTION public.create_payment_request_notifications()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  client_user_id UUID;
  admin_users RECORD;
BEGIN
  -- Get client user ID if exists
  SELECT u.id INTO client_user_id
  FROM users u
  JOIN clients c ON c.email = u.email
  WHERE c.id = NEW.client_id;
  
  -- Notify client if user account exists
  IF client_user_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, message)
    VALUES (
      client_user_id,
      'Payment Request',
      'New payment request of $' || NEW.amount || ' - ' || COALESCE(NEW.description, 'No description'),
      NULL
    );
  END IF;
  
  -- Notify all admin and receptionist users
  FOR admin_users IN 
    SELECT id FROM users WHERE role IN ('admin', 'receptionist')
  LOOP
    INSERT INTO notifications (user_id, title, message)
    VALUES (
      admin_users.id,
      'New Payment Request',
      'Payment request of $' || NEW.amount || ' created by ' || (SELECT name FROM users WHERE id = NEW.requested_by),
      NULL
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Trigger for payment request notifications
CREATE TRIGGER create_payment_request_notifications_trigger
AFTER INSERT ON public.payment_requests
FOR EACH ROW
EXECUTE FUNCTION public.create_payment_request_notifications();