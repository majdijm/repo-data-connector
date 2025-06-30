
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockJobs } from '@/data/mockData';
import { Camera, Upload, Calendar, FileImage } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const PhotographerDashboard = () => {
  const { user } = useAuth();
  const photographerJobs = mockJobs.filter(job => 
    job.assignedTo === user?.id && job.type === 'photo_session'
  );
  
  const todaySessions = photographerJobs.filter(job => 
    job.sessionDate && 
    job.sessionDate.toDateString() === new Date().toDateString()
  );

  const upcomingSessions = photographerJobs.filter(job => 
    job.sessionDate && job.sessionDate > new Date()
  );

  const completedSessions = photographerJobs.filter(job => 
    job.status === 'completed' || job.status === 'delivered'
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Photographer Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your photo sessions and uploads</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{todaySessions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Camera className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingSessions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileImage className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedSessions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Upload className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Files Uploaded</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Sessions */}
      {todaySessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-blue-600">
              <Calendar className="mr-2 h-5 w-5" />
              Today's Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaySessions.map((session) => (
                <div key={session.id} className="p-4 border rounded-lg bg-blue-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900">{session.title}</h3>
                      <p className="text-gray-600">{session.clientName}</p>
                      <p className="text-blue-600 text-sm">
                        {session.sessionDate?.toLocaleTimeString()} - {session.description}
                      </p>
                    </div>
                    <div className="space-x-2">
                      <Button size="sm">Upload Photos</Button>
                      <Button size="sm" variant="outline">Mark Complete</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assigned Photo Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>My Photo Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {photographerJobs.map((job) => (
              <div key={job.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-600">{job.clientName}</p>
                    <p className="text-sm text-gray-500 mt-1">{job.description}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="text-sm text-gray-500">
                        Session: {job.sessionDate?.toLocaleDateString()}
                      </span>
                      <span className="text-sm text-gray-500">
                        Due: {job.dueDate.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      job.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {job.status.replace('_', ' ')}
                    </span>
                    <div className="space-x-2">
                      <Button size="sm" variant="outline">
                        <Upload className="mr-1 h-3 w-3" />
                        Upload RAW
                      </Button>
                      <Button size="sm">View Details</Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PhotographerDashboard;
