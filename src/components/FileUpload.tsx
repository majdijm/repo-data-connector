
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

interface FileUploadProps {
  jobId: string;
  onFileUploaded?: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ jobId, onFileUploaded }) => {
  const { session } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !session) return;

    setIsLoading(true);
    try {
      // For now, we'll just store file metadata
      // In a real implementation, you'd upload to Supabase Storage
      const { error } = await supabase
        .from('job_files')
        .insert([{
          job_id: jobId,
          file_name: file.name,
          file_path: `/uploads/${file.name}`,
          file_type: file.type,
          file_size: file.size,
          uploaded_by: session.user.id
        }]);

      if (error) throw error;

      setFile(null);
      onFileUploaded?.();
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload File</CardTitle>
        <CardDescription>Upload job-related files</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpload} className="space-y-4">
          <Input
            type="file"
            onChange={handleFileChange}
            required
          />
          <Button type="submit" disabled={isLoading || !file}>
            {isLoading ? 'Uploading...' : 'Upload File'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FileUpload;
