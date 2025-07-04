
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
import { ArrowRight, Upload, Link as LinkIcon, MessageSquare, Check, X } from 'lucide-react';

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const handleWorkflowUpdate = async () => {
    if (!nextStep || !canUpdateWorkflow) {
      toast({
        title: "Error",
        description: "Please select a next step",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Starting workflow update for job:', job.id, 'Next step:', nextStep);
      
      let newStatus = 'review';
      let newAssignedTo = job.assigned_to;

      // Determine new status and assignment based on next step
      if (nextStep === 'handover') {
        newStatus = 'completed';
        console.log('Setting job to completed for client handover');
      } else if (nextStep === 'editing') {
        newStatus = 'in_progress';
        // Find an editor to assign to
        console.log('Looking for available editors...');
        const { data: editors, error: editorsError } = await supabase
          .from('users')
          .select('id, name')
          .eq('role', 'editor')
          .eq('is_active', true)
          .limit(1);
        
        if (editorsError) {
          console.error('Error fetching editors:', editorsError);
          throw editorsError;
        }

        console.log('Found editors:', editors);
        if (editors && editors.length > 0) {
          newAssignedTo = editors[0].id;
          console.log('Assigning to editor:', editors[0].name);
        } else {
          toast({
            title: "Warning",
            description: "No available editors found. Job will remain unassigned.",
            variant: "destructive"
          });
        }
      } else if (nextStep === 'design') {
        newStatus = 'in_progress';
        // Find a designer to assign to
        console.log('Looking for available designers...');
        const { data: designers, error: designersError } = await supabase
          .from('users')
          .select('id, name')
          .eq('role', 'designer')
          .eq('is_active', true)
          .limit(1);
        
        if (designersError) {
          console.error('Error fetching designers:', designersError);
          throw designersError;
        }

        console.log('Found designers:', designers);
        if (designers && designers.length > 0) {
          newAssignedTo = designers[0].id;
          console.log('Assigning to designer:', designers[0].name);
        } else {
          toast({
            title: "Warning", 
            description: "No available designers found. Job will remain unassigned.",
            variant: "destructive"
          });
        }
      }

      // Update job status and assignment
      console.log('Updating job with:', { status: newStatus, assigned_to: newAssignedTo });
      const { error: jobError } = await supabase
        .from('jobs')
        .update({
          status: newStatus,
          assigned_to: newAssignedTo,
          updated_at: new Date().toISOString()
        })
        .eq('id', job.id);

      if (jobError) {
        console.error('Error updating job:', jobError);
        throw jobError;
      }

      // Add workflow comment if provided
      if (workflowComment.trim()) {
        console.log('Adding workflow comment...');
        const { error: commentError } = await supabase
          .from('job_comments')
          .insert({
            job_id: job.id,
            user_id: userProfile?.id,
            content: `Workflow Update: ${workflowComment.trim()}`
          });

        if (commentError) {
          console.error('Error adding comment:', commentError);
          throw commentError;
        }
      }

      // Upload file if provided
      if (selectedFile) {
        console.log('Uploading file:', selectedFile.name);
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `job-files/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('job-files')
          .upload(filePath, selectedFile);

        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          throw uploadError;
        }

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

        if (fileError) {
          console.error('Error saving file record:', fileError);
          throw fileError;
        }
      }

      // Add cloud link if provided
      if (fileLink.trim()) {
        console.log('Adding cloud link...');
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

        if (linkError) {
          console.error('Error adding cloud link:', linkError);
          throw linkError;
        }
      }

      // Create notifications for assignment change
      if (newAssignedTo !== job.assigned_to && newAssignedTo) {
        console.log('Creating notification for new assignee...');
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
        description: "Failed to update job workflow. Please try again.",
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
              onChange={handleFileChange}
              accept="image/*,video/*,.pdf,.doc,.docx,.zip,.rar"
            />
            {selectedFile && (
              <div className="mt-2 flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex-1">
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={removeFile}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
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
