
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';
import { useJobNotifications } from '@/hooks/useJobNotifications';
import { Check, ArrowRight } from 'lucide-react';

interface WorkflowHistoryEntry {
  previous_stage?: string;
  new_stage?: string;
  transitioned_at?: string;
  notes?: string;
  transitioned_by?: string;
}

interface JobData {
  id: string;
  title: string;
  status: string;
  type: string;
  workflow_stage: string | null;
  workflow_order: number | null;
  assigned_to: string | null;
  workflow_history?: WorkflowHistoryEntry[] | null;
}

interface JobWorkflowActionsProps {
  job: JobData;
  onJobUpdated: () => void;
}

const JobWorkflowActions: React.FC<JobWorkflowActionsProps> = ({ job, onJobUpdated }) => {
  const [notes, setNotes] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const { toast } = useToast();
  const { t } = useTranslation();
  const { notifyWorkflowTransition } = useJobNotifications();

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role')
        .eq('is_active', true)
        .in('role', ['photographer', 'designer', 'editor'])
        .order('name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const getAvailableSteps = () => {
    switch (job.type) {
      case 'photo_session':
        return [
          { value: 'video_editing', label: 'Send to Video Editing', needsAssignment: true },
          { value: 'design', label: 'Send to Design', needsAssignment: true },
          { value: 'completed', label: 'Mark as Completed', needsAssignment: false }
        ];
      case 'video_editing':
        return [
          { value: 'design', label: 'Send to Design', needsAssignment: true },
          { value: 'completed', label: 'Mark as Completed', needsAssignment: false }
        ];
      case 'design':
        return [
          { value: 'completed', label: 'Mark as Completed', needsAssignment: false }
        ];
      default:
        return [
          { value: 'completed', label: 'Mark as Completed', needsAssignment: false }
        ];
    }
  };

  const getFilteredUsers = () => {
    if (!nextStep) return [];

    let targetRole = '';
    switch (nextStep) {
      case 'video_editing':
        targetRole = 'editor';
        break;
      case 'design':
        targetRole = 'designer';
        break;
      default:
        return [];
    }

    return users.filter(user => user.role === targetRole && user.is_active);
  };

  const handleProgressJob = async () => {
    if (!nextStep) {
      toast({
        title: "Error",
        description: "Please select the next step",
        variant: "destructive"
      });
      return;
    }

    const currentStep = getAvailableSteps().find(step => step.value === nextStep);
    if (currentStep?.needsAssignment && !selectedUserId) {
      toast({
        title: "Error", 
        description: "Please select a user to assign the job to",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsProcessing(true);
      console.log('🔄 Progressing workflow job:', {
        jobId: job.id,
        currentStage: job.type,
        nextStep,
        assignTo: selectedUserId || null,
        notes
      });

      // Prepare update data
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (nextStep === 'completed') {
        // Mark as completed
        updateData.status = 'completed';
        // Keep assigned_to so photographer can still see completed jobs
      } else {
        // Moving to next workflow stage
        updateData.type = nextStep;
        updateData.status = 'pending';
        updateData.assigned_to = selectedUserId || null;
        
        // Add workflow history
        const workflowEntry: WorkflowHistoryEntry = {
          previous_stage: job.type,
          new_stage: nextStep,
          transitioned_at: new Date().toISOString(),
          notes: notes || undefined,
          transitioned_by: job.assigned_to || undefined
        };
        
        // Get current workflow history and append new entry
        const { data: currentJob } = await supabase
          .from('jobs')
          .select('workflow_history')
          .eq('id', job.id)
          .single();

        const currentHistory = Array.isArray(currentJob?.workflow_history) ? currentJob.workflow_history : [];
        updateData.workflow_history = [...currentHistory, workflowEntry];
      }

      // Update the job
      const { error: updateError } = await supabase
        .from('jobs')
        .update(updateData)
        .eq('id', job.id);

      if (updateError) {
        console.error('❌ Error updating job:', updateError);
        throw updateError;
      }

      console.log('✅ Job updated successfully');

      // Send notifications
      if (nextStep !== 'completed') {
        await notifyWorkflowTransition(
          job.id,
          job.title,
          job.type,
          nextStep,
          selectedUserId || undefined,
          job.assigned_to || undefined
        );
      }

      toast({
        title: "Success",
        description: nextStep === 'completed' 
          ? "Job marked as completed" 
          : `Job moved to ${nextStep.replace('_', ' ')} successfully`
      });

      onJobUpdated();
      setNotes('');
      setNextStep('');
      setSelectedUserId('');

    } catch (error) {
      console.error('💥 Error progressing job:', error);
      toast({
        title: "Error",
        description: "Failed to progress job. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const availableSteps = getAvailableSteps();
  const filteredUsers = getFilteredUsers();
  const currentStep = availableSteps.find(step => step.value === nextStep);

  if (!job.workflow_stage && job.type !== 'photo_session') {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
      <CardHeader>
        <CardTitle className="text-blue-700 dark:text-blue-300">
          Workflow Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="nextStep">What happens next?</Label>
          <Select value={nextStep} onValueChange={setNextStep}>
            <SelectTrigger>
              <SelectValue placeholder="Choose next step..." />
            </SelectTrigger>
            <SelectContent>
              {availableSteps.map(step => (
                <SelectItem key={step.value} value={step.value}>
                  {step.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {currentStep?.needsAssignment && (
          <div>
            <Label htmlFor="assignUser">
              Assign to {nextStep === 'video_editing' ? 'Editor' : 'Designer'}
            </Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder={`Select ${nextStep === 'video_editing' ? 'editor' : 'designer'}...`} />
              </SelectTrigger>
              <SelectContent>
                {filteredUsers.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filteredUsers.length === 0 && (
              <p className="text-sm text-yellow-600 mt-1">
                ⚠️ No available {nextStep === 'video_editing' ? 'editors' : 'designers'} found.
              </p>
            )}
          </div>
        )}

        <div>
          <Label htmlFor="workflow-notes">Notes for transition</Label>
          <Textarea
            id="workflow-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about the current stage completion or instructions for the next stage..."
            className="mt-1"
          />
        </div>

        <Button
          onClick={handleProgressJob}
          disabled={isProcessing || !nextStep}
          className="w-full flex items-center gap-2"
        >
          {nextStep === 'completed' ? (
            <Check className="h-4 w-4" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
          {isProcessing ? 'Processing...' : 
           nextStep === 'completed' ? 'Mark as Completed' : 
           `Move to ${nextStep.replace('_', ' ')}`}
        </Button>
      </CardContent>
    </Card>
  );
};

export default JobWorkflowActions;
