import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

// Try with a different connection string format
const client = new Client({
  connectionString: 'postgres://postgres:2010J%40mool1983@db.xzvprtdxizsgwnddmgfb.supabase.co:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

console.log('Attempting to connect to PostgreSQL...');

try {
  await client.connect();
  console.log('Connected to PostgreSQL successfully!');
  
  const res = await client.query('SELECT NOW() as time');
  console.log('Current time from database:', res.rows[0].time);
  
  await client.end();
} catch (error) {
  console.error('Error with PostgreSQL connection:', error);
}
