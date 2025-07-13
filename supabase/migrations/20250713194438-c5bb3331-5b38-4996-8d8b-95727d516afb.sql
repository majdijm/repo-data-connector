-- Delete all job-related data in the correct order to avoid foreign key constraint issues

-- Delete activity logs related to jobs
DELETE FROM public.activity_logs WHERE resource_type = 'job';

-- Delete notifications related to jobs
DELETE FROM public.notifications WHERE related_job_id IS NOT NULL;

-- Delete feedback related to jobs
DELETE FROM public.feedback WHERE job_id IS NOT NULL;

-- Delete payments related to jobs
DELETE FROM public.payments WHERE job_id IS NOT NULL;

-- Delete job comments
DELETE FROM public.job_comments;

-- Delete job files
DELETE FROM public.job_files;

-- Delete jobs (this will cascade to any remaining dependent records)
DELETE FROM public.jobs;

-- Reset client totals since we're removing all job-related payments
UPDATE public.clients SET total_paid = 0, total_due = 0;