-- Add manager role to the users table
-- Update the role check constraint if it exists, or add validation

-- First, let's add the manager role option by updating any existing role constraints
-- We need to check if there are existing constraints on the role field

-- Add manager role support to existing role-based policies
CREATE POLICY "Managers can view all users" 
ON public.users 
FOR SELECT 
USING (get_current_user_role() = 'manager');

CREATE POLICY "Managers can manage all clients" 
ON public.clients 
FOR ALL 
USING (get_current_user_role() = 'manager');

CREATE POLICY "Managers can manage all jobs" 
ON public.jobs 
FOR ALL 
USING (get_current_user_role() = 'manager');

CREATE POLICY "Managers can manage all payments" 
ON public.payments 
FOR ALL 
USING (get_current_user_role() = 'manager');

CREATE POLICY "Managers can manage all payment requests" 
ON public.payment_requests 
FOR ALL 
USING (get_current_user_role() = 'manager');

CREATE POLICY "Managers can manage all packages" 
ON public.packages 
FOR ALL 
USING (get_current_user_role() = 'manager');

CREATE POLICY "Managers can manage all client packages" 
ON public.client_packages 
FOR ALL 
USING (get_current_user_role() = 'manager');

CREATE POLICY "Managers can manage all job files" 
ON public.job_files 
FOR ALL 
USING (get_current_user_role() = 'manager');

CREATE POLICY "Managers can manage all expenses" 
ON public.expenses 
FOR ALL 
USING (get_current_user_role() = 'manager');

CREATE POLICY "Managers can view all activity logs" 
ON public.activity_logs 
FOR SELECT 
USING (get_current_user_role() = 'manager');

-- Create attendance table for employee check-in/check-out
CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  check_in_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  check_out_time TIMESTAMP WITH TIME ZONE,
  work_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on attendance table
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Create policies for attendance
CREATE POLICY "Users can manage their own attendance" 
ON public.attendance 
FOR ALL 
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all attendance" 
ON public.attendance 
FOR ALL 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Managers can view all attendance" 
ON public.attendance 
FOR SELECT 
USING (get_current_user_role() = 'manager');

CREATE POLICY "Receptionists can view all attendance" 
ON public.attendance 
FOR SELECT 
USING (get_current_user_role() = 'receptionist');

-- Add unique constraint to prevent multiple check-ins on same date
ALTER TABLE public.attendance ADD CONSTRAINT unique_user_date_checkin 
UNIQUE (user_id, work_date);

-- Add trigger to update timestamps
CREATE TRIGGER update_attendance_updated_at
BEFORE UPDATE ON public.attendance
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();