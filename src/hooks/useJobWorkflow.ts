
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
        console.log('Sending acceptance notification to admin/receptionist');
        
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
            title: 'Job Completed and Accepted',
            message: `A job has been completed and accepted by the client. Job ID: ${jobId}`,
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

  return {
    updateJobProgress,
    isLoading
  };
};
