const { Client } = require('pg');

// Try with CommonJS syntax and more detailed error handling
const client = new Client({
  user: 'postgres',
  password: '2010J@mool1983',
  host: 'db.xzvprtdxizsgwnddmgfb.supabase.co',
  port: 5432,
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 30000 // 30 seconds
});

console.log('Attempting to connect to PostgreSQL...');

client.connect((err) => {
  if (err) {
    console.error('Connection error:', err);
    return;
  }
  
  console.log('Connected to PostgreSQL!');
  
  client.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('Query error:', err);
    } else {
      console.log('Database time:', res.rows[0]);
    }
    
    client.end();
  });
});
