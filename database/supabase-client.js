import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

// Load environment variables
dotenv.config();

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xzvprtdxizsgwnddmgfb.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6dnBydGR4aXpzZ3duZGRtZ2ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNDA1NTAsImV4cCI6MjA2NjcxNjU1MH0.PMhyf5qtDYOIU2I00UvGBKsNB2ZkNA0KMy-R3sZGUrI';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('Initializing Supabase client...');

// Test connection
const testConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.from('users').select('count');
    
    if (error && error.code !== 'PGRST204') {
      console.error('Error connecting to Supabase:', error.message);
      logger.error('Error connecting to Supabase:', error);
      return false;
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

// Database client with methods that match our previous API
export const db = {
  // Query wrapper for SELECT operations
  async query(text, params = []) {
    try {
      // Parse the query to determine what to do
      if (text.trim().toLowerCase().startsWith('select')) {
        const tableName = extractTableName(text);
        const columns = extractColumns(text);
        const conditions = extractConditions(text, params);
        
        const { data, error } = await supabase
          .from(tableName)
          .select(columns)
          .match(conditions);
        
        if (error) throw error;
        return { rows: data || [], rowCount: data?.length || 0 };
      } else {
        throw new Error(`Unsupported query type: ${text}`);
      }
    } catch (error) {
      logger.error('Database query error:', error);
      throw error;
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
  async runAsync(query, params = []) {
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
          changes: result?.length || 0,
          lastID: result?.[0]?.id
        };
      } else if (query.trim().toLowerCase().startsWith('update')) {
        const tableName = extractTableName(query);
        const { data: updateData, conditions } = extractUpdateData(query, params);
        
        const { data: result, error } = await supabase
          .from(tableName)
          .update(updateData)
          .match(conditions)
          .select();
        
        if (error) throw error;
        
        return { 
          changes: result?.length || 0,
          lastID: null
        };
      } else if (query.trim().toLowerCase().startsWith('delete')) {
        const tableName = extractTableName(query);
        const conditions = extractDeleteConditions(query, params);
        
        const { data: result, error } = await supabase
          .from(tableName)
          .delete()
          .match(conditions)
          .select();
        
        if (error) throw error;
        
        return { 
          changes: result?.length || 0,
          lastID: null
        };
      } else {
        throw new Error(`Unsupported query type: ${query}`);
      }
    } catch (error) {
      logger.error('Database query error:', error);
      throw error;
    }
  },

  // Get a single row
  async getAsync(query, params = []) {
    try {
      const tableName = extractTableName(query);
      const columns = extractColumns(query);
      const conditions = extractConditions(query, params);
      
      const { data, error } = await supabase
        .from(tableName)
        .select(columns)
        .match(conditions)
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" which we handle as null
        throw error;
      }
      
      return data || null;
    } catch (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      logger.error('Database query error:', error);
      throw error;
    }
  },

  // Get multiple rows
  async allAsync(query, params = []) {
    try {
      const tableName = extractTableName(query);
      const columns = extractColumns(query);
      const conditions = extractConditions(query, params);
      
      const { data, error } = await supabase
        .from(tableName)
        .select(columns)
        .match(conditions);
      
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
  const deleteMatch = query.match(/delete\s+from\s+([^\s,;()]+)/i);
  
  return (fromMatch?.[1] || intoMatch?.[1] || updateMatch?.[1] || deleteMatch?.[1] || '').replace(/['"]/g, '');
}

// Helper function to extract columns from SELECT query
function extractColumns(query) {
  if (query.includes('select *')) {
    return '*';
  }
  
  const columnsMatch = query.match(/select\s+(.+?)\s+from/i);
  if (columnsMatch && columnsMatch[1]) {
    return columnsMatch[1].split(',').map(col => col.trim()).join(',');
  }
  
  return '*';
}

// Helper function to extract conditions from WHERE clause
function extractConditions(query, params = []) {
  const conditions = {};
  
  // Simple condition extraction for common patterns
  // This is a simplified version - in a real implementation, you'd need to parse the SQL properly
  
  // Pattern: WHERE column = $1
  const singleParamMatch = query.match(/where\s+([^\s=]+)\s*=\s*\$1/i);
  if (singleParamMatch && params.length > 0) {
    conditions[singleParamMatch[1].trim()] = params[0];
    return conditions;
  }
  
  // Pattern: WHERE column1 = $1 AND column2 = $2
  const multiParamMatch = query.match(/where\s+([^\s=]+)\s*=\s*\$1\s+and\s+([^\s=]+)\s*=\s*\$2/i);
  if (multiParamMatch && params.length > 1) {
    conditions[multiParamMatch[1].trim()] = params[0];
    conditions[multiParamMatch[2].trim()] = params[1];
    return conditions;
  }
  
  return conditions;
}

// Helper function to extract INSERT data
function extractInsertData(query, params = []) {
  // Extract column names from INSERT INTO table (col1, col2, ...) VALUES ($1, $2, ...)
  const columnsMatch = query.match(/\(([^)]+)\)/);
  if (!columnsMatch) return {};
  
  const columns = columnsMatch[1].split(',').map(col => col.trim());
  
  // Create data object
  const data = {};
  columns.forEach((column, index) => {
    if (index < params.length) {
      data[column] = params[index];
    }
  });
  
  return data;
}

// Helper function to extract UPDATE data and conditions
function extractUpdateData(query, params = []) {
  // This is a simplified version - in a real implementation, you'd need to parse the SQL properly
  const data = {};
  const conditions = {};
  
  // Extract SET clause: UPDATE table SET col1 = $1, col2 = $2 WHERE id = $3
  const setClauseMatch = query.match(/set\s+(.+?)\s+where/i);
  if (!setClauseMatch) return { data, conditions };
  
  const setClauses = setClauseMatch[1].split(',');
  let paramIndex = 0;
  
  // Process SET clauses
  setClauses.forEach(clause => {
    const parts = clause.trim().split('=');
    if (parts.length === 2) {
      const column = parts[0].trim();
      if (paramIndex < params.length) {
        data[column] = params[paramIndex++];
      }
    }
  });
  
  // Extract WHERE clause
  const whereClauseMatch = query.match(/where\s+(.+)$/i);
  if (whereClauseMatch) {
    const whereClause = whereClauseMatch[1];
    const whereConditionMatch = whereClause.match(/([^\s=]+)\s*=\s*\$(\d+)/);
    
    if (whereConditionMatch) {
      const column = whereConditionMatch[1].trim();
      const paramPosition = parseInt(whereConditionMatch[2]) - 1;
      
      if (paramPosition < params.length) {
        conditions[column] = params[paramPosition];
      }
    }
  }
  
  return { data, conditions };
}

// Helper function to extract DELETE conditions
function extractDeleteConditions(query, params = []) {
  const conditions = {};
  
  // Extract WHERE clause: DELETE FROM table WHERE id = $1
  const whereClauseMatch = query.match(/where\s+(.+)$/i);
  if (whereClauseMatch) {
    const whereClause = whereClauseMatch[1];
    const whereConditionMatch = whereClause.match(/([^\s=]+)\s*=\s*\$(\d+)/);
    
    if (whereConditionMatch) {
      const column = whereConditionMatch[1].trim();
      const paramPosition = parseInt(whereConditionMatch[2]) - 1;
      
      if (paramPosition < params.length) {
        conditions[column] = params[paramPosition];
      }
    }
  }
  
  return conditions;
}

// Execute the test connection
testConnection();

export default supabase;
