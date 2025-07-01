
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { UserPlus } from 'lucide-react';
import CreateUserDialog from './CreateUserDialog';

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  role: string;
  created_at: string;
}

const UserManagement = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data: usersData, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive"
        });
        return;
      }

      setUsers(usersData || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrentUserRole = async () => {
    if (!user) return;
    
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching current user role:', error);
        // Fallback to user metadata
        const role = user.user_metadata?.role || 'client';
        setCurrentUserRole(role);
        return;
      }

      setCurrentUserRole(userData?.role || 'client');
    } catch (error) {
      console.error('Error fetching current user role:', error);
      const role = user.user_metadata?.role || 'client';
      setCurrentUserRole(role);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    if (currentUserRole !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Only admins can update user roles",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user role:', error);
        toast({
          title: "Error",
          description: "Failed to update user role",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "User role updated successfully"
      });

      // Refresh the users list
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRefreshSession = async () => {
    try {
      await supabase.auth.refreshSession();
      await fetchCurrentUserRole();
      toast({
        title: "Session Refreshed",
        description: "Your session has been refreshed. Please check your access now."
      });
    } catch (error) {
      console.error('Error refreshing session:', error);
      toast({
        title: "Error",
        description: "Failed to refresh session",
        variant: "destructive"
      });
    }
  };

  const handleUserCreated = () => {
    fetchUsers();
    setIsCreateDialogOpen(false);
    toast({
      title: "Success",
      description: "User created successfully and will appear in the list"
    });
  };

  useEffect(() => {
    if (user) {
      fetchUsers();
      fetchCurrentUserRole();
    }
  }, [user]);

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800 border-red-200',
      receptionist: 'bg-blue-100 text-blue-800 border-blue-200',
      photographer: 'bg-green-100 text-green-800 border-green-200',
      designer: 'bg-purple-100 text-purple-800 border-purple-200',
      editor: 'bg-orange-100 text-orange-800 border-orange-200',
      client: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (currentUserRole !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0-6V7m0 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600 mb-4">You don't have permission to manage users.</p>
          <p className="text-sm text-gray-500 mb-4">Current role: {currentUserRole}</p>
          <div className="space-y-2">
            <Button onClick={handleRefreshSession} variant="outline" className="mr-2">
              Refresh Session
            </Button>
            <Button onClick={logout} variant="destructive">
              Logout & Login Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">User Management</CardTitle>
              <p className="text-teal-100 text-sm">Create new users and manage team members</p>
            </div>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              variant="outline"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Create User
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No users found. Create your first user to get started.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {users.map((userProfile) => (
                <div key={userProfile.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{userProfile.name}</h3>
                    <p className="text-sm text-gray-600">{userProfile.email}</p>
                    <p className="text-xs text-gray-400">
                      Joined: {new Date(userProfile.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={`${getRoleBadgeColor(userProfile.role)} font-medium`}>
                      {userProfile.role}
                    </Badge>
                    <Select
                      value={userProfile.role}
                      onValueChange={(newRole) => updateUserRole(userProfile.id, newRole)}
                      disabled={isUpdating}
                    >
                      <SelectTrigger className="w-36 border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg">
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
          )}
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Info:</strong> Users are now automatically added to the database when created. 
              You can update their roles directly from this interface.
            </p>
          </div>
        </CardContent>
      </Card>

      <CreateUserDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onUserCreated={handleUserCreated}
      />
    </div>
  );
};

export default UserManagement;
