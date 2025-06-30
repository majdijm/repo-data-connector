import express from 'express';
import { db } from '../database/init.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Get user's notifications
router.get('/', async (req, res) => {
  try {
    const notifications = await db.allAsync(`
      SELECT n.*, j.title as job_title
      FROM notifications n
      LEFT JOIN jobs j ON n.related_job_id = j.id
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
      LIMIT 50
    `, [req.user.id]);

    res.json(notifications);
  } catch (error) {
    logger.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    const notification = await db.getAsync('SELECT * FROM notifications WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await db.runAsync('UPDATE notifications SET is_read = 1 WHERE id = ?', [req.params.id]);

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark all notifications as read
router.patch('/read-all', async (req, res) => {
  try {
    await db.runAsync('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.user.id]);

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    logger.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get unread count
router.get('/unread-count', async (req, res) => {
  try {
    const result = await db.getAsync('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0', [req.user.id]);

    res.json({ count: result.count });
  } catch (error) {
    logger.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;