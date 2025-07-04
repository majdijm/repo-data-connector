
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Upload, Link as LinkIcon, MessageSquare, Check } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  status: string;
  next_step: string | null;
  photographer_notes: string | null;
  assigned_to: string | null;
  type: string;
}

interface JobWorkflowActionsProps {
  job: Job;
  onJobUpdated: () => void;
}

const JobWorkflowActions: React.FC<JobWorkflowActionsProps> = ({ job, onJobUpdated }) => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [nextStep, setNextStep] = useState('');
  const [workflowComment, setWorkflowComment] = useState('');
  const [fileLink, setFileLink] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isPhotographer = userProfile?.role === 'photographer' && job.assigned_to === userProfile.id;
  const canUpdateWorkflow = isPhotographer && job.status === 'in_progress';

  const handleWorkflowUpdate = async () => {
    if (!nextStep || !canUpdateWorkflow) return;

    setIsLoading(true);
    try {
      let newStatus = 'review';
      let newAssignedTo = job.assigned_to;

      // Determine new status and assignment based on next step
      if (nextStep === 'handover') {
        newStatus = 'completed';
      } else if (nextStep === 'editing') {
        newStatus = 'in_progress';
        // Find an editor to assign to
        const { data: editors } = await supabase
          .from('users')
          .select('id')
          .eq('role', 'editor')
          .eq('is_active', true)
          .limit(1);
        
        if (editors && editors.length > 0) {
          newAssignedTo = editors[0].id;
        }
      } else if (nextStep === 'design') {
        newStatus = 'in_progress';
        // Find a designer to assign to
        const { data: designers } = await supabase
          .from('users')
          .select('id')
          .eq('role', 'designer')
          .eq('is_active', true)
          .limit(1);
        
        if (designers && designers.length > 0) {
          newAssignedTo = designers[0].id;
        }
      }

      // Update job status and assignment
      const { error: jobError } = await supabase
        .from('jobs')
        .update({
          status: newStatus,
          assigned_to: newAssignedTo,
          updated_at: new Date().toISOString()
        })
        .eq('id', job.id);

      if (jobError) throw jobError;

      // Add workflow comment if provided
      if (workflowComment.trim()) {
        const { error: commentError } = await supabase
          .from('job_comments')
          .insert({
            job_id: job.id,
            user_id: userProfile?.id,
            content: `Workflow Update: ${workflowComment.trim()}`
          });

        if (commentError) throw commentError;
      }

      // Upload file if provided
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `job-files/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('job-files')
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        // Save file record
        const { error: fileError } = await supabase
          .from('job_files')
          .insert({
            job_id: job.id,
            file_name: selectedFile.name,
            file_path: filePath,
            file_type: selectedFile.type,
            file_size: selectedFile.size,
            uploaded_by: userProfile?.id,
            is_final: nextStep === 'handover'
          });

        if (fileError) throw fileError;
      }

      // Add cloud link if provided
      if (fileLink.trim()) {
        const { error: linkError } = await supabase
          .from('job_files')
          .insert({
            job_id: job.id,
            file_name: 'Cloud Drive Link',
            file_path: fileLink,
            file_type: 'link',
            file_size: 0,
            uploaded_by: userProfile?.id,
            is_cloud_link: true,
            cloud_link: fileLink,
            is_final: nextStep === 'handover'
          });

        if (linkError) throw linkError;
      }

      // Create notifications for assignment change
      if (newAssignedTo !== job.assigned_to && newAssignedTo) {
        await supabase
          .from('notifications')
          .insert({
            user_id: newAssignedTo,
            title: 'New Job Assignment',
            message: `You have been assigned to "${job.title}" for ${nextStep} work`,
            related_job_id: job.id
          });
      }

      toast({
        title: "Success",
        description: `Job updated successfully - ${nextStep === 'handover' ? 'Ready for client' : `Assigned for ${nextStep}`}`
      });

      onJobUpdated();
      
      // Reset form
      setNextStep('');
      setWorkflowComment('');
      setSelectedFile(null);
      setFileLink('');
    } catch (error) {
      console.error('Error updating job workflow:', error);
      toast({
        title: "Error",
        description: "Failed to update job workflow",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!canUpdateWorkflow) {
    return null;
  }

  const getNextStepDetails = (step: string) => {
    const stepInfo = {
      handover: { 
        label: 'Ready for Client Handover', 
        color: 'bg-green-100 text-green-800',
        description: 'Job will be marked as completed and ready for client delivery'
      },
      editing: { 
        label: 'Needs Video Editing', 
        color: 'bg-blue-100 text-blue-800',
        description: 'Will be assigned to an available editor'
      },
      design: { 
        label: 'Needs Design Work', 
        color: 'bg-purple-100 text-purple-800',
        description: 'Will be assigned to an available designer'
      }
    };
    return stepInfo[step as keyof typeof stepInfo];
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRight className="h-5 w-5" />
          Complete Photography Work
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="nextStep">What's the next step for this job?</Label>
          <Select value={nextStep} onValueChange={setNextStep}>
            <SelectTrigger>
              <SelectValue placeholder="Select next step..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="handover">Ready for Client Handover</SelectItem>
              <SelectItem value="editing">Needs Video Editing</SelectItem>
              <SelectItem value="design">Needs Design Work</SelectItem>
            </SelectContent>
          </Select>
          {nextStep && (
            <div className="mt-2">
              <Badge className={getNextStepDetails(nextStep)?.color}>
                {getNextStepDetails(nextStep)?.label}
              </Badge>
              <p className="text-sm text-gray-600 mt-1">
                {getNextStepDetails(nextStep)?.description}
              </p>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="workflowComment">Workflow Comments (Optional)</Label>
          <Textarea
            id="workflowComment"
            value={workflowComment}
            onChange={(e) => setWorkflowComment(e.target.value)}
            rows={3}
            placeholder="Add any notes about the work completed, issues encountered, or instructions for the next step..."
          />
        </div>

        <div className="space-y-3">
          <Label>Attach Files or Links (Optional)</Label>
          
          <div>
            <Label htmlFor="file" className="text-sm">Upload File</Label>
            <Input
              id="file"
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              accept="image/*,video/*,.pdf,.doc,.docx,.zip,.rar"
            />
            {selectedFile && (
              <p className="text-sm text-gray-600 mt-1">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="fileLink" className="text-sm">Cloud Drive Link</Label>
            <Input
              id="fileLink"
              value={fileLink}
              onChange={(e) => setFileLink(e.target.value)}
              placeholder="https://drive.google.com/... or https://dropbox.com/..."
            />
          </div>
        </div>

        <Button 
          onClick={handleWorkflowUpdate} 
          disabled={!nextStep || isLoading}
          className="w-full"
        >
          {isLoading ? (
            'Processing...'
          ) : (
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              Complete & {nextStep === 'handover' ? 'Deliver to Client' : `Send to ${nextStep.charAt(0).toUpperCase() + nextStep.slice(1)}`}
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default JobWorkflowActions;
