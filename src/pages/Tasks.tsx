
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AlertCircle, RefreshCw, Calendar as CalendarIcon, Grid3X3 } from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { useUsers } from '@/hooks/useUsers';
import TasksCalendarView from '@/components/TasksCalendarView';
import TasksMatrixView from '@/components/TasksMatrixView';

const Tasks = () => {
  const { recentJobs, clients, isLoading, error, refetch } = useSupabaseData();
  const { users } = useUsers();
  const { isAdmin, isReceptionist } = useRoleAccess();
  const [viewMode, setViewMode] = useState<'matrix' | 'calendar'>('matrix');
  const [statusFilters, setStatusFilters] = useState({
    pending: true,
    in_progress: true,
    review: true,
    completed: false,
    delivered: false
  });

  const handleStatusFilterChange = (status: keyof typeof statusFilters, checked: boolean) => {
    setStatusFilters(prev => ({
      ...prev,
      [status]: checked
    }));
  };

  // Filter jobs based on selected statuses
  const filteredJobs = recentJobs.filter(job => 
    statusFilters[job.status as keyof typeof statusFilters]
  );

  // Get assignment summary for admins and receptionists
  const getAssignmentSummary = () => {
    const summary = {
      photo_session: {} as Record<string, number>,
      video_editing: {} as Record<string, number>,
      design: {} as Record<string, number>
    };

    filteredJobs.forEach(job => {
      if (job.assigned_to && job.type in summary) {
        const user = users.find(u => u.id === job.assigned_to);
        const userName = user ? user.name : 'Unknown User';
        
        if (!summary[job.type as keyof typeof summary][userName]) {
          summary[job.type as keyof typeof summary][userName] = 0;
        }
        summary[job.type as keyof typeof summary][userName]++;
      }
    });

    return summary;
  };

  const assignmentSummary = (isAdmin() || isReceptionist()) ? getAssignmentSummary() : null;

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tasks Overview</h1>
            <p className="text-gray-600 mt-2">Manage and view project tasks</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'matrix' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('matrix')}
                className="flex items-center gap-2"
              >
                <Grid3X3 className="h-4 w-4" />
                Matrix
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('calendar')}
                className="flex items-center gap-2"
              >
                <CalendarIcon className="h-4 w-4" />
                Calendar
              </Button>
            </div>
          </div>
        </div>

        {/* Status Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Status Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              {Object.entries(statusFilters).map(([status, checked]) => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox
                    id={status}
                    checked={checked}
                    onCheckedChange={(checked) => handleStatusFilterChange(status as keyof typeof statusFilters, !!checked)}
                  />
                  <Label htmlFor={status} className="text-sm font-medium capitalize">
                    {status.replace('_', ' ')}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Assignment Summary for Admins/Receptionists */}
        {assignmentSummary && (
          <Card>
            <CardHeader>
              <CardTitle>Assignment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Photo Sessions</h4>
                  {Object.keys(assignmentSummary.photo_session).length === 0 ? (
                    <p className="text-gray-500 text-sm">No assignments</p>
                  ) : (
                    <div className="space-y-1">
                      {Object.entries(assignmentSummary.photo_session).map(([photographer, count]) => (
                        <div key={photographer} className="flex justify-between text-sm">
                          <span>{photographer}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Video Production</h4>
                  {Object.keys(assignmentSummary.video_editing).length === 0 ? (
                    <p className="text-gray-500 text-sm">No assignments</p>
                  ) : (
                    <div className="space-y-1">
                      {Object.entries(assignmentSummary.video_editing).map(([editor, count]) => (
                        <div key={editor} className="flex justify-between text-sm">
                          <span>{editor}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Design Projects</h4>
                  {Object.keys(assignmentSummary.design).length === 0 ? (
                    <p className="text-gray-500 text-sm">No assignments</p>
                  ) : (
                    <div className="space-y-1">
                      {Object.entries(assignmentSummary.design).map(([designer, count]) => (
                        <div key={designer} className="flex justify-between text-sm">
                          <span>{designer}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No tasks found matching the current filters.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {viewMode === 'matrix' ? (
              <TasksMatrixView jobs={filteredJobs} clients={clients} users={users} />
            ) : (
              <TasksCalendarView jobs={filteredJobs} users={users} />
            )}
          </>
        )}

        {/* Status Legend */}
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
