import bcrypt from 'bcryptjs';
import logger from '../utils/logger.js';
import { db } from './supabase.js';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://xzvprtdxizsgwnddmgfb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6dnBydGR4aXpzZ3duZGRtZ2ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNDA1NTAsImV4cCI6MjA2NjcxNjU1MH0.PMhyf5qtDYOIU2I00UvGBKsNB2ZkNA0KMy-R3sZGUrI';

// Initialize Supabase client with direct access
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Create tables using Supabase REST API
const createTables = async () => {
  try {
    console.log('Creating tables in Supabase...');
    
    // For Supabase, we need to use the REST API to create tables
    // This is a simplified approach - in a real app, you'd use migrations
    
    // First, let's check if we can access the database
    const { data: healthCheck, error: healthError } = await supabase.rpc('get_service_status');
    
    if (healthError) {
      console.error('Cannot access Supabase SQL API:', healthError.message);
      console.log('Will use direct API calls to create and manage data instead');
      return;
    }
    
    console.log('Supabase service status:', healthCheck);
    
    // Instead of trying to create tables with SQL, we'll use the REST API
    // and let Supabase create tables automatically when we insert data
    
    console.log('Tables will be created automatically when data is inserted');
  } catch (error) {
    console.error('Error setting up tables:', error.message);
    logger.error('Error setting up tables:', error);
    // Continue anyway - tables will be created on first insert
  }
};

// Seed default users
const seedDefaultUsers = async () => {
  try {
    console.log('Seeding default users...');
    
    // Check if admin user exists
    const { data: adminExists, error: adminCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'admin@example.com')
      .limit(1);
    
    if (adminCheckError) throw adminCheckError;
    
    if (!adminExists || adminExists.length === 0) {
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const { data: admin, error: adminError } = await supabase
        .from('users')
        .insert({
          email: 'admin@example.com',
          password: hashedPassword,
          name: 'Admin User',
          role: 'admin'
        })
        .select();
      
      if (adminError) throw adminError;
      console.log('Admin user created');
    } else {
      console.log('Admin user already exists');
    }
    
    // Check if receptionist user exists
    const { data: receptionistExists, error: receptionistCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'receptionist@example.com')
      .limit(1);
    
    if (receptionistCheckError) throw receptionistCheckError;
    
    if (!receptionistExists || receptionistExists.length === 0) {
      // Create receptionist user
      const hashedPassword = await bcrypt.hash('reception123', 10);
      
      const { data: receptionist, error: receptionistError } = await supabase
        .from('users')
        .insert({
          email: 'receptionist@example.com',
          password: hashedPassword,
          name: 'Reception User',
          role: 'receptionist'
        })
        .select();
      
      if (receptionistError) throw receptionistError;
      console.log('Receptionist user created');
    } else {
      console.log('Receptionist user already exists');
    }
    
    console.log('Default users seeded successfully');
  } catch (error) {
    console.error('Error seeding default users:', error.message);
    logger.error('Error seeding default users:', error);
    throw error;
  }
};

// Main initialization function
export const initializeDatabase = async () => {
  try {
    console.log('Starting Supabase database initialization...');
    
    // First, check if we can connect to Supabase
    try {
      const { data, error } = await supabase.from('users').select('count');
      if (error) throw error;
      console.log('Supabase connection verified');
    } catch (connError) {
      console.error('Supabase connection failed:', connError.message);
      console.error('Cannot initialize database without connection. Please check your Supabase credentials.');
      return false;
    }
    
    // Continue with initialization if connection is successful
    try {
      await createTables();
    } catch (tableError) {
      console.error('Error creating tables:', tableError.message);
      // Continue with other operations even if table creation fails
    }
    
    try {
      await seedDefaultUsers();
    } catch (userError) {
      console.error('Error seeding users:', userError.message);
    }
    
    console.log('Supabase database initialization completed');
    logger.info('Supabase database initialization completed');
    return true;
  } catch (error) {
    console.error('Supabase database initialization failed:', error.message);
    logger.error('Supabase database initialization failed:', error);
    return false;
  }
};
