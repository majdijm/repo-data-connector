
import React from 'react';
import { useUsers } from '@/hooks/useUsers';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const UserDebugPanel: React.FC = () => {
  const { users, isLoading, error } = useUsers();
  const { userProfile } = useAuth();

  if (!userProfile || userProfile.role !== 'admin') {
    return null;
  }

  return (
    <Card className="mt-4 bg-gray-50">
      <CardHeader>
        <CardTitle className="text-sm">Debug: Users Data</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-xs">
          <div>
            <strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Error:</strong> {error || 'None'}
          </div>
          <div>
            <strong>Total Users:</strong> {users.length}
          </div>
          <div>
            <strong>Users by Role:</strong>
            <div className="ml-4 mt-1">
              {['admin', 'receptionist', 'photographer', 'designer', 'editor', 'client'].map(role => {
                const count = users.filter(u => u.role === role).length;
                return (
                  <div key={role} className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {role}: {count}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <strong>Active Users:</strong> {users.filter(u => u.is_active).length}
          </div>
          <div>
            <strong>Editors:</strong>
            <div className="ml-4 mt-1">
              {users.filter(u => u.role === 'editor').map(user => (
                <div key={user.id} className="text-xs">
                  {user.name} ({user.email}) - {user.is_active ? 'Active' : 'Inactive'}
                </div>
              ))}
            </div>
          </div>
          <div>
            <strong>Designers:</strong>
            <div className="ml-4 mt-1">
              {users.filter(u => u.role === 'designer').map(user => (
                <div key={user.id} className="text-xs">
                  {user.name} ({user.email}) - {user.is_active ? 'Active' : 'Inactive'}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserDebugPanel;
