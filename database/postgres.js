import pg from 'pg';
import logger from '../utils/logger.js';

const { Pool } = pg;

// PostgreSQL connection configuration
// Using connectionString with properly URL-encoded password
const connectionString = 'postgresql://postgres:2010J%40mool1983@db.xzvprtdxizsgwnddmgfb.supabase.co:5432/postgres';

const connectionConfig = {
  connectionString,
  ssl: {
    rejectUnauthorized: false // Required for Supabase
  },
  connectionTimeoutMillis: 30000, // 30 seconds
  idleTimeoutMillis: 30000 // 30 seconds
};

console.log('Initializing PostgreSQL connection...');

// Create the pool but don't connect immediately
const pool = new Pool(connectionConfig);

// Add error handler for the pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  logger.error('Unexpected error on idle PostgreSQL client', err);
});

// Function to test the connection
const testConnection = async () => {
  let client;
  try {
    console.log('Testing PostgreSQL connection...');
    client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time');
    console.log('PostgreSQL connection successful. Server time:', result.rows[0].current_time);
    logger.info('Successfully connected to PostgreSQL database');
    return true;
  } catch (err) {
    console.error('Error connecting to PostgreSQL database:', err.message);
    logger.error('Error connecting to PostgreSQL database:', err);
    return false;
  } finally {
    if (client) client.release();
  }
};

// Execute the test connection
testConnection();

// Helper functions to work with the database
export const db = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  
  // Helper functions similar to the SQLite ones
  async runAsync(query, params) {
    try {
      const result = await pool.query(query, params);
      return { 
        changes: result.rowCount,
        lastID: result.rows[0]?.id
      };
    } catch (error) {
      logger.error('Database query error:', error);
      throw error;
    }
  },

  async getAsync(query, params) {
    try {
      const result = await pool.query(query, params);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Database query error:', error);
      throw error;
    }
  },

  async allAsync(query, params) {
    try {
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Database query error:', error);
      throw error;
    }
  }
};
