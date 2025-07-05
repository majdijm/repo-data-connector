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

  // Check if user can update workflow - must be the assigned photographer
  // Allow for pending, in_progress, and review statuses
  const canUpdateWorkflow = userProfile?.role === 'photographer' && 
                           job.assigned_to === userProfile.id && 
                           ['pending', 'in_progress', 'review'].includes(job.status);

  console.log('JobWorkflowActions Debug:', {
    userRole: userProfile?.role,
    userId: userProfile?.id,
    jobAssignedTo: job.assigned_to,
    jobStatus: job.status,
    canUpdateWorkflow,
    allowedStatuses: ['pending', 'in_progress', 'review']
  });

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
      
      let newStatus = 'review';
      let newAssignedTo = job.assigned_to;

      // Determine new status and assignment based on next step
      if (nextStep === 'handover') {
        newStatus = 'completed';
        console.log('✅ Setting job to completed for client handover');
      } else if (nextStep === 'editing') {
        newStatus = 'in_progress';
        // Find an editor to assign to
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
          console.log('✅ Assigning to editor:', editors[0].name, 'ID:', editors[0].id);
        } else {
          console.log('⚠️ No available editors found');
          toast({
            title: "Warning",
            description: "No available editors found. Job will remain unassigned.",
            variant: "destructive"
          });
          // Still proceed with status change but keep current assignment
        }
      } else if (nextStep === 'design') {
        newStatus = 'in_progress';
        // Find a designer to assign to
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
          console.log('✅ Assigning to designer:', designers[0].name, 'ID:', designers[0].id);
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

      console.log('📝 About to update job with:', { 
        jobId: job.id,
        oldStatus: job.status, 
        newStatus, 
        oldAssignedTo: job.assigned_to, 
        newAssignedTo 
      });

      // Update job status and assignment
      const { data: updatedJob, error: jobError } = await supabase
        .from('jobs')
        .update({
          status: newStatus,
          assigned_to: newAssignedTo,
          updated_at: new Date().toISOString()
        })
        .eq('id', job.id)
        .select()
        .single();

      console.log('📊 Job update result:', { updatedJob, jobError });

      if (jobError) {
        console.error('❌ Error updating job:', jobError);
        throw jobError;
      }

      console.log('✅ Job updated successfully:', updatedJob);

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
          throw commentError;
        }
        console.log('✅ Comment added successfully');
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
          console.error('❌ Error saving file record:', fileError);
          throw fileError;
        }
        console.log('✅ File uploaded and recorded successfully');
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
          throw linkError;
        }
        console.log('✅ Cloud link added successfully');
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
      setWorkflowComment('');
      setSelectedFile(null);
      setFileLink('');
      
    } catch (error) {
      console.error('💥 Error updating job workflow:', error);
      toast({
        title: "Error",
        description: "Failed to update job workflow. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show debug info and don't render if user can't update workflow
  if (!canUpdateWorkflow) {
    console.log('🚫 JobWorkflowActions: Not rendering - user cannot update workflow');
    return null;
  }

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
