
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Check } from 'lucide-react';
import JobWorkflowSelector from './JobWorkflowSelector';
import JobFileUploadSection from './JobFileUploadSection';

interface Job {
  id: string;
  title: string;
  status: string;
  next_step: string | null; 
  photographer_notes: string | null;
  assigned_to: string | null;
  type: string;
  workflow_stage: string | null;
  workflow_order: number | null;
}

interface JobWorkflowActionsProps {
  job: Job;
  onJobUpdated: () => void;
}

const JobWorkflowActions: React.FC<JobWorkflowActionsProps> = ({ job, onJobUpdated }) => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [nextStep, setNextStep] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [workflowComment, setWorkflowComment] = useState('');
  const [fileLink, setFileLink] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if this is a workflow job
  const isWorkflowJob = Boolean(job.workflow_stage && job.workflow_order);
  
  // Check if user can update workflow based on their role and job assignment
  const canUpdateWorkflow = 
    ['photographer', 'designer', 'editor'].includes(userProfile?.role || '') && 
    job.assigned_to === userProfile?.id && 
    ['pending', 'in_progress', 'review'].includes(job.status) &&
    isWorkflowJob;

  console.log('🔍 JobWorkflowActions Debug:', {
    componentName: 'JobWorkflowActions',
    userRole: userProfile?.role,
    userId: userProfile?.id,
    jobAssignedTo: job.assigned_to,
    jobStatus: job.status,
    workflowStage: job.workflow_stage,
    workflowOrder: job.workflow_order,
    isWorkflowJob,
    canUpdateWorkflow,
    allowedStatuses: ['pending', 'in_progress', 'review'],
    jobDetails: {
      id: job.id,
      title: job.title,
      type: job.type
    }
  });

  // Don't render if this is not a workflow job
  if (!isWorkflowJob) {
    console.log('🚫 JobWorkflowActions: Not rendering - not a workflow job');
    return null;
  }

  // Don't render if user can't update workflow
  if (!canUpdateWorkflow) {
    console.log('🚫 JobWorkflowActions: Not rendering - user cannot update workflow');
    return null;
  }

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
      console.log('🔄 Starting workflow update for job:', job.id, 'Next step:', nextStep);
      console.log('📋 Current job status:', job.status, 'Current assigned to:', job.assigned_to);
      console.log('👤 Selected user for assignment:', selectedUserId);
      
      let newStatus = 'review';
      let newAssignedTo = job.assigned_to;

      // Determine new status and assignment based on next step
      if (nextStep === 'handover') {
        newStatus = 'completed';
        console.log('✅ Setting job to completed for client handover');
      } else if (nextStep === 'editing') {
        newStatus = 'in_progress';
        
        // Handle auto-assign vs specific user selection
        if (selectedUserId && selectedUserId !== 'auto-assign') {
          newAssignedTo = selectedUserId;
          console.log('✅ Assigning to selected editor:', selectedUserId);
        } else {
          const { data: editors, error: editorsError } = await supabase
            .from('users')
            .select('id, name, role, is_active')
            .eq('role', 'editor')
            .eq('is_active', true);
          
          console.log('📊 Editor query result:', { editors, editorsError });
          
          if (editorsError) {
            console.error('❌ Error fetching editors:', editorsError);
            throw editorsError;
          }

          if (editors && editors.length > 0) {
            newAssignedTo = editors[0].id;
            console.log('✅ Auto-assigning to editor:', editors[0].name, 'ID:', editors[0].id);
          } else {
            console.log('⚠️ No available editors found');
            toast({
              title: "Warning",
              description: "No available editors found. Job will remain unassigned.",
              variant: "destructive"
            });
          }
        }
      } else if (nextStep === 'design') {
        newStatus = 'in_progress';
        
        // Handle auto-assign vs specific user selection
        if (selectedUserId && selectedUserId !== 'auto-assign') {
          newAssignedTo = selectedUserId;
          console.log('✅ Assigning to selected designer:', selectedUserId);
        } else {
          const { data: designers, error: designersError } = await supabase
            .from('users')
            .select('id, name, role, is_active')
            .eq('role', 'designer')
            .eq('is_active', true);
          
          console.log('📊 Designer query result:', { designers, designersError });
          
          if (designersError) {
            console.error('❌ Error fetching designers:', designersError);
            throw designersError;
          }

          if (designers && designers.length > 0) {
            newAssignedTo = designers[0].id;
            console.log('✅ Auto-assigning to designer:', designers[0].name, 'ID:', designers[0].id);
          } else {
            console.log('⚠️ No available designers found');
            toast({
              title: "Warning", 
              description: "No available designers found. Job will remain unassigned.",
              variant: "destructive"
            });
          }
        }
      }

      console.log('📝 About to update job with:', { 
        jobId: job.id,
        oldStatus: job.status, 
        newStatus, 
        oldAssignedTo: job.assigned_to, 
        newAssignedTo 
      });

      console.log('🔄 Executing database update via RPC function');
      
      // Use the RPC function to bypass RLS restrictions for workflow updates
      const { data: updatedJob, error: jobError } = await supabase.rpc('update_job_workflow', {
        job_id: job.id,
        new_status: newStatus,
        new_assigned_to: newAssignedTo
      });

      console.log('📊 Job update result:', { updatedJob, jobError });

      if (jobError) {
        console.error('❌ Error updating job:', jobError);
        throw new Error(`Database error: ${jobError.message}`);
      }

      console.log('✅ Job updated successfully via RPC function');

      // Add workflow comment if provided
      if (workflowComment.trim()) {
        console.log('💬 Adding workflow comment...');
        const { error: commentError } = await supabase
          .from('job_comments')
          .insert({
            job_id: job.id,
            user_id: userProfile?.id,
            content: `Workflow Update: ${workflowComment.trim()}`
          });

        if (commentError) {
          console.error('❌ Error adding comment:', commentError);
        } else {
          console.log('✅ Comment added successfully');
        }
      }

      // Upload file if provided
      if (selectedFile) {
        console.log('📁 Uploading file:', selectedFile.name);
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `job-files/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('job-files')
          .upload(filePath, selectedFile);

        if (uploadError) {
          console.error('❌ Error uploading file:', uploadError);
        } else {
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
            console.error('❌ Error saving file record:', fileError);
          } else {
            console.log('✅ File uploaded and recorded successfully');
          }
        }
      }

      // Add cloud link if provided
      if (fileLink.trim()) {
        console.log('🔗 Adding cloud link...');
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
          console.error('❌ Error adding cloud link:', linkError);
        } else {
          console.log('✅ Cloud link added successfully');
        }
      }

      // Create notifications for assignment change
      if (newAssignedTo !== job.assigned_to && newAssignedTo) {
        console.log('📬 Creating notification for new assignee:', newAssignedTo);
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: newAssignedTo,
            title: 'New Job Assignment',
            message: `You have been assigned to "${job.title}" for ${nextStep} work`,
            related_job_id: job.id
          });

        if (notificationError) {
          console.error('❌ Error creating notification:', notificationError);
        } else {
          console.log('✅ Notification created successfully');
        }
      }

      console.log('🎉 Workflow update completed successfully');

      toast({
        title: "Success",
        description: `Job updated successfully - ${nextStep === 'handover' ? 'Ready for client' : `Assigned for ${nextStep}`}`
      });

      onJobUpdated();
      
      // Reset form
      setNextStep('');
      setSelectedUserId('');
      setWorkflowComment('');
      setSelectedFile(null);
      setFileLink('');
      
    } catch (error) {
      console.error('💥 Error updating job workflow:', error);
      
      let errorMessage = 'Failed to update job workflow';
      if (error instanceof Error) {
        errorMessage = `${errorMessage}: ${error.message}`;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get the appropriate title and description based on current workflow stage
  const getWorkflowInfo = () => {
    switch (job.workflow_stage) {
      case 'photo_session':
        return {
          title: 'Complete Photography Work',
          description: 'Choose what happens next with this job after your photography work is complete.'
        };
      case 'video_editing':
        return {
          title: 'Complete Video Editing Work', 
          description: 'Choose what happens next with this job after your video editing work is complete.'
        };
      case 'design':
        return {
          title: 'Complete Design Work',
          description: 'Choose what happens next with this job after your design work is complete.'
        };
      default:
        return {
          title: 'Complete Current Work',
          description: 'Choose what happens next with this job after your work is complete.'
        };
    }
  };

  const workflowInfo = getWorkflowInfo();

  console.log('✅ JobWorkflowActions: Rendering workflow actions for', userProfile?.role);

  return (
    <Card className="mt-4 border-2 border-blue-200">
      <CardHeader className="bg-blue-50">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <ArrowRight className="h-5 w-5" />
          {workflowInfo.title}
        </CardTitle>
        <p className="text-sm text-blue-600">
          {workflowInfo.description}
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <JobWorkflowSelector 
          nextStep={nextStep}
          onNextStepChange={setNextStep}
          selectedUserId={selectedUserId}
          onSelectedUserChange={setSelectedUserId}
          currentWorkflowStage={job.workflow_stage}
        />

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

        <JobFileUploadSection
          selectedFile={selectedFile}
          fileLink={fileLink}
          onFileChange={handleFileChange}
          onFileLinkChange={setFileLink}
          onRemoveFile={removeFile}
        />

        <Button 
          onClick={handleWorkflowUpdate} 
          disabled={!nextStep || isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700"
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
