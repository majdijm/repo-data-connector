
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Clock, User, MapPin, Eye, Calendar as CalendarIcon } from 'lucide-react';
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
}

interface EnhancedCalendarViewProps {
  onJobSelect?: (job: Job) => void;
}

const EnhancedCalendarView: React.FC<EnhancedCalendarViewProps> = ({ onJobSelect }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const { events, jobs, loading } = useCalendarEvents();
  const { t, language } = useTranslation();

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
    setSelectedJob(job);
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
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
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
              className="rounded-md border shadow-sm bg-white"
              locale={language === 'ar' ? ar : undefined}
              modifiers={{
                hasJobs: datesWithJobs
              }}
              modifiersStyles={{
                hasJobs: { 
                  backgroundColor: '#3b82f6', 
                  color: 'white',
                  fontWeight: 'bold',
                  borderRadius: '50%'
                }
              }}
            />
            <div className="mt-4 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>{t('datesWithTasks')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Details */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-green-50">
          <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {selectedDate ? format(selectedDate, 'PPP', { locale: language === 'ar' ? ar : undefined }) : t('selectDate')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {selectedDateJobs.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500">{t('noTasksScheduled')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    {selectedDateJobs.length}
                  </Badge>
                  {t('scheduledTasks')}
                </div>
                {selectedDateJobs.map(job => (
                  <div 
                    key={job.id} 
                    className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer hover:bg-gray-50"
                    onClick={() => handleJobClick(job)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 flex-1">{job.title}</h4>
                      <Badge className={`text-xs ${getStatusColor(job.status)} border`}>
                        {t(job.status as any)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        <span>{t('client')}: {job.clients?.name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        <span>{t('type')}: {t(job.type.replace('_', '') as any) || job.type}</span>
                      </div>
                      {job.price && (
                        <div className="flex items-center gap-2">
                          <span className="text-green-600 font-medium">${job.price}</span>
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3 w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJobClick(job);
                      }}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      {t('viewDetails')}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Job Details Dialog */}
      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {t('jobDetails')}
            </DialogTitle>
          </DialogHeader>
          
          {selectedJob && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('client')}</label>
                  <p className="text-lg">{selectedJob.clients?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('status')}</label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(selectedJob.status)}>
                      {t(selectedJob.status as any)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('type')}</label>
                  <p className="text-lg">{t(selectedJob.type.replace('_', '') as any) || selectedJob.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('price')}</label>
                  <p className="text-lg font-semibold text-green-600">
                    {selectedJob.price ? `$${selectedJob.price}` : 'N/A'}
                  </p>
                </div>
              </div>
              
              {selectedJob.due_date && (
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('dueDate')}</label>
                  <p className="text-lg">
                    {format(new Date(selectedJob.due_date), 'PPP', { 
                      locale: language === 'ar' ? ar : undefined 
                    })}
                  </p>
                </div>
              )}
              
              {selectedJob.description && (
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('description')}</label>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg mt-2">
                    {selectedJob.description}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EnhancedCalendarView;
