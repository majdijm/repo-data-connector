import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger.js';

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xzvprtdxizsgwnddmgfb.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6dnBydGR4aXpzZ3duZGRtZ2ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNDA1NTAsImV4cCI6MjA2NjcxNjU1MH0.PMhyf5qtDYOIU2I00UvGBKsNB2ZkNA0KMy-R3sZGUrI';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// Initialize Supabase client with service key if available
const supabase = SUPABASE_SERVICE_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createTables() {
  console.log('Starting table creation with SQL...');
  
  try {
    // Create users table
    console.log('Creating users table...');
    const createUsersTable = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS public.users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (createUsersTable.error) {
      console.error('Error creating users table:', createUsersTable.error);
    } else {
      console.log('Users table created successfully');
    }
    
    // Create clients table
    console.log('Creating clients table...');
    const createClientsTable = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS public.clients (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255),
          phone VARCHAR(50),
          address TEXT,
          total_paid DECIMAL(10,2) DEFAULT 0,
          total_due DECIMAL(10,2) DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (createClientsTable.error) {
      console.error('Error creating clients table:', createClientsTable.error);
    } else {
      console.log('Clients table created successfully');
    }
    
    // Create jobs table
    console.log('Creating jobs table...');
    const createJobsTable = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS public.jobs (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          client_id UUID REFERENCES public.clients(id),
          title VARCHAR(255) NOT NULL,
          type VARCHAR(50) NOT NULL,
          status VARCHAR(50) NOT NULL,
          description TEXT,
          price DECIMAL(10,2) DEFAULT 0,
          due_date TIMESTAMP WITH TIME ZONE,
          assigned_to UUID REFERENCES public.users(id),
          created_by UUID REFERENCES public.users(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (createJobsTable.error) {
      console.error('Error creating jobs table:', createJobsTable.error);
    } else {
      console.log('Jobs table created successfully');
    }
    
    // Create job_files table
    console.log('Creating job_files table...');
    const createJobFilesTable = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS public.job_files (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          job_id UUID REFERENCES public.jobs(id),
          uploaded_by UUID REFERENCES public.users(id),
          file_name VARCHAR(255) NOT NULL,
          file_path VARCHAR(255) NOT NULL,
          file_type VARCHAR(100),
          file_size BIGINT,
          is_final BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (createJobFilesTable.error) {
      console.error('Error creating job_files table:', createJobFilesTable.error);
    } else {
      console.log('Job files table created successfully');
    }
    
    // Create payments table
    console.log('Creating payments table...');
    const createPaymentsTable = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS public.payments (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          job_id UUID REFERENCES public.jobs(id),
          client_id UUID REFERENCES public.clients(id),
          amount DECIMAL(10,2) NOT NULL,
          payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          payment_method VARCHAR(50),
          received_by UUID REFERENCES public.users(id),
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (createPaymentsTable.error) {
      console.error('Error creating payments table:', createPaymentsTable.error);
    } else {
      console.log('Payments table created successfully');
    }
    
    // Create notifications table
    console.log('Creating notifications table...');
    const createNotificationsTable = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS public.notifications (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES public.users(id),
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          is_read BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (createNotificationsTable.error) {
      console.error('Error creating notifications table:', createNotificationsTable.error);
    } else {
      console.log('Notifications table created successfully');
    }
    
    // Create activity_logs table
    console.log('Creating activity_logs table...');
    const createActivityLogsTable = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS public.activity_logs (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES public.users(id),
          action VARCHAR(100) NOT NULL,
          resource_type VARCHAR(50) NOT NULL,
          resource_id UUID,
          details JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (createActivityLogsTable.error) {
      console.error('Error creating activity_logs table:', createActivityLogsTable.error);
    } else {
      console.log('Activity logs table created successfully');
    }
    
    // Create feedback table
    console.log('Creating feedback table...');
    const createFeedbackTable = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS public.feedback (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          job_id UUID REFERENCES public.jobs(id),
          client_id UUID REFERENCES public.clients(id),
          content TEXT NOT NULL,
          rating INTEGER CHECK (rating >= 1 AND rating <= 5),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (createFeedbackTable.error) {
      console.error('Error creating feedback table:', createFeedbackTable.error);
    } else {
      console.log('Feedback table created successfully');
    }
    
    console.log('All tables created successfully!');
    
    // Seed default users
    return await seedDefaultUsers();
  } catch (error) {
    console.error('Error creating tables:', error);
    return false;
  }
}

async function seedDefaultUsers() {
  try {
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
          console.error(`Error creating user ${user.email}:`, error);
        } else {
          console.log(`User ${user.email} created successfully with ID: ${data[0].id}`);
        }
      } catch (error) {
        console.error(`Error processing user ${user.email}:`, error);
      }
    }
    
    console.log('Default users seeded successfully!');
    return true;
  } catch (error) {
    console.error('Error seeding default users:', error);
    return false;
  }
}

// Run the script if executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  console.log('Starting table creation script...');
  createTables().then(success => {
    if (success) {
      console.log('Database setup completed successfully');
      process.exit(0);
    } else {
      console.error('Database setup failed');
      process.exit(1);
    }
  }).catch(error => {
    console.error('Unhandled error in createTables:', error);
    process.exit(1);
  });
}

export { createTables, seedDefaultUsers };
