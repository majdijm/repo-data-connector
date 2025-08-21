
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import JobWorkflowSelector from './JobWorkflowSelector';

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

interface JobWorkflowActionsProps {
  job: Job;
  onJobUpdate: () => void;
}

const JobWorkflowActions: React.FC<JobWorkflowActionsProps> = ({ job, onJobUpdate }) => {
  const [nextStep, setNextStep] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!newStatus || newStatus.trim() === '') return;
    
    setIsSubmitting(true);
    try {
      console.log('Updating job status:', { jobId: job.id, newStatus });
      
      const { error } = await supabase
        .from('jobs')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', job.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Job status updated successfully',
      });

      onJobUpdate();
    } catch (error) {
      console.error('Error updating job status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update job status',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWorkflowAction = async () => {
    if (!nextStep || nextStep.trim() === '') {
      toast({
        title: 'Error',
        description: 'Please select a next step',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Processing workflow action:', { jobId: job.id, nextStep, selectedUserId });

      let updateData: any = { updated_at: new Date().toISOString() };

      if (nextStep === 'handover') {
        updateData.status = 'completed';
        updateData.assigned_to = null;
      } else {
        updateData.status = 'in_progress';
        updateData.type = nextStep;
        
        if (selectedUserId && selectedUserId !== 'auto-assign' && selectedUserId.trim() !== '') {
          updateData.assigned_to = selectedUserId;
        } else {
          // Auto-assign logic would go here
          updateData.assigned_to = null;
        }
      }

      const { error } = await supabase
        .from('jobs')
        .update(updateData)
        .eq('id', job.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Job ${nextStep === 'handover' ? 'completed' : 'moved to ' + nextStep} successfully`,
      });

      setNextStep('');
      setSelectedUserId('');
      onJobUpdate();
    } catch (error) {
      console.error('Error processing workflow action:', error);
      toast({
        title: 'Error',
        description: 'Failed to process workflow action',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validStatusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'delivered', label: 'Delivered' }
  ].filter(option => option.value && option.value.trim() !== '');

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Current Status:</span>
        <Badge className={getStatusColor(job.status)}>
          {job.status.replace('_', ' ').toUpperCase()}
        </Badge>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium mb-2 block">Quick Status Update</label>
          <Select onValueChange={handleStatusUpdate} disabled={isSubmitting}>
            <SelectTrigger>
              <SelectValue placeholder="Change status..." />
            </SelectTrigger>
            <SelectContent>
              {validStatusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Workflow Actions</label>
          <JobWorkflowSelector
            nextStep={nextStep}
            onNextStepChange={setNextStep}
            selectedUserId={selectedUserId}
            onSelectedUserChange={setSelectedUserId}
            currentWorkflowStage={job.type}
          />
        </div>

        {nextStep && nextStep.trim() !== '' && (
          <Button 
            onClick={handleWorkflowAction} 
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Processing...' : 'Execute Action'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default JobWorkflowActions;
