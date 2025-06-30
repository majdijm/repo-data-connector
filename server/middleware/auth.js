import jwt from 'jsonwebtoken';
import { getDb } from '../database/db-manager.js';
import logger from '../utils/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = getDb();
    const user = await db.getAsync(
      'SELECT id, email, name, role, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Invalid or inactive user' });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Token verification failed:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

export const requireOwnershipOrRole = (roles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // If user has required role, allow access
    if (roles.includes(req.user.role)) {
      return next();
    }

    // For clients, check if they own the resource
    if (req.user.role === 'client') {
      const resourceId = req.params.id || req.params.clientId;
      
      try {
        const db = getDb();
        // Check if client owns the resource
        const client = await db.getAsync(
          'SELECT id FROM clients WHERE user_id = $1',
          [req.user.id]
        );

        if (client && client.id.toString() === resourceId) {
          return next();
        }
      } catch (error) {
        logger.error('Ownership check failed:', error);
      }
    }

    return res.status(403).json({ error: 'Access denied' });
  };
};

export { JWT_SECRET };