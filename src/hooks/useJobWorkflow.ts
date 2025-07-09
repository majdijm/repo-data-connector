
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';

export const useJobWorkflow = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const { notifyJobStatusUpdate } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);

  const updateJobProgress = async (jobId: string, newStatus: string) => {
    try {
      console.log(`Updating job ${jobId} to status: ${newStatus}`);

      // Get job details for notifications
      const { data: jobData, error: fetchError } = await supabase
        .from('jobs')
        .select('*, clients(name)')
        .eq('id', jobId)
        .single();

      if (fetchError) throw fetchError;

      // Update current job status
      const { error: updateError } = await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', jobId);

      if (updateError) throw updateError;

      // Send comprehensive notifications
      await notifyJobStatusUpdate(jobData, newStatus, jobData.clients?.name);

      toast({
        title: "Success",
        description: "Job status updated and all relevant parties notified"
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
    updateJobProgress,
    isLoading
  };
};
