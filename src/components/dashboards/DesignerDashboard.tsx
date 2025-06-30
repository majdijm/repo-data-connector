
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockJobs } from '@/data/mockData';
import { FileText, Upload, Calendar, FileImage } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const DesignerDashboard = () => {
  const { user } = useAuth();
  const designerJobs = mockJobs.filter(job => 
    job.assignedTo === user?.id && job.type === 'design'
  );
  
  const activeTasks = designerJobs.filter(job => 
    job.status === 'in_progress' || job.status === 'pending'
  );

  const reviewTasks = designerJobs.filter(job => job.status === 'review');
  const completedTasks = designerJobs.filter(job => 
    job.status === 'completed' || job.status === 'delivered'
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Designer Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your design projects and deliverables</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{activeTasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Review</p>
                <p className="text-2xl font-bold text-gray-900">{reviewTasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileImage className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedTasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Upload className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Files Delivered</p>
                <p className="text-2xl font-bold text-gray-900">18</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority Tasks */}
      {activeTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-purple-600">
              <FileText className="mr-2 h-5 w-5" />
              Priority Design Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeTasks.map((task) => (
                <div key={task.id} className="p-4 border rounded-lg bg-purple-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900">{task.title}</h3>
                      <p className="text-gray-600">{task.clientName}</p>
                      <p className="text-purple-600 text-sm mt-1">{task.description}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Due: {task.dueDate.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="space-x-2">
                      <Button size="sm">Upload Design</Button>
                      <Button size="sm" variant="outline">View Brief</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Design Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>My Design Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {designerJobs.map((job) => (
              <div key={job.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-600">{job.clientName}</p>
                    <p className="text-sm text-gray-500 mt-1">{job.description}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="text-sm text-gray-500">
                        Created: {job.createdAt.toLocaleDateString()}
                      </span>
                      <span className="text-sm text-gray-500">
                        Due: {job.dueDate.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      job.status === 'review' ? 'bg-purple-100 text-purple-800' :
                      job.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {job.status.replace('_', ' ')}
                    </span>
                    <div className="space-x-2">
                      <Button size="sm" variant="outline">
                        <Upload className="mr-1 h-3 w-3" />
                        Upload Files
                      </Button>
                      <Button size="sm">View Project</Button>
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

export default DesignerDashboard;
