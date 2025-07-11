
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { DollarSign, FileText, CheckCircle, Clock } from 'lucide-react';

const ClientDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { jobs, clients, payments, loading, error } = useSupabaseData();

  console.log('ClientDashboard render - Jobs:', jobs);
  console.log('ClientDashboard render - Clients:', clients);
  console.log('ClientDashboard render - Payments:', payments);
  console.log('ClientDashboard render - Loading:', loading);
  console.log('ClientDashboard render - Error:', error);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading dashboard data: {error.message || 'Unknown error'}</p>
        <pre className="text-xs text-gray-600 mt-2">{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'review':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate metrics
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(job => 
    job.status === 'pending' || 
    job.status === 'in_progress' || 
    job.status === 'review'
  ).length;
  const completedJobs = jobs.filter(job => 
    job.status === 'completed' || 
    job.status === 'delivered'
  ).length;
  const totalPaid = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
  const totalJobsValue = jobs.reduce((sum, job) => sum + (job.price || 0), 0);
  const accountBalance = totalJobsValue - totalPaid;

  console.log('ClientDashboard metrics:', {
    totalJobs,
    activeJobs,
    completedJobs,
    totalPaid,
    totalJobsValue,
    accountBalance
  });

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold">{t('clientPortal')}</h1>
        <p className="text-blue-100 mt-2">{t('clientPortalSubtitle')}</p>
        <div className="text-sm mt-2 opacity-75">
          Debug: {totalJobs} total jobs, {completedJobs} completed
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalJobs')}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalJobs}</div>
            <p className="text-xs text-muted-foreground">
              {activeJobs} {t('active')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('completedJobs')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedJobs}</div>
            <p className="text-xs text-muted-foreground">
              {((completedJobs / (totalJobs || 1)) * 100).toFixed(1)}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalPaid')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPaid}</div>
            <p className="text-xs text-muted-foreground">
              From {payments.length} payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('accountBalance')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${accountBalance}</div>
            <p className="text-xs text-muted-foreground">
              {accountBalance > 0 ? t('outstanding') : t('paid')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>{t('recentJobs')}</CardTitle>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-2">{t('noJobsFound')}</p>
              <p className="text-sm text-gray-400">
                {t('contactUsForNewProjects')}
              </p>
              <div className="text-xs text-gray-400 mt-4">
                Debug info: Client ID: {clients[0]?.id || 'No client found'}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.slice(0, 5).map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{job.title}</h4>
                    <p className="text-sm text-gray-600">{job.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('dueDate')}: {job.due_date ? new Date(job.due_date).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(job.status)}>
                      {t(job.status as any)}
                    </Badge>
                    {job.price && (
                      <span className="font-semibold text-green-600">${job.price}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Payments */}
      {payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('recentPayments')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {payments.slice(0, 5).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">${payment.amount}</p>
                    <p className="text-sm text-gray-600">{payment.payment_method}</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-800">{t('paid')}</Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClientDashboard;
