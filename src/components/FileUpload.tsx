import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Upload, Link as LinkIcon, File, X, Check } from 'lucide-react';

interface FileUploadProps {
  jobId: string;
  onUploadComplete?: () => void;
  onFileUploaded?: () => void; // Alternative prop name for compatibility
  allowedTypes?: string[];
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  jobId, 
  onUploadComplete,
  onFileUploaded,
  allowedTypes = ['image', 'video', 'document']
}) => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cloudLink, setCloudLink] = useState('');
  const [fileType, setFileType] = useState('raw');
  const [description, setDescription] = useState('');
  const [isFinal, setIsFinal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setCloudLink(''); // Clear cloud link if file is selected
    }
  };

  const handleCloudLinkChange = (value: string) => {
    setCloudLink(value);
    if (value.trim()) {
      setSelectedFile(null); // Clear file if cloud link is provided
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const uploadFile = async () => {
    if (!selectedFile || !userProfile) return null;

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${jobId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('job-files')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      return {
        file_name: selectedFile.name,
        file_path: fileName,
        file_size: selectedFile.size,
        file_type: fileType,
        is_cloud_link: false,
        cloud_link: null,
        is_final: isFinal,
        job_id: jobId,
        uploaded_by: userProfile.id
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile && !cloudLink.trim()) {
      toast({
        title: "Error",
        description: "Please select a file or provide a cloud link",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      let fileData;

      if (selectedFile) {
        fileData = await uploadFile();
      } else if (cloudLink.trim()) {
        // Handle cloud link
        const linkFileName = cloudLink.split('/').pop() || 'Cloud Link';
        fileData = {
          file_name: linkFileName,
          file_path: cloudLink,
          file_size: 0,
          file_type: fileType,
          is_cloud_link: true,
          cloud_link: cloudLink,
          is_final: isFinal,
          job_id: jobId,
          uploaded_by: userProfile?.id
        };
      }

      if (!fileData) {
        throw new Error('Failed to prepare file data');
      }

      // Save file record to database
      const { error: dbError } = await supabase
        .from('job_files')
        .insert([fileData]);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: `${selectedFile ? 'File uploaded' : 'Link added'} successfully`
      });

      // Reset form
      setSelectedFile(null);
      setCloudLink('');
      setFileType('raw');
      setDescription('');
      setIsFinal(false);
      
      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      // Call callback if provided
      const callback = onUploadComplete || onFileUploaded;
      if (callback) {
        callback();
      }

    } catch (error) {
      console.error('Error uploading:', error);
      toast({
        title: "Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* File Upload */}
        <div className="space-y-2">
          <Label htmlFor="file-input">Upload File</Label>
          <Input
            id="file-input"
            type="file"
            onChange={handleFileChange}
            accept="image/*,video/*,.pdf,.doc,.docx,.zip,.rar"
            disabled={isUploading}
          />
          {selectedFile && (
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                <File className="h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={removeFile}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Cloud Link */}
        <div className="space-y-2">
          <Label htmlFor="cloud-link">Or Cloud Drive Link</Label>
          <div className="flex gap-2">
            <LinkIcon className="h-4 w-4 mt-3 text-gray-500" />
            <Input
              id="cloud-link"
              value={cloudLink}
              onChange={(e) => handleCloudLinkChange(e.target.value)}
              placeholder="https://drive.google.com/... or Dropbox link"
              disabled={isUploading}
            />
          </div>
        </div>

        {/* File Type */}
        <div className="space-y-2">
          <Label>File Type</Label>
          <Select value={fileType} onValueChange={setFileType}>
            <SelectTrigger>
              <SelectValue placeholder="Select file type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="raw">Raw Files</SelectItem>
              <SelectItem value="preview">Preview</SelectItem>
              <SelectItem value="final">Final Deliverable</SelectItem>
              <SelectItem value="working">Work in Progress</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Final Deliverable Checkbox */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is-final"
            checked={isFinal}
            onCheckedChange={(checked) => setIsFinal(!!checked)}
            disabled={isUploading}
          />
          <Label htmlFor="is-final" className="text-sm">
            Mark as final deliverable (visible to client)
          </Label>
        </div>

        <Button 
          type="submit" 
          disabled={(!selectedFile && !cloudLink.trim()) || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Uploading...
            </>
          ) : (
            <>
              {selectedFile ? <Upload className="h-4 w-4 mr-2" /> : <LinkIcon className="h-4 w-4 mr-2" />}
              {selectedFile ? 'Upload File' : 'Add Link'}
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default FileUpload;