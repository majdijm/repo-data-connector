
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Eye, Calendar, Clock, User, ArrowRight, Briefcase } from 'lucide-react';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useTranslation } from '@/hooks/useTranslation';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const TasksPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { jobs, loading } = useCalendarEvents();
  const { t, language } = useTranslation();
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300 shadow-sm',
      in_progress: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300 shadow-sm',
      review: 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300 shadow-sm',
      completed: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300 shadow-sm',
      delivered: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300 shadow-sm',
      cancelled: 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300 shadow-sm',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 shadow-sm';
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleJobClick = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600 text-lg">{t('loading')}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-red-500 text-white p-8 rounded-2xl shadow-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Briefcase className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">{t('jobs')}</h1>
                <p className="text-purple-100 text-lg mt-2">Manage and track all your assigned tasks with ease</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters */}
        <Card className="shadow-xl border-0 bg-gradient-to-r from-white to-blue-50">
          <CardContent className="p-8">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder={`${t('search')} jobs, clients...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 text-lg border-2 focus:border-blue-400 rounded-xl shadow-sm"
                  />
                </div>
              </div>
              <div className="w-full sm:w-56">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-12 text-lg border-2 rounded-xl shadow-sm">
                    <Filter className="h-5 w-5 mr-3" />
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

        {/* Enhanced Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredJobs.map(job => (
            <Card 
              key={job.id} 
              className="group shadow-xl border-0 hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white via-gray-50 to-blue-50 overflow-hidden cursor-pointer hover:-translate-y-2 transform"
              onClick={() => handleJobClick(job.id)}
            >
              <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-blue-100 group-hover:from-blue-100 group-hover:to-purple-100 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl font-bold text-gray-900 flex-1 pr-3 group-hover:text-blue-700 transition-colors line-clamp-2">
                    {job.title}
                  </CardTitle>
                  <Badge className={`text-xs px-3 py-1 border-2 ${getStatusColor(job.status)} shrink-0`}>
                    {t(job.status as any)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-5 p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-600 group-hover:text-gray-700 transition-colors">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <span className="text-sm font-medium">{t('client')}</span>
                      <p className="font-semibold">{job.clients?.name || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-gray-600 group-hover:text-gray-700 transition-colors">
                    <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                      <Calendar className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <span className="text-sm font-medium">{t('type')}</span>
                      <p className="font-semibold capitalize">{t(job.type.replace('_', '') as any) || job.type}</p>
                    </div>
                  </div>
                  
                  {job.due_date && (
                    <div className="flex items-center gap-3 text-gray-600 group-hover:text-gray-700 transition-colors">
                      <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                        <Clock className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <span className="text-sm font-medium">Due Date</span>
                        <p className="font-semibold">
                          {format(new Date(job.due_date), 'MMM dd, yyyy', { 
                            locale: language === 'ar' ? ar : undefined 
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {job.price && (
                    <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <span className="text-green-700 font-bold text-2xl">${job.price}</span>
                    </div>
                  )}
                </div>
                
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full mt-6 h-12 text-base font-semibold hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-transparent group-hover:shadow-lg transition-all duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJobClick(job.id);
                  }}
                >
                  <Eye className="h-5 w-5 mr-2" />
                  {t('viewDetails')}
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
            <CardContent className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Calendar className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No tasks found</h3>
              <p className="text-gray-500 text-lg">Try adjusting your search or filter criteria</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TasksPage;
