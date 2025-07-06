
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Filter, Eye, Calendar, Clock, User } from 'lucide-react';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useTranslation } from '@/hooks/useTranslation';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const TasksPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const { jobs, loading } = useCalendarEvents();
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

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">{t('loading')}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold">{t('jobs')}</h1>
          <p className="text-purple-100 mt-2">Manage and track all your assigned tasks</p>
        </div>

        {/* Filters */}
        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder={t('search')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">{t('pending')}</SelectItem>
                    <SelectItem value="in_progress">{t('inProgress')}</SelectItem>
                    <SelectItem value="review">{t('review')}</SelectItem>
                    <SelectItem value="completed">{t('completed')}</SelectItem>
                    <SelectItem value="delivered">{t('delivered')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map(job => (
            <Card key={job.id} className="shadow-lg border-0 hover:shadow-xl transition-shadow bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex-1 pr-2">
                    {job.title}
                  </CardTitle>
                  <Badge className={`text-xs ${getStatusColor(job.status)} border shrink-0`}>
                    {t(job.status as any)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="h-4 w-4 text-blue-500" />
                    <span>{t('client')}: {job.clients?.name || 'N/A'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4 text-green-500" />
                    <span>{t('type')}: {t(job.type.replace('_', '') as any) || job.type}</span>
                  </div>
                  
                  {job.due_date && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span>
                        {format(new Date(job.due_date), 'MMM dd, yyyy', { 
                          locale: language === 'ar' ? ar : undefined 
                        })}
                      </span>
                    </div>
                  )}
                  
                  {job.price && (
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 font-semibold text-lg">${job.price}</span>
                    </div>
                  )}
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4 hover:bg-blue-50 hover:border-blue-300"
                  onClick={() => setSelectedJob(job)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {t('viewDetails')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <Card className="shadow-lg border-0">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">No tasks found</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filter criteria</p>
            </CardContent>
          </Card>
        )}
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
    </DashboardLayout>
  );
};

export default TasksPage;
