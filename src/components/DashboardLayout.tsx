
import React from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const { t } = useTranslation();

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="min-h-full">
          {/* Creative header with gradient */}
          <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 border-b border-border/50">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gradient">{t('creativeStudio')}</h1>
                  <p className="text-muted-foreground mt-1">{t('digitalDesign')} & {t('innovation')}</p>
                </div>
                <div className="hidden md:flex items-center space-x-4 rtl:space-x-reverse">
                  <div className="text-right rtl:text-left">
                    <p className="text-sm font-medium">{t('welcome')}</p>
                    <p className="text-xs text-muted-foreground">{t('creativity')} • {t('inspiration')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main content area with enhanced styling */}
          <div className="p-8 creative-gradient">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
