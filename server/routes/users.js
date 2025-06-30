import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../database/init.js';
import { requireRole } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', requireRole(['admin']), async (req, res) => {
  try {
    const users = await db.allAsync(`
      SELECT id, email, name, role, avatar, is_active, created_at
      FROM users
      ORDER BY created_at DESC
    `);

    res.json(users);
  } catch (error) {
    logger.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const user = await db.getAsync(`
      SELECT id, email, name, role, avatar, created_at
      FROM users WHERE id = ?
    `, [req.user.id]);

    res.json(user);
  } catch (error) {
    logger.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const { name, email } = req.body;

    if (email && email !== req.user.email) {
      const existingUser = await db.getAsync('SELECT id FROM users WHERE email = ? AND id != ?', [email, req.user.id]);
      if (existingUser) {
        return res.status(409).json({ error: 'Email already in use' });
      }
    }

    await db.runAsync(`
      UPDATE users SET 
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, email, req.user.id]);

    logger.info(`User profile updated: ${req.user.email}`);

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    logger.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password
router.put('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    const user = await db.getAsync('SELECT password FROM users WHERE id = ?', [req.user.id]);
    
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    await db.runAsync('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, req.user.id]);

    logger.info(`Password changed for user: ${req.user.email}`);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    logger.error('Error changing password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new user (admin only)
router.post('/', requireRole(['admin']), async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const validRoles = ['admin', 'receptionist', 'photographer', 'designer', 'editor', 'client'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const existingUser = await db.getAsync('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.runAsync(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, name, role]
    );

    logger.info(`New user created: ${email} (${role}) by ${req.user.email}`);

    res.status(201).json({
      message: 'User created successfully',
      userId: result.lastID
    });
  } catch (error) {
    logger.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user (admin only)
router.put('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const { name, email, role, is_active } = req.body;

    const user = await db.getAsync('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (email && email !== user.email) {
      const existingUser = await db.getAsync('SELECT id FROM users WHERE email = ? AND id != ?', [email, req.params.id]);
      if (existingUser) {
        return res.status(409).json({ error: 'Email already in use' });
      }
    }

    await db.runAsync(`
      UPDATE users SET 
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        role = COALESCE(?, role),
        is_active = COALESCE(?, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, email, role, is_active, req.params.id]);

    logger.info(`User ${req.params.id} updated by ${req.user.email}`);

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    logger.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get team members for assignment
router.get('/team', requireRole(['admin', 'receptionist']), async (req, res) => {
  try {
    const { type } = req.query;
    
    let roleFilter = '';
    if (type === 'photo_session') {
      roleFilter = "WHERE role = 'photographer'";
    } else if (type === 'video_editing') {
      roleFilter = "WHERE role = 'editor'";
    } else if (type === 'design') {
      roleFilter = "WHERE role = 'designer'";
    } else {
      roleFilter = "WHERE role IN ('photographer', 'designer', 'editor')";
    }

    const teamMembers = await db.allAsync(`
      SELECT id, name, role
      FROM users
      ${roleFilter} AND is_active = 1
      ORDER BY name
    `);

    res.json(teamMembers);
  } catch (error) {
    logger.error('Error fetching team members:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;