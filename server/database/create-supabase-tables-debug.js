import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup logging to file
const logFile = path.join(__dirname, 'supabase-debug.log');
const log = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp}: ${message}\n`;
  console.log(message);
  fs.appendFileSync(logFile, logMessage);
};

// Clear previous log
if (fs.existsSync(logFile)) {
  fs.unlinkSync(logFile);
}

// Load environment variables
log('Loading environment variables...');
dotenv.config();

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xzvprtdxizsgwnddmgfb.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6dnBydGR4aXpzZ3duZGRtZ2ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNDA1NTAsImV4cCI6MjA2NjcxNjU1MH0.PMhyf5qtDYOIU2I00UvGBKsNB2ZkNA0KMy-R3sZGUrI';

log(`Using Supabase URL: ${SUPABASE_URL}`);
log(`Using Supabase Key: ${SUPABASE_ANON_KEY.substring(0, 10)}...`);

// Initialize Supabase client
log('Initializing Supabase client...');
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Create tables in Supabase
const createTables = async () => {
  log('Creating tables in Supabase...');
  
  try {
    // Create users table
    log('Creating users table...');
    const { data: userData, error: usersError } = await supabase
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
      log(`Users table error: ${usersError.message}`);
      log(`Error details: ${JSON.stringify(usersError)}`);
    } else {
      log('Users table created successfully');
      log(`Response data: ${JSON.stringify(userData)}`);
      // Clean up temporary data
      await supabase.from('users').delete().eq('id', 'temp_id');
    }
    
    // Create clients table
    log('Creating clients table...');
    const { data: clientData, error: clientsError } = await supabase
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
      log(`Clients table error: ${clientsError.message}`);
      log(`Error details: ${JSON.stringify(clientsError)}`);
    } else {
      log('Clients table created successfully');
      log(`Response data: ${JSON.stringify(clientData)}`);
      // Clean up temporary data
      await supabase.from('clients').delete().eq('id', 'temp_id');
    }
    
    log('All tables created or verified');
    return true;
  } catch (error) {
    log(`Error creating tables: ${error.message}`);
    log(`Error stack: ${error.stack}`);
    return false;
  }
};

// Run the script if executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  log('Starting table creation process...');
  createTables().then(success => {
    if (success) {
      log('Tables created successfully');
      process.exit(0);
    } else {
      log('Failed to create tables');
      process.exit(1);
    }
  }).catch(error => {
    log(`Unhandled error: ${error.message}`);
    log(`Error stack: ${error.stack}`);
    process.exit(1);
  });
}

export { createTables };
