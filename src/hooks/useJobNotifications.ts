
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface JobNotificationData {
  jobId: string;
  jobTitle: string;
  jobType: string;
  clientName?: string;
  assignedToId?: string;
  createdById?: string;
}

export const useJobNotifications = () => {
  const { toast } = useToast();

  const notifyJobCreated = async (jobData: JobNotificationData) => {
    try {
      console.log('🔔 Creating job creation notifications for:', jobData);
      
      const notifications = [];

      // Notify assigned team member
      if (jobData.assignedToId) {
        notifications.push({
          user_id: jobData.assignedToId,
          title: 'New Job Assigned',
          message: `You have been assigned a new ${jobData.jobType.replace('_', ' ')} job: "${jobData.jobTitle}"`,
          related_job_id: jobData.jobId
        });
      }

      // Notify client if we can find them
      if (jobData.clientName) {
        const { data: clientUser } = await supabase
          .from('users')
          .select('id')
          .eq('role', 'client')
          .ilike('name', `%${jobData.clientName}%`)
          .single();

        if (clientUser) {
          notifications.push({
            user_id: clientUser.id,
            title: 'New Job Created',
            message: `A new ${jobData.jobType.replace('_', ' ')} job has been created for you: "${jobData.jobTitle}"`,
            related_job_id: jobData.jobId
          });
        }
      }

      // Notify admin and receptionist
      const { data: adminUsers } = await supabase
        .from('users')
        .select('id')
        .in('role', ['admin', 'receptionist'])
        .eq('is_active', true);

      if (adminUsers) {
        adminUsers.forEach(user => {
          if (user.id !== jobData.createdById) {
            notifications.push({
              user_id: user.id,
              title: 'New Job Created',
              message: `New ${jobData.jobType.replace('_', ' ')} job created: "${jobData.jobTitle}"`,
              related_job_id: jobData.jobId
            });
          }
        });
      }

      if (notifications.length > 0) {
        const { error } = await supabase
          .from('notifications')
          .insert(notifications);

        if (error) {
          console.error('❌ Error creating job notifications:', error);
        } else {
          console.log('✅ Job notifications created successfully:', notifications.length);
        }
      }

    } catch (error) {
      console.error('💥 Error in notifyJobCreated:', error);
    }
  };

  const notifyWorkflowTransition = async (
    jobId: string, 
    jobTitle: string, 
    fromStage: string, 
    toStage: string, 
    newAssigneeId?: string,
    previousAssigneeId?: string
  ) => {
    try {
      console.log('🔔 Creating workflow transition notifications:', {
        jobId, jobTitle, fromStage, toStage, newAssigneeId, previousAssigneeId
      });

      const notifications = [];

      // Notify new assignee
      if (newAssigneeId) {
        notifications.push({
          user_id: newAssigneeId,
          title: 'Workflow Job Ready',
          message: `A ${toStage.replace('_', ' ')} job is ready for you: "${jobTitle}"`,
          related_job_id: jobId
        });
      }

      // Notify previous assignee about successful transition
      if (previousAssigneeId && previousAssigneeId !== newAssigneeId) {
        notifications.push({
          user_id: previousAssigneeId,
          title: 'Job Transitioned',
          message: `Your job "${jobTitle}" has been successfully moved to ${toStage.replace('_', ' ')}`,
          related_job_id: jobId
        });
      }

      // Notify admin and receptionist
      const { data: adminUsers } = await supabase
        .from('users')
        .select('id')
        .in('role', ['admin', 'receptionist'])
        .eq('is_active', true);

      if (adminUsers) {
        adminUsers.forEach(user => {
          notifications.push({
            user_id: user.id,
            title: 'Workflow Progress',
            message: `Job "${jobTitle}" moved from ${fromStage.replace('_', ' ')} to ${toStage.replace('_', ' ')}`,
            related_job_id: jobId
          });
        });
      }

      if (notifications.length > 0) {
        const { error } = await supabase
          .from('notifications')
          .insert(notifications);

        if (error) {
          console.error('❌ Error creating workflow notifications:', error);
        } else {
          console.log('✅ Workflow notifications created successfully:', notifications.length);
        }
      }

    } catch (error) {
      console.error('💥 Error in notifyWorkflowTransition:', error);
    }
  };

  return {
    notifyJobCreated,
    notifyWorkflowTransition
  };
};
