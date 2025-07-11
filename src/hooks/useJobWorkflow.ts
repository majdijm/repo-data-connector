
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
            content: `Client accepted the work and marked it as delivered on ${new Date().toLocaleString()}`
          });

        if (commentError) {
          console.error('Error adding acceptance comment:', commentError);
        }
      }

      // Create notification for client (if not client updating)
      if (jobData.clients && userProfile?.role !== 'client') {
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
              title: 'Job Status Updated',
              message: `Your job "${jobData.title}" status has been updated to ${newStatus.replace('_', ' ')}`,
              related_job_id: jobId
            });

          if (notificationError) {
            console.error('Error creating notification:', notificationError);
          }
        }
      }

      // Create notification for admin/receptionist (if client accepted)
      if (newStatus === 'delivered' && userProfile?.role === 'client') {
        const { data: adminUsers, error: adminError } = await supabase
          .from('users')
          .select('id')
          .in('role', ['admin', 'receptionist'])
          .eq('is_active', true);

        if (!adminError && adminUsers) {
          const adminNotifications = adminUsers.map(user => ({
            user_id: user.id,
            title: 'Job Accepted by Client',
            message: `Client has accepted and confirmed delivery of job "${jobData.title}"`,
            related_job_id: jobId
          }));

          await supabase
            .from('notifications')
            .insert(adminNotifications);
        }
      }

      // Create notification for admin/receptionist (if team member updated)
      if (userProfile?.role !== 'client') {
        const { data: adminUsers, error: adminError } = await supabase
          .from('users')
          .select('id')
          .in('role', ['admin', 'receptionist'])
          .eq('is_active', true);

        if (!adminError && adminUsers) {
          const adminNotifications = adminUsers.map(user => ({
            user_id: user.id,
            title: 'Job Status Updated',
            message: `Job "${jobData.title}" for ${jobData.clients?.name} has been updated to ${newStatus.replace('_', ' ')}`,
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
        description: newStatus === 'delivered' ? "Work accepted and marked as delivered" : "Job status updated successfully"
      });
      
      // Force a page refresh to ensure all data is updated
      if (newStatus === 'delivered') {
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
      
    } catch (error) {
      console.error('Error updating job progress:', error);
      toast({
        title: "Error",
        description: "Failed to update job progress",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateJobProgress,
    isLoading
  };
};
