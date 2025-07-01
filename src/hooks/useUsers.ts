
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export const useUsers = () => {
  const { userProfile } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    if (!userProfile || userProfile.role !== 'admin') {
      setError('Access denied. Admin role required.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching all users as admin...');
      
      // Direct query to users table for admin users
      const { data: usersData, error } = await supabase
        .from('users')
        .select('id, email, name, role, is_active, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      
      setUsers(usersData || []);
      console.log('Users fetched successfully:', usersData?.length || 0);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching users');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    if (userProfile?.role !== 'admin') {
      throw new Error('Access denied. Admin role required.');
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      // Refresh users list
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (userProfile) {
      fetchUsers();
    }
  }, [userProfile]);

  return {
    users,
    isLoading,
    error,
    refetch: fetchUsers,
    updateUserRole
  };
};
