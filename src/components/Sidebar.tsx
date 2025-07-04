
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Calendar,
  Settings,
  LogOut,
  Camera,
  Palette,
  Video,
  UserCheck,
  CreditCard,
  Files,
  Bell,
  Package,
  Calculator
} from 'lucide-react';

const Sidebar = () => {
  const { user, userProfile, signOut } = useAuth();
  const { canManageUsers, canManageClients, canManageJobs, canViewJobs, canManagePayments, canViewFiles } = useRoleAccess();
  const location = useLocation();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      show: true
    },
    {
      name: 'Users',
      href: '/users',
      icon: Users,
      show: canManageUsers()
    },
    {
      name: 'Clients',
      href: '/clients',
      icon: UserCheck,
      show: canManageClients()
    },
    {
      name: 'Jobs',
      href: '/jobs',
      icon: Briefcase,
      show: canViewJobs()
    },
    {
      name: 'Files',
      href: '/files',
      icon: Files,
      show: canViewFiles()
    },
    {
      name: 'Calendar',
      href: '/calendar',
      icon: Calendar,
      show: true
    },
    {
      name: 'Payments',
      href: '/payments',
      icon: CreditCard,
      show: canManagePayments()
    }
  ];

  const settingsItems = [
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      show: true
    }
  ];

  const adminMenuItems = [
    { 
      name: 'Financial', 
      href: '/financial', 
      icon: Calculator,
      show: canManagePayments()
    }
  ];

  return (
    <div className="w-64 flex-shrink-0 border-r bg-gray-50 dark:bg-gray-900 dark:border-gray-800">
      <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center space-x-2 mb-6">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{userProfile?.name?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{userProfile?.name}</h2>
            <Badge variant="secondary">{userProfile?.role}</Badge>
          </div>
        </div>
        <ul className="space-y-2 mb-8">
          {navigationItems.map((item) => (
            item.show && (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 ${location.pathname === item.href ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                >
                  <item.icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <span className="ml-3">{item.name}</span>
                </Link>
              </li>
            )
          ))}
        </ul>

        {adminMenuItems.some(item => item.show) && (
          <>
            <span className="font-medium text-gray-700 dark:text-gray-400 px-3">Management</span>
            <ul className="space-y-2 mb-8">
              {adminMenuItems.map((item) => (
                item.show && (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 ${location.pathname === item.href ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                    >
                      <item.icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <span className="ml-3">{item.name}</span>
                    </Link>
                  </li>
                )
              ))}
            </ul>
          </>
        )}

        <span className="font-medium text-gray-700 dark:text-gray-400 px-3">Settings</span>
        <ul className="space-y-2">
          {settingsItems.map((item) => (
            item.show && (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 ${location.pathname === item.href ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                >
                  <item.icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <span className="ml-3">{item.name}</span>
                </Link>
              </li>
            )
          ))}
        </ul>
        <Button variant="ghost" className="w-full justify-start mt-4" onClick={() => signOut()}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
