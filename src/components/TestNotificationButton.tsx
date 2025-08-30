import React from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const TestNotificationButton = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const sendTestNotification = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: 'Test Notification',
          message: 'This is a test notification to verify the system is working.',
          created_at: new Date().toISOString()
        })
        .select();

      if (error) throw error;

      console.log('✅ Test notification sent:', data);
      toast({
        title: 'Test notification sent!',
        description: 'Check your notifications widget.',
      });
    } catch (error) {
      console.error('❌ Test notification failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to send test notification.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button onClick={sendTestNotification} variant="outline" size="sm">
      🔔 Send Test Notification
    </Button>
  );
};

export default TestNotificationButton;