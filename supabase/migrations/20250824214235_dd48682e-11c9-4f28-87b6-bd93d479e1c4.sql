-- Create storage bucket for job files if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('job-files', 'job-files', false)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for job-files storage bucket
CREATE POLICY "Team members can upload files for assigned jobs" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'job-files' AND 
  (get_current_user_role() = ANY (ARRAY['admin'::text, 'manager'::text, 'receptionist'::text, 'photographer'::text, 'designer'::text, 'editor'::text, 'ads_manager'::text]))
);

CREATE POLICY "Team members can view files for jobs" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'job-files' AND 
  (get_current_user_role() = ANY (ARRAY['admin'::text, 'manager'::text, 'receptionist'::text, 'photographer'::text, 'designer'::text, 'editor'::text, 'ads_manager'::text, 'client'::text]))
);

CREATE POLICY "Admins can manage all job files" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'job-files' AND 
  (get_current_user_role() = ANY (ARRAY['admin'::text, 'manager'::text, 'receptionist'::text]))
);