import pg from 'pg';
const { Pool } = pg;

// Using the properly URL-encoded connection string
const connectionString = 'postgresql://postgres:2010J%40mool1983@db.xzvprtdxizsgwnddmgfb.supabase.co:5432/postgres';

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

console.log('Attempting to connect to PostgreSQL...');

// Test connection
try {
  const client = await pool.connect();
  console.log('Successfully connected to PostgreSQL database!');
  
  const result = await client.query('SELECT NOW() as current_time');
  console.log('Current time from database:', result.rows[0].current_time);
  
  client.release();
  await pool.end();
} catch (err) {
  console.error('Error connecting to PostgreSQL database:', err);
}
