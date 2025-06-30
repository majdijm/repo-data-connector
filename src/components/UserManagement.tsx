
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrentUserRole = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('email', user.email)
        .single();
      
      if (error) throw error;
      if (data) setCurrentUserRole(data.role);
    } catch (error) {
      console.error('Error fetching current user role:', error);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    if (currentUserRole !== 'admin') {
      console.error('Only admins can update user roles');
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;
      
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error updating user role:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCurrentUserRole();
  }, [user]);

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      receptionist: 'bg-blue-100 text-blue-800',
      photographer: 'bg-green-100 text-green-800',
      designer: 'bg-purple-100 text-purple-800',
      editor: 'bg-orange-100 text-orange-800',
      client: 'bg-gray-100 text-gray-800',
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Only admins can see user management
  if (currentUserRole !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Access Denied</h3>
          <p className="text-gray-600 mt-2">You don't have permission to manage users.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((userProfile) => (
              <div key={userProfile.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{userProfile.name}</h3>
                  <p className="text-sm text-gray-600">{userProfile.email}</p>
                  <p className="text-xs text-gray-400">
                    Joined: {new Date(userProfile.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getRoleBadgeColor(userProfile.role)}>
                    {userProfile.role}
                  </Badge>
                  <Select
                    value={userProfile.role}
                    onValueChange={(newRole) => updateUserRole(userProfile.id, newRole)}
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="receptionist">Receptionist</SelectItem>
                      <SelectItem value="photographer">Photographer</SelectItem>
                      <SelectItem value="designer">Designer</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="client">Client</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
