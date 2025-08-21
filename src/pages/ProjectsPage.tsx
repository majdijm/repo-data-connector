import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Grid3X3, 
  Calendar as CalendarIcon, 
  List, 
  Search, 
  Filter, 
  Plus,
  Briefcase,
  Layout,
  Clock
} from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useUsers } from '@/hooks/useUsers';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { useNavigate } from 'react-router-dom';
import TasksMatrixView from '@/components/TasksMatrixView';
import TasksCalendarView from '@/components/TasksCalendarView';
import { useTranslation } from '@/hooks/useTranslation';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const ProjectsPage = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  const { jobs, clients, isLoading, error } = useSupabaseData();
  const { users } = useUsers();
  const { canManageJobs } = useRoleAccess();
  const { t, language } = useTranslation();
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300 shadow-sm',
      in_progress: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300 shadow-sm',
      review: 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300 shadow-sm',
      completed: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300 shadow-sm',
      delivered: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300 shadow-sm',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 shadow-sm';
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesType = typeFilter === 'all' || job.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  if (isLoading) {
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
      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white p-8 rounded-2xl shadow-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Briefcase className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">{t('jobs')}</h1>
                  <p className="text-purple-100 text-lg mt-2">Unified project management and task tracking</p>
                </div>
              </div>
              {canManageJobs() && (
                <Button 
                  onClick={() => navigate('/jobs')} 
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
                  size="lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create New Project
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="shadow-xl border-0 bg-gradient-to-r from-white to-gray-50">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder={`${t('search')} projects...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 border-2 focus:border-blue-400 rounded-xl"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-12 border-2 rounded-xl">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by Status" />
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

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-12 border-2 rounded-xl">
                  <Layout className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="photo_session">Photo Session</SelectItem>
                  <SelectItem value="video_editing">Video Editing</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* View Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-fit lg:grid-cols-3 gap-1 bg-gray-100 p-1 rounded-xl">
            <TabsTrigger value="list" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-6 py-2">
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">List View</span>
            </TabsTrigger>
            <TabsTrigger value="matrix" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-6 py-2">
              <Grid3X3 className="h-4 w-4" />
              <span className="hidden sm:inline">Matrix</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-6 py-2">
              <CalendarIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Calendar</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="list" className="space-y-4">
              {/* Enhanced Projects List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.map(job => (
                  <Card 
                    key={job.id} 
                    className="group shadow-xl border-0 hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white via-gray-50 to-blue-50 overflow-hidden cursor-pointer hover:-translate-y-1 transform"
                    onClick={() => navigate(`/jobs/${job.id}`)}
                  >
                    <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-blue-100 group-hover:from-blue-100 group-hover:to-purple-100 transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg font-bold text-gray-900 flex-1 pr-3 group-hover:text-blue-700 transition-colors line-clamp-2">
                          {job.title}
                        </CardTitle>
                        <Badge className={`text-xs px-2 py-1 border ${getStatusColor(job.status)} shrink-0`}>
                          {t(job.status as any)}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4 p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-gray-600">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm font-medium">Client:</span>
                          <span className="font-semibold">{job.clients?.name || 'N/A'}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium">Type:</span>
                          <span className="font-semibold capitalize">{job.type.replace('_', ' ')}</span>
                        </div>
                        
                        {job.due_date && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="h-4 w-4 text-orange-500" />
                            <span className="text-sm font-medium">Due:</span>
                            <span className="font-semibold">
                              {format(new Date(job.due_date), 'MMM dd, yyyy', { 
                                locale: language === 'ar' ? ar : undefined 
                              })}
                            </span>
                          </div>
                        )}
                        
                        {job.price && (
                          <div className="p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                            <span className="text-green-700 font-bold text-xl">${job.price}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredJobs.length === 0 && (
                <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
                  <CardContent className="text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                      <Briefcase className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-700 mb-2">No projects found</h3>
                    <p className="text-gray-500 text-lg">Try adjusting your search or filter criteria</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="matrix">
              <Card className="shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <CardTitle className="flex items-center space-x-2">
                    <Grid3X3 className="h-5 w-5 text-blue-600" />
                    <span>Projects Matrix View</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <TasksMatrixView jobs={filteredJobs} clients={clients} users={users} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calendar">
              <Card className="shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <CardTitle className="flex items-center space-x-2">
                    <CalendarIcon className="h-5 w-5 text-blue-600" />
                    <span>Projects Calendar View</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <TasksCalendarView jobs={filteredJobs} users={users} />
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ProjectsPage;