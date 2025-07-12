
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Link as LinkIcon, Download, Clock } from 'lucide-react';

interface JobFile {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  created_at: string;
  is_cloud_link: boolean;
  cloud_link?: string;
  is_final: boolean;
  users?: {
    name: string;
  };
}

interface JobFilesDisplayProps {
  jobId: string;
}

const JobFilesDisplay: React.FC<JobFilesDisplayProps> = ({ jobId }) => {
  const [files, setFiles] = useState<JobFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { userProfile } = useAuth();

  const fetchFiles = async () => {
    try {
      console.log('Fetching files for job:', jobId, 'as user role:', userProfile?.role);
      
      let query = supabase
        .from('job_files')
        .select(`
          id,
          file_name,
          file_path,
          file_size,
          file_type,
          created_at,
          is_cloud_link,
          cloud_link,
          is_final,
          users (
            name
          )
        `)
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      // For clients, only show final files
      if (userProfile?.role === 'client') {
        query = query.eq('is_final', true);
        console.log('Client user - filtering for final files only');
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching files:', error);
        throw error;
      }
      
      console.log('Files fetched:', data?.length || 0, 'files for job', jobId);
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: "Error",
        description: "Failed to load files",
        variant: "destructive"
      });
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (jobId && userProfile) {
      fetchFiles();
    }
  }, [jobId, userProfile]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'final': return 'bg-green-100 text-green-800';
      case 'raw': return 'bg-blue-100 text-blue-800';
      case 'preview': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownload = async (file: JobFile) => {
    if (file.is_cloud_link && file.cloud_link) {
      window.open(file.cloud_link, '_blank');
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from('job-files')
        .download(file.file_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {userProfile?.role === 'client' ? 'Final Deliverables' : 'Job Files'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading files...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (files.length === 0) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {userProfile?.role === 'client' ? 'Final Deliverables' : 'Job Files'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">
            {userProfile?.role === 'client' 
              ? 'No final deliverables available yet. Files will appear here once the work is completed.'
              : 'No files uploaded yet.'
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {userProfile?.role === 'client' ? 'Final Deliverables' : 'Job Files'} ({files.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {files.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {file.is_cloud_link ? (
                  <LinkIcon className="h-5 w-5 text-blue-500" />
                ) : (
                  <FileText className="h-5 w-5 text-gray-500" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-sm">{file.file_name}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={getFileTypeColor(file.file_type)} variant="outline">
                      {file.file_type}
                    </Badge>
                    {file.is_final && (
                      <Badge className="bg-green-100 text-green-800" variant="outline">
                        Final
                      </Badge>
                    )}
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(file.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  {!file.is_cloud_link && (
                    <p className="text-xs text-gray-500">{formatFileSize(file.file_size)}</p>
                  )}
                  {file.users?.name && (
                    <p className="text-xs text-gray-500">Uploaded by: {file.users.name}</p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownload(file)}
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                {file.is_cloud_link ? 'Open' : 'Download'}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default JobFilesDisplay;
