import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://xzvprtdxizsgwnddmgfb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6dnBydGR4aXpzZ3duZGRtZ2ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNDA1NTAsImV4cCI6MjA2NjcxNjU1MH0.PMhyf5qtDYOIU2I00UvGBKsNB2ZkNA0KMy-R3sZGUrI';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test connection
async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Try to list tables (this is a read-only operation)
    const { data, error } = await supabase
      .from('pg_tables')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error connecting to Supabase:', error);
    } else {
      console.log('Successfully connected to Supabase!');
      console.log('Available tables:', data);
    }
  } catch (error) {
    console.error('Connection test failed:', error);
  }
}

testConnection();
