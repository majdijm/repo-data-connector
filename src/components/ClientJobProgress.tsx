
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, AlertCircle, Calendar, ThumbsUp, Download, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { useJobWorkflow } from '@/hooks/useJobWorkflow';
import { useToast } from '@/hooks/use-toast';
import JobFilesDisplay from '@/components/JobFilesDisplay';
import JobComments from '@/components/JobComments';

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
  const { updateJobProgress, isLoading } = useJobWorkflow();
  const { toast } = useToast();

  const getStatusProgress = (status: string) => {
    const statusMap = {
      'pending': 10,
      'in_progress': 50,
      'review': 75,
      'completed': 95, // Not 100% until client accepts
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

  const handleClientAcceptance = async () => {
    try {
      await updateJobProgress(job.id, 'delivered');
      toast({
        title: "Success",
        description: "Thank you! Work has been accepted and marked as delivered."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept work. Please try again.",
        variant: "destructive"
      });
    }
  };

  const progressPercentage = getStatusProgress(job.status);
  const canAccept = job.status === 'completed';
  const isDelivered = job.status === 'delivered';
  const showFiles = ['completed', 'delivered'].includes(job.status);

  return (
    <div className="space-y-4">
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
            
            {/* Progress Status Text */}
            <div className="text-sm text-muted-foreground">
              {job.status === 'completed' && (
                <span className="text-green-600 font-medium">
                  ✓ Work completed - Awaiting your acceptance
                </span>
              )}
              {job.status === 'delivered' && (
                <span className="text-gray-600 font-medium">
                  ✓ Delivered and accepted
                </span>
              )}
              {!['completed', 'delivered'].includes(job.status) && (
                <span>In progress...</span>
              )}
            </div>
          </div>

          {/* Client Acceptance Section */}
          {canAccept && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-green-800 mb-1">Work Ready for Review</h4>
                  <p className="text-sm text-green-700 mb-3">
                    Your work has been completed and is ready for your review. Please check the final files below and accept the delivery when you're satisfied.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleClientAcceptance}
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {isLoading ? 'Processing...' : 'Accept & Complete'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delivered Confirmation */}
          {isDelivered && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-gray-600" />
                <div>
                  <h4 className="font-medium text-gray-800">Work Delivered</h4>
                  <p className="text-sm text-gray-600">
                    Thank you for your acceptance. This project has been successfully completed and delivered.
                  </p>
                </div>
              </div>
            </div>
          )}

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

      {/* Job Files - Show only for completed/delivered jobs */}
      {showFiles && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Final Deliverables</h3>
          </div>
          <JobFilesDisplay jobId={job.id} />
        </div>
      )}

      {/* Job Comments - Show handover comments for completed/delivered jobs */}
      {showFiles && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold">Handover Notes</h3>
          </div>
          <JobComments
            jobId={job.id}
            jobTitle={job.title}
            clientName={job.clients?.name}
          />
        </div>
      )}
    </div>
  );
};

export default ClientJobProgress;
