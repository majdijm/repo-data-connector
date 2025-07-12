
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useJobWorkflow = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const updateJobProgress = async (jobId: string, newStatus: string) => {
    try {
      setIsLoading(true);
      console.log(`Updating job ${jobId} to status: ${newStatus}`);

      // Get job details for notifications
      const { data: jobData, error: fetchError } = await supabase
        .from('jobs')
        .select(`
          *,
          clients (
            id,
            name,
            email
          )
        `)
        .eq('id', jobId)
        .single();

      if (fetchError) throw fetchError;

      // Update current job status
      const { error: updateError } = await supabase
        .from('jobs')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);

      if (updateError) throw updateError;

      // Add client acceptance comment when status changes to delivered
      if (newStatus === 'delivered' && userProfile?.role === 'client') {
        const { error: commentError } = await supabase
          .from('job_comments')
          .insert({
            job_id: jobId,
            user_id: userProfile.id,
            content: `Work accepted and marked as delivered by client on ${new Date().toLocaleString()}`
          });

        if (commentError) {
          console.error('Error adding acceptance comment:', commentError);
        }
      }

      // Create notification for client when team member marks as completed
      if (newStatus === 'completed' && userProfile?.role !== 'client' && jobData.clients) {
        console.log('Sending completion notification to client');
        
        // Find the client's user ID
        const { data: clientUser, error: clientUserError } = await supabase
          .from('users')
          .select('id')
          .eq('email', jobData.clients.email)
          .eq('role', 'client')
          .single();

        if (!clientUserError && clientUser) {
          const { error: notificationError } = await supabase
            .from('notifications')
            .insert({
              user_id: clientUser.id,
              title: 'Work Completed - Ready for Review',
              message: `Your job "${jobData.title}" has been completed and is ready for your review and acceptance. Please check the final deliverables.`,
              related_job_id: jobId
            });

          if (notificationError) {
            console.error('Error creating client notification:', notificationError);
          } else {
            console.log('Client notification created successfully');
          }
        }
      }

      // Create notification for admin/receptionist when client accepts
      if (newStatus === 'delivered' && userProfile?.role === 'client') {
        console.log('Sending acceptance notification to admin/receptionist');
        
        const { data: adminUsers, error: adminError } = await supabase
          .from('users')
          .select('id')
          .in('role', ['admin', 'receptionist'])
          .eq('is_active', true);

        if (!adminError && adminUsers) {
          const adminNotifications = adminUsers.map(user => ({
            user_id: user.id,
            title: 'Job Accepted by Client',
            message: `Client "${jobData.clients?.name}" has accepted and confirmed delivery of job "${jobData.title}"`,
            related_job_id: jobId
          }));

          const { error: notifError } = await supabase
            .from('notifications')
            .insert(adminNotifications);

          if (notifError) {
            console.error('Error creating admin notifications:', notifError);
          } else {
            console.log('Admin notifications created successfully');
          }
        }
      }

      // Create notification for admin/receptionist when team member updates status
      if (userProfile?.role && ['photographer', 'designer', 'editor'].includes(userProfile.role)) {
        const { data: adminUsers, error: adminError } = await supabase
          .from('users')
          .select('id')
          .in('role', ['admin', 'receptionist'])
          .eq('is_active', true);

        if (!adminError && adminUsers) {
          const adminNotifications = adminUsers.map(user => ({
            user_id: user.id,
            title: 'Job Status Updated',
            message: `Job "${jobData.title}" for ${jobData.clients?.name} has been updated to ${newStatus.replace('_', ' ')} by ${userProfile.name}`,
            related_job_id: jobId
          }));

          await supabase
            .from('notifications')
            .insert(adminNotifications);
        }
      }

      console.log(`Job ${jobId} successfully updated to ${newStatus}`);
      toast({
        title: "Success",
        description: newStatus === 'delivered' ? "Work accepted and marked as delivered" : 
                    newStatus === 'completed' ? "Job marked as completed - client will be notified" :
                    "Job status updated successfully"
      });
      
      return true; // Return success indicator instead of forcing page reload
      
    } catch (error) {
      console.error('Error updating job progress:', error);
      toast({
        title: "Error",
        description: "Failed to update job progress",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateJobProgress,
    isLoading
  };
};
