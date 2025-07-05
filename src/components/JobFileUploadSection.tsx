
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface JobFileUploadSectionProps {
  selectedFile: File | null;
  fileLink: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileLinkChange: (value: string) => void;
  onRemoveFile: () => void;
}

const JobFileUploadSection: React.FC<JobFileUploadSectionProps> = ({
  selectedFile,
  fileLink,
  onFileChange,
  onFileLinkChange,
  onRemoveFile
}) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-3">
      <Label>Attach Files or Links (Optional)</Label>
      
      <div>
        <Label htmlFor="file" className="text-sm">Upload File</Label>
        <Input
          id="file"
          type="file"
          onChange={onFileChange}
          accept="image/*,video/*,.pdf,.doc,.docx,.zip,.rar"
        />
        {selectedFile && (
          <div className="mt-2 flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="flex-1">
              <p className="text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={onRemoveFile}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="fileLink" className="text-sm">Cloud Drive Link</Label>
        <Input
          id="fileLink"
          value={fileLink}
          onChange={(e) => onFileLinkChange(e.target.value)}
          placeholder="https://drive.google.com/... or https://dropbox.com/..."
        />
      </div>
    </div>
  );
};

export default JobFileUploadSection;
