
import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'admin' | 'receptionist' | 'photographer' | 'designer' | 'editor' | 'client';

export const useRoleAccess = () => {
  const { userProfile } = useAuth();
  
  const hasRole = (requiredRoles: UserRole | UserRole[]): boolean => {
    if (!userProfile?.role) return false;
    
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return roles.includes(userProfile.role as UserRole);
  };

  const isAdmin = () => hasRole('admin');
  
  const isReceptionist = () => hasRole('receptionist');
  
  const isTeamMember = () => hasRole(['photographer', 'designer', 'editor']);
  
  const isClient = () => hasRole('client');
  
  const canManageUsers = () => hasRole('admin');
  
  const canManageClients = () => hasRole(['admin', 'receptionist']);
  
  const canManageJobs = () => hasRole(['admin', 'receptionist']);
  
  const canViewJobs = () => hasRole(['admin', 'receptionist', 'photographer', 'designer', 'editor']);
  
  const canManagePayments = () => {
    return hasRole(['admin', 'receptionist']);
  };
  
  const canViewFiles = () => hasRole(['admin', 'receptionist', 'photographer', 'designer', 'editor']);

  const getCurrentRole = (): UserRole | null => {
    return (userProfile?.role as UserRole) || null;
  };

  return {
    hasRole,
    isAdmin,
    isReceptionist,
    isTeamMember,
    isClient,
    canManageUsers,
    canManageClients,
    canManageJobs,
    canViewJobs,
    canManagePayments,
    canViewFiles,
    getCurrentRole,
    userRole: userProfile?.role as UserRole
  };
};
