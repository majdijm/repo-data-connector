
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const useSocket = () => {
  const { session, user } = useAuth();

  useEffect(() => {
    if (session && user) {
      // Only connect if we have a valid session
      if (!socket) {
        socket = io('ws://localhost:3006', {
          auth: {
            userId: user.id,
            email: user.email
          }
        });

        socket.on('connect', () => {
          console.log('Connected to socket server');
        });

        socket.on('disconnect', () => {
          console.log('Disconnected from socket server');
        });
      }
    } else {
      // Disconnect if no session
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    }

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, [session, user]);

  const emit = (event: string, data: any) => {
    if (socket) {
      socket.emit(event, data);
    }
  };

  const on = (event: string, callback: (data: any) => void) => {
    if (socket) {
      socket.on(event, callback);
    }
  };

  const off = (event: string, callback?: (data: any) => void) => {
    if (socket) {
      socket.off(event, callback);
    }
  };

  return {
    emit,
    on,
    off,
    isConnected: socket?.connected || false
  };
};
