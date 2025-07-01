
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';

const Tasks = () => {
  const { recentJobs, clients, isLoading, error, refetch } = useSupabaseData();

  const jobTypes = ['photo_session', 'video_editing', 'design'] as const;
  const jobTypeLabels = {
    photo_session: 'Photo Session',
    video_editing: 'Video Editing',
    design: 'Design'
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getJobsForClientAndType = (clientId: string, jobType: string) => {
    return recentJobs.filter(job => job.client_id === clientId && job.type === jobType);
  };

  const isOverdue = (dueDateString: string | null) => {
    if (!dueDateString) return false;
    return new Date() > new Date(dueDateString);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tasks...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading tasks: {error}
            </AlertDescription>
          </Alert>
          <Button onClick={refetch} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks Overview</h1>
          <p className="text-gray-600 mt-2">Client-Job Status Matrix</p>
        </div>

        {clients.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No clients found. Add clients to see tasks.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-max">
              {/* Header Row */}
              <div className="grid grid-cols-[200px_repeat(var(--client-count),_300px)] gap-4 mb-4" style={{'--client-count': clients.length} as any}>
                <div className="font-semibold text-gray-700 flex items-center">
                  Job Types
                </div>
                {clients.map(client => (
                  <div key={client.id} className="font-semibold text-gray-700 text-center">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium">{client.name}</div>
                      <div className="text-sm text-gray-500">{client.email}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Job Type Rows */}
              {jobTypes.map(jobType => (
                <div key={jobType} className="grid grid-cols-[200px_repeat(var(--client-count),_300px)] gap-4 mb-4" style={{'--client-count': clients.length} as any}>
                  {/* Job Type Label */}
                  <div className="flex items-center justify-center bg-blue-50 rounded-lg p-4">
                    <span className="font-medium text-blue-900">{jobTypeLabels[jobType]}</span>
                  </div>

                  {/* Client Cards for this Job Type */}
                  {clients.map(client => {
                    const jobs = getJobsForClientAndType(client.id, jobType);
                    
                    return (
                      <Card key={`${client.id}-${jobType}`} className="h-full">
                        <CardContent className="p-4">
                          {jobs.length === 0 ? (
                            <div className="text-center text-gray-400 py-8">
                              <div className="text-sm">No jobs</div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {jobs.map(job => (
                                <div key={job.id} className="border rounded-lg p-3 bg-gray-50">
                                  <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-medium text-sm text-gray-900 leading-tight">
                                      {job.title}
                                    </h4>
                                    {getStatusIcon(job.status)}
                                  </div>
                                  
                                  <div className="flex items-center justify-between mb-2">
                                    <Badge className={`text-xs ${getStatusColor(job.status)}`}>
                                      {job.status.replace('_', ' ')}
                                    </Badge>
                                    {job.due_date && isOverdue(job.due_date) && job.status !== 'completed' && job.status !== 'delivered' && (
                                      <Badge variant="destructive" className="text-xs">
                                        Overdue
                                      </Badge>
                                    )}
                                  </div>

                                  <div className="space-y-1 text-xs text-gray-600">
                                    {job.due_date && (
                                      <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        Due: {new Date(job.due_date).toLocaleDateString()}
                                      </div>
                                    )}
                                    {job.assigned_to && (
                                      <div className="text-xs text-blue-600">
                                        Assigned: {job.assigned_to}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-100 text-yellow-800">pending</Badge>
                <span className="text-sm">Awaiting start</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800">in progress</Badge>
                <span className="text-sm">Currently working</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-100 text-purple-800">review</Badge>
                <span className="text-sm">Awaiting review</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800">completed</Badge>
                <span className="text-sm">Work finished</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-gray-100 text-gray-800">delivered</Badge>
                <span className="text-sm">Delivered to client</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Tasks;
