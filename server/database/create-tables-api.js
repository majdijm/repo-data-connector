import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xzvprtdxizsgwnddmgfb.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6dnBydGR4aXpzZ3duZGRtZ2ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNDA1NTAsImV4cCI6MjA2NjcxNjU1MH0.PMhyf5qtDYOIU2I00UvGBKsNB2ZkNA0KMy-R3sZGUrI';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createUsersTable() {
  console.log('Creating users table...');
  
  try {
    // First, try to select from the table to see if it exists
    const { data, error } = await supabase.from('users').select('id').limit(1);
    
    if (error) {
      console.log('Users table does not exist, creating...');
      
      // Create a user to force table creation with the right schema
      const { error: insertError } = await supabase.from('users').insert({
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', 10),
        name: 'Admin User',
        role: 'admin',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      if (insertError) {
        console.error('Error creating users table:', insertError);
        return false;
      } else {
        console.log('Users table created successfully!');
        return true;
      }
    } else {
      console.log('Users table already exists');
      return true;
    }
  } catch (error) {
    console.error('Error in createUsersTable:', error);
    return false;
  }
}

// Run the function
createUsersTable()
  .then(result => {
    console.log('Operation completed with result:', result);
    process.exit(0);
  })
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
