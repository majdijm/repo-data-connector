import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useWorkflowNotifications = () => {
  const { toast } = useToast();

  const sendJobAssignmentNotification = async (
    jobId: string,
    jobTitle: string,
    assignedUserId: string,
    assignedBy: string
  ) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: assignedUserId,
          title: 'New Job Assignment',
          message: `You have been assigned to job "${jobTitle}" by ${assignedBy}`,
          related_job_id: jobId,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending assignment notification:', error);
    }
  };

  const sendStatusUpdateNotification = async (
    jobId: string,
    jobTitle: string,
    oldStatus: string,
    newStatus: string,
    updatedBy: string
  ) => {
    try {
      // Notify admins and receptionists about status changes
      const { data: adminUsers } = await supabase
        .from('users')
        .select('id')
        .in('role', ['admin', 'receptionist'])
        .eq('is_active', true);

      if (adminUsers && adminUsers.length > 0) {
        const notifications = adminUsers.map(user => ({
          user_id: user.id,
          title: 'Job Status Updated',
          message: `Job "${jobTitle}" status changed from ${oldStatus} to ${newStatus} by ${updatedBy}`,
          related_job_id: jobId,
          created_at: new Date().toISOString()
        }));

        const { error } = await supabase
          .from('notifications')
          .insert(notifications);

        if (error) throw error;
      }

      // If job is completed, notify client
      if (newStatus === 'completed') {
        const { data: job } = await supabase
          .from('jobs')
          .select(`
            client_id,
            clients (
              name,
              email
            )
          `)
          .eq('id', jobId)
          .single();

        if (job?.client_id) {
          // Check if client has a user account
          const { data: clientUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', job.clients?.email)
            .eq('role', 'client')
            .single();

          if (clientUser) {
            await supabase
              .from('notifications')
              .insert({
                user_id: clientUser.id,
                title: 'Job Completed',
                message: `Your job "${jobTitle}" has been completed and is ready for review`,
                related_job_id: jobId,
                created_at: new Date().toISOString()
              });
          }
        }
      }
    } catch (error) {
      console.error('Error sending status update notification:', error);
    }
  };

  const sendWorkflowTransitionNotification = async (
    jobId: string,
    jobTitle: string,
    fromStage: string,
    toStage: string,
    assignedTo: string,
    transitionBy: string
  ) => {
    try {
      // Notify the newly assigned user
      await supabase
        .from('notifications')
        .insert({
          user_id: assignedTo,
          title: 'Workflow Assignment',
          message: `Job "${jobTitle}" has been moved from ${fromStage} to ${toStage} and assigned to you`,
          related_job_id: jobId,
          created_at: new Date().toISOString()
        });

      // Notify admins about workflow progression
      const { data: adminUsers } = await supabase
        .from('users')
        .select('id')
        .in('role', ['admin', 'manager', 'receptionist'])
        .eq('is_active', true);

      if (adminUsers && adminUsers.length > 0) {
        const notifications = adminUsers.map(user => ({
          user_id: user.id,
          title: 'Workflow Progress',
          message: `Job "${jobTitle}" moved from ${fromStage} to ${toStage} by ${transitionBy}`,
          related_job_id: jobId,
          created_at: new Date().toISOString()
        }));

        await supabase
          .from('notifications')
          .insert(notifications);
      }
    } catch (error) {
      console.error('Error sending workflow transition notification:', error);
    }
  };

  const sendFileUploadNotification = async (
    jobId: string,
    jobTitle: string,
    fileName: string,
    uploadedBy: string,
    isFinal: boolean = false
  ) => {
    try {
      // Get job details to find client and assigned user
      const { data: job } = await supabase
        .from('jobs')
        .select(`
          client_id,
          assigned_to,
          clients (
            name,
            email
          )
        `)
        .eq('id', jobId)
        .single();

      if (!job) return;

      const notificationTitle = isFinal ? 'Final Files Available' : 'New Files Uploaded';
      const notificationMessage = isFinal 
        ? `Final files for job "${jobTitle}" have been uploaded and are ready for review`
        : `New file "${fileName}" has been uploaded for job "${jobTitle}" by ${uploadedBy}`;

      const notificationsToSend = [];

      // Notify admins and receptionists
      const { data: adminUsers } = await supabase
        .from('users')
        .select('id')
        .in('role', ['admin', 'manager', 'receptionist'])
        .eq('is_active', true);

      if (adminUsers) {
        adminUsers.forEach(user => {
          notificationsToSend.push({
            user_id: user.id,
            title: notificationTitle,
            message: notificationMessage,
            related_job_id: jobId,
            created_at: new Date().toISOString()
          });
        });
      }

      // If final files, notify client
      if (isFinal && job.client_id) {
        const { data: clientUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', job.clients?.email)
          .eq('role', 'client')
          .single();

        if (clientUser) {
          notificationsToSend.push({
            user_id: clientUser.id,
            title: 'Your Files Are Ready',
            message: `Your final files for "${jobTitle}" are now available for download`,
            related_job_id: jobId,
            created_at: new Date().toISOString()
          });
        }
      }

      if (notificationsToSend.length > 0) {
        await supabase
          .from('notifications')
          .insert(notificationsToSend);
      }
    } catch (error) {
      console.error('Error sending file upload notification:', error);
    }
  };

  const sendCommentNotification = async (
    jobId: string,
    jobTitle: string,
    commentContent: string,
    commentBy: string,
    commentByRole: string
  ) => {
    try {
      const { data: job } = await supabase
        .from('jobs')
        .select(`
          client_id,
          assigned_to,
          clients (
            name,
            email
          )
        `)
        .eq('id', jobId)
        .single();

      if (!job) return;

      const notificationsToSend = [];

      // Notify relevant users based on who commented
      if (commentByRole === 'client') {
        // Client commented - notify assigned team member and admins
        if (job.assigned_to) {
          notificationsToSend.push({
            user_id: job.assigned_to,
            title: 'New Client Comment',
            message: `Client commented on job "${jobTitle}": ${commentContent.substring(0, 100)}...`,
            related_job_id: jobId,
            created_at: new Date().toISOString()
          });
        }

        // Notify admins
        const { data: adminUsers } = await supabase
          .from('users')
          .select('id')
          .in('role', ['admin', 'manager', 'receptionist'])
          .eq('is_active', true);

        if (adminUsers) {
          adminUsers.forEach(user => {
            notificationsToSend.push({
              user_id: user.id,
              title: 'Client Comment',
              message: `${commentBy} commented on job "${jobTitle}"`,
              related_job_id: jobId,
              created_at: new Date().toISOString()
            });
          });
        }
      } else {
        // Team member commented - notify client if they have an account
        const { data: clientUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', job.clients?.email)
          .eq('role', 'client')
          .single();

        if (clientUser) {
          notificationsToSend.push({
            user_id: clientUser.id,
            title: 'New Update on Your Job',
            message: `${commentBy} added a comment to your job "${jobTitle}"`,
            related_job_id: jobId,
            created_at: new Date().toISOString()
          });
        }
      }

      if (notificationsToSend.length > 0) {
        await supabase
          .from('notifications')
          .insert(notificationsToSend);
      }
    } catch (error) {
      console.error('Error sending comment notification:', error);
    }
  };

  return {
    sendJobAssignmentNotification,
    sendStatusUpdateNotification,
    sendWorkflowTransitionNotification,
    sendFileUploadNotification,
    sendCommentNotification
  };
};