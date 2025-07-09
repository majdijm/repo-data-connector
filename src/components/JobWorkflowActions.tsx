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
  
  // Check if user can update workflow - must be the assigned photographer for workflow jobs
  const canUpdateWorkflow = userProfile?.role === 'photographer' && 
                           job.assigned_to === userProfile.id && 
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
        
        if (selectedUserId) {
          // Use the specifically selected editor
          newAssignedTo = selectedUserId;
          console.log('✅ Assigning to selected editor:', selectedUserId);
        } else {
          // Find an editor to assign to (fallback to auto-assignment)
          console.log('🔍 Looking for available editors...');
          
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

          console.log('👥 Found editors:', editors?.length || 0, editors);
          
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
            // Still proceed with status change but keep current assignment
          }
        }
      } else if (nextStep === 'design') {
        newStatus = 'in_progress';
        
        if (selectedUserId) {
          // Use the specifically selected designer
          newAssignedTo = selectedUserId;
          console.log('✅ Assigning to selected designer:', selectedUserId);
        } else {
          // Find a designer to assign to (fallback to auto-assignment)
          console.log('🔍 Looking for available designers...');
          
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

          console.log('👥 Found designers:', designers?.length || 0, designers);
          
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
            // Still proceed with status change but keep current assignment
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

      // Get current session and user info for detailed debugging
      const { data: session } = await supabase.auth.getSession();
      console.log('🔐 Current session debug:', {
        sessionExists: !!session?.session,
        userId: session?.session?.user?.id,
        userEmail: session?.session?.user?.email,
        userProfileId: userProfile?.id,
        userProfileRole: userProfile?.role,
        sessionMatches: session?.session?.user?.id === userProfile?.id
      });

      // Test the get_current_user_role function directly
      console.log('🧪 Testing get_current_user_role function...');
      const { data: roleData, error: roleError } = await supabase
        .rpc('get_current_user_role');
      
      console.log('🧪 Role function result:', { roleData, roleError });

      // Test if we can read the current job
      console.log('🧪 Testing job read access...');
      const { data: currentJobTest, error: readError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', job.id)
        .single();
      
      console.log('🧪 Job read test result:', { 
        success: !readError, 
        error: readError?.message,
        jobExists: !!currentJobTest,
        jobAssignedTo: currentJobTest?.assigned_to,
        authUserMatches: currentJobTest?.assigned_to === session?.session?.user?.id
      });

      // Try a minimal update first to test the policy
      console.log('🧪 Testing minimal update (just updated_at)...');
      const { data: minimalUpdateTest, error: minimalError } = await supabase
        .from('jobs')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', job.id)
        .select()
        .single();
      
      console.log('🧪 Minimal update test result:', { 
        success: !minimalError, 
        error: minimalError?.message,
        errorCode: minimalError?.code,
        data: minimalUpdateTest
      });

      if (minimalError) {
        console.error('❌ Even minimal update failed. This is definitely an RLS policy issue.');
        console.error('❌ RLS Policy Debug Info:', {
          errorCode: minimalError.code,
          errorMessage: minimalError.message,
          currentUser: session?.session?.user?.id,
          jobAssignedTo: job.assigned_to,
          userRole: userProfile?.role,
          roleFromFunction: roleData
        });
        throw new Error(`RLS Policy Issue: ${minimalError.message}`);
      }

      // If minimal update succeeded, try the full update
      console.log('✅ Minimal update succeeded, proceeding with full update...');
      
      const updateData = {
        status: newStatus,
        assigned_to: newAssignedTo,
        updated_at: new Date().toISOString()
      };
      
      console.log('🔄 Executing full database update with data:', updateData);
      
      const { data: updatedJob, error: jobError } = await supabase
        .from('jobs')
        .update(updateData)
        .eq('id', job.id)
        .select()
        .single();

      console.log('📊 Job update result:', { updatedJob, jobError });

      if (jobError) {
        console.error('❌ Error updating job:', jobError);
        console.error('❌ Error code:', jobError.code);
        console.error('❌ Error message:', jobError.message);
        console.error('❌ Error details:', jobError.details);
        console.error('❌ Error hint:', jobError.hint);
        
        throw new Error(`Database error: ${jobError.message}`);
      }

      if (!updatedJob) {
        console.error('❌ No job returned from update query');
        throw new Error('No job returned from update query - job may not exist');
      }

      console.log('✅ Job updated successfully:', updatedJob);
      console.log('✅ Verification - Updated job status:', updatedJob.status, 'assigned_to:', updatedJob.assigned_to);

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
          // Don't throw here, comment is optional
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
          // Don't throw here, file upload is optional
        } else {
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
            console.error('❌ Error saving file record:', fileError);
            // Don't throw here, file record is optional
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
          // Don't throw here, cloud link is optional
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
          // Don't throw here, notifications are optional
        } else {
          console.log('✅ Notification created successfully');
        }
      }

      console.log('🎉 Workflow update completed successfully');

      toast({
        title: "Success",
        description: `Job updated successfully - ${nextStep === 'handover' ? 'Ready for client' : `Assigned for ${nextStep}`}`
      });

      // Call onJobUpdated to refresh the job list
      console.log('🔄 Calling onJobUpdated to refresh job list...');
      onJobUpdated();
      
      // Reset form
      setNextStep('');
      setSelectedUserId('');
      setWorkflowComment('');
      setSelectedFile(null);
      setFileLink('');
      
    } catch (error) {
      console.error('💥 Error updating job workflow:', error);
      console.error('💥 Error type:', typeof error);
      console.error('💥 Error constructor:', error?.constructor?.name);
      
      let errorMessage = 'Failed to update job workflow';
      if (error instanceof Error) {
        errorMessage = `${errorMessage}: ${error.message}`;
      } else if (typeof error === 'string') {
        errorMessage = `${errorMessage}: ${error}`;
      } else {
        errorMessage = `${errorMessage}: Unknown error`;
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

  console.log('✅ JobWorkflowActions: Rendering workflow actions for photographer');

  return (
    <Card className="mt-4 border-2 border-blue-200">
      <CardHeader className="bg-blue-50">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <ArrowRight className="h-5 w-5" />
          Complete Photography Work
        </CardTitle>
        <p className="text-sm text-blue-600">
          Choose what happens next with this job after your photography work is complete.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <JobWorkflowSelector 
          nextStep={nextStep}
          onNextStepChange={setNextStep}
          selectedUserId={selectedUserId}
          onSelectedUserChange={setSelectedUserId}
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
