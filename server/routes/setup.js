import express from 'express';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import logger from '../utils/logger.js';

const router = express.Router();

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xzvprtdxizsgwnddmgfb.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6dnBydGR4aXpzZ3duZGRtZ2ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNDA1NTAsImV4cCI6MjA2NjcxNjU1MH0.PMhyf5qtDYOIU2I00UvGBKsNB2ZkNA0KMy-R3sZGUrI';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test connection endpoint
router.get('/test-connection', async (req, res) => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      logger.error('Supabase connection error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
    
    return res.json({ success: true, message: 'Supabase connection successful' });
  } catch (error) {
    logger.error('Supabase connection test failed:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Create tables endpoint
router.post('/create-tables', async (req, res) => {
  try {
    const results = {
      users: null,
      clients: null,
      jobs: null,
      job_files: null,
      payments: null,
      notifications: null,
      activity_logs: null,
      feedback: null
    };
    
    // Create users table
    try {
      const { error } = await supabase
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
      
      results.users = error ? { success: false, error: error.message } : { success: true };
      
      // Clean up if successful
      if (!error) {
        await supabase.from('users').delete().eq('id', '00000000-0000-0000-0000-000000000000');
      }
    } catch (error) {
      results.users = { success: false, error: error.message };
    }
    
    // Create clients table
    try {
      const { error } = await supabase
        .from('clients')
        .insert({
          id: '00000000-0000-0000-0000-000000000000',
          name: 'Temporary Client',
          email: 'temp_client@example.com',
          phone: '1234567890',
          address: 'Temporary Address',
          total_paid: 0,
          total_due: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      results.clients = error ? { success: false, error: error.message } : { success: true };
      
      // Clean up if successful
      if (!error) {
        await supabase.from('clients').delete().eq('id', '00000000-0000-0000-0000-000000000000');
      }
    } catch (error) {
      results.clients = { success: false, error: error.message };
    }
    
    // Create jobs table
    try {
      const { error } = await supabase
        .from('jobs')
        .insert({
          id: '00000000-0000-0000-0000-000000000000',
          title: 'Temporary Job',
          type: 'photo_session',
          status: 'pending',
          description: 'Temporary job description',
          price: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      results.jobs = error ? { success: false, error: error.message } : { success: true };
      
      // Clean up if successful
      if (!error) {
        await supabase.from('jobs').delete().eq('id', '00000000-0000-0000-0000-000000000000');
      }
    } catch (error) {
      results.jobs = { success: false, error: error.message };
    }
    
    // Create job_files table
    try {
      const { error } = await supabase
        .from('job_files')
        .insert({
          id: '00000000-0000-0000-0000-000000000000',
          file_name: 'temp.jpg',
          file_path: '/temp/path',
          file_type: 'image/jpeg',
          file_size: 0,
          is_final: false,
          created_at: new Date().toISOString()
        });
      
      results.job_files = error ? { success: false, error: error.message } : { success: true };
      
      // Clean up if successful
      if (!error) {
        await supabase.from('job_files').delete().eq('id', '00000000-0000-0000-0000-000000000000');
      }
    } catch (error) {
      results.job_files = { success: false, error: error.message };
    }
    
    // Create payments table
    try {
      const { error } = await supabase
        .from('payments')
        .insert({
          id: '00000000-0000-0000-0000-000000000000',
          amount: 0,
          payment_date: new Date().toISOString(),
          payment_method: 'cash',
          notes: 'Temporary payment',
          created_at: new Date().toISOString()
        });
      
      results.payments = error ? { success: false, error: error.message } : { success: true };
      
      // Clean up if successful
      if (!error) {
        await supabase.from('payments').delete().eq('id', '00000000-0000-0000-0000-000000000000');
      }
    } catch (error) {
      results.payments = { success: false, error: error.message };
    }
    
    // Create notifications table
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          id: '00000000-0000-0000-0000-000000000000',
          title: 'Temporary Notification',
          message: 'This is a temporary notification',
          is_read: false,
          created_at: new Date().toISOString()
        });
      
      results.notifications = error ? { success: false, error: error.message } : { success: true };
      
      // Clean up if successful
      if (!error) {
        await supabase.from('notifications').delete().eq('id', '00000000-0000-0000-0000-000000000000');
      }
    } catch (error) {
      results.notifications = { success: false, error: error.message };
    }
    
    // Create activity_logs table
    try {
      const { error } = await supabase
        .from('activity_logs')
        .insert({
          id: '00000000-0000-0000-0000-000000000000',
          action: 'temporary_action',
          resource_type: 'temporary',
          resource_id: '00000000-0000-0000-0000-000000000000',
          details: {},
          created_at: new Date().toISOString()
        });
      
      results.activity_logs = error ? { success: false, error: error.message } : { success: true };
      
      // Clean up if successful
      if (!error) {
        await supabase.from('activity_logs').delete().eq('id', '00000000-0000-0000-0000-000000000000');
      }
    } catch (error) {
      results.activity_logs = { success: false, error: error.message };
    }
    
    // Create feedback table
    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          id: '00000000-0000-0000-0000-000000000000',
          content: 'Temporary feedback',
          rating: 5,
          created_at: new Date().toISOString()
        });
      
      results.feedback = error ? { success: false, error: error.message } : { success: true };
      
      // Clean up if successful
      if (!error) {
        await supabase.from('feedback').delete().eq('id', '00000000-0000-0000-0000-000000000000');
      }
    } catch (error) {
      results.feedback = { success: false, error: error.message };
    }
    
    return res.json({ success: true, results });
  } catch (error) {
    logger.error('Error creating tables:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Seed users endpoint
router.post('/seed-users', async (req, res) => {
  try {
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
    
    const results = [];
    
    for (const user of defaultUsers) {
      try {
        // Check if user already exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', user.email)
          .single();
        
        if (existingUser) {
          results.push({ email: user.email, status: 'skipped', message: 'User already exists' });
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
          results.push({ email: user.email, status: 'error', error: error.message });
        } else {
          results.push({ email: user.email, status: 'success', id: data[0].id });
        }
      } catch (error) {
        results.push({ email: user.email, status: 'error', error: error.message });
      }
    }
    
    return res.json({ success: true, results });
  } catch (error) {
    logger.error('Error seeding users:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
