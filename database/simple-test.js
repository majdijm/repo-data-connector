import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://xzvprtdxizsgwnddmgfb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6dnBydGR4aXpzZ3duZGRtZ2ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNDA1NTAsImV4cCI6MjA2NjcxNjU1MH0.PMhyf5qtDYOIU2I00UvGBKsNB2ZkNA0KMy-R3sZGUrI';

// Initialize Supabase client with timeout options
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false
  },
  global: {
    fetch: (url, options) => {
      const timeout = 5000; // 5 seconds timeout
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

console.log('Testing Supabase connection with 5-second timeout...');

// Simple health check
supabase.auth.getSession()
  .then(({ data, error }) => {
    if (error) {
      console.error('Connection error:', error.message);
    } else {
      console.log('Connection successful!');
      console.log('Session data:', data);
    }
  })
  .catch(err => {
    console.error('Connection failed:', err.message);
  })
  .finally(() => {
    console.log('Test completed');
  });
