
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  Calendar, 
  DollarSign, 
  Briefcase, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ClientJobProgress from '@/components/ClientJobProgress';
import ClientPaymentSummary from '@/components/ClientPaymentSummary';
import ClientNotifications from '@/components/ClientNotifications';
import JobFilesDisplay from '@/components/JobFilesDisplay';

const ClientDashboard = () => {
  const { jobs, clients, payments, paymentRequests, loading, error, stats } = useSupabaseData();
  const { t } = useTranslation();
  const navigate = useNavigate();

  console.log('ClientDashboard render - Jobs:', jobs);
  console.log('ClientDashboard render - Clients:', clients);
  console.log('ClientDashboard render - Payments:', payments);
  console.log('ClientDashboard render - Loading:', loading);
  console.log('ClientDashboard render - Error:', error);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive">{t('errorLoadingData')}</p>
        </div>
      </div>
    );
  }

  const clientRecord = clients[0];
  const activeJobs = jobs.filter(job => ['pending', 'in_progress', 'review', 'completed'].includes(job.status));
  const deliveredJobs = jobs.filter(job => job.status === 'delivered');

  // Payment requests are now fetched from the hook

  // Mock client packages data - in real implementation, this should be fetched
  const clientPackages = [
    {
      id: '1',
      name: 'Premium Design Package',
      price: 299,
      duration_months: 12,
      start_date: '2024-01-01T00:00:00Z',
      end_date: '2024-12-31T23:59:59Z',
      is_active: true
    }
  ];

  console.log('ClientDashboard metrics:', {
    totalJobs: jobs.length,
    activeJobs: activeJobs.length,
    deliveredJobs: deliveredJobs.length,
    totalPayments: payments.length,
    clientId: clientRecord?.id
  });

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/10 to-purple-600/10 p-6 rounded-lg border">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {clientRecord?.name || 'Valued Client'}!
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your projects and account status.
        </p>
      </div>

      {/* Notifications */}
      <ClientNotifications />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">Total Projects</p>
                <p className="text-2xl font-bold text-blue-700">{stats.totalJobs}</p>
              </div>
              <Briefcase className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 mb-1">Active Projects</p>
                <p className="text-2xl font-bold text-yellow-700">{stats.activeJobs}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">Delivered</p>
                <p className="text-2xl font-bold text-green-700">{deliveredJobs.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">Total Paid</p>
                <p className="text-2xl font-bold text-purple-700">${stats.totalRevenue}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Summary with Package Info */}
      <ClientPaymentSummary 
        jobs={jobs} 
        payments={payments} 
        paymentRequests={paymentRequests}
        clientPackages={clientPackages}
      />

      {/* Active Projects */}
      {activeJobs.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Active Projects
          </h2>
          <div className="grid gap-4">
            {activeJobs.map((job) => (
              <div key={job.id} className="relative">
                <ClientJobProgress job={job} />
                <div className="absolute top-4 right-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/jobs/${job.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </div>
                {/* Show files for completed jobs */}
                {job.status === 'completed' && (
                  <div className="mt-4">
                    <JobFilesDisplay jobId={job.id} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delivered Projects */}
      {deliveredJobs.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Delivered Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {deliveredJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{job.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {job.type.replace('_', ' ')} • ${job.price}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">
                      DELIVERED
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/jobs/${job.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Projects Message */}
      {jobs.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="text-center py-12">
            <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Projects Yet</h3>
            <p className="text-muted-foreground">
              Your projects will appear here once they are created by our team.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClientDashboard;
