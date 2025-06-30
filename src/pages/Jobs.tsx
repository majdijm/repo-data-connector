
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import JobForm from '@/components/JobForm';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Briefcase } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  type: string;
  status: string;
  description: string;
  price: number;
  due_date: string;
  created_at: string;
}

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setJobs(data);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleJobAdded = () => {
    fetchJobs();
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

  if (isLoading) {
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
          <p className="text-gray-600 mt-2">Manage your projects and tasks</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <JobForm onJobAdded={handleJobAdded} />
          </div>
          
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="mr-2 h-5 w-5" />
                  All Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                {jobs.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No jobs found. Create your first job!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <div key={job.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{job.title}</h3>
                            <p className="text-sm text-gray-600 capitalize">{job.type.replace('_', ' ')}</p>
                            {job.description && (
                              <p className="text-sm text-gray-500 mt-1">{job.description}</p>
                            )}
                            {job.due_date && (
                              <p className="text-sm text-gray-400 mt-1">
                                Due: {new Date(job.due_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(job.status)}`}>
                              {job.status.replace('_', ' ')}
                            </span>
                            {job.price > 0 && (
                              <span className="text-sm font-medium text-green-600">
                                ${job.price}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Jobs;
