import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, User, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { useJobWorkflow } from '@/hooks/useJobWorkflow';
import JobWorkflowActions from './JobWorkflowActions';
import JobComments from './JobComments';
import FileUpload from './FileUpload';

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
  clients?: {
    name: string;
    email?: string;
  };
}

interface CalendarTaskEditorProps {
  job: Job;
  onJobUpdate: () => void;
  onClose?: () => void;
}

const CalendarTaskEditor: React.FC<CalendarTaskEditorProps> = ({ job, onJobUpdate, onClose }) => {
  const [editedJob, setEditedJob] = useState<Job>(job);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { canManageJobs, canViewJobs, getCurrentRole } = useRoleAccess();
  const { updateJobProgress, markAsHandovered } = useJobWorkflow();

  const currentRole = getCurrentRole();
  const canEdit = canManageJobs() || (job.assigned_to === editedJob.assigned_to);

  useEffect(() => {
    setEditedJob(job);
  }, [job]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updateData: any = {
        title: editedJob.title,
        description: editedJob.description,
        due_date: editedJob.due_date,
        session_date: editedJob.session_date,
        updated_at: new Date().toISOString()
      };

      // Only allow status updates for team members assigned to the job
      if (job.assigned_to && currentRole && ['photographer', 'designer', 'editor', 'ads_manager'].includes(currentRole)) {
        updateData.status = editedJob.status;
      }

      const { error } = await supabase
        .from('jobs')
        .update(updateData)
        .eq('id', job.id);

      if (error) throw error;

      // Create notification for status changes
      if (editedJob.status !== job.status) {
        const { data: adminUsers } = await supabase
          .from('users')
          .select('id')
          .in('role', ['admin', 'receptionist'])
          .eq('is_active', true);

        if (adminUsers && adminUsers.length > 0) {
          const notifications = adminUsers.map(user => ({
            user_id: user.id,
            title: 'Job Status Updated',
            message: `Job "${job.title}" status changed from ${job.status} to ${editedJob.status}`,
            related_job_id: job.id,
            created_at: new Date().toISOString()
          }));

          await supabase.from('notifications').insert(notifications);
        }
      }

      toast({
        title: "Success",
        description: "Job updated successfully"
      });

      onJobUpdate();
      onClose?.();
    } catch (error) {
      console.error('Error updating job:', error);
      toast({
        title: "Error",
        description: "Failed to update job",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-purple-100 text-purple-800';
      case 'handovered': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'review', label: 'Review' },
    { value: 'completed', label: 'Completed' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'handovered', label: 'Handovered' }
  ];

  if (!canViewJobs()) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
          <p className="text-muted-foreground">You do not have permission to view this job.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Edit Task: {job.title}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Job Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={editedJob.title}
                  onChange={(e) => setEditedJob({ ...editedJob, title: e.target.value })}
                  disabled={!canEdit}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editedJob.description || ''}
                  onChange={(e) => setEditedJob({ ...editedJob, description: e.target.value })}
                  disabled={!canEdit}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="datetime-local"
                    value={editedJob.due_date ? format(new Date(editedJob.due_date), "yyyy-MM-dd'T'HH:mm") : ''}
                    onChange={(e) => setEditedJob({ ...editedJob, due_date: e.target.value })}
                    disabled={!canEdit}
                  />
                </div>

                {editedJob.session_date && (
                  <div className="space-y-2">
                    <Label htmlFor="session_date">Session Date</Label>
                    <Input
                      id="session_date"
                      type="datetime-local"
                      value={format(new Date(editedJob.session_date), "yyyy-MM-dd'T'HH:mm")}
                      onChange={(e) => setEditedJob({ ...editedJob, session_date: e.target.value })}
                      disabled={!canEdit}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Current Status</Label>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(editedJob.status)}>
                    {editedJob.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                  {canEdit && job.assigned_to && (
                    <Select
                      value={editedJob.status}
                      onValueChange={(value) => setEditedJob({ ...editedJob, status: value })}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Client</Label>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>{job.clients?.name || 'No client assigned'}</span>
                </div>
              </div>

              {editedJob.price && (
                <div className="space-y-2">
                  <Label>Price</Label>
                  <div className="text-lg font-semibold text-green-600">
                    ${editedJob.price}
                  </div>
                </div>
              )}

              {canEdit && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Workflow Actions & File Upload */}
          <div className="space-y-4">
            {job.assigned_to && (
              <JobWorkflowActions
                job={job}
                onJobUpdate={onJobUpdate}
              />
            )}

            {job.assigned_to && (
              <Card>
                <CardHeader>
                  <CardTitle>Upload Files</CardTitle>
                </CardHeader>
                <CardContent>
                  <FileUpload
                    jobId={job.id}
                    onFileUploaded={onJobUpdate}
                    allowedTypes={['image', 'video', 'document']}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-6">
          <JobComments
            jobId={job.id}
            jobTitle={job.title}
            clientName={job.clients?.name}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CalendarTaskEditor;