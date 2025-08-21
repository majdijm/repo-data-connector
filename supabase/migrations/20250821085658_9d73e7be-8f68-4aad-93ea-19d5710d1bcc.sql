
-- Add the missing session_date column to the jobs table
ALTER TABLE public.jobs 
ADD COLUMN session_date timestamp with time zone;
