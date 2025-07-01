
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';

const RoleTestPanel: React.FC = () => {
  const { userProfile } = useAuth();
  const roleAccess = useRoleAccess();

  if (!userProfile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Role Test Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No user profile loaded</p>
        </CardContent>
      </Card>
    );
  }

  const permissions = [
    { name: 'Is Admin', check: roleAccess.isAdmin() },
    { name: 'Is Receptionist', check: roleAccess.isReceptionist() },
    { name: 'Is Team Member', check: roleAccess.isTeamMember() },
    { name: 'Is Client', check: roleAccess.isClient() },
    { name: 'Can Manage Users', check: roleAccess.canManageUsers() },
    { name: 'Can Manage Clients', check: roleAccess.canManageClients() },
    { name: 'Can Manage Jobs', check: roleAccess.canManageJobs() },
    { name: 'Can View Jobs', check: roleAccess.canViewJobs() },
    { name: 'Can Manage Payments', check: roleAccess.canManagePayments() },
    { name: 'Can View Files', check: roleAccess.canViewFiles() },
  ];

  return (
    <Card className="border border-blue-200">
      <CardHeader className="bg-blue-50">
        <CardTitle className="text-blue-800">🧪 Role Test Panel</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-sm text-blue-600">Current Role:</span>
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            {userProfile.role}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-2">
          {permissions.map((permission) => (
            <div key={permission.name} className="flex items-center gap-2 p-2 rounded">
              {permission.check ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm ${permission.check ? 'text-green-700' : 'text-red-700'}`}>
                {permission.name}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RoleTestPanel;
