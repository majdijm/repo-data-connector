import pg from 'pg';
const { Client } = pg;

// Try a different approach with Client instead of Pool
const client = new Client({
  user: 'postgres',
  password: '2010J@mool1983',
  host: 'db.xzvprtdxizsgwnddmgfb.supabase.co',
  port: 5432,
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

console.log('Attempting to connect to PostgreSQL using Client...');

client.connect()
  .then(() => {
    console.log('Connected to PostgreSQL successfully!');
    return client.query('SELECT NOW() as current_time');
  })
  .then(res => {
    console.log('Current time from database:', res.rows[0].current_time);
    client.end();
  })
  .catch(err => {
    console.error('Error connecting to PostgreSQL:', err);
    process.exit(1);
  });
