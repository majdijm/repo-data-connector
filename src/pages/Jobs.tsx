import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Plus, Calendar, User, DollarSign } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import JobForm from '@/components/JobForm';

interface Job {
  id: number;
  title: string;
  type: string;
  status: string;
  client_name: string;
  assigned_to_name: string;
  due_date: string;
  session_date?: string;
  description: string;
  price?: number;
  created_at: string;
}

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJobForm, setShowJobForm] = useState(false);
  const { apiCall } = useApi();
  const { user } = useAuth();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const data = await apiCall('/jobs');
      setJobs(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch jobs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      review: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      delivered: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      photo_session: 'Photo Session',
      video_editing: 'Video Editing',
      design: 'Design'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const canCreateJobs = ['admin', 'receptionist'].includes(user?.role || '');

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Jobs Management</h1>
            <p className="text-gray-600 mt-2">View and manage all jobs and assignments</p>
          </div>
          {canCreateJobs && (
            <Dialog open={showJobForm} onOpenChange={setShowJobForm}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Job
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <JobForm
                  onJobCreated={() => {
                    setShowJobForm(false);
                    fetchJobs();
                  }}
                  onCancel={() => setShowJobForm(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              All Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new job.</p>
                {canCreateJobs && (
                  <div className="mt-6">
                    <Button onClick={() => setShowJobForm(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Job
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div key={job.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium text-gray-900">{job.title}</h3>
                          <Badge className={getStatusColor(job.status)}>
                            {job.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline">
                            {getTypeLabel(job.type)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <User className="mr-1 h-4 w-4" />
                            Client: {job.client_name}
                          </div>
                          
                          {job.assigned_to_name && (
                            <div className="flex items-center">
                              <User className="mr-1 h-4 w-4" />
                              Assigned: {job.assigned_to_name}
                            </div>
                          )}
                          
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4" />
                            Due: {new Date(job.due_date).toLocaleDateString()}
                          </div>
                          
                          {job.session_date && (
                            <div className="flex items-center">
                              <Calendar className="mr-1 h-4 w-4" />
                              Session: {new Date(job.session_date).toLocaleDateString()}
                            </div>
                          )}
                          
                          {job.price && (
                            <div className="flex items-center">
                              <DollarSign className="mr-1 h-4 w-4" />
                              ${job.price.toLocaleString()}
                            </div>
                          )}
                        </div>
                        
                        {job.description && (
                          <p className="text-sm text-gray-500 mt-2">{job.description}</p>
                        )}
                      </div>
                      
                      <div className="ml-4">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Jobs;