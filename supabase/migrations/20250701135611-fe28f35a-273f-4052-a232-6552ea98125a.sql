
-- Check and add foreign key constraints only if they don't exist
DO $$ 
BEGIN
    -- Add jobs_client_id_fkey if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'jobs_client_id_fkey' 
        AND table_name = 'jobs'
    ) THEN
        ALTER TABLE public.jobs 
        ADD CONSTRAINT jobs_client_id_fkey 
        FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;
    END IF;

    -- Add jobs_assigned_to_fkey if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'jobs_assigned_to_fkey' 
        AND table_name = 'jobs'
    ) THEN
        ALTER TABLE public.jobs 
        ADD CONSTRAINT jobs_assigned_to_fkey 
        FOREIGN KEY (assigned_to) REFERENCES public.users(id) ON DELETE SET NULL;
    END IF;

    -- Add jobs_created_by_fkey if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'jobs_created_by_fkey' 
        AND table_name = 'jobs'
    ) THEN
        ALTER TABLE public.jobs 
        ADD CONSTRAINT jobs_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;
    END IF;

    -- Add payments_job_id_fkey if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'payments_job_id_fkey' 
        AND table_name = 'payments'
    ) THEN
        ALTER TABLE public.payments 
        ADD CONSTRAINT payments_job_id_fkey 
        FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;
    END IF;

    -- Add payments_client_id_fkey if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'payments_client_id_fkey' 
        AND table_name = 'payments'
    ) THEN
        ALTER TABLE public.payments 
        ADD CONSTRAINT payments_client_id_fkey 
        FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;
    END IF;

    -- Add payments_received_by_fkey if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'payments_received_by_fkey' 
        AND table_name = 'payments'
    ) THEN
        ALTER TABLE public.payments 
        ADD CONSTRAINT payments_received_by_fkey 
        FOREIGN KEY (received_by) REFERENCES public.users(id) ON DELETE SET NULL;
    END IF;

    -- Add job_files_job_id_fkey if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'job_files_job_id_fkey' 
        AND table_name = 'job_files'
    ) THEN
        ALTER TABLE public.job_files 
        ADD CONSTRAINT job_files_job_id_fkey 
        FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;
    END IF;

    -- Add job_files_uploaded_by_fkey if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'job_files_uploaded_by_fkey' 
        AND table_name = 'job_files'
    ) THEN
        ALTER TABLE public.job_files 
        ADD CONSTRAINT job_files_uploaded_by_fkey 
        FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE SET NULL;
    END IF;

    -- Add notifications_user_id_fkey if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'notifications_user_id_fkey' 
        AND table_name = 'notifications'
    ) THEN
        ALTER TABLE public.notifications 
        ADD CONSTRAINT notifications_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;

    -- Add activity_logs_user_id_fkey if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'activity_logs_user_id_fkey' 
        AND table_name = 'activity_logs'
    ) THEN
        ALTER TABLE public.activity_logs 
        ADD CONSTRAINT activity_logs_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;

    -- Add feedback_job_id_fkey if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'feedback_job_id_fkey' 
        AND table_name = 'feedback'
    ) THEN
        ALTER TABLE public.feedback 
        ADD CONSTRAINT feedback_job_id_fkey 
        FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;
    END IF;

    -- Add feedback_client_id_fkey if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'feedback_client_id_fkey' 
        AND table_name = 'feedback'
    ) THEN
        ALTER TABLE public.feedback 
        ADD CONSTRAINT feedback_client_id_fkey 
        FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Drop existing generic RLS policies (ignore errors if they don't exist)
DROP POLICY IF EXISTS "Authenticated users can access clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can access jobs" ON public.jobs;
DROP POLICY IF EXISTS "Authenticated users can access job_files" ON public.job_files;
DROP POLICY IF EXISTS "Authenticated users can access payments" ON public.payments;
DROP POLICY IF EXISTS "Authenticated users can access notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users can access activity_logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Authenticated users can access feedback" ON public.feedback;

-- Create helper function to get current user's role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM public.users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Clients RLS policies
CREATE POLICY "Admins can manage all clients" ON public.clients
FOR ALL USING (public.get_current_user_role() IN ('admin'));

CREATE POLICY "Receptionists can manage all clients" ON public.clients
FOR ALL USING (public.get_current_user_role() IN ('receptionist'));

CREATE POLICY "Team members can view clients" ON public.clients
FOR SELECT USING (public.get_current_user_role() IN ('photographer', 'designer', 'editor'));

-- Jobs RLS policies
CREATE POLICY "Admins can manage all jobs" ON public.jobs
FOR ALL USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Receptionists can manage all jobs" ON public.jobs
FOR ALL USING (public.get_current_user_role() = 'receptionist');

CREATE POLICY "Team members can view assigned jobs" ON public.jobs
FOR SELECT USING (
    public.get_current_user_role() IN ('photographer', 'designer', 'editor') 
    AND assigned_to = auth.uid()
);

CREATE POLICY "Team members can update assigned jobs" ON public.jobs
FOR UPDATE USING (
    public.get_current_user_role() IN ('photographer', 'designer', 'editor') 
    AND assigned_to = auth.uid()
);

-- Job Files RLS policies
CREATE POLICY "Admins can manage all job files" ON public.job_files
FOR ALL USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Receptionists can manage all job files" ON public.job_files
FOR ALL USING (public.get_current_user_role() = 'receptionist');

CREATE POLICY "Team members can manage files for assigned jobs" ON public.job_files
FOR ALL USING (
    public.get_current_user_role() IN ('photographer', 'designer', 'editor') 
    AND EXISTS (
        SELECT 1 FROM public.jobs 
        WHERE jobs.id = job_files.job_id 
        AND jobs.assigned_to = auth.uid()
    )
);

-- Payments RLS policies
CREATE POLICY "Admins can manage all payments" ON public.payments
FOR ALL USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Receptionists can manage all payments" ON public.payments
FOR ALL USING (public.get_current_user_role() = 'receptionist');

CREATE POLICY "Team members can view payments for assigned jobs" ON public.payments
FOR SELECT USING (
    public.get_current_user_role() IN ('photographer', 'designer', 'editor') 
    AND EXISTS (
        SELECT 1 FROM public.jobs 
        WHERE jobs.id = payments.job_id 
        AND jobs.assigned_to = auth.uid()
    )
);

-- Notifications RLS policies
CREATE POLICY "Users can manage their own notifications" ON public.notifications
FOR ALL USING (user_id = auth.uid());

-- Activity Logs RLS policies
CREATE POLICY "Admins can view all activity logs" ON public.activity_logs
FOR SELECT USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Users can insert their own activity logs" ON public.activity_logs
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Feedback RLS policies
CREATE POLICY "Admins can manage all feedback" ON public.feedback
FOR ALL USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Receptionists can manage all feedback" ON public.feedback
FOR ALL USING (public.get_current_user_role() = 'receptionist');

CREATE POLICY "Team members can view feedback for assigned jobs" ON public.feedback
FOR SELECT USING (
    public.get_current_user_role() IN ('photographer', 'designer', 'editor') 
    AND EXISTS (
        SELECT 1 FROM public.jobs 
        WHERE jobs.id = feedback.job_id 
        AND jobs.assigned_to = auth.uid()
    )
);
