
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { useTranslation } from '@/hooks/useTranslation';
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
  UserCheck,
  CreditCard,
  Files,
  Calculator,
  CheckSquare,
  Palette,
  Camera,
  Sparkles
} from 'lucide-react';

const Sidebar = () => {
  const { user, userProfile, signOut } = useAuth();
  const { canManageUsers, canManageClients, canManageJobs, canViewJobs, canManagePayments, canViewFiles } = useRoleAccess();
  const { t } = useTranslation();
  const location = useLocation();

  const navigationItems = [
    {
      name: t('dashboard'),
      href: '/dashboard',
      icon: LayoutDashboard,
      show: true
    },
    {
      name: t('users'),
      href: '/users',
      icon: Users,
      show: canManageUsers()
    },
    {
      name: t('clients'),
      href: '/clients',
      icon: UserCheck,
      show: canManageClients()
    },
    {
      name: t('jobs'),
      href: '/jobs',
      icon: Briefcase,
      show: canViewJobs()
    },
    {
      name: t('tasks'),
      href: '/tasks',
      icon: CheckSquare,
      show: true
    },
    {
      name: t('files'),
      href: '/files',
      icon: Files,
      show: canViewFiles()
    },
    {
      name: t('calendar'),
      href: '/calendar',
      icon: Calendar,
      show: true
    },
    {
      name: t('payments'),
      href: '/payments',
      icon: CreditCard,
      show: canManagePayments()
    }
  ];

  const settingsItems = [
    {
      name: t('settings'),
      href: '/settings',
      icon: Settings,
      show: true
    }
  ];

  const adminMenuItems = [
    { 
      name: t('financial'), 
      href: '/financial', 
      icon: Calculator,
      show: canManagePayments()
    }
  ];

  return (
    <div className="w-64 flex-shrink-0 border-r bg-card/50 backdrop-blur-xl">
      <div className="h-full px-3 py-4 overflow-y-auto">
        
        {/* Creative Studio Branding */}
        <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6 p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
          <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gradient">{t('creativeStudio')}</h2>
            <p className="text-xs text-muted-foreground">{t('digitalDesign')}</p>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse mb-6 p-3 bg-gradient-to-r from-muted/50 to-accent/5 rounded-lg">
          <Avatar className="h-9 w-9 ring-2 ring-primary/20">
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold">
              {userProfile?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-sm font-semibold text-foreground">{userProfile?.name}</h2>
            <Badge variant="secondary" className="text-xs bg-gradient-to-r from-primary/10 to-accent/10 text-primary border-primary/20">
              {userProfile?.role}
            </Badge>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="space-y-1 mb-8">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
            {t('navigation')}
          </h3>
          {navigationItems.map((item) => (
            item.show && (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center p-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  location.pathname === item.href 
                    ? 'bg-gradient-to-r from-primary/20 to-accent/20 text-primary shadow-lg border border-primary/20' 
                    : 'text-muted-foreground hover:bg-gradient-to-r hover:from-muted/50 hover:to-accent/5 hover:text-foreground'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3 rtl:mr-0 rtl:ml-3" />
                <span>{item.name}</span>
                {location.pathname === item.href && (
                  <div className="w-2 h-2 bg-primary rounded-full ml-auto rtl:ml-0 rtl:mr-auto animate-pulse"></div>
                )}
              </Link>
            )
          ))}
        </div>

        {/* Admin Menu */}
        {adminMenuItems.some(item => item.show) && (
          <div className="space-y-1 mb-8">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
              {t('management')}
            </h3>
            {adminMenuItems.map((item) => (
              item.show && (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center p-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    location.pathname === item.href 
                      ? 'bg-gradient-to-r from-primary/20 to-accent/20 text-primary shadow-lg border border-primary/20' 
                      : 'text-muted-foreground hover:bg-gradient-to-r hover:from-muted/50 hover:to-accent/5 hover:text-foreground'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3 rtl:mr-0 rtl:ml-3" />
                  <span>{item.name}</span>
                  {location.pathname === item.href && (
                    <div className="w-2 h-2 bg-primary rounded-full ml-auto rtl:ml-0 rtl:mr-auto animate-pulse"></div>
                  )}
                </Link>
              )
            ))}
          </div>
        )}

        {/* Settings */}
        <div className="space-y-1 mb-8">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
            {t('settings')}
          </h3>
          {settingsItems.map((item) => (
            item.show && (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center p-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  location.pathname === item.href 
                    ? 'bg-gradient-to-r from-primary/20 to-accent/20 text-primary shadow-lg border border-primary/20' 
                    : 'text-muted-foreground hover:bg-gradient-to-r hover:from-muted/50 hover:to-accent/5 hover:text-foreground'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3 rtl:mr-0 rtl:ml-3" />
                <span>{item.name}</span>
                {location.pathname === item.href && (
                  <div className="w-2 h-2 bg-primary rounded-full ml-auto rtl:ml-0 rtl:mr-auto animate-pulse"></div>
                )}
              </Link>
            )
          ))}
        </div>

        {/* Sign Out Button */}
        <div className="mt-auto pt-4 border-t border-border/50">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 p-3" 
            onClick={() => signOut()}
          >
            <LogOut className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
            {t('signOut')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
