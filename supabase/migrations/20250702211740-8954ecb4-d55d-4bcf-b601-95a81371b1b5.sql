
-- Create the job_comments table
CREATE TABLE public.job_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.job_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for job comments
-- Admins can manage all comments
CREATE POLICY "Admins can manage all job comments" 
  ON public.job_comments 
  FOR ALL 
  USING (get_current_user_role() = 'admin');

-- Receptionists can manage all comments
CREATE POLICY "Receptionists can manage all job comments" 
  ON public.job_comments 
  FOR ALL 
  USING (get_current_user_role() = 'receptionist');

-- Team members can manage comments on their assigned jobs
CREATE POLICY "Team members can manage comments on assigned jobs" 
  ON public.job_comments 
  FOR ALL 
  USING (
    get_current_user_role() = ANY(ARRAY['photographer', 'designer', 'editor']) 
    AND EXISTS (
      SELECT 1 FROM public.jobs 
      WHERE jobs.id = job_comments.job_id 
      AND jobs.assigned_to = auth.uid()
    )
  );

-- Users can manage their own comments
CREATE POLICY "Users can manage their own comments" 
  ON public.job_comments 
  FOR ALL 
  USING (user_id = auth.uid());

-- Create index for better performance
CREATE INDEX idx_job_comments_job_id ON public.job_comments(job_id);
CREATE INDEX idx_job_comments_user_id ON public.job_comments(user_id);
