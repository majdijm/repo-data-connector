
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Upload, X } from 'lucide-react';

interface FileUploadProps {
  jobId: string;
  onFileUploaded?: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ jobId, onFileUploaded }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [fileType, setFileType] = useState('raw');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0 || !user) return;

    setIsUploading(true);
    try {
      const uploadedFiles = [];

      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `jobs/${jobId}/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('job-files')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Save file metadata to database
        const { error: dbError } = await supabase
          .from('job_files')
          .insert([{
            job_id: jobId,
            file_name: file.name,
            file_path: filePath,
            file_size: file.size,
            file_type: fileType,
            uploaded_by: user.id
          }]);

        if (dbError) throw dbError;

        uploadedFiles.push({
          name: file.name,
          path: filePath
        });
      }

      toast({
        title: "Success",
        description: `${uploadedFiles.length} file(s) uploaded successfully`
      });

      setFiles([]);
      onFileUploaded?.();
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Error",
        description: "Failed to upload files",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload size={20} />
          Upload Files
        </CardTitle>
        <CardDescription>Upload job-related files (images, videos, documents)</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <Input
              type="file"
              multiple
              onChange={handleFileChange}
              accept="image/*,video/*,.pdf,.zip,.rar,.psd,.ai"
              className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
          </div>
          
          <div>
            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="raw">Raw Files</option>
              <option value="final">Final Files</option>
              <option value="preview">Preview Files</option>
              <option value="reference">Reference Files</option>
            </select>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Selected Files:</h4>
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Button type="submit" disabled={isUploading || files.length === 0} className="w-full">
            {isUploading ? 'Uploading...' : `Upload ${files.length} File(s)`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FileUpload;
