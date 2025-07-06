
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LanguageSelector from '@/components/LanguageSelector';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { Settings, User, Globe } from 'lucide-react';

const SettingsPage = () => {
  const { userProfile } = useAuth();
  const { t } = useTranslation();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            {t('settings')}
          </h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t('profileInformation')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">{t('name')}</label>
                <p className="text-lg font-semibold text-gray-900">{userProfile?.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">{t('email')}</label>
                <p className="text-lg text-gray-600">{userProfile?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">{t('role')}</label>
                <p className="text-lg capitalize font-medium text-blue-600">{userProfile?.role}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {t('languageSettings')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    {t('selectLanguage')}
                  </label>
                  <LanguageSelector />
                </div>
                <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
                  <p>Language preference will be saved automatically and applied across the entire application.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
