-- Fix security warnings by setting search_path for all functions
CREATE OR REPLACE FUNCTION public.update_job_workflow(
  job_id UUID,
  new_status TEXT,
  new_assigned_to UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Update the job with the new status and assignment
  UPDATE public.jobs 
  SET 
    status = new_status,
    assigned_to = new_assigned_to,
    updated_at = now()
  WHERE id = job_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM public.users 
    WHERE id = auth.uid()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.update_job_workflow_stage(
  job_id uuid, 
  new_stage text, 
  new_assigned_to uuid, 
  stage_notes text DEFAULT NULL::text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_history JSONB;
  new_history_entry JSONB;
BEGIN
  -- Get current workflow history
  SELECT workflow_history INTO current_history FROM public.jobs WHERE id = job_id;
  
  -- Create new history entry
  new_history_entry := jsonb_build_object(
    'stage', new_stage,
    'assigned_to', new_assigned_to,
    'completed_at', now(),
    'notes', stage_notes
  );
  
  -- Update job with new stage and assignment
  UPDATE public.jobs 
  SET 
    current_workflow_stage = new_stage,
    assigned_to = new_assigned_to,
    workflow_history = COALESCE(current_history, '[]'::jsonb) || new_history_entry,
    updated_at = now()
  WHERE id = job_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.initialize_job_workflow(job_id uuid, stages jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.jobs 
  SET 
    workflow_stages = stages,
    current_workflow_stage = (stages->0->>'stage')::text
  WHERE id = job_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Insert into users table with proper field mapping
  INSERT INTO public.users (id, email, name, role, password, is_active, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    'managed_by_auth', -- Default password since auth is handled by Supabase
    true,
    NEW.created_at
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, users.name),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

-- Clean up all data as requested
DELETE FROM public.job_files;
DELETE FROM public.job_comments;
DELETE FROM public.notifications;
DELETE FROM public.activity_logs;
DELETE FROM public.calendar_events;
DELETE FROM public.feedback;
DELETE FROM public.jobs;
DELETE FROM public.payment_requests;
DELETE FROM public.payments;
DELETE FROM public.expenses;
DELETE FROM public.salaries;
DELETE FROM public.client_packages;
DELETE FROM public.client_contracts;
DELETE FROM public.clients;

-- Clear existing users (except system users)
DELETE FROM public.users WHERE email NOT LIKE '%@supabase%';

-- Create the requested users with proper roles and password
INSERT INTO public.users (email, name, role, password, is_active, created_at) VALUES
('M.J.ZUOD@hotmail.com', 'Mohamad zyoud', 'admin', 'admin123', true, now()),
('shadenyahya04@gmail.com', 'Shaden yahya', 'receptionist', 'admin123', true, now()),
('asmaashaban03@icloud.com', 'Asmaa shaban', 'receptionist', 'admin123', true, now()),
('sanaqararya@gmail.com', 'Sana qararya', 'receptionist', 'admin123', true, now()),
('ahmadjameel2003@gmail.com', 'Ahmad zyoud', 'photographer', 'admin123', true, now()),
('Bakeradnan80@gmail.com', 'Bakr filfil', 'photographer', 'admin123', true, now()),
('batoolrabaya1@gmail.com', 'Batoul hamdan', 'editor', 'admin123', true, now()),
('hyousry875@gmail.com', 'Hazem yousry', 'designer', 'admin123', true, now())
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  password = EXCLUDED.password,
  updated_at = now();