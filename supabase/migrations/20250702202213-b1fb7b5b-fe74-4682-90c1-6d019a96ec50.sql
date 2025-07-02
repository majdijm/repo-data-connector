
-- Add cloud storage link support to job_files table
ALTER TABLE public.job_files 
ADD COLUMN cloud_link TEXT,
ADD COLUMN is_cloud_link BOOLEAN DEFAULT false;

-- Update existing records to mark them as not cloud links
UPDATE public.job_files SET is_cloud_link = false WHERE is_cloud_link IS NULL;
