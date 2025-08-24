import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Megaphone, 
  PenTool, 
  Eye, 
  FileVideo, 
  Clock, 
  CheckCircle,
  RefreshCw,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import AttendanceWidget from '@/components/AttendanceWidget';
import NotificationWidget from '@/components/NotificationWidget';

const AdsManagerDashboard = () => {
  const { stats, recentJobs, isLoading, error, refetch } = useSupabaseData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
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

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      review: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
  };

  const adsManagerTasks = [
    { name: 'Ads Plan', icon: Megaphone, color: 'text-orange-600', description: 'Strategic advertising planning' },
    { name: 'Content Plan', icon: PenTool, color: 'text-purple-600', description: 'Content strategy & planning' },
    { name: 'Visual ID', icon: Eye, color: 'text-blue-600', description: 'Visual identity development' },
    { name: 'Scripts', icon: FileVideo, color: 'text-green-600', description: 'Script writing & development' }
  ];

  const taskData = adsManagerTasks.map(task => ({
    task: task.name,
    completed: Math.floor(Math.random() * 10) + 1,
    pending: Math.floor(Math.random() * 5) + 1
  }));

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ads Manager Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage advertising campaigns, content planning, and creative strategies</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-red-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeJobs}</p>
                  </div>
                  <div className="p-3 rounded-full bg-orange-100">
                    <Megaphone className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Content Plans</p>
                    <p className="text-2xl font-bold text-gray-900">{Math.floor(stats.totalJobs * 0.3)}</p>
                  </div>
                  <div className="p-3 rounded-full bg-purple-100">
                    <PenTool className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.completedJobs}</p>
                  </div>
                  <div className="p-3 rounded-full bg-green-100">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Task Types Overview */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Task Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={taskData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="task" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completed" fill="#10b981" name="Completed" />
                  <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Task Types Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {adsManagerTasks.map((task, index) => (
              <Card key={index} className="shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-gray-100">
                      <task.icon className={`h-6 w-6 ${task.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{task.name}</h3>
                      <p className="text-sm text-gray-600">{task.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Assigned Tasks */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Recent Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              {recentJobs.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No tasks assigned yet</p>
              ) : (
                <div className="space-y-4">
                  {recentJobs.slice(0, 5).map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{job.title}</h4>
                        <p className="text-sm text-gray-600">
                          {job.clients?.name || 'Unknown Client'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Type: {job.type?.replace('_', ' ') || 'General'}
                        </p>
                      </div>
                      <Badge className={getStatusBadge(job.status)}>
                        {job.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <AttendanceWidget />
          <NotificationWidget />
          
          <Card className="shadow-lg border-0 bg-gradient-to-br from-indigo-50 to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-700">
                <Clock className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                <Megaphone className="h-4 w-4 mr-2" />
                Create Ads Plan
              </Button>
              <Button className="w-full justify-start bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                <PenTool className="h-4 w-4 mr-2" />
                Plan Content
              </Button>
              <Button className="w-full justify-start bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                <Eye className="h-4 w-4 mr-2" />
                Design Visual ID
              </Button>
              <Button className="w-full justify-start bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                <FileVideo className="h-4 w-4 mr-2" />
                Write Scripts
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdsManagerDashboard;