
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  Calendar,
  FileText,
  DollarSign,
  Settings,
  LogOut,
  CheckSquare,
  Briefcase,
  CreditCard,
  Package,
  Folder,
  UserCheck,
  Receipt,
  Eye,
  Bell,
  Clock2,
  Wallet
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import LanguageSelector from './LanguageSelector';

const Sidebar = () => {
  const { signOut, userProfile } = useAuth();
  const roleAccess = useRoleAccess();
  const location = useLocation();
  const { t, language } = useTranslation();

  const isRTL = language === 'ar';

  const navigationItems = [
    {
      name: t('dashboard'),
      href: '/',
      icon: LayoutDashboard,
      show: true
    },
    {
      name: 'Projects',
      href: '/projects',
      icon: Folder,
      show: roleAccess.canViewJobs() && !roleAccess.isTeamMember()
    },
    {
      name: t('tasks'),
      href: '/tasks',
      icon: CheckSquare,
      show: roleAccess.canViewJobs() && !roleAccess.isTeamMember()
    },
    {
      name: t('jobs'),
      href: '/jobs',
      icon: Briefcase,
      show: roleAccess.canViewJobs() && !roleAccess.isTeamMember()
    },
    {
      name: t('clients'),
      href: '/clients',
      icon: Users,
      show: roleAccess.canManageClients()
    },
    {
      name: t('calendar'),
      href: '/calendar',
      icon: Calendar,
      show: !roleAccess.isTeamMember()
    },
    {
      name: t('files'),
      href: '/files',
      icon: FileText,
      show: roleAccess.canViewFiles() && !roleAccess.isTeamMember()
    },
    {
      name: t('financial'),
      href: '/financial',
      icon: DollarSign,
      show: roleAccess.canManagePayments()
    },
    {
      name: 'Packages',
      href: '/packages',
      icon: Package,
      show: roleAccess.canManagePackages()
    },
    {
      name: t('payments'),
      href: '/payments',
      icon: CreditCard,
      show: roleAccess.canManagePayments()
    },
    {
      name: 'Attendance',
      href: '/attendance',
      icon: UserCheck,
      show: !roleAccess.isClient() // Hide from clients
    },
    {
      name: t('users'),
      href: '/users',
      icon: Users,
      show: roleAccess.canManageUsers()
    },
    {
      name: 'Client Portal',
      href: '/client-portal',
      icon: Eye,
      show: roleAccess.isClient()
    },
    {
      name: 'Notifications',
      href: '/notifications',
      icon: Bell,
      show: true // Show for all users
    },
    {
      name: 'Session Payments',
      href: '/session-payments',
      icon: Clock2,
      show: !roleAccess.isClient() // Show for all except clients
    },
    {
      name: 'Monthly Salaries',
      href: '/monthly-salaries',
      icon: Wallet,
      show: roleAccess.canManageUsers() || roleAccess.canManagePayments() // Show for admins, managers, receptionists
    }
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className={cn(
      "flex flex-col h-full bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/20 border-r border-purple-100/50 backdrop-blur-sm",
      isRTL ? "border-l border-r-0" : ""
    )}>
      {/* Logo and Studio Info */}
      <div className={cn(
        "p-6 border-b border-purple-100/50 bg-gradient-to-r from-white/80 to-purple-50/50",
        isRTL ? "text-right" : "text-left"
      )}>
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">✨</span>
          </div>
          <div>
            <h1 className="font-bold text-lg bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent">
              Creative Studio
            </h1>
            <p className="text-sm text-purple-600/70 font-medium">
              Digital Design & Innovation
            </p>
          </div>
        </div>
      </div>

      {/* User Profile */}
      {userProfile && (
        <div className={cn(
          "p-4 border-b border-purple-100/50 bg-gradient-to-r from-white/60 to-purple-50/30",
          isRTL ? "text-right" : "text-left"
        )}>
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
              {userProfile.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {userProfile.name}
              </p>
              <p className="text-xs text-purple-600 bg-purple-100/70 px-2 py-0.5 rounded-full inline-block font-medium">
                {userProfile.role}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Section */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4">
          <h3 className={cn(
            "text-xs font-semibold text-purple-600/80 uppercase tracking-wider mb-3",
            isRTL ? "text-right" : "text-left"
          )}>
            {t('dashboard')}
          </h3>
          <nav className="space-y-1">
            {navigationItems.filter(item => item.show).map((item, index) => (
              <NavLink
                key={`${item.name}-${item.href}-${index}`}
                to={item.href}
                className={cn(
                  "group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                  isRTL ? "flex-row-reverse text-right" : "",
                  isActive(item.href)
                    ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-200/50 transform scale-[1.02]"
                    : "text-slate-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:text-purple-700 hover:shadow-md hover:transform hover:scale-[1.01]"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  isRTL ? "ml-3" : "mr-3",
                  isActive(item.href) 
                    ? "text-white drop-shadow-sm" 
                    : "text-slate-500 group-hover:text-purple-600 group-hover:scale-110"
                )} />
                <span className="font-medium">{item.name}</span>
                {isActive(item.href) && (
                  <div className={cn(
                    "w-1 h-6 bg-white/30 rounded-full",
                    isRTL ? "mr-auto" : "ml-auto"
                  )} />
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Settings and Language Selector */}
      <div className="p-4 border-t border-purple-100/50 bg-gradient-to-r from-white/60 to-purple-50/30 space-y-3">
        <LanguageSelector />
        
        <NavLink
          to="/settings"
          className={cn(
            "group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
            isRTL ? "flex-row-reverse text-right" : "",
            isActive('/settings')
              ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-200/50"
              : "text-slate-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:text-purple-700 hover:shadow-md"
          )}
        >
          <Settings className={cn(
            "h-5 w-5 transition-transform duration-200",
            isRTL ? "ml-3" : "mr-3",
            "group-hover:rotate-90"
          )} />
          <span>{t('settings')}</span>
        </NavLink>

        <Button
          variant="ghost"
          onClick={handleSignOut}
          className={cn(
            "w-full justify-start px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
            isRTL ? "flex-row-reverse" : "",
            "text-slate-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-700 hover:shadow-md"
          )}
        >
          <LogOut className={cn(
            "h-5 w-5 transition-transform duration-200",
            isRTL ? "ml-3" : "mr-3",
            "group-hover:scale-110"
          )} />
          <span>{t('signOut')}</span>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
