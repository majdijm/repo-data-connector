import express from 'express';
import { db } from '../database/init.js';
import { requireRole, requireOwnershipOrRole } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Get all jobs (admin/receptionist) or assigned jobs (team) or client jobs (client)
router.get('/', async (req, res) => {
  try {
    let query = `
      SELECT j.*, c.name as client_name, u.name as assigned_to_name
      FROM jobs j
      LEFT JOIN clients c ON j.client_id = c.id
      LEFT JOIN users u ON j.assigned_to = u.id
    `;
    let params = [];

    if (req.user.role === 'client') {
      // Clients can only see their own jobs
      const client = await db.getAsync('SELECT id FROM clients WHERE user_id = ?', [req.user.id]);
      if (!client) {
        return res.json([]);
      }
      query += ' WHERE j.client_id = ?';
      params.push(client.id);
    } else if (['photographer', 'designer', 'editor'].includes(req.user.role)) {
      // Team members see their assigned jobs
      query += ' WHERE j.assigned_to = ?';
      params.push(req.user.id);
    }

    query += ' ORDER BY j.created_at DESC';

    const jobs = await db.allAsync(query, params);

    res.json(jobs);
  } catch (error) {
    logger.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single job
router.get('/:id', requireOwnershipOrRole(['admin', 'receptionist', 'photographer', 'designer', 'editor']), async (req, res) => {
  try {
    const job = await db.getAsync(`
      SELECT j.*, c.name as client_name, c.email as client_email, u.name as assigned_to_name
      FROM jobs j
      LEFT JOIN clients c ON j.client_id = c.id
      LEFT JOIN users u ON j.assigned_to = u.id
      WHERE j.id = ?
    `, [req.params.id]);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Get job files
    const files = await db.allAsync(`
      SELECT jf.*, u.name as uploaded_by_name
      FROM job_files jf
      LEFT JOIN users u ON jf.uploaded_by = u.id
      WHERE jf.job_id = ?
      ORDER BY jf.uploaded_at DESC
    `, [req.params.id]);

    job.files = files;

    res.json(job);
  } catch (error) {
    logger.error('Error fetching job:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new job (admin/receptionist only)
router.post('/', requireRole(['admin', 'receptionist']), async (req, res) => {
  try {
    const { title, type, client_id, assigned_to, due_date, session_date, description, price } = req.body;

    if (!title || !type || !client_id || !due_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const validTypes = ['photo_session', 'video_editing', 'design'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid job type' });
    }

    const result = await db.runAsync(`
      INSERT INTO jobs (title, type, client_id, assigned_to, due_date, session_date, description, price, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, type, client_id, assigned_to, due_date, session_date, description, price, req.user.id]);

    // Create notification for assigned user
    if (assigned_to) {
      await db.runAsync(`
        INSERT INTO notifications (user_id, title, message, type, related_job_id)
        VALUES (?, ?, ?, ?, ?)
      `, [assigned_to, 'New Job Assigned', `You have been assigned to: ${title}`, 'info', result.lastID]);

      // Emit real-time notification
      const io = req.app.get('io');
      io.to(`user_${assigned_to}`).emit('notification', {
        title: 'New Job Assigned',
        message: `You have been assigned to: ${title}`,
        type: 'info'
      });
    }

    // Log activity
    await db.runAsync(
      'INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'create', 'job', result.lastID, `Created job: ${title}`]
    );

    logger.info(`Job created: ${title} by ${req.user.email}`);

    res.status(201).json({ id: result.lastID, message: 'Job created successfully' });
  } catch (error) {
    logger.error('Error creating job:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update job status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'in_progress', 'review', 'completed', 'delivered'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const job = await db.getAsync('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check permissions
    if (req.user.role === 'client') {
      return res.status(403).json({ error: 'Clients cannot update job status' });
    }

    if (['photographer', 'designer', 'editor'].includes(req.user.role) && job.assigned_to !== req.user.id) {
      return res.status(403).json({ error: 'You can only update jobs assigned to you' });
    }

    await db.runAsync('UPDATE jobs SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, req.params.id]);

    // Create notification for client
    const client = await db.getAsync('SELECT user_id FROM clients WHERE id = ?', [job.client_id]);
    if (client && client.user_id) {
      await db.runAsync(`
        INSERT INTO notifications (user_id, title, message, type, related_job_id)
        VALUES (?, ?, ?, ?, ?)
      `, [client.user_id, 'Job Status Updated', `Your job "${job.title}" status changed to ${status}`, 'info', job.id]);
    }

    // Log activity
    await db.runAsync(
      'INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'update', 'job', req.params.id, `Updated job status to: ${status}`]
    );

    logger.info(`Job ${req.params.id} status updated to ${status} by ${req.user.email}`);

    res.json({ message: 'Job status updated successfully' });
  } catch (error) {
    logger.error('Error updating job status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update job (admin/receptionist only)
router.put('/:id', requireRole(['admin', 'receptionist']), async (req, res) => {
  try {
    const { title, type, assigned_to, due_date, session_date, description, price } = req.body;

    const job = await db.getAsync('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    await db.runAsync(`
      UPDATE jobs SET 
        title = COALESCE(?, title),
        type = COALESCE(?, type),
        assigned_to = COALESCE(?, assigned_to),
        due_date = COALESCE(?, due_date),
        session_date = COALESCE(?, session_date),
        description = COALESCE(?, description),
        price = COALESCE(?, price),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [title, type, assigned_to, due_date, session_date, description, price, req.params.id]);

    // If assignment changed, notify new assignee
    if (assigned_to && assigned_to !== job.assigned_to) {
      await db.runAsync(`
        INSERT INTO notifications (user_id, title, message, type, related_job_id)
        VALUES (?, ?, ?, ?, ?)
      `, [assigned_to, 'Job Assigned', `You have been assigned to: ${title || job.title}`, 'info', req.params.id]);
    }

    logger.info(`Job ${req.params.id} updated by ${req.user.email}`);

    res.json({ message: 'Job updated successfully' });
  } catch (error) {
    logger.error('Error updating job:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete job (admin only)
router.delete('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const job = await db.getAsync('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    await db.runAsync('DELETE FROM jobs WHERE id = ?', [req.params.id]);

    logger.info(`Job ${req.params.id} deleted by ${req.user.email}`);

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    logger.error('Error deleting job:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;