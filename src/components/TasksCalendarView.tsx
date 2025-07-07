
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  type: string;
  status: string;
  due_date: string | null;
  client_id: string | null;
  assigned_to: string | null;
  clients?: {
    name: string;
  };
}

interface TasksCalendarViewProps {
  jobs: Job[];
  users: any[];
}

const TasksCalendarView: React.FC<TasksCalendarViewProps> = ({ jobs, users }) => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());

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

  const getUserName = (userId: string | null) => {
    if (!userId) return 'Unassigned';
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  };

  // Get jobs for selected date
  const getJobsForDate = (date: Date) => {
    return jobs.filter(job => {
      if (!job.due_date) return false;
      const jobDate = new Date(job.due_date);
      return jobDate.toDateString() === date.toDateString();
    });
  };

  // Get dates that have jobs
  const getDatesWithJobs = () => {
    return jobs
      .filter(job => job.due_date)
      .map(job => new Date(job.due_date!));
  };

  const selectedDateJobs = selectedDate ? getJobsForDate(selectedDate) : [];
  const datesWithJobs = getDatesWithJobs();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>Calendar View</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            modifiers={{
              hasJobs: datesWithJobs
            }}
            modifiersStyles={{
              hasJobs: { 
                backgroundColor: '#3b82f6', 
                color: 'white',
                fontWeight: 'bold'
              }
            }}
          />
          <div className="mt-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Dates with scheduled tasks</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedDate ? selectedDate.toLocaleDateString() : 'Select a Date'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDateJobs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No tasks scheduled for this date
            </p>
          ) : (
            <div className="space-y-4">
              {selectedDateJobs.map(job => (
                <div 
                  key={job.id} 
                  className="border rounded-lg p-4 bg-gray-50 cursor-pointer hover:bg-blue-50 transition-colors"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{job.title}</h4>
                    <Badge className={`text-xs ${getStatusColor(job.status)}`}>
                      {job.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      <span>Client: {job.clients?.name || 'No client'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>Type: {job.type.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      <span>Assigned: {getUserName(job.assigned_to)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TasksCalendarView;
