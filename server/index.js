import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import clientRoutes from './routes/clients.js';
import jobRoutes from './routes/jobs.js';
import paymentRoutes from './routes/payments.js';
import fileRoutes from './routes/files.js';
import notificationRoutes from './routes/notifications.js';
import dashboardRoutes from './routes/dashboard.js';
import setupRoutes from './routes/setup.js';

import { initializeDatabase } from './database/db-manager.js';
import { authenticateToken } from './middleware/auth.js';
import logger from './utils/logger.js';
import { setupSocketHandlers } from './socket/handlers.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:8080",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3006; // Changed to 3005 to avoid conflicts

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:8080",
  credentials: true
}));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
// Serve uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Initialize database
console.log('Starting database initialization from index.js...');
try {
  const { db, type } = await initializeDatabase();
  console.log(`Database initialization completed successfully using ${type}!`);
} catch (error) {
  console.error('Database initialization failed:', error.message);
  console.warn('Server will start with limited functionality.');
  // Continue running the server even if database initialization fails
}

// Socket.IO setup
setupSocketHandlers(io);

// Make io available to routes
app.set('io', io);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/clients', authenticateToken, clientRoutes);
app.use('/api/jobs', authenticateToken, jobRoutes);
app.use('/api/files', authenticateToken, fileRoutes);
app.use('/api/payments', authenticateToken, paymentRoutes);
app.use('/api/notifications', authenticateToken, notificationRoutes);
app.use('/api/dashboard', authenticateToken, dashboardRoutes);

// Setup routes (no authentication required for initial setup)
app.use('/api/setup', setupRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export { io };