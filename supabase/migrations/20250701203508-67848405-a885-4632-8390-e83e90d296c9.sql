
-- Create storage bucket for job files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('job-files', 'job-files', true);

-- Create storage policies for job files bucket
CREATE POLICY "Allow authenticated users to upload files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'job-files' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow users to view files" ON storage.objects
FOR SELECT USING (bucket_id = 'job-files');

CREATE POLICY "Allow file owners and admins to delete files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'job-files' AND 
  (auth.uid()::text = owner OR 
   EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'receptionist')))
);

-- Enable realtime for notifications
ALTER TABLE notifications REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE notifications;

-- Enable realtime for jobs to track status changes
ALTER TABLE jobs REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE jobs;

-- Enable realtime for job files
ALTER TABLE job_files REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE job_files;
