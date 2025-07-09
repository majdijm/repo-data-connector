
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
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔍 useUsers: Starting to fetch users...');
      
      const { data: usersData, error: fetchError } = await supabase
        .from('users')
        .select('id, email, name, role, is_active, created_at')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('❌ useUsers: Error fetching users:', fetchError);
        throw fetchError;
      }
      
      console.log('📊 useUsers: Users data from database:', usersData);
      console.log('📊 useUsers: Total users found:', usersData?.length || 0);
      
      if (!usersData || usersData.length === 0) {
        console.log('⚠️ useUsers: No users found in database');
        setUsers([]);
        setError('No users found in the database');
        return;
      }

      const transformedUsers = usersData.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name || user.email,
        role: user.role,
        is_active: user.is_active ?? true,
        created_at: user.created_at
      })) as User[];
      
      console.log('✅ useUsers: Transformed users:', transformedUsers);
      setUsers(transformedUsers);
      
    } catch (err) {
      console.error('💥 useUsers: Error in fetchUsers:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching users');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    if (!userProfile || userProfile.role !== 'admin') {
      throw new Error('Access denied. Admin role required.');
    }

    try {
      console.log('🔄 useUsers: Updating user role:', { userId, newRole });
      
      const { error } = await supabase
        .from('users')
        .update({ 
          role: newRole, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', userId);

      if (error) {
        console.error('❌ useUsers: Error updating user role:', error);
        throw error;
      }

      console.log('✅ useUsers: User role updated successfully');
      await fetchUsers();
    } catch (error) {
      console.error('💥 useUsers: Error updating user role:', error);
      throw error;
    }
  };

  useEffect(() => {
    console.log('🚀 useUsers: Hook initialized, starting initial fetch');
    fetchUsers();
  }, []);

  return {
    users,
    isLoading,
    error,
    refetch: fetchUsers,
    updateUserRole
  };
};
