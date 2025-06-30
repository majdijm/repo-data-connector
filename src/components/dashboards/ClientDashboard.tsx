
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockJobs, mockClients, mockPayments } from '@/data/mockData';
import { FileText, Calendar, FileImage, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const ClientDashboard = () => {
  const { user } = useAuth();
  const clientData = mockClients.find(client => client.userId === user?.id);
  const clientJobs = mockJobs.filter(job => job.clientId === clientData?.id);
  const clientPayments = mockPayments.filter(payment => payment.clientId === clientData?.id);

  const activeProjects = clientJobs.filter(job => 
    job.status !== 'completed' && job.status !== 'delivered'
  );
  const completedProjects = clientJobs.filter(job => 
    job.status === 'completed' || job.status === 'delivered'
  );

  const totalPaid = clientPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const remainingBalance = (clientData?.totalDue || 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}</h1>
        <p className="text-gray-600 mt-2">Track your projects and downloads</p>
      </div>

      {/* Client Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">{activeProjects.length}</p>
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
                <p className="text-2xl font-bold text-gray-900">{completedProjects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Paid</p>
                <p className="text-2xl font-bold text-gray-900">${totalPaid.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Balance Due</p>
                <p className="text-2xl font-bold text-gray-900">${remainingBalance.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Projects */}
      {activeProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-blue-600" />
              Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeProjects.map((project) => (
                <div key={project.id} className="p-4 border rounded-lg bg-blue-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900">{project.title}</h3>
                      <p className="text-blue-600 text-sm mt-1">{project.description}</p>
                      <div className="flex items-center mt-2 space-x-4">
                        {project.sessionDate && (
                          <span className="text-sm text-gray-600">
                            Session: {project.sessionDate.toLocaleDateString()}
                          </span>
                        )}
                        <span className="text-sm text-gray-600">
                          Due: {project.dueDate.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'review' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completed Projects & Downloads */}
        <Card>
          <CardHeader>
            <CardTitle>Completed Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedProjects.map((project) => (
                <div key={project.id} className="p-3 border rounded-lg bg-green-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{project.title}</h4>
                      <p className="text-sm text-gray-600">
                        Completed: {project.updatedAt.toLocaleDateString()}
                      </p>
                    </div>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Download Files
                    </Button>
                  </div>
                </div>
              ))}
              {completedProjects.length === 0 && (
                <p className="text-gray-500 text-center py-4">No completed projects yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clientPayments.map((payment) => (
                <div key={payment.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">${payment.amount}</p>
                      <p className="text-sm text-gray-600">{payment.description}</p>
                      <p className="text-xs text-gray-400">
                        {payment.recordedAt.toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-green-600 text-sm font-medium">Paid</span>
                  </div>
                </div>
              ))}
              {clientPayments.length === 0 && (
                <p className="text-gray-500 text-center py-4">No payment history</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Upcoming Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {clientJobs
              .filter(job => job.sessionDate && job.sessionDate > new Date())
              .map((session) => (
                <div key={session.id} className="p-4 border rounded-lg bg-yellow-50">
                  <h4 className="font-medium text-gray-900">{session.title}</h4>
                  <p className="text-yellow-600 text-sm mt-1">
                    Scheduled: {session.sessionDate?.toLocaleDateString()} at{' '}
                    {session.sessionDate?.toLocaleTimeString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{session.description}</p>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDashboard;
