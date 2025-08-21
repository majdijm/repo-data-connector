import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const NotificationWidget = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Set up real-time subscription for notifications
    if (user) {
      const channel = supabase
        .channel('notifications-widget')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Notification change received:', payload);
            fetchNotifications(); // Refresh notifications
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationIcon = (title: string) => {
    if (title.toLowerCase().includes('error') || title.toLowerCase().includes('failed')) {
      return <AlertCircle size={16} className="text-red-500" />;
    }
    if (title.toLowerCase().includes('success') || title.toLowerCase().includes('completed')) {
      return <CheckCircle size={16} className="text-green-500" />;
    }
    return <Info size={16} className="text-blue-500" />;
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-yellow-50 to-orange-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5 text-orange-600" />
            Notifications
          </CardTitle>
          {unreadCount > 0 && (
            <Badge className="bg-orange-100 text-orange-700">
              {unreadCount} new
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No notifications</p>
        ) : (
          <>
            {notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`p-3 rounded-lg border transition-colors ${
                  !notification.is_read ? 'bg-orange-100/50 border-orange-200' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1">
                    {getNotificationIcon(notification.title)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  {!notification.is_read && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => markAsRead(notification.id)}
                      className="h-6 w-6 p-0"
                    >
                      <Check size={12} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/notifications')}
              className="w-full mt-2"
            >
              View All Notifications
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationWidget;