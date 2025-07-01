
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, RefreshCw, AlertCircle } from 'lucide-react';
import CreateUserDialog from './CreateUserDialog';

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  role: string;
  created_at: string;
}

const UserManagement = () => {
  const { userProfile, logout, refreshUserProfile, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: usersData, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        setError('Failed to fetch users: ' + error.message);
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
      setError('Failed to fetch users');
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    if (userProfile?.role !== 'admin') {
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

      await fetchUsers();
      await refreshUserProfile();
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
      await refreshUserProfile();
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
    if (!authLoading && userProfile) {
      fetchUsers();
    }
  }, [userProfile, authLoading]);

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

  // Show loading state
  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
        <Button onClick={fetchUsers} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  // Access control
  if (userProfile?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600 mb-4">You don't have permission to manage users.</p>
          <p className="text-sm text-gray-500 mb-4">Current role: {userProfile?.role || 'Unknown'}</p>
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
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-400">
                      Joined: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={`${getRoleBadgeColor(user.role)} font-medium`}>
                      {user.role}
                    </Badge>
                    <Select
                      value={user.role}
                      onValueChange={(newRole) => updateUserRole(user.id, newRole)}
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
              <strong>Info:</strong> Users are automatically synchronized between Supabase Auth and your database. 
              All user data is managed consistently across the application.
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
