import express from 'express';
import { db } from '../database/init.js';
import { requireRole } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Get all payments (admin/receptionist only)
router.get('/', requireRole(['admin', 'receptionist']), async (req, res) => {
  try {
    const payments = await db.allAsync(`
      SELECT p.*, c.name as client_name, j.title as job_title, u.name as recorded_by_name
      FROM payments p
      LEFT JOIN clients c ON p.client_id = c.id
      LEFT JOIN jobs j ON p.job_id = j.id
      LEFT JOIN users u ON p.recorded_by = u.id
      ORDER BY p.recorded_at DESC
    `);

    res.json(payments);
  } catch (error) {
    logger.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get payments for specific client
router.get('/client/:clientId', requireRole(['admin', 'receptionist']), async (req, res) => {
  try {
    const payments = await db.allAsync(`
      SELECT p.*, j.title as job_title, u.name as recorded_by_name
      FROM payments p
      LEFT JOIN jobs j ON p.job_id = j.id
      LEFT JOIN users u ON p.recorded_by = u.id
      WHERE p.client_id = ?
      ORDER BY p.recorded_at DESC
    `, [req.params.clientId]);

    res.json(payments);
  } catch (error) {
    logger.error('Error fetching client payments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Record new payment (admin/receptionist only)
router.post('/', requireRole(['admin', 'receptionist']), async (req, res) => {
  try {
    const { client_id, job_id, amount, description, payment_method } = req.body;

    if (!client_id || !amount) {
      return res.status(400).json({ error: 'Client ID and amount are required' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }

    // Verify client exists
    const client = await db.getAsync('SELECT * FROM clients WHERE id = ?', [client_id]);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Verify job exists if provided
    if (job_id) {
      const job = await db.getAsync('SELECT * FROM jobs WHERE id = ? AND client_id = ?', [job_id, client_id]);
      if (!job) {
        return res.status(404).json({ error: 'Job not found or does not belong to client' });
      }
    }

    const result = await db.runAsync(`
      INSERT INTO payments (client_id, job_id, amount, description, payment_method, recorded_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [client_id, job_id, amount, description, payment_method || 'cash', req.user.id]);

    // Update client's total paid
    await db.runAsync(
      'UPDATE clients SET total_paid = total_paid + ? WHERE id = ?',
      [amount, client_id]
    );

    // Create notification for client if they have a user account
    if (client.user_id) {
      await db.runAsync(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (?, ?, ?, ?)
      `, [client.user_id, 'Payment Recorded', `Payment of $${amount} has been recorded for your account`, 'success']);
    }

    // Log activity
    await db.runAsync(
      'INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'create', 'payment', result.lastID, `Recorded payment: $${amount} for client ${client.name}`]
    );

    logger.info(`Payment recorded: $${amount} for client ${client_id} by ${req.user.email}`);

    res.status(201).json({ 
      id: result.lastID, 
      message: 'Payment recorded successfully' 
    });
  } catch (error) {
    logger.error('Error recording payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update payment (admin/receptionist only)
router.put('/:id', requireRole(['admin', 'receptionist']), async (req, res) => {
  try {
    const { amount, description, payment_method } = req.body;

    const payment = await db.getAsync('SELECT * FROM payments WHERE id = ?', [req.params.id]);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const oldAmount = payment.amount;
    const newAmount = amount || oldAmount;

    await db.runAsync(`
      UPDATE payments SET 
        amount = COALESCE(?, amount),
        description = COALESCE(?, description),
        payment_method = COALESCE(?, payment_method)
      WHERE id = ?
    `, [amount, description, payment_method, req.params.id]);

    // Update client's total paid if amount changed
    if (amount && amount !== oldAmount) {
      const difference = newAmount - oldAmount;
      await db.runAsync(
        'UPDATE clients SET total_paid = total_paid + ? WHERE id = ?',
        [difference, payment.client_id]
      );
    }

    logger.info(`Payment ${req.params.id} updated by ${req.user.email}`);

    res.json({ message: 'Payment updated successfully' });
  } catch (error) {
    logger.error('Error updating payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete payment (admin only)
router.delete('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const payment = await db.getAsync('SELECT * FROM payments WHERE id = ?', [req.params.id]);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    await db.runAsync('DELETE FROM payments WHERE id = ?', [req.params.id]);

    // Update client's total paid
    await db.runAsync(
      'UPDATE clients SET total_paid = total_paid - ? WHERE id = ?',
      [payment.amount, payment.client_id]
    );

    logger.info(`Payment ${req.params.id} deleted by ${req.user.email}`);

    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    logger.error('Error deleting payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;