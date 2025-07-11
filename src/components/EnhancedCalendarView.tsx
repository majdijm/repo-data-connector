
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, MapPin, Eye, Calendar as CalendarIcon, ArrowRight } from 'lucide-react';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useTranslation } from '@/hooks/useTranslation';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Job {
  id: string;
  title: string;
  type: string;
  status: string;
  due_date: string | null;
  client_id: string | null;
  assigned_to: string | null;
  description: string | null;
  price: number | null;
  clients?: {
    name: string;
  };
  users?: {
    name: string;
    role: string;
  };
}

interface EnhancedCalendarViewProps {
  onJobSelect?: (job: Job) => void;
}

const EnhancedCalendarView: React.FC<EnhancedCalendarViewProps> = ({ onJobSelect }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { events, jobs, loading } = useCalendarEvents();
  const { t, language } = useTranslation();
  const navigate = useNavigate();

  console.log('EnhancedCalendarView - Jobs:', jobs);
  console.log('EnhancedCalendarView - Events:', events);

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
      review: 'bg-purple-100 text-purple-800 border-purple-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      delivered: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getJobsForDate = (date: Date) => {
    return jobs.filter(job => {
      if (!job.due_date) return false;
      const jobDate = new Date(job.due_date);
      return jobDate.toDateString() === date.toDateString();
    });
  };

  const getDatesWithJobs = () => {
    return jobs
      .filter(job => job.due_date)
      .map(job => new Date(job.due_date!));
  };

  const selectedDateJobs = selectedDate ? getJobsForDate(selectedDate) : [];
  const datesWithJobs = getDatesWithJobs();

  const handleJobClick = (job: Job) => {
    navigate(`/jobs/${job.id}`);
    if (onJobSelect) {
      onJobSelect(job);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Enhanced Calendar */}
      <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-blue-50 to-indigo-50 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {t('calendarView')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-lg border-2 shadow-md bg-white pointer-events-auto"
            locale={language === 'ar' ? ar : undefined}
            modifiers={{
              hasJobs: datesWithJobs
            }}
            modifiersStyles={{
              hasJobs: { 
                backgroundColor: '#3b82f6', 
                color: 'white',
                fontWeight: 'bold',
                borderRadius: '50%',
                transform: 'scale(1.1)',
                boxShadow: '0 4px 8px rgba(59, 130, 246, 0.3)'
              }
            }}
          />
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full shadow-sm"></div>
              <span className="text-sm font-medium text-blue-800">{t('datesWithTasks')}</span>
            </div>
            <div className="text-xs text-blue-600 mt-1">
              {jobs.length} total jobs found
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Selected Date Details */}
      <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-green-50 to-emerald-50 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-600 via-teal-600 to-emerald-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {selectedDate ? format(selectedDate, 'PPP', { locale: language === 'ar' ? ar : undefined }) : t('selectDate')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {selectedDateJobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <CalendarIcon className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg font-medium">{t('noTasksScheduled')}</p>
              <p className="text-gray-400 text-sm mt-2">Select a highlighted date to view tasks</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2 p-2 bg-green-100 rounded-lg">
                <Badge variant="outline" className="bg-green-200 text-green-800 border-green-300 shadow-sm">
                  {selectedDateJobs.length}
                </Badge>
                {t('scheduledTasks')}
              </div>
              {selectedDateJobs.map(job => (
                <div 
                  key={job.id} 
                  className="group border-2 rounded-xl p-4 bg-white shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:bg-gradient-to-r hover:from-white hover:to-blue-50 hover:border-blue-300 transform hover:-translate-y-1"
                  onClick={() => handleJobClick(job)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-gray-900 flex-1 group-hover:text-blue-700 transition-colors">
                      {job.title}
                    </h4>
                    <Badge className={`text-xs ${getStatusColor(job.status)} border shadow-sm`}>
                      {t(job.status as any)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    {job.clients?.name && (
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-blue-500" />
                        <span>{t('client')}: {job.clients.name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-green-500" />
                      <span>{t('type')}: {t(job.type.replace('_', '') as any) || job.type}</span>
                    </div>
                    {job.price && (
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 font-semibold text-base">${job.price}</span>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJobClick(job);
                    }}
                  >
                    <Eye className="h-3 w-3 mr-2" />
                    {t('viewDetails')}
                    <ArrowRight className="h-3 w-3 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedCalendarView;
