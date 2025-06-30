import bcrypt from 'bcryptjs';
import logger from '../utils/logger.js';
import { db } from './postgres.js';

const createTables = async () => {
  const tables = [
    // Users table
    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'receptionist', 'photographer', 'designer', 'editor', 'client')),
      avatar TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Clients table
    `CREATE TABLE IF NOT EXISTS clients (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      address TEXT,
      total_paid DECIMAL(10,2) DEFAULT 0,
      total_due DECIMAL(10,2) DEFAULT 0,
      user_id INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,

    // Jobs table
    `CREATE TABLE IF NOT EXISTS jobs (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('photo_session', 'video_editing', 'design')),
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'review', 'completed', 'delivered')),
      client_id INTEGER NOT NULL,
      assigned_to INTEGER,
      due_date TIMESTAMP NOT NULL,
      session_date TIMESTAMP,
      description TEXT,
      price DECIMAL(10,2),
      created_by INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id),
      FOREIGN KEY (assigned_to) REFERENCES users(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )`,

    // Job files table
    `CREATE TABLE IF NOT EXISTS job_files (
      id SERIAL PRIMARY KEY,
      job_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_type TEXT NOT NULL CHECK (file_type IN ('raw', 'final', 'design', 'video')),
      file_size INTEGER,
      mime_type TEXT,
      uploaded_by INTEGER NOT NULL,
      uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
      FOREIGN KEY (uploaded_by) REFERENCES users(id)
    )`,

    // Payments table
    `CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      client_id INTEGER NOT NULL,
      job_id INTEGER,
      amount DECIMAL(10,2) NOT NULL,
      description TEXT,
      payment_method TEXT DEFAULT 'cash',
      recorded_by INTEGER NOT NULL,
      recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id),
      FOREIGN KEY (job_id) REFERENCES jobs(id),
      FOREIGN KEY (recorded_by) REFERENCES users(id)
    )`,

    // Notifications table
    `CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
      is_read BOOLEAN DEFAULT FALSE,
      related_job_id INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (related_job_id) REFERENCES jobs(id)
    )`,

    // Activity logs table
    `CREATE TABLE IF NOT EXISTS activity_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      resource_id INTEGER,
      details TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,

    // Client feedback table
    `CREATE TABLE IF NOT EXISTS client_feedback (
      id SERIAL PRIMARY KEY,
      job_id INTEGER NOT NULL,
      client_id INTEGER NOT NULL,
      rating INTEGER CHECK (rating >= 1 AND rating <= 5),
      feedback TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES jobs(id),
      FOREIGN KEY (client_id) REFERENCES clients(id)
    )`
  ];

  for (const table of tables) {
    try {
      await db.query(table);
    } catch (error) {
      logger.error(`Error creating table: ${error.message}`);
      throw error;
    }
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
      const existing = await db.getAsync('SELECT id FROM users WHERE email = $1', [user.email]);
      if (!existing) {
        await db.query(
          'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING',
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
  try {
    // Create sample client
    const clientExists = await db.getAsync('SELECT id FROM clients WHERE email = $1', ['john@example.com']);
    if (!clientExists) {
      const clientResult = await db.query(
        'INSERT INTO clients (name, email, phone, total_due) VALUES ($1, $2, $3, $4) RETURNING id',
        ['John Smith', 'john@example.com', '+1 (555) 123-4567', 2500]
      );
      
      const clientId = clientResult.rows[0].id;

      // Create sample jobs
      const photographerId = await db.getAsync('SELECT id FROM users WHERE role = $1 LIMIT 1', ['photographer']);
      const designerId = await db.getAsync('SELECT id FROM users WHERE role = $1 LIMIT 1', ['designer']);
      const receptionistId = await db.getAsync('SELECT id FROM users WHERE role = $1 LIMIT 1', ['receptionist']);

      if (photographerId && designerId && receptionistId) {
        const jobs = [
          {
            title: 'Wedding Photography - Smith',
            type: 'photo_session',
            status: 'in_progress',
            client_id: clientId,
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
            client_id: clientId,
            assigned_to: designerId.id,
            due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            description: 'Create new brand identity',
            price: 800,
            created_by: receptionistId.id
          }
        ];

        for (const job of jobs) {
          await db.query(
            'INSERT INTO jobs (title, type, status, client_id, assigned_to, due_date, session_date, description, price, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
            [job.title, job.type, job.status, job.client_id, job.assigned_to, job.due_date, job.session_date, job.description, job.price, job.created_by]
          );
        }

        logger.info('Sample data created successfully');
      }
    }
  } catch (error) {
    logger.error('Error seeding sample data:', error);
  }
};

export const initializeDatabase = async () => {
  try {
    console.log('Starting database initialization...');
    
    // First, check if we can connect to the database
    try {
      await db.query('SELECT 1');
      console.log('Database connection verified');
    } catch (connError) {
      console.error('Database connection failed:', connError.message);
      console.error('Cannot initialize database without connection. Please check your database credentials.');
      return false;
    }
    
    // Continue with initialization if connection is successful
    try {
      console.log('Creating tables...');
      await createTables();
      console.log('Tables created successfully');
    } catch (tableError) {
      console.error('Error creating tables:', tableError.message);
      // Continue with other operations even if table creation fails
    }
    
    try {
      console.log('Seeding default users...');
      await seedDefaultUsers();
      console.log('Default users seeded successfully');
    } catch (userError) {
      console.error('Error seeding users:', userError.message);
      // Continue with other operations even if user seeding fails
    }
    
    try {
      console.log('Seeding sample data...');
      await seedSampleData();
      console.log('Sample data seeded successfully');
    } catch (dataError) {
      console.error('Error seeding sample data:', dataError.message);
      // Continue even if sample data seeding fails
    }
    
    console.log('Database initialization completed');
    logger.info('Database initialization completed');
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    logger.error('Database initialization failed:', error);
    return false;
  }
};
