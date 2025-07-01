
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useUsers } from '@/hooks/useUsers';
import { Calendar, Clock, User, FileText, Plus, Edit } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  type: string;
  status: string;
  price: number;
  created_at: string;
  client_id: string | null;
  assigned_to: string | null;
  due_date: string | null;
  description: string | null;
  package_included: boolean | null;
  extra_cost: number | null;
  extra_cost_reason: string | null;
  clients?: {
    name: string;
  };
}

interface Client {
  id: string;
  name: string;
  email: string;
}

const JobManagement = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const { users, isLoading: usersLoading } = useUsers();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    type: 'photo_session',
    client_id: '',
    assigned_to: '',
    due_date: '',
    description: '',
    price: 0
  });

  // Filter team members based on job type from users data
  const getFilteredTeamMembers = (jobType: string) => {
    console.log('Filtering team members for job type:', jobType, 'from users:', users);
    
    const teamMembers = users.filter(user => 
      ['photographer', 'designer', 'editor'].includes(user.role) && user.is_active
    );
    
    console.log('All team members:', teamMembers);
    
    let filtered = [];
    switch (jobType) {
      case 'photo_session':
        filtered = teamMembers.filter(member => member.role === 'photographer');
        break;
      case 'video_editing':
        filtered = teamMembers.filter(member => member.role === 'editor');
        break;
      case 'design':
        filtered = teamMembers.filter(member => member.role === 'designer');
        break;
      default:
        filtered = teamMembers;
    }
    
    console.log('Filtered team members for', jobType, ':', filtered);
    return filtered;
  };

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          clients (
            name
          )
        `)
        .order('created_at', { ascending: false });

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

  React.useEffect(() => {
    fetchJobs();
    fetchClients();
  }, []);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('jobs')
        .insert([{
          ...formData,
          status: 'pending',
          created_by: userProfile?.id
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Job created successfully"
      });

      setFormData({
        title: '',
        type: 'photo_session',
        client_id: '',
        assigned_to: '',
        due_date: '',
        description: '',
        price: 0
      });
      setShowCreateForm(false);
      fetchJobs();
    } catch (error) {
      console.error('Error creating job:', error);
      toast({
        title: "Error",
        description: "Failed to create job",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateJobStatus = async (jobId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', jobId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Job status updated"
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
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      review: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      delivered: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const canManageJobs = userProfile?.role === 'admin' || userProfile?.role === 'receptionist';
  const canUpdateStatus = canManageJobs || ['photographer', 'designer', 'editor'].includes(userProfile?.role || '');

  const filteredTeamMembers = getFilteredTeamMembers(formData.type);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Job Management</h2>
        {canManageJobs && (
          <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Job
          </Button>
        )}
      </div>

      {showCreateForm && canManageJobs && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Job</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateJob} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Job Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => setFormData({...formData, type: value, assigned_to: ''})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="photo_session">Photo Session</SelectItem>
                      <SelectItem value="video_editing">Video Editing</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client">Client</Label>
                  <Select value={formData.client_id} onValueChange={(value) => setFormData({...formData, client_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="assigned_to">Assign To</Label>
                  <Select 
                    value={formData.assigned_to} 
                    onValueChange={(value) => setFormData({...formData, assigned_to: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select team member" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredTeamMembers.map(member => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name} ({member.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="datetime-local"
                    value={formData.due_date}
                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading || usersLoading}>
                  {isLoading ? 'Creating...' : 'Create Job'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {jobs.map(job => (
          <Card key={job.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{job.title}</h3>
                    <Badge className={getStatusColor(job.status)}>
                      {job.status.replace('_', ' ')}
                    </Badge>
                    {job.package_included && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        Package Included
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Client: {job.clients?.name || 'No client'}
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Type: {job.type.replace('_', ' ')}
                    </div>
                    {job.due_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Due: {new Date(job.due_date).toLocaleDateString()}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Created: {new Date(job.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {job.description && (
                    <p className="text-sm text-gray-700 mb-3">{job.description}</p>
                  )}

                  <div className="text-sm space-y-1">
                    {!job.package_included && (
                      <div className="font-medium">
                        Price: ${job.price || 0}
                      </div>
                    )}
                    {job.extra_cost && job.extra_cost > 0 && (
                      <div className="text-orange-600">
                        Extra Cost: ${job.extra_cost}
                        {job.extra_cost_reason && (
                          <span className="text-gray-600"> - {job.extra_cost_reason}</span>
                        )}
                      </div>
                    )}
                    {job.package_included && (
                      <div className="text-blue-600">
                        Included in client package
                      </div>
                    )}
                  </div>
                </div>

                {canUpdateStatus && (
                  <div className="ml-4">
                    <Select
                      value={job.status}
                      onValueChange={(value) => updateJobStatus(job.id, value)}
                    >
                      <SelectTrigger className="w-32">
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {jobs.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No jobs found. Create your first job to get started.</p>
          </CardContent>
        </Card>
      )}

      {(isLoading || usersLoading) && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};

export default JobManagement;
