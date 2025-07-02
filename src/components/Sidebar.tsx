
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  CreditCard,
  Package,
  Settings,
  CheckSquare,
  Camera,
  Video,
  Palette,
  UserCircle,
  Bell,
  Files
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const { userProfile } = useAuth();
  const { 
    isAdmin, 
    isReceptionist, 
    isTeamMember, 
    isClient,
    canManageUsers,
    canManageClients,
    canManageJobs,
    canManagePayments,
    canViewFiles
  } = useRoleAccess();

  const navigationItems = [
    {
      title: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      show: true
    },
    {
      title: 'Users',
      href: '/users',
      icon: Users,
      show: canManageUsers()
    },
    {
      title: 'Clients',
      href: '/clients',
      icon: UserCircle,
      show: canManageClients()
    },
    {
      title: 'Jobs',
      href: '/jobs',
      icon: Briefcase,
      show: canManageJobs() || isTeamMember()
    },
    {
      title: 'Tasks',
      href: '/tasks',
      icon: CheckSquare,
      show: true
    },
    {
      title: 'Photo Sessions',
      href: '/photo-sessions',
      icon: Camera,
      show: userProfile?.role === 'photographer'
    },
    {
      title: 'Video Tasks',
      href: '/video-tasks',
      icon: Video,
      show: userProfile?.role === 'editor'
    },
    {
      title: 'Design Tasks',
      href: '/design-tasks',
      icon: Palette,
      show: userProfile?.role === 'designer'
    },
    {
      title: 'Calendar',
      href: '/calendar',
      icon: Calendar,
      show: true
    },
    {
      title: 'Files',
      href: '/files',
      icon: Files,
      show: canViewFiles()
    },
    {
      title: 'Payments',
      href: '/payments',
      icon: CreditCard,
      show: canManagePayments()
    },
    {
      title: 'Packages',
      href: '/packages',
      icon: Package,
      show: isAdmin() || isReceptionist()
    },
    {
      title: 'Notifications',
      href: '/notifications',
      icon: Bell,
      show: true
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: Settings,
      show: true
    }
  ];

  const filteredItems = navigationItems.filter(item => item.show);

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900">PhotoStudio</h1>
      </div>
      
      <nav className="flex-1 px-4 pb-4 space-y-2">
        {filteredItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
              location.pathname === item.href
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.title}
          </Link>
        ))}
      </nav>

      {userProfile && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserCircle className="h-8 w-8 text-gray-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{userProfile.name}</p>
              <p className="text-xs text-gray-500 capitalize">{userProfile.role}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
