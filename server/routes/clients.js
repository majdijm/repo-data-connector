import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../database/init.js';
import { requireRole } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Get all clients (admin/receptionist only)
router.get('/', requireRole(['admin', 'receptionist']), async (req, res) => {
  try {
    const clients = await db.allAsync(`
      SELECT c.*, u.email as user_email
      FROM clients c
      LEFT JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC
    `);

    res.json(clients);
  } catch (error) {
    logger.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single client
router.get('/:id', requireRole(['admin', 'receptionist']), async (req, res) => {
  try {
    const client = await db.getAsync(`
      SELECT c.*, u.email as user_email
      FROM clients c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [req.params.id]);

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Get client's jobs
    const jobs = await db.allAsync(`
      SELECT j.*, u.name as assigned_to_name
      FROM jobs j
      LEFT JOIN users u ON j.assigned_to = u.id
      WHERE j.client_id = ?
      ORDER BY j.created_at DESC
    `, [req.params.id]);

    // Get client's payments
    const payments = await db.allAsync(`
      SELECT p.*, u.name as recorded_by_name
      FROM payments p
      LEFT JOIN users u ON p.recorded_by = u.id
      WHERE p.client_id = ?
      ORDER BY p.recorded_at DESC
    `, [req.params.id]);

    client.jobs = jobs;
    client.payments = payments;

    res.json(client);
  } catch (error) {
    logger.error('Error fetching client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new client (admin/receptionist only)
router.post('/', requireRole(['admin', 'receptionist']), async (req, res) => {
  try {
    const { name, email, phone, address, createUserAccount, password } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Check if email already exists
    const existingClient = await db.getAsync('SELECT id FROM clients WHERE email = ?', [email]);
    if (existingClient) {
      return res.status(409).json({ error: 'Client with this email already exists' });
    }

    let userId = null;

    // Create user account if requested
    if (createUserAccount) {
      if (!password) {
        return res.status(400).json({ error: 'Password required for user account' });
      }

      const existingUser = await db.getAsync('SELECT id FROM users WHERE email = ?', [email]);
      if (existingUser) {
        return res.status(409).json({ error: 'User account with this email already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userResult = await db.runAsync(
        'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
        [email, hashedPassword, name, 'client']
      );
      userId = userResult.lastID;
    }

    const result = await db.runAsync(
      'INSERT INTO clients (name, email, phone, address, user_id) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone, address, userId]
    );

    // Log activity
    await db.runAsync(
      'INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'create', 'client', result.lastID, `Created client: ${name}`]
    );

    logger.info(`Client created: ${name} by ${req.user.email}`);

    res.status(201).json({ 
      id: result.lastID, 
      message: 'Client created successfully',
      userAccountCreated: !!userId
    });
  } catch (error) {
    logger.error('Error creating client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update client (admin/receptionist only)
router.put('/:id', requireRole(['admin', 'receptionist']), async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    const client = await db.getAsync('SELECT * FROM clients WHERE id = ?', [req.params.id]);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    await db.runAsync(`
      UPDATE clients SET 
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        address = COALESCE(?, address),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, email, phone, address, req.params.id]);

    // Log activity
    await db.runAsync(
      'INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'update', 'client', req.params.id, `Updated client: ${name || client.name}`]
    );

    logger.info(`Client ${req.params.id} updated by ${req.user.email}`);

    res.json({ message: 'Client updated successfully' });
  } catch (error) {
    logger.error('Error updating client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete client (admin only)
router.delete('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const client = await db.getAsync('SELECT * FROM clients WHERE id = ?', [req.params.id]);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Check if client has active jobs
    const activeJobs = await db.getAsync(
      'SELECT COUNT(*) as count FROM jobs WHERE client_id = ? AND status NOT IN ("completed", "delivered")',
      [req.params.id]
    );

    if (activeJobs.count > 0) {
      return res.status(400).json({ error: 'Cannot delete client with active jobs' });
    }

    await db.runAsync('DELETE FROM clients WHERE id = ?', [req.params.id]);

    // Delete associated user account if exists
    if (client.user_id) {
      await db.runAsync('DELETE FROM users WHERE id = ?', [client.user_id]);
    }

    logger.info(`Client ${req.params.id} deleted by ${req.user.email}`);

    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    logger.error('Error deleting client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;