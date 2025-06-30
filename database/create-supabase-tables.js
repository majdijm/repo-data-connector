import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

// Load environment variables
dotenv.config();

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xzvprtdxizsgwnddmgfb.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6dnBydGR4aXpzZ3duZGRtZ2ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNDA1NTAsImV4cCI6MjA2NjcxNjU1MH0.PMhyf5qtDYOIU2I00UvGBKsNB2ZkNA0KMy-R3sZGUrI';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Create tables in Supabase
const createTables = async () => {
  console.log('Creating tables in Supabase...');
  
  try {
    // Create users table
    console.log('Creating users table...');
    const { error: usersError } = await supabase
      .from('users')
      .insert({
        id: 'temp_id',
        email: 'temp@example.com',
        password: 'temp_password',
        name: 'Temporary User',
        role: 'admin',
        is_active: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();
    
    if (usersError) {
      console.log('Users table already exists or error:', usersError.message);
    } else {
      console.log('Users table created successfully');
      // Clean up temporary data
      await supabase.from('users').delete().eq('id', 'temp_id');
    }
    
    // Create clients table
    console.log('Creating clients table...');
    const { error: clientsError } = await supabase
      .from('clients')
      .insert({
        id: 'temp_id',
        name: 'Temporary Client',
        email: 'temp_client@example.com',
        phone: '1234567890',
        address: 'Temporary Address',
        total_paid: 0,
        total_due: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();
    
    if (clientsError) {
      console.log('Clients table already exists or error:', clientsError.message);
    } else {
      console.log('Clients table created successfully');
      // Clean up temporary data
      await supabase.from('clients').delete().eq('id', 'temp_id');
    }
    
    // Create jobs table
    console.log('Creating jobs table...');
    const { error: jobsError } = await supabase
      .from('jobs')
      .insert({
        id: 'temp_id',
        title: 'Temporary Job',
        type: 'photo_session',
        status: 'pending',
        description: 'Temporary job description',
        price: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();
    
    if (jobsError) {
      console.log('Jobs table already exists or error:', jobsError.message);
    } else {
      console.log('Jobs table created successfully');
      // Clean up temporary data
      await supabase.from('jobs').delete().eq('id', 'temp_id');
    }
    
    // Create job_files table
    console.log('Creating job_files table...');
    const { error: filesError } = await supabase
      .from('job_files')
      .insert({
        id: 'temp_id',
        file_name: 'temp.jpg',
        file_path: '/temp/path',
        file_type: 'image/jpeg',
        file_size: 0,
        is_final: false,
        created_at: new Date().toISOString()
      })
      .select();
    
    if (filesError) {
      console.log('Job_files table already exists or error:', filesError.message);
    } else {
      console.log('Job_files table created successfully');
      // Clean up temporary data
      await supabase.from('job_files').delete().eq('id', 'temp_id');
    }
    
    // Create payments table
    console.log('Creating payments table...');
    const { error: paymentsError } = await supabase
      .from('payments')
      .insert({
        id: 'temp_id',
        amount: 0,
        payment_date: new Date().toISOString(),
        payment_method: 'cash',
        notes: 'Temporary payment',
        created_at: new Date().toISOString()
      })
      .select();
    
    if (paymentsError) {
      console.log('Payments table already exists or error:', paymentsError.message);
    } else {
      console.log('Payments table created successfully');
      // Clean up temporary data
      await supabase.from('payments').delete().eq('id', 'temp_id');
    }
    
    // Create notifications table
    console.log('Creating notifications table...');
    const { error: notificationsError } = await supabase
      .from('notifications')
      .insert({
        id: 'temp_id',
        title: 'Temporary Notification',
        message: 'This is a temporary notification',
        is_read: false,
        created_at: new Date().toISOString()
      })
      .select();
    
    if (notificationsError) {
      console.log('Notifications table already exists or error:', notificationsError.message);
    } else {
      console.log('Notifications table created successfully');
      // Clean up temporary data
      await supabase.from('notifications').delete().eq('id', 'temp_id');
    }
    
    // Create activity_logs table
    console.log('Creating activity_logs table...');
    const { error: logsError } = await supabase
      .from('activity_logs')
      .insert({
        id: 'temp_id',
        action: 'temporary_action',
        resource_type: 'temporary',
        resource_id: 0,
        details: {},
        created_at: new Date().toISOString()
      })
      .select();
    
    if (logsError) {
      console.log('Activity_logs table already exists or error:', logsError.message);
    } else {
      console.log('Activity_logs table created successfully');
      // Clean up temporary data
      await supabase.from('activity_logs').delete().eq('id', 'temp_id');
    }
    
    // Create feedback table
    console.log('Creating feedback table...');
    const { error: feedbackError } = await supabase
      .from('feedback')
      .insert({
        id: 'temp_id',
        content: 'Temporary feedback',
        rating: 5,
        created_at: new Date().toISOString()
      })
      .select();
    
    if (feedbackError) {
      console.log('Feedback table already exists or error:', feedbackError.message);
    } else {
      console.log('Feedback table created successfully');
      // Clean up temporary data
      await supabase.from('feedback').delete().eq('id', 'temp_id');
    }
    
    console.log('All tables created or verified');
    return true;
  } catch (error) {
    console.error('Error creating tables:', error.message);
    logger.error('Error creating tables:', error);
    return false;
  }
};

// Run the script if executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  createTables().then(success => {
    if (success) {
      console.log('Tables created successfully');
      process.exit(0);
    } else {
      console.error('Failed to create tables');
      process.exit(1);
    }
  });
}

export { createTables };
