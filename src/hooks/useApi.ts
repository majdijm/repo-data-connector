
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useApi = () => {
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const apiCall = async (
    table: string,
    operation: 'select' | 'insert' | 'update' | 'delete',
    data?: any,
    filters?: any
  ) => {
    if (!session) {
      throw new Error('No active session');
    }

    setIsLoading(true);
    try {
      let query = supabase.from(table);

      switch (operation) {
        case 'select':
          if (filters) {
            Object.keys(filters).forEach(key => {
              query = query.eq(key, filters[key]);
            });
          }
          return await query.select();
        case 'insert':
          return await query.insert(data);
        case 'update':
          if (filters) {
            Object.keys(filters).forEach(key => {
              query = query.eq(key, filters[key]);
            });
          }
          return await query.update(data);
        case 'delete':
          if (filters) {
            Object.keys(filters).forEach(key => {
              query = query.eq(key, filters[key]);
            });
          }
          return await query.delete();
        default:
          throw new Error('Invalid operation');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    apiCall,
    isLoading,
    isAuthenticated: !!session
  };
};
