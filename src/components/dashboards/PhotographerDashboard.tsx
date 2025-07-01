
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  Upload, 
  Clock, 
  CheckCircle
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

interface PhotographerDashboardProps {
  userProfile: UserProfile;
}

const PhotographerDashboard: React.FC<PhotographerDashboardProps> = ({ userProfile }) => {
  // Mock data for now - will be replaced with real data
  const stats = {
    activeSessions: 3,
    upcomingSessions: 5,
    completedSessions: 12,
    pendingUploads: 2
  };

  const sessions = [
    {
      id: '1',
      title: 'Wedding Photography - Sarah & John',
      client: 'Sarah Johnson',
      date: new Date().toISOString(),
      status: 'pending',
      type: 'wedding'
    },
    {
      id: '2',
      title: 'Corporate Headshots - Tech Corp',
      client: 'Tech Corp',
      date: new Date(Date.now() + 86400000).toISOString(),
      status: 'scheduled',
      type: 'corporate'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Photographer Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {userProfile.name}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSessions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingSessions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedSessions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Uploads</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingUploads}</div>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Your Assigned Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">{session.title}</h3>
                  <p className="text-sm text-gray-600">
                    Client: {session.client} • Type: {session.type}
                  </p>
                  <p className="text-sm text-gray-500">
                    Date: {new Date(session.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={`${getStatusColor(session.status)} border-0`}>
                    {session.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            ))}
            {sessions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No assigned sessions found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PhotographerDashboard;
