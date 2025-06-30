import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export const useSocket = () => {
  const { token, user } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (token && user) {
      socketRef.current = io(SOCKET_URL, {
        auth: {
          token
        }
      });

      socketRef.current.on('connect', () => {
        console.log('Connected to server');
      });

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from server');
      });

      socketRef.current.on('notification', (notification) => {
        // Handle real-time notifications
        console.log('New notification:', notification);
      });

      socketRef.current.on('job_status_changed', (data) => {
        // Handle job status changes
        console.log('Job status changed:', data);
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [token, user]);

  const emitJobStatusUpdate = (jobId: string, status: string) => {
    if (socketRef.current) {
      socketRef.current.emit('job_status_update', { jobId, status });
    }
  };

  const markNotificationRead = (notificationId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('mark_notification_read', notificationId);
    }
  };

  return {
    socket: socketRef.current,
    emitJobStatusUpdate,
    markNotificationRead
  };
};