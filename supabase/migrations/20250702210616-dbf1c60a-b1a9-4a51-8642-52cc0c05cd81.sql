
-- Update the jobs status check constraint to include workflow statuses
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_status_check;

-- Add the updated constraint with all necessary status values
ALTER TABLE public.jobs ADD CONSTRAINT jobs_status_check 
CHECK (status IN ('pending', 'in_progress', 'review', 'completed', 'delivered', 'waiting_dependency'));
