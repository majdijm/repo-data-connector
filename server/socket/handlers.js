import { db } from '../database/init.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../middleware/auth.js';
import logger from '../utils/logger.js';

export const setupSocketHandlers = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await db.getAsync(
        'SELECT id, email, name, role FROM users WHERE id = ? AND is_active = 1',
        [decoded.userId]
      );

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user.id;
      socket.user = user;
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.user.email}`);

    // Join user-specific room for notifications
    socket.join(`user_${socket.userId}`);

    // Join role-specific rooms
    socket.join(`role_${socket.user.role}`);

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.user.email}`);
    });

    // Handle real-time notifications
    socket.on('mark_notification_read', async (notificationId) => {
      try {
        await db.runAsync(
          'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
          [notificationId, socket.userId]
        );
        
        socket.emit('notification_marked_read', { notificationId });
      } catch (error) {
        logger.error('Error marking notification as read:', error);
      }
    });

    // Handle job status updates
    socket.on('job_status_update', async (data) => {
      try {
        const { jobId, status } = data;
        
        // Verify user can update this job
        const job = await db.getAsync('SELECT * FROM jobs WHERE id = ?', [jobId]);
        if (!job) return;

        if (socket.user.role === 'client') return;
        
        if (['photographer', 'designer', 'editor'].includes(socket.user.role) && 
            job.assigned_to !== socket.userId) {
          return;
        }

        // Update job status
        await db.runAsync(
          'UPDATE jobs SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [status, jobId]
        );

        // Notify relevant users
        const client = await db.getAsync('SELECT user_id FROM clients WHERE id = ?', [job.client_id]);
        if (client && client.user_id) {
          io.to(`user_${client.user_id}`).emit('job_status_changed', {
            jobId,
            status,
            jobTitle: job.title
          });
        }

        // Notify admin and receptionist
        io.to('role_admin').emit('job_status_changed', {
          jobId,
          status,
          jobTitle: job.title
        });
        io.to('role_receptionist').emit('job_status_changed', {
          jobId,
          status,
          jobTitle: job.title
        });

      } catch (error) {
        logger.error('Error updating job status via socket:', error);
      }
    });
  });
};