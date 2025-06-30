import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

// Promisify database methods
db.runAsync = promisify(db.run.bind(db));
db.getAsync = promisify(db.get.bind(db));
db.allAsync = promisify(db.all.bind(db));

const createTables = async () => {
  const tables = [
    // Users table
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'receptionist', 'photographer', 'designer', 'editor', 'client')),
      avatar TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // Clients table
    `CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      address TEXT,
      total_paid DECIMAL(10,2) DEFAULT 0,
      total_due DECIMAL(10,2) DEFAULT 0,
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,

    // Jobs table
    `CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('photo_session', 'video_editing', 'design')),
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'review', 'completed', 'delivered')),
      client_id INTEGER NOT NULL,
      assigned_to INTEGER,
      due_date DATETIME NOT NULL,
      session_date DATETIME,
      description TEXT,
      price DECIMAL(10,2),
      created_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id),
      FOREIGN KEY (assigned_to) REFERENCES users(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )`,

    // Job files table
    `CREATE TABLE IF NOT EXISTS job_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_type TEXT NOT NULL CHECK (file_type IN ('raw', 'final', 'design', 'video')),
      file_size INTEGER,
      mime_type TEXT,
      uploaded_by INTEGER NOT NULL,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
      FOREIGN KEY (uploaded_by) REFERENCES users(id)
    )`,

    // Payments table
    `CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      job_id INTEGER,
      amount DECIMAL(10,2) NOT NULL,
      description TEXT,
      payment_method TEXT DEFAULT 'cash',
      recorded_by INTEGER NOT NULL,
      recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id),
      FOREIGN KEY (job_id) REFERENCES jobs(id),
      FOREIGN KEY (recorded_by) REFERENCES users(id)
    )`,

    // Notifications table
    `CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
      is_read BOOLEAN DEFAULT 0,
      related_job_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (related_job_id) REFERENCES jobs(id)
    )`,

    // Activity logs table
    `CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      resource_id INTEGER,
      details TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,

    // Client feedback table
    `CREATE TABLE IF NOT EXISTS client_feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER NOT NULL,
      client_id INTEGER NOT NULL,
      rating INTEGER CHECK (rating >= 1 AND rating <= 5),
      feedback TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES jobs(id),
      FOREIGN KEY (client_id) REFERENCES clients(id)
    )`
  ];

  for (const table of tables) {
    await db.runAsync(table);
  }

  logger.info('Database tables created successfully');
};

const seedDefaultUsers = async () => {
  const defaultUsers = [
    {
      email: 'admin@studio.com',
      password: await bcrypt.hash('admin123', 10),
      name: 'Admin User',
      role: 'admin'
    },
    {
      email: 'receptionist@studio.com',
      password: await bcrypt.hash('demo', 10),
      name: 'Sarah Johnson',
      role: 'receptionist'
    },
    {
      email: 'photographer@studio.com',
      password: await bcrypt.hash('demo', 10),
      name: 'Mike Chen',
      role: 'photographer'
    },
    {
      email: 'designer@studio.com',
      password: await bcrypt.hash('demo', 10),
      name: 'Emma Wilson',
      role: 'designer'
    },
    {
      email: 'editor@studio.com',
      password: await bcrypt.hash('demo', 10),
      name: 'David Rodriguez',
      role: 'editor'
    },
    {
      email: 'client@example.com',
      password: await bcrypt.hash('demo', 10),
      name: 'John Smith',
      role: 'client'
    }
  ];

  for (const user of defaultUsers) {
    try {
      const existing = await db.getAsync('SELECT id FROM users WHERE email = ?', [user.email]);
      if (!existing) {
        await db.runAsync(
          'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
          [user.email, user.password, user.name, user.role]
        );
        logger.info(`Created default user: ${user.email}`);
      }
    } catch (error) {
      logger.error(`Error creating user ${user.email}:`, error);
    }
  }
};

const seedSampleData = async () => {
  // Create sample client
  const clientExists = await db.getAsync('SELECT id FROM clients WHERE email = ?', ['john@example.com']);
  if (!clientExists) {
    const clientResult = await db.runAsync(
      'INSERT INTO clients (name, email, phone, total_due) VALUES (?, ?, ?, ?)',
      ['John Smith', 'john@example.com', '+1 (555) 123-4567', 2500]
    );

    // Create sample jobs
    const photographerId = await db.getAsync('SELECT id FROM users WHERE role = ? LIMIT 1', ['photographer']);
    const designerId = await db.getAsync('SELECT id FROM users WHERE role = ? LIMIT 1', ['designer']);
    const editorId = await db.getAsync('SELECT id FROM users WHERE role = ? LIMIT 1', ['editor']);
    const receptionistId = await db.getAsync('SELECT id FROM users WHERE role = ? LIMIT 1', ['receptionist']);

    if (photographerId && designerId && editorId && receptionistId) {
      const jobs = [
        {
          title: 'Wedding Photography - Smith',
          type: 'photo_session',
          status: 'in_progress',
          client_id: clientResult.lastID,
          assigned_to: photographerId.id,
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          session_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Full wedding photography coverage',
          price: 2500,
          created_by: receptionistId.id
        },
        {
          title: 'Brand Logo Design',
          type: 'design',
          status: 'review',
          client_id: clientResult.lastID,
          assigned_to: designerId.id,
          due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Create new brand identity',
          price: 800,
          created_by: receptionistId.id
        }
      ];

      for (const job of jobs) {
        await db.runAsync(
          'INSERT INTO jobs (title, type, status, client_id, assigned_to, due_date, session_date, description, price, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [job.title, job.type, job.status, job.client_id, job.assigned_to, job.due_date, job.session_date, job.description, job.price, job.created_by]
        );
      }

      logger.info('Sample data created successfully');
    }
  }
};

export const initializeDatabase = async () => {
  try {
    await createTables();
    await seedDefaultUsers();
    await seedSampleData();
    logger.info('Database initialized successfully');
  } catch (error) {
    logger.error('Database initialization failed:', error);
    throw error;
  }
};

export { db };