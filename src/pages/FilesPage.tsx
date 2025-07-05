import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Files, Upload, Download, Trash2, Eye, FileText, Image, Video } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import FileUpload from '@/components/FileUpload';

interface JobFile {
  id: string;
  job_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  is_final: boolean;
  is_cloud_link: boolean;
  cloud_link: string | null;
  created_at: string;
  uploaded_by: string;
  jobs?: {
    title: string;
  };
}

const FilesPage = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<JobFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [jobs, setJobs] = useState<any[]>([]);

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('job_files')
        .select(`
          *,
          jobs (
            title
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: "Error",
        description: "Failed to fetch files",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('id, title')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  useEffect(() => {
    fetchFiles();
    fetchJobs();
  }, []);

  const downloadFile = async (file: JobFile) => {
    try {
      // Handle cloud links differently
      if (file.is_cloud_link && file.cloud_link) {
        window.open(file.cloud_link, '_blank');
        toast({
          title: "Success",
          description: "Cloud link opened in new tab"
        });
        return;
      }

      // Handle regular file downloads
      const { data, error } = await supabase.storage
        .from('job-files')
        .download(file.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "File downloaded successfully"
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive"
      });
    }
  };

  const deleteFile = async (file: JobFile) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      // For cloud links, only delete the database record
      if (!file.is_cloud_link) {
        // Delete from storage only if it's not a cloud link
        const { error: storageError } = await supabase.storage
          .from('job-files')
          .remove([file.file_path]);

        if (storageError) throw storageError;
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('job_files')
        .delete()
        .eq('id', file.id);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "File deleted successfully"
      });

      fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive"
      });
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return <Image size={20} className="text-blue-500" />;
    }
    if (['mp4', 'avi', 'mov', 'wmv'].includes(ext || '')) {
      return <Video size={20} className="text-red-500" />;
    }
    return <FileText size={20} className="text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const canUpload = ['admin', 'receptionist', 'photographer', 'designer', 'editor'].includes(userProfile?.role || '');
  const canDelete = ['admin', 'receptionist'].includes(userProfile?.role || '');

  return (
    <ProtectedRoute requiredRoles={['admin', 'receptionist', 'photographer', 'designer', 'editor']}>
      <DashboardLayout>
        <div className="space-y-8">
          <div className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <Files size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">File Management</h1>
                <p className="text-teal-100 mt-1">Manage project files and assets</p>
              </div>
            </div>
          </div>

          {canUpload && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Select Job for Upload</label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full p-2 border rounded-md mb-4"
                >
                  <option value="">Select a job...</option>
                  {jobs.map(job => (
                    <option key={job.id} value={job.id}>{job.title}</option>
                  ))}
                </select>
              </div>
              {selectedJobId && (
                <FileUpload 
                  jobId={selectedJobId} 
                  onFileUploaded={fetchFiles}
                />
              )}
            </div>
          )}

          <div className="grid gap-4">
            <h2 className="text-2xl font-bold">Project Files</h2>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              </div>
            ) : files.length > 0 ? (
              files.map(file => (
                <Card key={file.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {file.is_cloud_link ? (
                          <div className="flex items-center justify-center w-5 h-5 bg-blue-100 rounded">
                            <span className="text-xs text-blue-600">🔗</span>
                          </div>
                        ) : (
                          getFileIcon(file.file_name)
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{file.file_name}</h3>
                            <Badge variant={file.is_final ? "default" : "secondary"}>
                              {file.file_type}
                            </Badge>
                            {file.is_cloud_link && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                Cloud Link
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mb-1">
                            Job: {file.jobs?.title || 'Unknown'}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {!file.is_cloud_link && `Size: ${formatFileSize(file.file_size)} • `}
                            Uploaded: {new Date(file.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => downloadFile(file)}
                        >
                          <Download size={16} />
                        </Button>
                        {canDelete && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => deleteFile(file)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Files size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No files found.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default FilesPage;
