
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Palette, 
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

interface DesignerDashboardProps {
  userProfile: UserProfile;
}

const DesignerDashboard: React.FC<DesignerDashboardProps> = ({ userProfile }) => {
  // Mock data for now - will be replaced with real data
  const stats = {
    activeProjects: 4,
    pendingReview: 2,
    completedProjects: 18,
    pendingUploads: 1
  };

  const projects = [
    {
      id: '1',
      title: 'Logo Design - Tech Startup',
      client: 'Tech Startup Inc',
      dueDate: new Date(Date.now() + 172800000).toISOString(),
      status: 'in_progress',
      type: 'logo'
    },
    {
      id: '2',
      title: 'Brochure Design - Real Estate',
      client: 'Prime Properties',
      dueDate: new Date(Date.now() + 259200000).toISOString(),
      status: 'review',
      type: 'brochure'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Designer Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {userProfile.name}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReview}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedProjects}</div>
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

      {/* Assigned Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Your Design Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">{project.title}</h3>
                  <p className="text-sm text-gray-600">
                    Client: {project.client} • Type: {project.type}
                  </p>
                  <p className="text-sm text-gray-500">
                    Due: {new Date(project.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={`${getStatusColor(project.status)} border-0`}>
                    {project.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No assigned projects found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DesignerDashboard;
