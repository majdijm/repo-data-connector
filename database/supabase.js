import { createClient } from '@supabase/supabase-js';
import logger from '../utils/logger.js';

// Supabase configuration
const SUPABASE_URL = 'https://xzvprtdxizsgwnddmgfb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6dnBydGR4aXpzZ3duZGRtZ2ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNDA1NTAsImV4cCI6MjA2NjcxNjU1MH0.PMhyf5qtDYOIU2I00UvGBKsNB2ZkNA0KMy-R3sZGUrI';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('Initializing Supabase client...');

// Test connection
const testConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      throw error;
    }
    
    console.log('Supabase connection successful');
    logger.info('Successfully connected to Supabase');
    return true;
  } catch (err) {
    console.error('Error connecting to Supabase:', err.message);
    logger.error('Error connecting to Supabase:', err);
    return false;
  }
};

// Execute the test connection
testConnection();

// Helper functions to work with Supabase
export const db = {
  // Query wrapper for SELECT operations
  async query(text, params = []) {
    // For simple SELECT queries
    if (text.trim().toLowerCase().startsWith('select')) {
      const tableName = extractTableName(text);
      const { data, error } = await supabase
        .from(tableName)
        .select('*');
      
      if (error) throw error;
      return { rows: data, rowCount: data.length };
    } else {
      logger.error('Unsupported query type for Supabase client:', text);
      throw new Error('Unsupported query type for Supabase client');
    }
  },
  
  // Get a client (compatibility function)
  async getClient() {
    return {
      query: async (text, params) => {
        return await db.query(text, params);
      },
      release: () => {}
    };
  },
  
  // Run a query that modifies data
  async runAsync(query, params) {
    try {
      if (query.trim().toLowerCase().startsWith('insert into')) {
        const tableName = extractTableName(query);
        const data = extractInsertData(query, params);
        
        const { data: result, error } = await supabase
          .from(tableName)
          .insert(data)
          .select();
        
        if (error) throw error;
        
        return { 
          changes: result.length,
          lastID: result[0]?.id
        };
      } else if (query.trim().toLowerCase().startsWith('update')) {
        const tableName = extractTableName(query);
        const { data: updateData, condition } = extractUpdateData(query, params);
        
        const { data: result, error } = await supabase
          .from(tableName)
          .update(updateData)
          .match(condition)
          .select();
        
        if (error) throw error;
        
        return { 
          changes: result.length,
          lastID: null
        };
      } else {
        logger.error('Unsupported query type for Supabase client:', query);
        throw new Error('Unsupported query type for Supabase client');
      }
    } catch (error) {
      logger.error('Database query error:', error);
      throw error;
    }
  },

  // Get a single row
  async getAsync(query, params) {
    try {
      const tableName = extractTableName(query);
      const condition = extractWhereCondition(query, params);
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .match(condition)
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" which we handle as null
        throw error;
      }
      
      return data || null;
    } catch (error) {
      logger.error('Database query error:', error);
      throw error;
    }
  },

  // Get multiple rows
  async allAsync(query, params) {
    try {
      const tableName = extractTableName(query);
      const condition = extractWhereCondition(query, params);
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .match(condition);
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      logger.error('Database query error:', error);
      throw error;
    }
  }
};

// Helper function to extract table name from SQL query
function extractTableName(query) {
  const fromMatch = query.match(/from\s+([^\s,;()]+)/i);
  const intoMatch = query.match(/into\s+([^\s,;()]+)/i);
  const updateMatch = query.match(/update\s+([^\s,;()]+)/i);
  
  return (fromMatch?.[1] || intoMatch?.[1] || updateMatch?.[1] || '').replace(/['"]/g, '');
}

// Helper function to extract WHERE conditions
function extractWhereCondition(query, params) {
  // This is a simplified version - in a real implementation, you'd need to parse the SQL properly
  const whereMatch = query.match(/where\s+([^\s]+)\s*=\s*\$1/i);
  if (whereMatch && params && params.length > 0) {
    const field = whereMatch[1];
    return { [field]: params[0] };
  }
  return {};
}

// Helper function to extract INSERT data
function extractInsertData(query, params) {
  // Very simplified - would need proper SQL parsing in production
  const fields = query.match(/\(([^)]+)\)/)?.[1].split(',').map(f => f.trim());
  if (fields && params) {
    const data = {};
    fields.forEach((field, index) => {
      if (index < params.length) {
        data[field] = params[index];
      }
    });
    return data;
  }
  return {};
}

// Helper function to extract UPDATE data
function extractUpdateData(query, params) {
  // Very simplified - would need proper SQL parsing in production
  const setClause = query.match(/set\s+([^;]+)\s+where/i)?.[1];
  const whereClause = query.match(/where\s+([^;]+)/i)?.[1];
  
  const data = {};
  const condition = {};
  
  if (setClause && params) {
    const setParts = setClause.split(',').map(p => p.trim());
    let paramIndex = 0;
    
    setParts.forEach(part => {
      const [field] = part.split('=');
      if (field && paramIndex < params.length) {
        data[field.trim()] = params[paramIndex++];
      }
    });
    
    if (whereClause && paramIndex < params.length) {
      const [field] = whereClause.split('=');
      if (field) {
        condition[field.trim()] = params[paramIndex];
      }
    }
  }
  
  return { data, condition };
}
