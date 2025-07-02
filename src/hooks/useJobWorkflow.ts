
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface WorkflowJob {
  title: string;
  type: 'photo_session' | 'video_editing' | 'design';
  assigned_to: string;
  due_date: string;
  description?: string;
  extra_cost?: number;
  extra_cost_reason?: string;
}

export const useJobWorkflow = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const createWorkflowJobs = async (
    client_id: string,
    photoSessionJob: WorkflowJob,
    videoEditingJob: WorkflowJob,
    designJob: WorkflowJob,
    package_included: boolean = false
  ) => {
    if (!userProfile) return null;

    setIsLoading(true);
    try {
      // Create photo session job first
      const { data: photoJob, error: photoError } = await supabase
        .from('jobs')
        .insert([{
          ...photoSessionJob,
          client_id,
          status: 'pending',
          created_by: userProfile.id,
          package_included,
          workflow_stage: 'photo_session',
          workflow_order: 1
        }])
        .select()
        .single();

      if (photoError) throw photoError;

      // Create video editing job (dependent on photo session)
      const { data: videoJob, error: videoError } = await supabase
        .from('jobs')
        .insert([{
          ...videoEditingJob,
          client_id,
          status: 'waiting_dependency',
          created_by: userProfile.id,
          package_included,
          workflow_stage: 'video_editing',
          workflow_order: 2,
          depends_on_job_id: photoJob.id
        }])
        .select()
        .single();

      if (videoError) throw videoError;

      // Create design job (dependent on video editing)
      const { data: designJobData, error: designError } = await supabase
        .from('jobs')
        .insert([{
          ...designJob,
          client_id,
          status: 'waiting_dependency',
          created_by: userProfile.id,
          package_included,
          workflow_stage: 'design',
          workflow_order: 3,
          depends_on_job_id: videoJob.id
        }])
        .select()
        .single();

      if (designError) throw designError;

      // Create notifications for all assigned team members
      await createWorkflowNotifications(photoJob, videoJob, designJobData);

      toast({
        title: "Success",
        description: "Workflow jobs created successfully with all dependencies"
      });

      return { photoJob, videoJob, designJob: designJobData };
    } catch (error) {
      console.error('Error creating workflow jobs:', error);
      toast({
        title: "Error",
        description: "Failed to create workflow jobs",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createWorkflowNotifications = async (photoJob: any, videoJob: any, designJob: any) => {
    const notifications = [];

    // Notification for photographer
    if (photoJob.assigned_to) {
      notifications.push({
        user_id: photoJob.assigned_to,
        title: 'New Photo Session Assigned',
        message: `You have been assigned to photo session: ${photoJob.title}. Due: ${new Date(photoJob.due_date).toLocaleDateString()}`,
        type: 'info',
        related_job_id: photoJob.id
      });
    }

    // Notification for video editor (preparation notice)
    if (videoJob.assigned_to) {
      notifications.push({
        user_id: videoJob.assigned_to,
        title: 'Upcoming Video Editing Job',
        message: `Video editing job "${videoJob.title}" will be ready after photo session completion. Expected start: ${new Date(videoJob.due_date).toLocaleDateString()}`,
        type: 'info',
        related_job_id: videoJob.id
      });
    }

    // Notification for designer (preparation notice)
    if (designJob.assigned_to) {
      notifications.push({
        user_id: designJob.assigned_to,
        title: 'Upcoming Design Job',
        message: `Design job "${designJob.title}" will be ready after video editing completion. Expected start: ${new Date(designJob.due_date).toLocaleDateString()}`,
        type: 'info',
        related_job_id: designJob.id
      });
    }

    if (notifications.length > 0) {
      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) {
        console.error('Error creating notifications:', error);
      }
    }
  };

  const updateJobProgress = async (jobId: string, newStatus: string) => {
    try {
      // Update current job status
      const { error: updateError } = await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', jobId);

      if (updateError) throw updateError;

      // If job is completed, check for dependent jobs
      if (newStatus === 'completed') {
        const { data: dependentJobs, error: dependentError } = await supabase
          .from('jobs')
          .select('*')
          .eq('depends_on_job_id', jobId);

        if (dependentError) throw dependentError;

        // Activate dependent jobs and notify assignees
        for (const dependentJob of dependentJobs || []) {
          await supabase
            .from('jobs')
            .update({ status: 'pending' })
            .eq('id', dependentJob.id);

          // Notify the assignee that their job is now ready
          if (dependentJob.assigned_to) {
            await supabase
              .from('notifications')
              .insert([{
                user_id: dependentJob.assigned_to,
                title: 'Job Ready to Start',
                message: `Your ${dependentJob.workflow_stage.replace('_', ' ')} job "${dependentJob.title}" is now ready to start!`,
                type: 'success',
                related_job_id: dependentJob.id
              }]);
          }
        }
      }

      toast({
        title: "Success",
        description: "Job status updated and dependent jobs notified"
      });
    } catch (error) {
      console.error('Error updating job progress:', error);
      toast({
        title: "Error",
        description: "Failed to update job progress",
        variant: "destructive"
      });
    }
  };

  return {
    createWorkflowJobs,
    updateJobProgress,
    isLoading
  };
};
