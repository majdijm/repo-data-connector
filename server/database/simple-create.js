import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://xzvprtdxizsgwnddmgfb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6dnBydGR4aXpzZ3duZGRtZ2ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNDA1NTAsImV4cCI6MjA2NjcxNjU1MH0.PMhyf5qtDYOIU2I00UvGBKsNB2ZkNA0KMy-R3sZGUrI';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createUserTable() {
  console.log('Creating users table...');
  
  try {
    // Try to insert a test user to create the table
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'admin',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();
    
    if (error) {
      console.error('Error creating users table:', error.message);
    } else {
      console.log('Users table created successfully:', data);
    }
  } catch (error) {
    console.error('Exception creating users table:', error);
  }
}

// Run the function
createUserTable()
  .then(() => console.log('Done'))
  .catch(err => console.error('Unhandled error:', err));
