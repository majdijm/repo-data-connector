
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Video, 
  Upload, 
  Clock, 
  CheckCircle,
  AlertCircle,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import AttendanceWidget from '@/components/AttendanceWidget';
import NotificationWidget from '@/components/NotificationWidget';

const EditorDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const { stats, recentJobs, isLoading, error, refetch } = useSupabaseData();

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

  // Filter for video editing jobs only
  const videoJobs = recentJobs.filter(job => job.type === 'video_editing');
  const activeProjects = videoJobs.filter(job => job.status === 'in_progress').length;
  const completedProjects = videoJobs.filter(job => job.status === 'completed').length;
  const pendingReview = videoJobs.filter(job => job.status === 'review').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Create status distribution for pie chart
  const statusData = [
    { name: 'Active', value: activeProjects, color: '#3b82f6' },
    { name: 'Review', value: pendingReview, color: '#8b5cf6' },
    { name: 'Completed', value: completedProjects, color: '#10b981' }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Video Editor Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {userProfile?.name}!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <Video className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeProjects}</div>
                <p className="text-xs text-muted-foreground mt-1">Currently editing</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingReview}</div>
                <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedProjects}</div>
                <p className="text-xs text-muted-foreground mt-1">Successfully delivered</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <Upload className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{videoJobs.length}</div>
                <p className="text-xs text-muted-foreground mt-1">All video projects</p>
              </CardContent>
            </Card>
          </div>

          {/* Project Status Distribution */}
          {statusData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Project Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex justify-center">
                  <div className="flex flex-wrap gap-4">
                    {statusData.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-sm">{item.name}: {item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Assigned Projects */}
          <Card>
            <CardHeader>
              <CardTitle>Your Video Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {videoJobs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No video editing projects assigned to you yet.
                  </div>
                ) : (
                  videoJobs.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold">{project.title}</h3>
                        <p className="text-sm text-gray-600">
                          Client: {project.clients?.name || 'Unknown'} • Type: Video Editing
                        </p>
                        {project.due_date && (
                          <p className="text-sm text-gray-500">
                            Due: {new Date(project.due_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={`${getStatusColor(project.status)} border-0`}>
                          {project.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <AttendanceWidget />
          <NotificationWidget />
        </div>
      </div>
    </div>
  );
};

export default EditorDashboard;
