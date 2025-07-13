
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useJobWorkflow = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const updateJobProgress = async (jobId: string, newStatus: string) => {
    try {
      setIsLoading(true);
      console.log(`Updating job ${jobId} to status: ${newStatus}`);

      // Update the job status
      const { error: updateError } = await supabase
        .from('jobs')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);

      if (updateError) {
        console.error('Error updating job status:', updateError);
        throw updateError;
      }

      // If the status is being set to "delivered", create notifications for admin/receptionist
      if (newStatus === 'delivered') {
        console.log('Job accepted by client, sending notification to admin/receptionist for handover');
        
        // Get all admin and receptionist users
        const { data: adminUsers, error: adminError } = await supabase
          .from('users')
          .select('id')
          .in('role', ['admin', 'receptionist'])
          .eq('is_active', true);

        if (adminError) {
          console.error('Error fetching admin users:', adminError);
        } else if (adminUsers && adminUsers.length > 0) {
          // Create notifications for all admin/receptionist users
          const notifications = adminUsers.map(user => ({
            user_id: user.id,
            title: 'Job Accepted - Ready for Handover',
            message: `Job "${jobId}" has been accepted by the client and is ready for handover. Please mark as handovered to complete the workflow.`,
            related_job_id: jobId,
            created_at: new Date().toISOString()
          }));

          const { error: notificationError } = await supabase
            .from('notifications')
            .insert(notifications);

          if (notificationError) {
            console.error('Error creating notifications:', notificationError);
          } else {
            console.log('Admin notifications created successfully');
          }
        }
      }

      console.log(`Job ${jobId} successfully updated to ${newStatus}`);
      return true;

    } catch (error) {
      console.error('Error in updateJobProgress:', error);
      toast({
        title: "Error",
        description: "Failed to update job status. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const markAsHandovered = async (jobId: string) => {
    try {
      setIsLoading(true);
      console.log(`Marking job ${jobId} as handovered`);

      // Update the job status to handovered
      const { error: updateError } = await supabase
        .from('jobs')
        .update({ 
          status: 'handovered',
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);

      if (updateError) {
        console.error('Error marking job as handovered:', updateError);
        throw updateError;
      }

      console.log(`Job ${jobId} successfully marked as handovered`);
      toast({
        title: "Success",
        description: "Job has been marked as handovered and completed."
      });
      return true;

    } catch (error) {
      console.error('Error marking job as handovered:', error);
      toast({
        title: "Error",
        description: "Failed to mark job as handovered. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateJobProgress,
    markAsHandovered,
    isLoading
  };
};
