
import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'admin' | 'manager' | 'receptionist' | 'photographer' | 'designer' | 'editor' | 'client';

export const useRoleAccess = () => {
  const { userProfile } = useAuth();
  
  const hasRole = (requiredRoles: UserRole | UserRole[]): boolean => {
    if (!userProfile?.role) return false;
    
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return roles.includes(userProfile.role as UserRole);
  };

  const isAdmin = () => hasRole('admin');
  
  const isManager = () => hasRole('manager');
  
  const isReceptionist = () => hasRole('receptionist');
  
  const isTeamMember = () => hasRole(['photographer', 'designer', 'editor']);
  
  const isClient = () => hasRole('client');
  
  const canManageUsers = () => hasRole('admin');
  
  const canManageClients = () => hasRole(['admin', 'manager', 'receptionist']);
  
  const canManageJobs = () => hasRole(['admin', 'manager', 'receptionist']);
  
  const canViewJobs = () => hasRole(['admin', 'manager', 'receptionist', 'photographer', 'designer', 'editor']);
  
  const canManagePayments = () => {
    return hasRole(['admin', 'manager', 'receptionist']);
  };
  
  const canViewFiles = () => hasRole(['admin', 'manager', 'receptionist', 'photographer', 'designer', 'editor']);

  const canManageAttendance = () => hasRole(['admin', 'manager', 'receptionist']);

  const canViewAttendance = () => hasRole(['admin', 'manager', 'receptionist']);

  const canManagePackages = () => hasRole(['admin', 'manager', 'receptionist']);

  const getCurrentRole = (): UserRole | null => {
    return (userProfile?.role as UserRole) || null;
  };

  return {
    hasRole,
    isAdmin,
    isManager,
    isReceptionist,
    isTeamMember,
    isClient,
    canManageUsers,
    canManageClients,
    canManageJobs,
    canViewJobs,
    canManagePayments,
    canViewFiles,
    canManageAttendance,
    canViewAttendance,
    canManagePackages,
    getCurrentRole,
    userRole: userProfile?.role as UserRole,
    isLoading: !userProfile
  };
};
