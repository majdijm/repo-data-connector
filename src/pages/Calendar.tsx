
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import EnhancedCalendarView from '@/components/EnhancedCalendarView';
import { useTranslation } from '@/hooks/useTranslation';

const Calendar = () => {
  const { t } = useTranslation();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold">{t('calendar')}</h1>
          <p className="text-blue-100 mt-2">{t('taskScheduling')}</p>
        </div>

        <EnhancedCalendarView />
      </div>
    </DashboardLayout>
  );
};

export default Calendar;
