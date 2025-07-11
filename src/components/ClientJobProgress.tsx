
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface JobData {
  id: string;
  title: string;
  status: string;
  type: string;
  due_date: string | null;
  created_at: string;
  description: string | null;
  workflow_stage: string | null;
  workflow_order: number | null;
  price: number;
  clients?: {
    name: string;
  };
  users?: {
    name: string;
  };
}

interface ClientJobProgressProps {
  job: JobData;
}

const ClientJobProgress: React.FC<ClientJobProgressProps> = ({ job }) => {
  const getStatusProgress = (status: string) => {
    const statusMap = {
      'pending': 10,
      'in_progress': 50,
      'review': 75,
      'completed': 90,
      'delivered': 100
    };
    return statusMap[status as keyof typeof statusMap] || 0;
  };

  const getStatusColor = (status: string) => {
    const colorMap = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'in_progress': 'bg-blue-100 text-blue-800 border-blue-200',
      'review': 'bg-purple-100 text-purple-800 border-purple-200',
      'completed': 'bg-green-100 text-green-800 border-green-200',
      'delivered': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colorMap[status as keyof typeof colorMap] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'completed':
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const progressPercentage = getStatusProgress(job.status);

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{job.title}</CardTitle>
          <Badge className={`${getStatusColor(job.status)} flex items-center gap-1`}>
            {getStatusIcon(job.status)}
            {job.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Job Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground">Type</p>
            <p className="font-medium capitalize">{job.type.replace('_', ' ')}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Price</p>
            <p className="font-medium">${job.price}</p>
          </div>
          {job.due_date && (
            <div className="space-y-1">
              <p className="text-muted-foreground">Due Date</p>
              <p className="font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(job.due_date), 'PPP')}
              </p>
            </div>
          )}
          {job.users?.name && (
            <div className="space-y-1">
              <p className="text-muted-foreground">Assigned To</p>
              <p className="font-medium">{job.users.name}</p>
            </div>
          )}
        </div>

        {/* Workflow Stage */}
        {job.workflow_stage && (
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm">Current Stage</p>
            <p className="font-medium capitalize">
              {job.workflow_stage.replace('_', ' ')} 
              {job.workflow_order && ` (Step ${job.workflow_order})`}
            </p>
          </div>
        )}

        {/* Description */}
        {job.description && (
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm">Description</p>
            <p className="text-sm bg-muted p-3 rounded-lg">{job.description}</p>
          </div>
        )}

        {/* Timeline */}
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm">Created</p>
          <p className="text-sm">{format(new Date(job.created_at), 'PPP')}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientJobProgress;
