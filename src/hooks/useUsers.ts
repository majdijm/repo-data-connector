
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
      
      console.log('🔍 Fetching all users...');
      
      // Fetch ALL users without any role-based filtering
      const { data: usersData, error: fetchError } = await supabase
        .from('users')
        .select('id, email, name, role, is_active, created_at')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('❌ Error fetching users:', fetchError);
        throw fetchError;
      }
      
      console.log('📊 Raw users data from database:', usersData);
      console.log('📊 Total users found:', usersData?.length || 0);
      
      if (!usersData || usersData.length === 0) {
        console.log('⚠️ No users found in database');
        setUsers([]);
        setError('No users found in the database');
        return;
      }

      // Log each user individually for debugging
      usersData.forEach((user, index) => {
        console.log(`👤 User ${index + 1}:`, {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          is_active: user.is_active,
          created_at: user.created_at
        });
        
        // Check specifically for the editor mentioned
        if (user.email === 'quranlight2019@gmail.com') {
          console.log('🎯 FOUND TARGET EDITOR:', {
            email: user.email,
            role: user.role,
            is_active: user.is_active,
            roleCheck: user.role === 'editor',
            activeCheck: user.is_active === true
          });
        }
      });
      
      const transformedUsers = usersData.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name || user.email, // Fallback to email if name is missing
        role: user.role,
        is_active: user.is_active ?? true,
        created_at: user.created_at
      })) as User[];
      
      console.log('✅ Transformed users:', transformedUsers);
      
      // Detailed role analysis
      const roleStats = {
        admins: transformedUsers.filter(u => u.role === 'admin').length,
        receptionists: transformedUsers.filter(u => u.role === 'receptionist').length,
        photographers: transformedUsers.filter(u => u.role === 'photographer').length,
        editors: transformedUsers.filter(u => u.role === 'editor').length,
        designers: transformedUsers.filter(u => u.role === 'designer').length,
        clients: transformedUsers.filter(u => u.role === 'client').length
      };
      
      console.log('📈 Users by role:', roleStats);
      
      // Check specifically for active editors
      const activeEditors = transformedUsers.filter(u => u.role === 'editor' && u.is_active);
      console.log('✅ Active editors found:', activeEditors.length, activeEditors);
      
      // Check for the specific editor user
      const targetUser = transformedUsers.find(u => u.email === 'quranlight2019@gmail.com');
      if (targetUser) {
        console.log('🎯 Target editor found in transformed data:', targetUser);
      } else {
        console.log('❌ Target editor NOT found in transformed data');
      }
      
      setUsers(transformedUsers);
      console.log('🎉 Users set successfully. Total count:', transformedUsers.length);
      
    } catch (err) {
      console.error('💥 Error in fetchUsers:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching users');
      setUsers([]); // Set empty array on error to prevent stale data
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    if (!userProfile || userProfile.role !== 'admin') {
      throw new Error('Access denied. Admin role required.');
    }

    try {
      console.log('🔄 Updating user role:', { userId, newRole });
      
      const { error } = await supabase
        .from('users')
        .update({ 
          role: newRole, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', userId);

      if (error) {
        console.error('❌ Error updating user role:', error);
        throw error;
      }

      console.log('✅ User role updated successfully');
      
      // Refresh users list
      await fetchUsers();
    } catch (error) {
      console.error('💥 Error updating user role:', error);
      throw error;
    }
  };

  useEffect(() => {
    console.log('🚀 useUsers hook initialized');
    fetchUsers();
  }, []); // Remove dependency on userProfile to fetch all users immediately

  return {
    users,
    isLoading,
    error,
    refetch: fetchUsers,
    updateUserRole
  };
};
