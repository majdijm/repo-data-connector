import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useUsers } from '@/hooks/useUsers';
import { useJobWorkflow } from '@/hooks/useJobWorkflow';
import { useNotifications } from '@/hooks/useNotifications';
import WorkflowJobForm from './WorkflowJobForm';
import JobComments from './JobComments';
import CalendarIntegration from './CalendarIntegration';
import { Calendar, Clock, User, FileText, Plus, Package, DollarSign, Workflow, Camera, Video, Palette, Trash2, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';

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
  workflow_stage?: string | null;
  workflow_order?: number | null;
}

interface Client {
  id: string;
  name: string;
  email: string;
}

interface ClientPackage {
  id: string;
  client_id: string;
  package_id: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  packages: {
    id: string;
    name: string;
    description: string;
    price: number;
    duration_months: number;
  };
}

const JobManagement = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const { users, isLoading: usersLoading } = useUsers();
  const { updateJobProgress } = useJobWorkflow();
  const { notifyJobCreated } = useNotifications();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientPackages, setClientPackages] = useState<ClientPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createMode, setCreateMode] = useState<'single' | 'workflow'>('single');
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState({
    title: '',
    type: 'photo_session',
    client_id: '',
    assigned_to: '',
    due_date: '',
    description: '',
    price: 0,
    package_included: false,
    extra_cost: 0,
    extra_cost_reason: ''
  });

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

  const fetchClientPackages = async (clientId: string) => {
    if (!clientId) {
      setClientPackages([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('client_packages')
        .select(`
          *,
          packages (*)
        `)
        .eq('client_id', clientId)
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString());

      if (error) throw error;
      setClientPackages(data || []);
    } catch (error) {
      console.error('Error fetching client packages:', error);
      setClientPackages([]);
    }
  };

  React.useEffect(() => {
    fetchJobs();
    fetchClients();
  }, []);

  React.useEffect(() => {
    if (formData.client_id) {
      fetchClientPackages(formData.client_id);
    } else {
      setClientPackages([]);
    }
  }, [formData.client_id]);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      // Get client name for notifications
      const selectedClient = clients.find(c => c.id === formData.client_id);
      
      const { data: newJob, error } = await supabase
        .from('jobs')
        .insert([{
          ...formData,
          status: 'pending',
          created_by: userProfile?.id
        }])
        .select()
        .single();

      if (error) throw error;

      // Send notifications to all relevant parties
      await notifyJobCreated(newJob, selectedClient?.name);

      toast({
        title: "Success",
        description: "Job created successfully and all relevant parties have been notified"
      });

      setFormData({
        title: '',
        type: 'photo_session',
        client_id: '',
        assigned_to: '',
        due_date: '',
        description: '',
        price: 0,
        package_included: false,
        extra_cost: 0,
        extra_cost_reason: ''
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
      await updateJobProgress(jobId, newStatus);
      fetchJobs(); // Refresh jobs to show updated status
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      review: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      delivered: 'bg-gray-100 text-gray-800',
      waiting_dependency: 'bg-orange-100 text-orange-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getWorkflowBadge = (job: Job) => {
    if (job.workflow_stage) {
      const badges = {
        photo_session: { icon: <Camera className="h-3 w-3" />, label: 'Photo Session', color: 'bg-blue-100 text-blue-800' },
        video_editing: { icon: <Video className="h-3 w-3" />, label: 'Video Editing', color: 'bg-green-100 text-green-800' },
        design: { icon: <Palette className="h-3 w-3" />, label: 'Design', color: 'bg-purple-100 text-purple-800' }
      };
      const badge = badges[job.workflow_stage as keyof typeof badges];
      if (badge) {
        return (
          <Badge className={`${badge.color} flex items-center gap-1`}>
            {badge.icon}
            {badge.label} #{job.workflow_order}
          </Badge>
        );
      }
    }
    return null;
  };

  const canManageJobs = userProfile?.role === 'admin' || userProfile?.role === 'receptionist';
  const canUpdateStatus = canManageJobs || ['photographer', 'designer', 'editor'].includes(userProfile?.role || '');
  const canDeleteJobs = canManageJobs;

  const filteredTeamMembers = getFilteredTeamMembers(formData.type);

  const handleDeleteJob = async (jobId: string, jobTitle: string) => {
    try {
      setIsLoading(true);
      
      // Check if job has dependent jobs
      const { data: dependentJobs } = await supabase
        .from('jobs')
        .select('id, title')
        .eq('depends_on_job_id', jobId);

      if (dependentJobs && dependentJobs.length > 0) {
        toast({
          title: "Cannot Delete Job",
          description: `This job has ${dependentJobs.length} dependent job(s). Please delete or update dependent jobs first.`,
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Job "${jobTitle}" deleted successfully`
      });

      fetchJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Job Management</h2>
        {canManageJobs && (
          <div className="flex gap-2">
            <Button 
              onClick={() => {
                setCreateMode('single');
                setShowCreateForm(true);
              }} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Single Job
            </Button>
            <Button 
              onClick={() => {
                setCreateMode('workflow');
                setShowCreateForm(true);
              }} 
              className="flex items-center gap-2"
            >
              <Workflow className="h-4 w-4" />
              Photo Workflow
            </Button>
          </div>
        )}
      </div>

      {showCreateForm && canManageJobs && (
        <div>
          {createMode === 'workflow' ? (
            <WorkflowJobForm 
              onJobsCreated={() => {
                setShowCreateForm(false);
                fetchJobs();
              }}
              onCancel={() => setShowCreateForm(false)}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Create New Job</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateJob} className="space-y-6">
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
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Package and Pricing Section */}
                  <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Package & Pricing
                    </h4>
                    
                    {/* Package Selection */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="package_included"
                        checked={formData.package_included}
                        onCheckedChange={(checked) => 
                          setFormData({...formData, package_included: !!checked})
                        }
                      />
                      <Label htmlFor="package_included" className="text-sm font-medium">
                        This job is included in a client package
                      </Label>
                    </div>

                    {/* Show active packages if package is selected */}
                    {formData.package_included && formData.client_id && (
                      <div className="mt-3">
                        {clientPackages.length > 0 ? (
                          <div className="bg-blue-50 p-3 rounded-md">
                            <p className="text-sm font-medium text-blue-800 mb-2">Active client packages:</p>
                            {clientPackages.map(cp => (
                              <div key={cp.id} className="text-sm text-blue-700 flex items-center gap-2">
                                <Package className="h-3 w-3" />
                                {cp.packages.name} - ${cp.packages.price} 
                                (expires: {new Date(cp.end_date).toLocaleDateString()})
                              </div>
                            ))}
                          </div>
                        ) : (
                          <Alert className="bg-yellow-50 border-yellow-200">
                            <AlertDescription className="text-yellow-800">
                              No active packages found for this client.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}

                    {/* Regular Price (only show if not package included) */}
                    {!formData.package_included && (
                      <div>
                        <Label htmlFor="price" className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Job Price
                        </Label>
                        <Input
                          id="price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                          placeholder="0.00"
                        />
                      </div>
                    )}

                    {/* Extra Cost Section */}
                    <div className="space-y-3 pt-3 border-t">
                      <Label className="text-sm font-medium text-gray-700">Additional Costs</Label>
                      <div>
                        <Label htmlFor="extra_cost" className="text-sm">Extra Cost (if any)</Label>
                        <Input
                          id="extra_cost"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.extra_cost}
                          onChange={(e) => setFormData({...formData, extra_cost: Number(e.target.value)})}
                          placeholder="0.00"
                        />
                      </div>
                      
                      {formData.extra_cost > 0 && (
                        <div>
                          <Label htmlFor="extra_cost_reason" className="text-sm">
                            Reason for extra cost
                          </Label>
                          <Textarea
                            id="extra_cost_reason"
                            value={formData.extra_cost_reason}
                            onChange={(e) => setFormData({...formData, extra_cost_reason: e.target.value})}
                            placeholder="e.g., model fees, studio rental, special equipment"
                            rows={2}
                          />
                        </div>
                      )}
                    </div>

                    {/* Total Cost Display */}
                    <div className="pt-3 border-t bg-white p-3 rounded">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Cost:</span>
                        <span className="font-bold text-lg">
                          {formData.package_included ? 
                            `Package + $${formData.extra_cost || 0}` : 
                            `$${(formData.price || 0) + (formData.extra_cost || 0)}`
                          }
                        </span>
                      </div>
                      {formData.package_included && (
                        <p className="text-xs text-gray-600 mt-1">
                          Main service included in client package
                        </p>
                      )}
                    </div>
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
        </div>
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
                    {getWorkflowBadge(job)}
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

                  <div className="text-sm space-y-1 mb-3">
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

                  {/* Expandable section for comments and calendar */}
                  <div className="mt-4">
                    <Collapsible>
                      <CollapsibleTrigger 
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
                        onClick={() => toggleJobExpansion(job.id)}
                      >
                        <MessageSquare className="h-4 w-4" />
                        View Details & Comments
                        {expandedJobs.has(job.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-3">
                        <CalendarIntegration job={job} />
                        <JobComments 
                          jobId={job.id} 
                          jobTitle={job.title}
                          clientName={job.clients?.name}
                        />
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </div>

                <div className="ml-4 flex items-center gap-2">
                  {canUpdateStatus && (
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
                        {job.status === 'waiting_dependency' && (
                          <SelectItem value="waiting_dependency">Waiting Dependency</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                  
                  {canDeleteJobs && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Job</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{job.title}"? This action cannot be undone.
                            {job.workflow_stage && (
                              <div className="mt-2 p-2 bg-yellow-50 rounded text-yellow-800">
                                <strong>Warning:</strong> This is part of a workflow. Deleting it may affect dependent jobs.
                              </div>
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteJob(job.id, job.title)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete Job
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
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
