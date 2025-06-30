import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

// Load environment variables
dotenv.config();

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xzvprtdxizsgwnddmgfb.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6dnBydGR4aXpzZ3duZGRtZ2ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNDA1NTAsImV4cCI6MjA2NjcxNjU1MH0.PMhyf5qtDYOIU2I00UvGBKsNB2ZkNA0KMy-R3sZGUrI';

// Initialize Supabase client with timeout options
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false
  },
  global: {
    fetch: (url, options) => {
      const timeout = 10000; // 10 seconds timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      return fetch(url, {
        ...options,
        signal: controller.signal
      }).then(response => {
        clearTimeout(timeoutId);
        return response;
      }).catch(error => {
        clearTimeout(timeoutId);
        throw error;
      });
    }
  }
});

// Create tables in Supabase using the REST API
const createTables = async () => {
  console.log('Creating tables in Supabase...');
  
  try {
    // Create users table using SQL
    console.log('Creating users table...');
    const { error: usersError } = await supabase.rpc('create_users_table');
    
    if (usersError) {
      console.error('Error creating users table:', usersError.message);
    } else {
      console.log('Users table created successfully');
    }
    
    // Create clients table
    console.log('Creating clients table...');
    const { error: clientsError } = await supabase.rpc('create_clients_table');
    
    if (clientsError) {
      console.error('Error creating clients table:', clientsError.message);
    } else {
      console.log('Clients table created successfully');
    }
    
    // Create jobs table
    console.log('Creating jobs table...');
    const { error: jobsError } = await supabase.rpc('create_jobs_table');
    
    if (jobsError) {
      console.error('Error creating jobs table:', jobsError.message);
    } else {
      console.log('Jobs table created successfully');
    }
    
    // Create job_files table
    console.log('Creating job_files table...');
    const { error: filesError } = await supabase.rpc('create_job_files_table');
    
    if (filesError) {
      console.error('Error creating job_files table:', filesError.message);
    } else {
      console.log('Job_files table created successfully');
    }
    
    // Create payments table
    console.log('Creating payments table...');
    const { error: paymentsError } = await supabase.rpc('create_payments_table');
    
    if (paymentsError) {
      console.error('Error creating payments table:', paymentsError.message);
    } else {
      console.log('Payments table created successfully');
    }
    
    // Create notifications table
    console.log('Creating notifications table...');
    const { error: notificationsError } = await supabase.rpc('create_notifications_table');
    
    if (notificationsError) {
      console.error('Error creating notifications table:', notificationsError.message);
    } else {
      console.log('Notifications table created successfully');
    }
    
    // Create activity_logs table
    console.log('Creating activity_logs table...');
    const { error: logsError } = await supabase.rpc('create_activity_logs_table');
    
    if (logsError) {
      console.error('Error creating activity_logs table:', logsError.message);
    } else {
      console.log('Activity_logs table created successfully');
    }
    
    // Create feedback table
    console.log('Creating feedback table...');
    const { error: feedbackError } = await supabase.rpc('create_feedback_table');
    
    if (feedbackError) {
      console.error('Error creating feedback table:', feedbackError.message);
    } else {
      console.log('Feedback table created successfully');
    }
    
    console.log('All tables created or verified');
    
    // Seed default users
    await seedDefaultUsers();
    
    return true;
  } catch (error) {
    console.error('Error creating tables:', error.message);
    logger.error('Error creating tables:', error);
    return false;
  }
};

