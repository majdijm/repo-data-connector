
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
      console.log('Creating notification:', notificationData);
      
      const { error } = await supabase
        .from('notifications')
        .insert([{
          user_id: notificationData.user_id,
          title: notificationData.title,
          message: notificationData.message,
          related_job_id: notificationData.related_job_id,
          is_read: false
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
      console.log('Creating bulk notifications:', notifications);
      
      const { error } = await supabase
        .from('notifications')
        .insert(notifications.map(n => ({
          user_id: n.user_id,
          title: n.title,
          message: n.message,
          related_job_id: n.related_job_id,
          is_read: false
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

  const notifyClient = async (clientEmail: string, title: string, message: string, jobId?: string) => {
    try {
      // Find the client's user ID by email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', clientEmail)
        .eq('role', 'client')
        .single();

      if (userError || !userData) {
        console.log('No user found for client email:', clientEmail);
        return false;
      }

      return await createNotification({
        user_id: userData.id,
        title,
        message,
        related_job_id: jobId
      });
    } catch (error) {
      console.error('Error notifying client:', error);
      return false;
    }
  };

  const notifyPaymentReceived = async (clientEmail: string, amount: number) => {
    return await notifyClient(
      clientEmail,
      'Payment Received',
      `Payment of $${amount} has been received and recorded in your account.`
    );
  };

  const notifyPaymentRequest = async (clientEmail: string, amount: number, dueDate?: string) => {
    const dueDateText = dueDate ? ` Due: ${new Date(dueDate).toLocaleDateString()}` : '';
    return await notifyClient(
      clientEmail,
      'Payment Request',
      `A payment request of $${amount} has been created for your account.${dueDateText}`
    );
  };

  const notifyJobStatusUpdate = async (job: any, newStatus: string, clientEmail?: string) => {
    const notifications: NotificationData[] = [];

    // Notify client if email is provided
    if (clientEmail) {
      const { data: clientUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', clientEmail)
        .eq('role', 'client')
        .single();

      if (clientUser) {
        notifications.push({
          user_id: clientUser.id,
          title: 'Job Status Updated',
          message: `Your job "${job.title}" status has been updated to ${newStatus.replace('_', ' ')}`,
          type: newStatus === 'completed' ? 'success' : 'info',
          related_job_id: job.id
        });
      }
    }

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
          message: `Job "${job.title}" status changed to ${newStatus.replace('_', ' ')}`,
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
              message: `Your ${dependentJob.workflow_stage?.replace('_', ' ')} job "${dependentJob.title}" is now ready to start!`,
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

  const notifyJobCreated = async (job: any, clientEmail?: string) => {
    const notifications: NotificationData[] = [];

    // Notify assigned team member
    if (job.assigned_to) {
      notifications.push({
        user_id: job.assigned_to,
        title: 'New Job Assigned',
        message: `You have been assigned to "${job.title}". Due: ${job.due_date ? new Date(job.due_date).toLocaleDateString() : 'No due date set'}`,
        type: 'info',
        related_job_id: job.id
      });
    }

    // Notify client if email is provided
    if (clientEmail) {
      const { data: clientUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', clientEmail)
        .eq('role', 'client')
        .single();

      if (clientUser) {
        notifications.push({
          user_id: clientUser.id,
          title: 'New Job Created',
          message: `A new ${job.type.replace('_', ' ')} job "${job.title}" has been created for you.`,
          type: 'info',
          related_job_id: job.id
        });
      }
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
            message: `New ${job.type.replace('_', ' ')} job "${job.title}" has been created`,
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

  const notifyWorkflowCreated = async (photoJob: any, videoJob: any, designJob: any, clientEmail?: string) => {
    const notifications: NotificationData[] = [];

    // Notify photographer (immediate job)
    if (photoJob.assigned_to) {
      notifications.push({
        user_id: photoJob.assigned_to,
        title: 'New Photo Session Assigned',
        message: `You have been assigned to photo session: "${photoJob.title}". Due: ${new Date(photoJob.due_date).toLocaleDateString()}`,
        type: 'info',
        related_job_id: photoJob.id
      });
    }

    // Notify video editor (upcoming job)
    if (videoJob.assigned_to && videoJob.assigned_to !== photoJob.assigned_to) {
      notifications.push({
        user_id: videoJob.assigned_to,
        title: 'Upcoming Video Editing Job',
        message: `Video editing job "${videoJob.title}" will be ready after photo session completion. Expected start: ${new Date(videoJob.due_date).toLocaleDateString()}`,
        type: 'info',
        related_job_id: videoJob.id
      });
    }

    // Notify designer (upcoming job)
    if (designJob.assigned_to && designJob.assigned_to !== photoJob.assigned_to && designJob.assigned_to !== videoJob.assigned_to) {
      notifications.push({
        user_id: designJob.assigned_to,
        title: 'Upcoming Design Job',
        message: `Design job "${designJob.title}" will be ready after video editing completion. Expected start: ${new Date(designJob.due_date).toLocaleDateString()}`,
        type: 'info',
        related_job_id: designJob.id
      });
    }

    // Notify client if email is provided
    if (clientEmail) {
      const { data: clientUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', clientEmail)
        .eq('role', 'client')
        .single();

      if (clientUser) {
        notifications.push({
          user_id: clientUser.id,
          title: 'Complete Workflow Created',
          message: `A complete photo workflow has been created for you: Photo Session → Video Editing → Design`,
          type: 'success',
          related_job_id: photoJob.id
        });
      }
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
          message: `Complete photo workflow created: Photo Session → Video Editing → Design`,
          type: 'success',
          related_job_id: photoJob.id
        });
      });
    }

    if (notifications.length > 0) {
      await createBulkNotifications(notifications);
    }
  };

  return {
    createNotification,
    createBulkNotifications,
    notifyClient,
    notifyPaymentReceived,
    notifyPaymentRequest,
    notifyJobCreated,
    notifyWorkflowCreated,
    notifyJobStatusUpdate
  };
};
