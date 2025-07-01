
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  FileText, 
  CreditCard, 
  Bell, 
  Settings,
  LogOut,
  UserCog,
  Camera,
  Video,
  Palette
} from 'lucide-react';

const Sidebar = () => {
  const { logout, user, userProfile } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  // Define menu items with role permissions
  const getMenuItems = () => {
    const role = userProfile?.role;
    
    const baseItems = [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/', roles: ['admin', 'receptionist', 'photographer', 'designer', 'editor', 'client'] },
    ];

    const adminItems = [
      { icon: Users, label: 'Clients', href: '/clients', roles: ['admin', 'receptionist'] },
      { icon: Briefcase, label: 'Jobs', href: '/jobs', roles: ['admin', 'receptionist', 'photographer', 'designer', 'editor'] },
      { icon: UserCog, label: 'Users', href: '/users', roles: ['admin'] },
      { icon: Camera, label: 'Photo Sessions', href: '/photo-sessions', roles: ['admin', 'receptionist', 'photographer'] },
      { icon: Video, label: 'Video Production', href: '/video-tasks', roles: ['admin', 'receptionist', 'editor'] },
      { icon: Palette, label: 'Design Projects', href: '/design-tasks', roles: ['admin', 'receptionist', 'designer'] },
      { icon: FileText, label: 'Files', href: '/files', roles: ['admin', 'receptionist', 'photographer', 'designer', 'editor'] },
      { icon: CreditCard, label: 'Payments', href: '/payments', roles: ['admin', 'receptionist'] },
    ];

    const generalItems = [
      { icon: Bell, label: 'Notifications', href: '/notifications', roles: ['admin', 'receptionist', 'photographer', 'designer', 'editor', 'client'] },
      { icon: Settings, label: 'Settings', href: '/settings', roles: ['admin', 'receptionist', 'photographer', 'designer', 'editor', 'client'] },
    ];

    const allItems = [...baseItems, ...adminItems, ...generalItems];
    
    // Filter items based on user role
    return allItems.filter(item => !role || item.roles.includes(role));
  };

  const menuItems = getMenuItems();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname === path;
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white w-64 min-h-screen flex flex-col shadow-2xl">
      <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-teal-600 to-cyan-600">
        <div className="flex items-center space-x-3 mb-2">
          <img 
            src="/lovable-uploads/31edede1-0100-4c16-b0ee-ccb5fe42795e.png" 
            alt="New Design Logo" 
            className="w-10 h-10 rounded-lg bg-white p-1"
          />
          <div>
            <h1 className="text-lg font-bold text-white">NEW DESIGN</h1>
            <p className="text-xs text-teal-100">ADS AGENCY</p>
          </div>
        </div>
        {user && (
          <div className="mt-2">
            <p className="text-sm text-teal-100">
              {user.user_metadata?.name || user.email}
            </p>
            {userProfile?.role && (
              <p className="text-xs text-teal-200 capitalize">
                {userProfile.role}
              </p>
            )}
          </div>
        )}
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.href}>
              <NavLink
                to={item.href}
                className={({ isActive: linkActive }) => 
                  `flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group ${
                    isActive(item.href) || linkActive
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg transform scale-105' 
                      : 'hover:bg-gray-700/50 hover:text-teal-300 hover:transform hover:scale-105'
                  }`
                }
              >
                <item.icon 
                  size={20} 
                  className={`transition-colors duration-200 ${
                    isActive(item.href) ? 'text-white' : 'group-hover:text-teal-300'
                  }`} 
                />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-700/50">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-white hover:bg-red-600/20 hover:text-red-300 transition-all duration-200"
        >
          <LogOut size={20} className="mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
