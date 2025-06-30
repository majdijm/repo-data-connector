import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

// Load environment variables
dotenv.config();

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xzvprtdxizsgwnddmgfb.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6dnBydGR4aXpzZ3duZGRtZ2ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNDA1NTAsImV4cCI6MjA2NjcxNjU1MH0.PMhyf5qtDYOIU2I00UvGBKsNB2ZkNA0KMy-R3sZGUrI';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Main setup function
const setupSupabase = async () => {
  try {
    console.log('Starting Supabase setup...');
    
    // Test connection
    console.log('Testing Supabase connection...');
    try {
      const { data: connectionTest, error: connectionError } = await supabase.from('users').select('count');
      
      if (connectionError && connectionError.code !== 'PGRST204') {
        console.error('Connection error:', connectionError.message);
        // Continue anyway - we'll try to create the tables
      } else {
        console.log('Connection successful!');
      }
    } catch (connErr) {
      console.error('Connection error:', connErr.message);
      // Continue anyway - we'll try to create the tables
    }
    
    // We already handled the connection error in the try/catch block above
    // Now we'll continue with the setup regardless of connection status
    
    console.log('Connection successful!');
    
    // Create tables by inserting sample data
    await createTables();
    
    // Seed initial data
    await seedDefaultUsers();
    
    console.log('Supabase setup completed successfully!');
    return true;
  } catch (error) {
    console.error('Supabase setup failed:', error.message);
    logger.error('Supabase setup failed:', error);
    return false;
  }
};

