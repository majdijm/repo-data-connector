
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface Job {
  id: string;
  title: string;
  type: string;
  status: string;
  assigned_to?: string;
  due_date: string;
  session_date?: string;
  price?: number;
  client_id: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface JobCardProps {
  job: Job;
  onUpdate: () => void;
  onDelete: (jobId: string) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onUpdate, onDelete }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'photo_session': return 'Photo Session';
      case 'video_editing': return 'Video Editing';
      case 'design': return 'Design';
      default: return type;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{job.title}</CardTitle>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline">{getTypeLabel(job.type)}</Badge>
              <Badge className={getStatusColor(job.status)}>
                {job.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(job.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>Due: {format(new Date(job.due_date), 'PPP')}</span>
          </div>
          
          {job.session_date && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>Session: {format(new Date(job.session_date), 'PPP')}</span>
            </div>
          )}
          
          {job.assigned_to && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span>Assigned to: {job.assigned_to}</span>
            </div>
          )}
          
          {job.price && (
            <div className="text-lg font-semibold">
              ${job.price}
            </div>
          )}
          
          {job.description && (
            <p className="text-gray-600 mt-2">{job.description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
