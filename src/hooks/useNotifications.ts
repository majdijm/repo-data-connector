
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface NotificationData {
  user_id: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  related_job_id?: string;
}

export const useNotifications = () => {
  const { toast } = useToast();

  const createNotification = async (notificationData: NotificationData) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert([{
          user_id: notificationData.user_id,
          title: notificationData.title,
          message: notificationData.message,
          type: notificationData.type || 'info',
          related_job_id: notificationData.related_job_id
        }]);

      if (error) {
        console.error('Error creating notification:', error);
        return false;
      }

      console.log('Notification created successfully for user:', notificationData.user_id);
      return true;
    } catch (error) {
      console.error('Error in createNotification:', error);
      return false;
    }
  };

  const createBulkNotifications = async (notifications: NotificationData[]) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert(notifications.map(n => ({
          user_id: n.user_id,
          title: n.title,
          message: n.message,
          type: n.type || 'info',
          related_job_id: n.related_job_id
        })));

      if (error) {
        console.error('Error creating bulk notifications:', error);
        return false;
      }

      console.log(`${notifications.length} notifications created successfully`);
      return true;
    } catch (error) {
      console.error('Error in createBulkNotifications:', error);
      return false;
    }
  };

  const notifyJobCreated = async (job: any, clientName?: string) => {
    const notifications: NotificationData[] = [];

    // Notify assigned team member
    if (job.assigned_to) {
      notifications.push({
        user_id: job.assigned_to,
        title: 'New Job Assigned',
        message: `You have been assigned to "${job.title}"${clientName ? ` for ${clientName}` : ''}. Due: ${job.due_date ? new Date(job.due_date).toLocaleDateString() : 'No due date set'}`,
        type: 'info',
        related_job_id: job.id
      });
    }

    // Notify admin and receptionist about new job
    const { data: adminsAndReceptionists } = await supabase
      .from('users')
      .select('id')
      .in('role', ['admin', 'receptionist'])
      .eq('is_active', true);

    if (adminsAndReceptionists) {
      adminsAndReceptionists.forEach(user => {
        if (user.id !== job.assigned_to) { // Don't duplicate notification
          notifications.push({
            user_id: user.id,
            title: 'New Job Created',
            message: `New ${job.type.replace('_', ' ')} job "${job.title}" has been created${clientName ? ` for ${clientName}` : ''}`,
            type: 'info',
            related_job_id: job.id
          });
        }
      });
    }

    if (notifications.length > 0) {
      await createBulkNotifications(notifications);
    }
  };

  const notifyWorkflowCreated = async (photoJob: any, videoJob: any, designJob: any, clientName?: string) => {
    const notifications: NotificationData[] = [];

    // Notify photographer (immediate job)
    if (photoJob.assigned_to) {
      notifications.push({
        user_id: photoJob.assigned_to,
        title: 'New Photo Session Assigned',
        message: `You have been assigned to photo session: "${photoJob.title}"${clientName ? ` for ${clientName}` : ''}. Due: ${new Date(photoJob.due_date).toLocaleDateString()}`,
        type: 'info',
        related_job_id: photoJob.id
      });
    }

    // Notify video editor (upcoming job)
    if (videoJob.assigned_to && videoJob.assigned_to !== photoJob.assigned_to) {
      notifications.push({
        user_id: videoJob.assigned_to,
        title: 'Upcoming Video Editing Job',
        message: `Video editing job "${videoJob.title}" will be ready after photo session completion${clientName ? ` for ${clientName}` : ''}. Expected start: ${new Date(videoJob.due_date).toLocaleDateString()}`,
        type: 'info',
        related_job_id: videoJob.id
      });
    }

    // Notify designer (upcoming job)
    if (designJob.assigned_to && designJob.assigned_to !== photoJob.assigned_to && designJob.assigned_to !== videoJob.assigned_to) {
      notifications.push({
        user_id: designJob.assigned_to,
        title: 'Upcoming Design Job',
        message: `Design job "${designJob.title}" will be ready after video editing completion${clientName ? ` for ${clientName}` : ''}. Expected start: ${new Date(designJob.due_date).toLocaleDateString()}`,
        type: 'info',
        related_job_id: designJob.id
      });
    }

    // Notify admin and receptionist about workflow creation
    const { data: adminsAndReceptionists } = await supabase
      .from('users')
      .select('id')
      .in('role', ['admin', 'receptionist'])
      .eq('is_active', true);

    if (adminsAndReceptionists) {
      adminsAndReceptionists.forEach(user => {
        notifications.push({
          user_id: user.id,
          title: 'New Workflow Created',
          message: `Complete photo workflow created${clientName ? ` for ${clientName}` : ''}: Photo Session → Video Editing → Design`,
          type: 'success',
          related_job_id: photoJob.id
        });
      });
    }

    if (notifications.length > 0) {
      await createBulkNotifications(notifications);
    }
  };

  const notifyJobStatusUpdate = async (job: any, newStatus: string, clientName?: string) => {
    const notifications: NotificationData[] = [];

    // Notify admin and receptionist about status change
    const { data: adminsAndReceptionists } = await supabase
      .from('users')
      .select('id')
      .in('role', ['admin', 'receptionist'])
      .eq('is_active', true);

    if (adminsAndReceptionists) {
      adminsAndReceptionists.forEach(user => {
        notifications.push({
          user_id: user.id,
          title: 'Job Status Updated',
          message: `Job "${job.title}"${clientName ? ` for ${clientName}` : ''} status changed to ${newStatus.replace('_', ' ')}`,
          type: newStatus === 'completed' ? 'success' : 'info',
          related_job_id: job.id
        });
      });
    }

    // If job is completed, check for dependent jobs and notify their assignees
    if (newStatus === 'completed') {
      const { data: dependentJobs } = await supabase
        .from('jobs')
        .select('*, clients(name)')
        .eq('depends_on_job_id', job.id);

      if (dependentJobs && dependentJobs.length > 0) {
        for (const dependentJob of dependentJobs) {
          if (dependentJob.assigned_to) {
            notifications.push({
              user_id: dependentJob.assigned_to,
              title: 'Job Ready to Start',
              message: `Your ${dependentJob.workflow_stage?.replace('_', ' ')} job "${dependentJob.title}" is now ready to start!${clientName ? ` Client: ${clientName}` : ''}`,
              type: 'success',
              related_job_id: dependentJob.id
            });
          }
        }
      }
    }

    if (notifications.length > 0) {
      await createBulkNotifications(notifications);
    }
  };

  return {
    createNotification,
    createBulkNotifications,
    notifyJobCreated,
    notifyWorkflowCreated,
    notifyJobStatusUpdate
  };
};
