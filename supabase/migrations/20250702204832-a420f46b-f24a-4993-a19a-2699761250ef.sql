
-- Add workflow support columns to jobs table
ALTER TABLE public.jobs 
ADD COLUMN workflow_stage TEXT,
ADD COLUMN workflow_order INTEGER,
ADD COLUMN depends_on_job_id UUID REFERENCES public.jobs(id);

-- Add index for better performance on workflow queries
CREATE INDEX idx_jobs_depends_on ON public.jobs(depends_on_job_id);
CREATE INDEX idx_jobs_workflow_stage ON public.jobs(workflow_stage);

-- Add related_job_id column to notifications table for job-related notifications
ALTER TABLE public.notifications 
ADD COLUMN related_job_id UUID REFERENCES public.jobs(id);

-- Add index for job-related notifications
CREATE INDEX idx_notifications_related_job ON public.notifications(related_job_id);

-- Update existing jobs to have default workflow values
UPDATE public.jobs SET workflow_stage = type, workflow_order = 1 WHERE workflow_stage IS NULL;
