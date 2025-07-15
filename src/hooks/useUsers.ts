
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

  const deleteUser = async (userId: string) => {
    if (!userProfile || userProfile.role !== 'admin') {
      throw new Error('Access denied. Admin role required.');
    }

    try {
      console.log('🗑️ useUsers: Deleting user:', userId);
      
      // First, delete all related data that references this user
      // This is important to maintain data integrity
      
      // Delete activity logs
      await supabase.from('activity_logs').delete().eq('user_id', userId);
      
      // Delete calendar events
      await supabase.from('calendar_events').delete().eq('user_id', userId);
      
      // Delete job comments
      await supabase.from('job_comments').delete().eq('user_id', userId);
      
      // Delete job files uploaded by this user
      await supabase.from('job_files').delete().eq('uploaded_by', userId);
      
      // Delete notifications
      await supabase.from('notifications').delete().eq('user_id', userId);
      
      // Delete payments received by this user
      await supabase.from('payments').delete().eq('received_by', userId);
      
      // Delete salaries for this user
      await supabase.from('salaries').delete().eq('user_id', userId);
      
      // Delete payment requests made by this user
      await supabase.from('payment_requests').delete().eq('requested_by', userId);
      
      // Delete client contracts uploaded by this user
      await supabase.from('client_contracts').delete().eq('uploaded_by', userId);
      
      // Delete expenses recorded by this user
      await supabase.from('expenses').delete().eq('recorded_by', userId);
      
      // Update jobs to remove references to this user
      await supabase
        .from('jobs')
        .update({ 
          assigned_to: null,
          original_assigned_to: null,
          created_by: null,
          updated_at: new Date().toISOString()
        })
        .or(`assigned_to.eq.${userId},original_assigned_to.eq.${userId},created_by.eq.${userId}`);
      
      // Finally, delete the user
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('❌ useUsers: Error deleting user:', error);
        throw error;
      }

      console.log('✅ useUsers: User deleted successfully');
      
    } catch (error) {
      console.error('💥 useUsers: Error deleting user:', error);
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
    updateUserRole,
    deleteUser
  };
};
