
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Edit, Save, X, Calendar, DollarSign, User, FileText } from 'lucide-react';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import JobWorkflowActions from '@/components/JobWorkflowActions';
import JobComments from '@/components/JobComments';
import { useUsers } from '@/hooks/useUsers';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { jobs, loading } = useCalendarEvents();
  const { userProfile } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { users } = useUsers();
  
  const [job, setJob] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    status: '',
    price: '',
    due_date: '',
    assigned_to: ''
  });

  useEffect(() => {
    const foundJob = jobs.find(j => j.id === id);
    if (foundJob) {
      setJob(foundJob);
      setEditForm({
        title: foundJob.title || '',
        description: foundJob.description || '',
        status: foundJob.status || '',
        price: foundJob.price?.toString() || '',
        due_date: foundJob.due_date ? format(new Date(foundJob.due_date), 'yyyy-MM-dd') : '',
        assigned_to: foundJob.assigned_to || ''
      });
    }
  }, [jobs, id]);

  const canEdit = userProfile?.role === 'admin' || 
                 userProfile?.role === 'receptionist' || 
                 job?.assigned_to === userProfile?.id;

  const handleSave = async () => {
    if (!job || !canEdit) return;

    try {
      const updates = {
        title: editForm.title,
        description: editForm.description,
        status: editForm.status,
        price: editForm.price ? parseFloat(editForm.price) : null,
        due_date: editForm.due_date || null,
        assigned_to: editForm.assigned_to || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', job.id);

      if (error) throw error;

      setJob({ ...job, ...updates });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Job updated successfully"
      });
    } catch (error) {
      console.error('Error updating job:', error);
      toast({
        title: "Error",
        description: "Failed to update job",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
      review: 'bg-purple-100 text-purple-800 border-purple-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      delivered: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">{t('loading')}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout>
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h2>
          <Button onClick={() => navigate('/jobs')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
              <p className="text-gray-600 mt-1">Job Details</p>
            </div>
          </div>
          
          {canEdit && (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Job
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Job Details Card */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Job Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Title</label>
                {isEditing ? (
                  <Input
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full"
                  />
                ) : (
                  <p className="text-lg font-semibold text-gray-900">{job.title}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                {isEditing ? (
                  <Select value={editForm.status} onValueChange={(value) => setEditForm({ ...editForm, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className={`${getStatusColor(job.status)} text-sm px-3 py-1`}>
                    {job.status.replace('_', ' ')}
                  </Badge>
                )}
              </div>

              {/* Client */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Client
                </label>
                <p className="text-lg">{job.clients?.name || 'Not assigned'}</p>
              </div>

              {/* Price */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Price
                </label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    className="w-full"
                    placeholder="0.00"
                  />
                ) : (
                  <p className="text-lg font-semibold text-green-600">
                    {job.price ? `$${job.price}` : 'Not set'}
                  </p>
                )}
              </div>

              {/* Due Date */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Due Date
                </label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={editForm.due_date}
                    onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
                    className="w-full"
                  />
                ) : (
                  <p className="text-lg">
                    {job.due_date ? format(new Date(job.due_date), 'PPP') : 'Not set'}
                  </p>
                )}
              </div>

              {/* Assigned To */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Assigned To
                </label>
                {isEditing && (userProfile?.role === 'admin' || userProfile?.role === 'receptionist') ? (
                  <Select value={editForm.assigned_to} onValueChange={(value) => setEditForm({ ...editForm, assigned_to: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {users.filter(user => ['photographer', 'designer', 'editor'].includes(user.role) && user.is_active).map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-lg">
                    {job.users?.name || 'Not assigned'} 
                    {job.users?.name && <span className="text-sm text-gray-500 ml-2">({job.assigned_to === userProfile?.id ? 'You' : job.users.role || 'Unknown role'})</span>}
                  </p>
                )}
              </div>

              {/* Type */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Type</label>
                <p className="text-lg capitalize">{job.type.replace('_', ' ')}</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Description</label>
              {isEditing ? (
                <Textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full min-h-24"
                  placeholder="Job description..."
                />
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{job.description || 'No description provided'}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Workflow Actions */}
        {job && (
          <JobWorkflowActions
            job={job}
            onJobUpdated={() => {
              // Refresh job data after workflow update
              window.location.reload();
            }}
          />
        )}

        {/* Job Comments */}
        {job && (
          <JobComments
            jobId={job.id}
            jobTitle={job.title}
            clientName={job.clients?.name}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default JobDetails;
