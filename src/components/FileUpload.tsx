
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Link, Cloud } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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
  const [cloudLink, setCloudLink] = useState('');
  const [cloudDescription, setCloudDescription] = useState('');
  const [uploadType, setUploadType] = useState<'file' | 'link'>('file');

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
    if (!user) return;

    if (uploadType === 'file' && files.length === 0) {
      toast({
        title: "Error",
        description: "Please select files to upload",
        variant: "destructive"
      });
      return;
    }

    if (uploadType === 'link' && !cloudLink.trim()) {
      toast({
        title: "Error",
        description: "Please enter a cloud storage link",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      if (uploadType === 'link') {
        // Save cloud link to database
        const { error: dbError } = await supabase
          .from('job_files')
          .insert([{
            job_id: jobId,
            file_name: cloudDescription || 'Cloud Storage Link',
            file_path: cloudLink,
            file_size: 0,
            file_type: fileType,
            uploaded_by: user.id,
            cloud_link: cloudLink,
            is_cloud_link: true
          }]);

        if (dbError) throw dbError;

        toast({
          title: "Success",
          description: "Cloud storage link added successfully"
        });

        setCloudLink('');
        setCloudDescription('');
      } else {
        // Handle file uploads
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
              uploaded_by: user.id,
              is_cloud_link: false
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
      }

      onFileUploaded?.();
    } catch (error) {
      console.error('Error uploading:', error);
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
          Upload Files or Add Cloud Links
        </CardTitle>
        <CardDescription>Upload job-related files or add links to cloud storage (Google Drive, OneDrive, Mega, etc.)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Upload Type Selection */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={uploadType === 'file' ? 'default' : 'outline'}
              onClick={() => setUploadType('file')}
              className="flex items-center gap-2"
            >
              <Upload size={16} />
              Upload Files
            </Button>
            <Button
              type="button"
              variant={uploadType === 'link' ? 'default' : 'outline'}
              onClick={() => setUploadType('link')}
              className="flex items-center gap-2"
            >
              <Cloud size={16} />
              Cloud Link
            </Button>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            {uploadType === 'file' ? (
              <div>
                <Input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  accept="image/*,video/*,.pdf,.zip,.rar,.psd,.ai"
                  className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="cloudLink">Cloud Storage Link</Label>
                  <Input
                    id="cloudLink"
                    type="url"
                    value={cloudLink}
                    onChange={(e) => setCloudLink(e.target.value)}
                    placeholder="https://drive.google.com/... or https://mega.nz/..."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cloudDescription">Description (Optional)</Label>
                  <Input
                    id="cloudDescription"
                    value={cloudDescription}
                    onChange={(e) => setCloudDescription(e.target.value)}
                    placeholder="e.g., Final Photos, Raw Files, etc."
                  />
                </div>
              </div>
            )}
            
            <div>
              <Label htmlFor="fileType">File Type</Label>
              <select
                id="fileType"
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

            {uploadType === 'file' && files.length > 0 && (
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

            <Button 
              type="submit" 
              disabled={isUploading || (uploadType === 'file' && files.length === 0) || (uploadType === 'link' && !cloudLink.trim())} 
              className="w-full"
            >
              {isUploading ? 'Processing...' : 
                uploadType === 'file' ? `Upload ${files.length} File(s)` : 'Add Cloud Link'}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUpload;
