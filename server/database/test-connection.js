import pg from 'pg';
const { Pool } = pg;

// PostgreSQL connection configuration - trying different approaches
const pool = new Pool({
  connectionString: 'postgresql://postgres:2010J%40mool1983@db.xzvprtdxizsgwnddmgfb.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

console.log('Attempting to connect to PostgreSQL...');

// Test connection
pool.connect()
  .then(client => {
    console.log('Successfully connected to PostgreSQL database!');
    
    // Test a simple query
    return client.query('SELECT NOW()')
      .then(res => {
        console.log('Query result:', res.rows[0]);
        client.release();
        process.exit(0);
      })
      .catch(err => {
        console.error('Query error:', err);
        client.release();
        process.exit(1);
      });
  })
  .catch(err => {
    console.error('Error connecting to PostgreSQL database:', err);
    process.exit(1);
  });
