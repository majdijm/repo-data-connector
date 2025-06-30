
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { 
  Calendar, 
  Users, 
  FileText, 
  User,
  FileImage,
  FileVideo,
  BarChart3
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const getNavigationItems = (role: UserRole) => {
    const baseItems = [
      { name: 'Dashboard', path: '/dashboard', icon: FileText },
    ];

    switch (role) {
      case 'admin':
        return [
          ...baseItems,
          { name: 'Tasks Overview', path: '/tasks', icon: BarChart3 },
          { name: 'Users', path: '/users', icon: Users },
          { name: 'All Jobs', path: '/jobs', icon: FileText },
          { name: 'Clients', path: '/clients', icon: User },
          { name: 'Reports', path: '/reports', icon: FileText },
        ];
      case 'receptionist':
        return [
          ...baseItems,
          { name: 'Tasks Overview', path: '/tasks', icon: BarChart3 },
          { name: 'Calendar', path: '/calendar', icon: Calendar },
          { name: 'Clients', path: '/clients', icon: User },
          { name: 'Jobs', path: '/jobs', icon: FileText },
          { name: 'Payments', path: '/payments', icon: FileText },
        ];
      case 'photographer':
        return [
          ...baseItems,
          { name: 'Photo Sessions', path: '/photo-sessions', icon: FileImage },
          { name: 'My Tasks', path: '/tasks', icon: FileText },
        ];
      case 'designer':
        return [
          ...baseItems,
          { name: 'Design Tasks', path: '/design-tasks', icon: FileText },
          { name: 'My Tasks', path: '/tasks', icon: FileText },
        ];
      case 'editor':
        return [
          ...baseItems,
          { name: 'Video Tasks', path: '/video-tasks', icon: FileVideo },
          { name: 'My Tasks', path: '/tasks', icon: FileText },
        ];
      case 'client':
        return [
          ...baseItems,
          { name: 'My Projects', path: '/my-projects', icon: FileText },
          { name: 'Downloads', path: '/downloads', icon: FileText },
        ];
      default:
        return baseItems;
    }
  };

  const navigationItems = getNavigationItems(user.role);

  const getRoleColor = (role: UserRole) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      receptionist: 'bg-green-100 text-green-800',
      photographer: 'bg-blue-100 text-blue-800',
      designer: 'bg-purple-100 text-purple-800',
      editor: 'bg-orange-100 text-orange-800',
      client: 'bg-gray-100 text-gray-800',
    };
    return colors[role];
  };

  return (
    <div className="w-64 bg-white shadow-lg h-screen flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-gray-800">Studio Manager</h1>
        <div className="mt-3">
          <p className="text-sm font-medium text-gray-700">{user.name}</p>
          <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${getRoleColor(user.role)}`}>
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </span>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t">
        <Button
          onClick={logout}
          variant="outline"
          className="w-full"
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
