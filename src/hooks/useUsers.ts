
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
    if (!userProfile) {
      setError('User profile not loaded');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching users as:', userProfile.role);
      
      const { data: usersData, error: fetchError } = await supabase
        .from('users')
        .select('id, email, name, role, is_active, created_at')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching users:', fetchError);
        throw fetchError;
      }
      
      console.log('Raw users data from database:', usersData);
      
      const transformedUsers = usersData?.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name || 'No name',
        role: user.role,
        is_active: user.is_active ?? true,
        created_at: user.created_at
      })) || [];
      
      console.log('Transformed users:', transformedUsers);
      console.log('Users by role:', {
        admins: transformedUsers.filter(u => u.role === 'admin').length,
        receptionists: transformedUsers.filter(u => u.role === 'receptionist').length,
        photographers: transformedUsers.filter(u => u.role === 'photographer').length,
        editors: transformedUsers.filter(u => u.role === 'editor').length,
        designers: transformedUsers.filter(u => u.role === 'designer').length,
        clients: transformedUsers.filter(u => u.role === 'client').length
      });
      
      setUsers(transformedUsers);
      console.log('Users set successfully:', transformedUsers.length);
      
    } catch (err) {
      console.error('Error in fetchUsers:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching users');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    if (!userProfile || userProfile.role !== 'admin') {
      throw new Error('Access denied. Admin role required.');
    }

    try {
      console.log('Updating user role:', { userId, newRole });
      
      const { error } = await supabase
        .from('users')
        .update({ 
          role: newRole, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user role:', error);
        throw error;
      }

      console.log('User role updated successfully');
      
      // Refresh users list
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (userProfile) {
      console.log('UserProfile loaded, fetching users...', userProfile);
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
