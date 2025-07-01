
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Files, Upload, Download, Trash2, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface JobFile {
  id: string;
  job_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  is_final: boolean;
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [fileType, setFileType] = useState('raw');

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

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !selectedJobId) return;

    try {
      const filePath = `jobs/${selectedJobId}/${Date.now()}-${selectedFile.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('job-files')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('job_files')
        .insert([{
          job_id: selectedJobId,
          file_name: selectedFile.name,
          file_path: filePath,
          file_size: selectedFile.size,
          file_type: fileType,
          uploaded_by: userProfile?.id
        }]);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "File uploaded successfully"
      });

      setSelectedFile(null);
      setSelectedJobId('');
      fetchFiles();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive"
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const canUpload = ['admin', 'receptionist', 'photographer', 'designer', 'editor'].includes(userProfile?.role || '');

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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload size={20} />
                  Upload File
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFileUpload} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Input
                        type="file"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        required
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="Job ID"
                        value={selectedJobId}
                        onChange={(e) => setSelectedJobId(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <select
                      value={fileType}
                      onChange={(e) => setFileType(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="raw">Raw File</option>
                      <option value="final">Final File</option>
                      <option value="preview">Preview</option>
                    </select>
                  </div>
                  <Button type="submit" disabled={!selectedFile || !selectedJobId}>
                    Upload File
                  </Button>
                </form>
              </CardContent>
            </Card>
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
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{file.file_name}</h3>
                          <Badge variant={file.is_final ? "default" : "secondary"}>
                            {file.file_type}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-1">
                          Job: {file.jobs?.title || 'Unknown'}
                        </p>
                        <p className="text-gray-500 text-sm">
                          Size: {formatFileSize(file.file_size)} • 
                          Uploaded: {new Date(file.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye size={16} />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download size={16} />
                        </Button>
                        {canUpload && (
                          <Button size="sm" variant="outline">
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