// Seed default users
const seedDefaultUsers = async () => {
  console.log('Seeding default users...');
  
  const defaultUsers = [
    {
      email: 'admin@example.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin',
      is_active: true
    },
    {
      email: 'receptionist@example.com',
      password: 'reception123',
      name: 'Receptionist User',
      role: 'receptionist',
      is_active: true
    },
    {
      email: 'photographer@example.com',
      password: 'photo123',
      name: 'Photographer User',
      role: 'photographer',
      is_active: true
    },
    {
      email: 'designer@example.com',
      password: 'design123',
      name: 'Designer User',
      role: 'designer',
      is_active: true
    },
    {
      email: 'editor@example.com',
      password: 'editor123',
      name: 'Editor User',
      role: 'editor',
      is_active: true
    },
    {
      email: 'client@example.com',
      password: 'client123',
      name: 'Client User',
      role: 'client',
      is_active: true
    }
  ];
  
  for (const user of defaultUsers) {
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single();
      
      if (existingUser) {
        console.log(`User ${user.email} already exists, skipping...`);
        continue;
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      
      // Create user
      const { data, error } = await supabase
        .from('users')
        .insert({
          ...user,
          password: hashedPassword,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
      
      if (error) {
        console.error(`Error creating ${user.role} user:`, error.message);
      } else {
        console.log(`${user.role} user created successfully`);
      }
    } catch (error) {
      console.error(`Error creating ${user.role} user:`, error.message);
    }
  }
};

// Create SQL functions in Supabase to create tables
const createSQLFunctions = async () => {
  console.log('Creating SQL functions in Supabase...');
  
  try {
    // Create users table function
    const createUsersTableSQL = `
      CREATE OR REPLACE FUNCTION create_users_table()
      RETURNS void AS $$
      BEGIN
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT NOT NULL CHECK (role IN ('admin', 'receptionist', 'photographer', 'designer', 'editor', 'client')),
          avatar TEXT,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    // Create clients table function
    const createClientsTableSQL = `
      CREATE OR REPLACE FUNCTION create_clients_table()
      RETURNS void AS $$
      BEGIN
        CREATE TABLE IF NOT EXISTS clients (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id),
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT,
          address TEXT,
          total_paid NUMERIC DEFAULT 0,
          total_due NUMERIC DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    // Create jobs table function
    const createJobsTableSQL = `
      CREATE OR REPLACE FUNCTION create_jobs_table()
      RETURNS void AS $$
      BEGIN
        CREATE TABLE IF NOT EXISTS jobs (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          client_id UUID REFERENCES clients(id),
          photographer_id UUID REFERENCES users(id),
          designer_id UUID REFERENCES users(id),
          editor_id UUID REFERENCES users(id),
          title TEXT NOT NULL,
          type TEXT NOT NULL,
          status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'review', 'completed', 'cancelled')),
          description TEXT,
          price NUMERIC NOT NULL DEFAULT 0,
          due_date TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    // Create job_files table function
    const createJobFilesTableSQL = `
      CREATE OR REPLACE FUNCTION create_job_files_table()
      RETURNS void AS $$
      BEGIN
        CREATE TABLE IF NOT EXISTS job_files (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          job_id UUID REFERENCES jobs(id),
          uploaded_by UUID REFERENCES users(id),
          file_name TEXT NOT NULL,
          file_path TEXT NOT NULL,
          file_type TEXT NOT NULL,
          file_size INTEGER NOT NULL,
          is_final BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    // Create payments table function
    const createPaymentsTableSQL = `
      CREATE OR REPLACE FUNCTION create_payments_table()
      RETURNS void AS $$
      BEGIN
        CREATE TABLE IF NOT EXISTS payments (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          job_id UUID REFERENCES jobs(id),
          client_id UUID REFERENCES clients(id),
          amount NUMERIC NOT NULL,
          payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          payment_method TEXT NOT NULL,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    // Create notifications table function
    const createNotificationsTableSQL = `
      CREATE OR REPLACE FUNCTION create_notifications_table()
      RETURNS void AS $$
      BEGIN
        CREATE TABLE IF NOT EXISTS notifications (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id),
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    // Create activity_logs table function
    const createActivityLogsTableSQL = `
      CREATE OR REPLACE FUNCTION create_activity_logs_table()
      RETURNS void AS $$
      BEGIN
        CREATE TABLE IF NOT EXISTS activity_logs (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id),
          action TEXT NOT NULL,
          resource_type TEXT NOT NULL,
          resource_id UUID,
          details JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    // Create feedback table function
    const createFeedbackTableSQL = `
      CREATE OR REPLACE FUNCTION create_feedback_table()
      RETURNS void AS $$
      BEGIN
        CREATE TABLE IF NOT EXISTS feedback (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          job_id UUID REFERENCES jobs(id),
          client_id UUID REFERENCES clients(id),
          content TEXT NOT NULL,
          rating INTEGER CHECK (rating BETWEEN 1 AND 5),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    // Execute SQL functions
    const sqlFunctions = [
      { name: 'create_users_table', sql: createUsersTableSQL },
      { name: 'create_clients_table', sql: createClientsTableSQL },
      { name: 'create_jobs_table', sql: createJobsTableSQL },
      { name: 'create_job_files_table', sql: createJobFilesTableSQL },
      { name: 'create_payments_table', sql: createPaymentsTableSQL },
      { name: 'create_notifications_table', sql: createNotificationsTableSQL },
      { name: 'create_activity_logs_table', sql: createActivityLogsTableSQL },
      { name: 'create_feedback_table', sql: createFeedbackTableSQL }
    ];
    
    for (const func of sqlFunctions) {
      console.log(`Creating ${func.name} function...`);
      const { error } = await supabase.rpc('exec_sql', { sql: func.sql });
      
      if (error) {
        console.error(`Error creating ${func.name} function:`, error.message);
      } else {
        console.log(`${func.name} function created successfully`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error creating SQL functions:', error.message);
    logger.error('Error creating SQL functions:', error);
    return false;
  }
};

// Create exec_sql function in Supabase
const createExecSQLFunction = async () => {
  console.log('Creating exec_sql function in Supabase...');
  
  try {
    // Connect to Supabase using the service role key (requires admin access)
    const adminSupabase = createClient(
      SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY
    );
    
    // Create exec_sql function using the REST API
    const { error } = await adminSupabase.functions.invoke('create-exec-sql-function', {
      body: { 
        create_function: true 
      }
    });
    
    if (error) {
      console.error('Error creating exec_sql function:', error.message);
      return false;
    }
    
    console.log('exec_sql function created successfully');
    return true;
  } catch (error) {
    console.error('Error creating exec_sql function:', error.message);
    logger.error('Error creating exec_sql function:', error);
    return false;
  }
};

// Main function to set up the database
const setupDatabase = async () => {
  try {
    // Create exec_sql function first
    await createExecSQLFunction();
    
    // Create SQL functions to create tables
    await createSQLFunctions();
    
    // Create tables using the SQL functions
    await createTables();
    
    console.log('Database setup completed successfully');
    return true;
  } catch (error) {
    console.error('Database setup failed:', error.message);
    logger.error('Database setup failed:', error);
    return false;
  }
};

// Run the script if executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  setupDatabase().then(success => {
    if (success) {
      console.log('Database setup completed successfully');
      process.exit(0);
    } else {
      console.error('Database setup failed');
      process.exit(1);
    }
  });
}

export { setupDatabase };
