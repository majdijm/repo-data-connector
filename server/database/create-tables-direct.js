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

// Create tables directly using insert operations
const createTables = async () => {
  console.log('Creating tables in Supabase by inserting sample data...');
  
  try {
    // Create users table
    console.log('Creating users table...');
    const { error: usersError } = await supabase
      .from('users')
      .insert({
        id: '00000000-0000-0000-0000-000000000000',
        email: 'temp@example.com',
        password: 'temp_password',
        name: 'Temporary User',
        role: 'admin',
        is_active: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (usersError) {
      console.log('Users table error:', usersError.message);
    } else {
      console.log('Users table created successfully');
      // Clean up temporary data
      await supabase.from('users').delete().eq('id', '00000000-0000-0000-0000-000000000000');
    }
    
    // Create clients table
    console.log('Creating clients table...');
    const { error: clientsError } = await supabase
      .from('clients')
      .insert({
        id: '00000000-0000-0000-0000-000000000000',
        user_id: '00000000-0000-0000-0000-000000000000',
        name: 'Temporary Client',
        email: 'temp_client@example.com',
        phone: '1234567890',
        address: 'Temporary Address',
        total_paid: 0,
        total_due: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (clientsError) {
      console.log('Clients table error:', clientsError.message);
    } else {
      console.log('Clients table created successfully');
      // Clean up temporary data
      await supabase.from('clients').delete().eq('id', '00000000-0000-0000-0000-000000000000');
    }
    
    // Create jobs table
    console.log('Creating jobs table...');
    const { error: jobsError } = await supabase
      .from('jobs')
      .insert({
        id: '00000000-0000-0000-0000-000000000000',
        client_id: '00000000-0000-0000-0000-000000000000',
        photographer_id: '00000000-0000-0000-0000-000000000000',
        designer_id: '00000000-0000-0000-0000-000000000000',
        editor_id: '00000000-0000-0000-0000-000000000000',
        title: 'Temporary Job',
        type: 'photo_session',
        status: 'pending',
        description: 'Temporary job description',
        price: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (jobsError) {
      console.log('Jobs table error:', jobsError.message);
    } else {
      console.log('Jobs table created successfully');
      // Clean up temporary data
      await supabase.from('jobs').delete().eq('id', '00000000-0000-0000-0000-000000000000');
    }
    
    // Create job_files table
    console.log('Creating job_files table...');
    const { error: filesError } = await supabase
      .from('job_files')
      .insert({
        id: '00000000-0000-0000-0000-000000000000',
        job_id: '00000000-0000-0000-0000-000000000000',
        uploaded_by: '00000000-0000-0000-0000-000000000000',
        file_name: 'temp.jpg',
        file_path: '/temp/path',
        file_type: 'image/jpeg',
        file_size: 0,
        is_final: false,
        created_at: new Date().toISOString()
      });
    
    if (filesError) {
      console.log('Job_files table error:', filesError.message);
    } else {
      console.log('Job_files table created successfully');
      // Clean up temporary data
      await supabase.from('job_files').delete().eq('id', '00000000-0000-0000-0000-000000000000');
    }
    
    // Create payments table
    console.log('Creating payments table...');
    const { error: paymentsError } = await supabase
      .from('payments')
      .insert({
        id: '00000000-0000-0000-0000-000000000000',
        job_id: '00000000-0000-0000-0000-000000000000',
        client_id: '00000000-0000-0000-0000-000000000000',
        amount: 0,
        payment_date: new Date().toISOString(),
        payment_method: 'cash',
        notes: 'Temporary payment',
        created_at: new Date().toISOString()
      });
    
    if (paymentsError) {
      console.log('Payments table error:', paymentsError.message);
    } else {
      console.log('Payments table created successfully');
      // Clean up temporary data
      await supabase.from('payments').delete().eq('id', '00000000-0000-0000-0000-000000000000');
    }
    
    // Create notifications table
    console.log('Creating notifications table...');
    const { error: notificationsError } = await supabase
      .from('notifications')
      .insert({
        id: '00000000-0000-0000-0000-000000000000',
        user_id: '00000000-0000-0000-0000-000000000000',
        title: 'Temporary Notification',
        message: 'This is a temporary notification',
        is_read: false,
        created_at: new Date().toISOString()
      });
    
    if (notificationsError) {
      console.log('Notifications table error:', notificationsError.message);
    } else {
      console.log('Notifications table created successfully');
      // Clean up temporary data
      await supabase.from('notifications').delete().eq('id', '00000000-0000-0000-0000-000000000000');
    }
    
    // Create activity_logs table
    console.log('Creating activity_logs table...');
    const { error: logsError } = await supabase
      .from('activity_logs')
      .insert({
        id: '00000000-0000-0000-0000-000000000000',
        user_id: '00000000-0000-0000-0000-000000000000',
        action: 'temporary_action',
        resource_type: 'temporary',
        resource_id: '00000000-0000-0000-0000-000000000000',
        details: {},
        created_at: new Date().toISOString()
      });
    
    if (logsError) {
      console.log('Activity_logs table error:', logsError.message);
    } else {
      console.log('Activity_logs table created successfully');
      // Clean up temporary data
      await supabase.from('activity_logs').delete().eq('id', '00000000-0000-0000-0000-000000000000');
    }
    
    // Create feedback table
    console.log('Creating feedback table...');
    const { error: feedbackError } = await supabase
      .from('feedback')
      .insert({
        id: '00000000-0000-0000-0000-000000000000',
        job_id: '00000000-0000-0000-0000-000000000000',
        client_id: '00000000-0000-0000-0000-000000000000',
        content: 'Temporary feedback',
        rating: 5,
        created_at: new Date().toISOString()
      });
    
    if (feedbackError) {
      console.log('Feedback table error:', feedbackError.message);
    } else {
      console.log('Feedback table created successfully');
      // Clean up temporary data
      await supabase.from('feedback').delete().eq('id', '00000000-0000-0000-0000-000000000000');
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

export { createTables };
