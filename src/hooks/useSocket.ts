
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useSocket = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Subscribe to real-time notifications
      const notificationsChannel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('New notification received:', payload);
            // You can emit custom events here or use a state management solution
          }
        )
        .subscribe();

      // Subscribe to job status changes
      const jobsChannel = supabase
        .channel('jobs')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'jobs'
          },
          (payload) => {
            console.log('Job status updated:', payload);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(notificationsChannel);
        supabase.removeChannel(jobsChannel);
      };
    }
  }, [user]);

  // Utility functions for real-time operations
  const createNotification = async (userId: string, title: string, message: string) => {
    const { error } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        title,
        message
      }]);

    if (error) {
      console.error('Error creating notification:', error);
    }
  };

  const updateJobStatus = async (jobId: string, status: string) => {
    const { error } = await supabase
      .from('jobs')
      .update({ status })
      .eq('id', jobId);

    if (error) {
      console.error('Error updating job status:', error);
    }
  };

  return {
    createNotification,
    updateJobStatus,
    isConnected: !!user
  };
};
