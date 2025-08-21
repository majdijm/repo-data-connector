
import React from 'react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DashboardAnalytics from '@/components/DashboardAnalytics';
import AttendanceWidget from '@/components/AttendanceWidget';
import NotificationWidget from '@/components/NotificationWidget';
import { 
  Users, 
  Briefcase, 
  DollarSign, 
  Clock,
  TrendingUp,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

const AdminDashboard = () => {
  const { stats, recentJobs, clients, isLoading, error, refetch } = useSupabaseData();

  if (isLoading) {
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
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading dashboard: {error}
          </AlertDescription>
        </Alert>
        <Button onClick={refetch} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-blue-100">Complete overview of your media agency operations</p>
      </div>

      {/* Quick Access Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceWidget />
        <NotificationWidget />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              Active client relationships
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
            <div className="flex gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {stats.pendingJobs} pending
              </Badge>
              <Badge variant="default" className="text-xs">
                {stats.completedJobs} completed
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From completed projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingPayments}</div>
            <p className="text-xs text-muted-foreground">
              Jobs awaiting payment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Section */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h2 className="text-2xl font-bold">Analytics & Performance</h2>
        </div>
        <DashboardAnalytics />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Jobs</CardTitle>
            <CardDescription>Latest project activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentJobs.slice(0, 5).map(job => (
              <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{job.title}</p>
                  <p className="text-sm text-gray-500">
                    {job.clients?.name || 'No client'} • {job.type.replace('_', ' ')}
                  </p>
                </div>
                <Badge variant={
                  job.status === 'completed' ? 'default' : 
                  job.status === 'in_progress' ? 'secondary' : 'outline'
                }>
                  {job.status.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client Overview</CardTitle>
            <CardDescription>Top clients by engagement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {clients.slice(0, 5).map(client => (
              <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{client.name}</p>
                  <p className="text-sm text-gray-500">{client.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">
                    ${client.total_paid?.toLocaleString() || 0}
                  </p>
                  <p className="text-sm text-gray-500">paid</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
