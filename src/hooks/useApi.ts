
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
      let query = supabase.from(table as any);

      switch (operation) {
        case 'select':
          let selectQuery = query.select();
          if (filters) {
            Object.keys(filters).forEach(key => {
              selectQuery = selectQuery.eq(key, filters[key]);
            });
          }
          return await selectQuery;
        case 'insert':
          return await query.insert(data);
        case 'update':
          let updateQuery = query.update(data);
          if (filters) {
            Object.keys(filters).forEach(key => {
              updateQuery = updateQuery.eq(key, filters[key]);
            });
          }
          return await updateQuery;
        case 'delete':
          let deleteQuery = query.delete();
          if (filters) {
            Object.keys(filters).forEach(key => {
              deleteQuery = deleteQuery.eq(key, filters[key]);
            });
          }
          return await deleteQuery;
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
