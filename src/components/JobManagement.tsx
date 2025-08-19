
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, DollarSign, User, FileText, Eye } from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import JobForm from '@/components/JobForm';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';

const JobManagement = () => {
  const { jobs, loading, refetch } = useSupabaseData();
  const { canManageJobs } = useRoleAccess();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  console.log('JobManagement - Jobs data:', jobs);
  console.log('JobManagement - Loading:', loading);
  console.log('JobManagement - Can manage jobs:', canManageJobs());
  console.log('JobManagement - Show create form:', showCreateForm);

  const handleJobAdded = () => {
    console.log('Job added successfully, refreshing data and closing form');
    refetch();
    setShowCreateForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'review':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'delivered':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatJobType = (type: string) => {
    switch (type) {
      case 'photo_session':
        return t('photoSession');
      case 'video_editing':
        return t('videoEditing');
      case 'design':
        return t('design');
      default:
        return type;
    }
  };

  const getStatusText = (status: string) => {
    return t(status as any) || status.replace('_', ' ');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{t('jobManagement')}</h2>
          {canManageJobs() && (
            <Button disabled>
              <Plus className="w-4 h-4 mr-2" />
              {t('createNewJob')}
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('jobManagement')}</h2>
          <p className="text-gray-600">{t('createNewJob')} {t('clients')}</p>
        </div>
        {canManageJobs() && (
          <Button 
            onClick={() => {
              console.log('Create New Job button clicked');
              setShowCreateForm(!showCreateForm);
            }}
            variant={showCreateForm ? "outline" : "default"}
          >
            <Plus className="w-4 h-4 mr-2" />
            {showCreateForm ? t('cancel') : t('createNewJob')}
          </Button>
        )}
      </div>

      {/* Job Creation Form */}
      {showCreateForm && canManageJobs() && (
        <Card>
          <CardHeader>
            <CardTitle>{t('createNewJob')}</CardTitle>
            <CardDescription>{t('createNewJob')} {t('clients')}</CardDescription>
          </CardHeader>
          <CardContent>
            <JobForm onJobAdded={handleJobAdded} />
          </CardContent>
        </Card>
      )}

      {/* Job Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('totalJobs')}</p>
                <p className="text-2xl font-bold">{jobs.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('pending')}</p>
                <p className="text-2xl font-bold">
                  {jobs.filter(job => job.status === 'pending').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('inProgress')}</p>
                <p className="text-2xl font-bold">
                  {jobs.filter(job => job.status === 'in_progress').length}
                </p>
              </div>
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('completed')}</p>
                <p className="text-2xl font-bold">
                  {jobs.filter(job => job.status === 'completed' || job.status === 'delivered').length}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('jobs')}</h3>
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noJobsCreatedYet')}</h3>
              <p className="text-gray-500 mb-4">{t('createNewJob')}</p>
              {canManageJobs() && (
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('createNewJob')}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{job.title}</CardTitle>
                      <CardDescription>{formatJobType(job.type)}</CardDescription>
                    </div>
                    <Badge variant="outline" className={getStatusColor(job.status)}>
                      {getStatusText(job.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-2" />
                      {job.clients?.name || t('unassigned')}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {t('due')}: {format(new Date(job.due_date), 'MMM dd, yyyy')}
                    </div>
                    {job.price && (
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="w-4 h-4 mr-2" />
                        ${job.price}
                      </div>
                    )}
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/jobs/${job.id}`)}
                        className="w-full"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        {t('viewDetails')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobManagement;