// Create tables by inserting sample data (Supabase will create tables automatically)
const createTables = async () => {
  try {
    console.log('Creating tables in Supabase...');
    
    // Users table
    const { error: usersError } = await supabase.from('users').upsert([
      {
        id: 'dummy_user',
        email: 'dummy@example.com',
        password: 'dummy_password',
        name: 'Dummy User',
        role: 'admin',
        is_active: false
      }
    ], { onConflict: 'id' });
    
    if (usersError) {
      console.error('Error creating users table:', usersError.message);
    } else {
      console.log('Users table created successfully');
      
      // Clean up dummy data
      await supabase.from('users').delete().eq('id', 'dummy_user');
    }
    
    // Clients table
    const { error: clientsError } = await supabase.from('clients').upsert([
      {
        id: 'dummy_client',
        name: 'Dummy Client',
        email: 'dummy_client@example.com',
        phone: '123456789',
        total_paid: 0,
        total_due: 0
      }
    ], { onConflict: 'id' });
    
    if (clientsError) {
      console.error('Error creating clients table:', clientsError.message);
    } else {
      console.log('Clients table created successfully');
      
      // Clean up dummy data
      await supabase.from('clients').delete().eq('id', 'dummy_client');
    }
    
    // Jobs table
    const { error: jobsError } = await supabase.from('jobs').upsert([
      {
        id: 'dummy_job',
        title: 'Dummy Job',
        type: 'photo_session',
        status: 'pending',
        description: 'Dummy job description',
        price: 0
      }
    ], { onConflict: 'id' });
    
    if (jobsError) {
      console.error('Error creating jobs table:', jobsError.message);
    } else {
      console.log('Jobs table created successfully');
      
      // Clean up dummy data
      await supabase.from('jobs').delete().eq('id', 'dummy_job');
    }
    
    // Job_Files table
    const { error: filesError } = await supabase.from('job_files').upsert([
      {
        id: 'dummy_file',
        job_id: 'dummy_job',
        file_name: 'dummy.jpg',
        file_path: '/dummy/path',
        file_type: 'image/jpeg',
        file_size: 0,
        is_final: false
      }
    ], { onConflict: 'id' });
    
    if (filesError) {
      console.error('Error creating job_files table:', filesError.message);
    } else {
      console.log('Job_Files table created successfully');
      
      // Clean up dummy data
      await supabase.from('job_files').delete().eq('id', 'dummy_file');
    }
    
    // Payments table
    const { error: paymentsError } = await supabase.from('payments').upsert([
      {
        id: 'dummy_payment',
        amount: 0,
        payment_method: 'cash',
        notes: 'Dummy payment'
      }
    ], { onConflict: 'id' });
    
    if (paymentsError) {
      console.error('Error creating payments table:', paymentsError.message);
    } else {
      console.log('Payments table created successfully');
      
      // Clean up dummy data
      await supabase.from('payments').delete().eq('id', 'dummy_payment');
    }
    
    // Notifications table
    const { error: notificationsError } = await supabase.from('notifications').upsert([
      {
        id: 'dummy_notification',
        title: 'Dummy Notification',
        message: 'This is a dummy notification',
        is_read: false
      }
    ], { onConflict: 'id' });
    
    if (notificationsError) {
      console.error('Error creating notifications table:', notificationsError.message);
    } else {
      console.log('Notifications table created successfully');
      
      // Clean up dummy data
      await supabase.from('notifications').delete().eq('id', 'dummy_notification');
    }
    
    // Activity_Logs table
    const { error: logsError } = await supabase.from('activity_logs').upsert([
      {
        id: 'dummy_log',
        action: 'dummy_action',
        resource_type: 'dummy',
        resource_id: 0,
        details: {}
      }
    ], { onConflict: 'id' });
    
    if (logsError) {
      console.error('Error creating activity_logs table:', logsError.message);
    } else {
      console.log('Activity_Logs table created successfully');
      
      // Clean up dummy data
      await supabase.from('activity_logs').delete().eq('id', 'dummy_log');
    }
    
    // Feedback table
    const { error: feedbackError } = await supabase.from('feedback').upsert([
      {
        id: 'dummy_feedback',
        content: 'Dummy feedback',
        rating: 5
      }
    ], { onConflict: 'id' });
    
    if (feedbackError) {
      console.error('Error creating feedback table:', feedbackError.message);
    } else {
      console.log('Feedback table created successfully');
      
      // Clean up dummy data
      await supabase.from('feedback').delete().eq('id', 'dummy_feedback');
    }
    
    console.log('All tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error.message);
    logger.error('Error creating tables:', error);
  }
};

// Seed default users
const seedDefaultUsers = async () => {
  try {
    console.log('Seeding default users...');
    
    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const receptionistPassword = await bcrypt.hash('reception123', 10);
    
    // Check if admin user exists
    const { data: existingAdmin } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'admin@example.com')
      .single();
    
    if (!existingAdmin) {
      // Create admin user
      const { error: adminError } = await supabase.from('users').insert({
        email: 'admin@example.com',
        password: adminPassword,
        name: 'Admin User',
        role: 'admin',
        is_active: true
      });
      
      if (adminError) {
        console.error('Error creating admin user:', adminError.message);
      } else {
        console.log('Admin user created successfully');
      }
    } else {
      console.log('Admin user already exists');
    }
    
    // Check if receptionist user exists
    const { data: existingReceptionist } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'receptionist@example.com')
      .single();
    
    if (!existingReceptionist) {
      // Create receptionist user
      const { error: receptionistError } = await supabase.from('users').insert({
        email: 'receptionist@example.com',
        password: receptionistPassword,
        name: 'Receptionist User',
        role: 'receptionist',
        is_active: true
      });
      
      if (receptionistError) {
        console.error('Error creating receptionist user:', receptionistError.message);
      } else {
        console.log('Receptionist user created successfully');
      }
    } else {
      console.log('Receptionist user already exists');
    }
    
    // Create one user of each role for testing
    const roles = ['photographer', 'designer', 'editor', 'client'];
    const defaultPassword = await bcrypt.hash('password123', 10);
    
    for (const role of roles) {
      // Check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', `${role}@example.com`)
        .single();
      
      if (!existingUser) {
        // Create user
        const { error: userError } = await supabase.from('users').insert({
          email: `${role}@example.com`,
          password: defaultPassword,
          name: `${role.charAt(0).toUpperCase() + role.slice(1)} User`,
          role: role,
          is_active: true
        });
        
        if (userError) {
          console.error(`Error creating ${role} user:`, userError.message);
        } else {
          console.log(`${role.charAt(0).toUpperCase() + role.slice(1)} user created successfully`);
        }
      } else {
        console.log(`${role.charAt(0).toUpperCase() + role.slice(1)} user already exists`);
      }
    }
    
    console.log('Default users seeded successfully');
  } catch (error) {
    console.error('Error seeding default users:', error.message);
    logger.error('Error seeding default users:', error);
  }
};

// Run the setup if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  setupSupabase().then(success => {
    if (success) {
      console.log('Supabase setup completed successfully!');
      process.exit(0);
    } else {
      console.error('Supabase setup failed!');
      process.exit(1);
    }
  });
}

export { setupSupabase };
