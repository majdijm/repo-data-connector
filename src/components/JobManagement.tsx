
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Calendar, 
  User, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Camera,
  Palette,
  Video,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import JobForm from './JobForm';
import JobComments from './JobComments';
import JobWorkflowActions from './JobWorkflowActions';
import FileUpload from './FileUpload';

interface Job {
  id: string;
  title: string;
  type: string;
  status: string;
  client_id: string;
  assigned_to: string | null;
  due_date: string | null;
  price: number;
  description: string | null;
  created_at: string;
  updated_at: string;
  clients?: {
    name: string;
    email: string;
  };
  users?: {
    name: string;
  };
}

interface Client {
  id: string;
  name: string;
  email: string;
}

interface User {
  id: string;
  name: string;
  role: string;
}

const JobManagement = () => {
  const { userProfile } = useAuth();
  const { canManageJobs, canViewJobs, isTeamMember } = useRoleAccess();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (canViewJobs()) {
      fetchJobs();
      if (canManageJobs()) {
        fetchClients();
        fetchUsers();
      }
    }
  }, [canViewJobs, canManageJobs]);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('jobs')
        .select(`
          *,
          clients (name, email),
          users (name)
        `)
        .order('created_at', { ascending: false });

      // If user is a team member, only show jobs assigned to them
      if (isTeamMember() && userProfile?.id) {
        query = query.eq('assigned_to', userProfile.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch jobs",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, email')
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, role')
        .eq('is_active', true)
        .in('role', ['photographer', 'designer', 'editor'])
        .order('name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleJobCreated = () => {
    fetchJobs();
    setIsCreateDialogOpen(false);
  };

  const handleJobUpdated = () => {
    fetchJobs();
    setIsEditDialogOpen(false);
    setSelectedJob(null);
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Job deleted successfully"
      });
      fetchJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive"
      });
    }
  };

  const updateJobStatus = async (jobId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', jobId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Job status updated successfully"
      });
      fetchJobs();
    } catch (error) {
      console.error('Error updating job status:', error);
      toast({
        title: "Error",
        description: "Failed to update job status",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'photo_session': return <Camera className="h-4 w-4" />;
      case 'video_editing': return <Video className="h-4 w-4" />;
      case 'design': return <Palette className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const toggleJobExpansion = (jobId: string) => {
    const newExpanded = new Set(expandedJobs);
    if (newExpanded.has(jobId)) {
      newExpanded.delete(jobId);
    } else {
      newExpanded.add(jobId);
    }
    setExpandedJobs(newExpanded);
  };

  if (!canViewJobs()) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">You don't have permission to view jobs.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading jobs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {isTeamMember() ? 'My Jobs' : 'Job Management'}
        </h2>
        {canManageJobs() && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Job</DialogTitle>
              </DialogHeader>
              <JobForm
                clients={clients}
                users={users}
                onJobCreated={handleJobCreated}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {isTeamMember() ? 'No jobs assigned to you yet.' : 'No jobs created yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getTypeIcon(job.type)}
                    <div>
                      <CardTitle className="text-lg">{job.title}</CardTitle>
                      <p className="text-sm text-gray-600">
                        Client: {job.clients?.name || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(job.status)}>
                      {job.status.replace('_', ' ')}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleJobExpansion(job.id)}
                    >
                      {expandedJobs.has(job.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {expandedJobs.has(job.id) && (
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        Assigned: {job.users?.name || 'Unassigned'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        Due: {job.due_date ? new Date(job.due_date).toLocaleDateString() : 'No due date'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        Price: ${job.price}
                      </span>
                    </div>
                  </div>

                  {job.description && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Description</h4>
                      <p className="text-sm text-gray-600">{job.description}</p>
                    </div>
                  )}

                  {canManageJobs() && (
                    <div className="flex items-center space-x-2 mb-4">
                      <Label htmlFor={`status-${job.id}`} className="text-sm font-medium">
                        Status:
                      </Label>
                      <Select
                        value={job.status}
                        onValueChange={(value) => updateJobStatus(job.id, value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="review">Review</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {canManageJobs() && (
                    <div className="flex space-x-2 mb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedJob(job);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteJob(job.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  )}

                  {/* File Upload Section - Show for team members */}
                  {isTeamMember() && (
                    <div className="mb-4">
                      <FileUpload jobId={job.id} onFileUploaded={fetchJobs} />
                    </div>
                  )}

                  {/* Job Workflow Actions - Show for photographers */}
                  <JobWorkflowActions 
                    job={job} 
                    onJobUpdated={handleJobUpdated}
                  />

                  {/* Job Comments Section */}
                  <JobComments 
                    jobId={job.id} 
                    jobTitle={job.title}
                    clientName={job.clients?.name}
                  />
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Edit Job Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
          </DialogHeader>
          {selectedJob && (
            <JobForm
              job={selectedJob}
              clients={clients}
              users={users}
              onJobCreated={handleJobUpdated}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobManagement;
