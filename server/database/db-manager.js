import logger from '../utils/logger.js';
import * as pgDb from './postgres.js';
import * as sqliteDb from './init.js';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xzvprtdxizsgwnddmgfb.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6dnBydGR4aXpzZ3duZGRtZ2ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNDA1NTAsImV4cCI6MjA2NjcxNjU1MH0.PMhyf5qtDYOIU2I00UvGBKsNB2ZkNA0KMy-R3sZGUrI';

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

// Database manager to handle fallback between PostgreSQL and SQLite
let activeDb = null;
let usingFallback = false;

// Supabase database wrapper
const supabaseDb = {
  async query(text, params = []) {
    try {
      // Parse the query to determine what to do
      if (text.trim().toLowerCase().startsWith('select')) {
        const tableName = extractTableName(text);
        const { data, error } = await supabase.from(tableName).select('*');
        
        if (error) throw error;
        return { rows: data || [], rowCount: data?.length || 0 };
      } else {
        throw new Error(`Unsupported query type: ${text}`);
      }
    } catch (error) {
      logger.error('Supabase query error:', error);
      throw error;
    }
  },
  
  async getClient() {
    return {
      query: async (text, params) => {
        return await supabaseDb.query(text, params);
      },
      release: () => {}
    };
  },
  
  async runAsync(query, params = []) {
    try {
      if (query.trim().toLowerCase().startsWith('insert into')) {
        const tableName = extractTableName(query);
        const { data, error } = await supabase.from(tableName).insert(params[0]);
        
        if (error) throw error;
        return { changes: 1, lastID: data?.[0]?.id };
      } else if (query.trim().toLowerCase().startsWith('update')) {
        const tableName = extractTableName(query);
        const { data, error } = await supabase.from(tableName).update(params[0]).eq('id', params[1]);
        
        if (error) throw error;
        return { changes: 1 };
      } else if (query.trim().toLowerCase().startsWith('delete')) {
        const tableName = extractTableName(query);
        const { data, error } = await supabase.from(tableName).delete().eq('id', params[0]);
        
        if (error) throw error;
        return { changes: 1 };
      }
      throw new Error(`Unsupported query type: ${query}`);
    } catch (error) {
      logger.error('Supabase query error:', error);
      throw error;
    }
  },

  async getAsync(query, params = []) {
    try {
      const tableName = extractTableName(query);
      const { data, error } = await supabase.from(tableName).select('*').eq('id', params[0]).single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      if (error.code === 'PGRST116') return null;
      logger.error('Supabase query error:', error);
      throw error;
    }
  },

  async allAsync(query, params = []) {
    try {
      const tableName = extractTableName(query);
      const { data, error } = await supabase.from(tableName).select('*');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Supabase query error:', error);
      throw error;
    }
  }
};

// Helper function to extract table name from SQL query
function extractTableName(query) {
  const fromMatch = query.match(/from\s+([^\s,;()]+)/i);
  const intoMatch = query.match(/into\s+([^\s,;()]+)/i);
  const updateMatch = query.match(/update\s+([^\s,;()]+)/i);
  const deleteMatch = query.match(/delete\s+from\s+([^\s,;()]+)/i);
  
  return (fromMatch?.[1] || intoMatch?.[1] || updateMatch?.[1] || deleteMatch?.[1] || '').replace(/['"`]/g, '');
}

export const initializeDatabase = async () => {
  console.log('Initializing database connection...');
  
  // Try Supabase first
  try {
    console.log('Attempting to connect to Supabase...');
    // Test Supabase connection
    const { data, error } = await supabase.auth.getSession();
    
    if (error) throw error;
    
    console.log('Successfully connected to Supabase');
    activeDb = supabaseDb;
    
    return { db: activeDb, type: 'supabase' };
  } catch (supabaseError) {
    console.error('Supabase connection failed:', supabaseError.message);
    logger.error('Supabase connection failed:', supabaseError);
    
    // Try PostgreSQL next
    try {
      console.log('Attempting to connect to PostgreSQL...');
      // Test PostgreSQL connection
      const client = await pgDb.db.getClient();
      await client.query('SELECT 1');
      client.release();
      
      console.log('Successfully connected to PostgreSQL database');
      activeDb = pgDb.db;
      
      // Initialize PostgreSQL database
      const { initializeDatabase } = await import('./postgres-init.js');
      await initializeDatabase();
      
      return { db: activeDb, type: 'postgresql' };
    } catch (pgError) {
      console.error('PostgreSQL connection failed:', pgError.message);
      logger.error('PostgreSQL connection failed:', pgError);
      
      // Fall back to SQLite
      console.log('Falling back to SQLite database...');
      try {
        // Initialize SQLite database
        const { initializeDatabase } = await import('./init.js');
        await initializeDatabase();
        
        activeDb = sqliteDb.db;
        usingFallback = true;
        console.log('Successfully connected to SQLite database (fallback)');
        return { db: activeDb, type: 'sqlite' };
      } catch (sqliteError) {
        console.error('SQLite fallback failed:', sqliteError.message);
        logger.error('SQLite fallback failed:', sqliteError);
        throw new Error('All database connections failed');
      }
    }
  }
};

// Export the active database
export const getDb = () => {
  if (!activeDb) {
    throw new Error('Database not initialized');
  }
  return activeDb;
};

// Check if using fallback
export const isUsingFallback = () => usingFallback;
