
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import JobTypeSelector from './JobTypeSelector';

interface Client {
  id: string;
  name: string;
  email: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
}

interface JobFormProps {
  onJobAdded?: () => void;
}

const JobForm: React.FC<JobFormProps> = ({ onJobAdded }) => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [clientPackages, setClientPackages] = useState<any[]>([]);
  const [jobMode, setJobMode] = useState<'single' | 'workflow'>('single');
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    description: '',
    client_id: '',
    assigned_to: '',
    due_date: '',
    price: 0,
    package_included: false,
    extra_cost: 0,
    extra_cost_reason: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, email');
      
      if (!error && data) {
        setClients(data);
      }
    };

    const fetchTeamMembers = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, role')
        .in('role', ['photographer', 'designer', 'editor']);
      
      if (!error && data) {
        setTeamMembers(data);
      }
    };

    const fetchPackages = async () => {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('is_active', true);
      
      if (!error && data) {
        setPackages(data);
      }
    };

    fetchClients();
    fetchTeamMembers();
    fetchPackages();
  }, []);

  // Fetch client packages when client is selected
  useEffect(() => {
    if (formData.client_id) {
      const fetchClientPackages = async () => {
        const { data, error } = await supabase
          .from('client_packages')
          .select(`
            *,
            packages (*)
          `)
          .eq('client_id', formData.client_id)
          .eq('is_active', true)
          .gte('end_date', new Date().toISOString());
        
        if (!error && data) {
          setClientPackages(data);
        }
      };

      fetchClientPackages();
    } else {
      setClientPackages([]);
    }
  }, [formData.client_id]);

  const createSingleJob = async () => {
    const { error } = await supabase
      .from('jobs')
      .insert([{
        ...formData,
        status: 'pending',
        created_by: session?.user.id,
        workflow_stage: null,
        workflow_order: null,
        depends_on_job_id: null
      }]);

    if (error) throw error;

    toast({
      title: "Success",
      description: "Job created successfully"
    });
  };

  const createWorkflowJob = async () => {
    if (!formData.client_id) {
      throw new Error('Client must be selected for workflow jobs');
    }

    // Create a single workflow job that will transition through stages
    const { error } = await supabase
      .from('jobs')
      .insert([{
        title: formData.title,
        type: 'photo_session', // Start with photo session
        status: 'pending',
        client_id: formData.client_id,
        assigned_to: formData.assigned_to,
        due_date: formData.due_date,
        description: formData.description,
        price: formData.price,
        package_included: formData.package_included,
        extra_cost: formData.extra_cost,
        extra_cost_reason: formData.extra_cost_reason,
        created_by: session?.user.id,
        workflow_stage: 'photo_session',
        workflow_order: 1,
        depends_on_job_id: null
      }]);

    if (error) throw error;

    toast({
      title: "Success",
      description: "Workflow job created successfully - it will progress through photo session, video editing, and design stages"
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    if (!formData.title || !formData.client_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // For single jobs, type is required. For workflow jobs, it starts with photo_session
    if (jobMode === 'single' && !formData.type) {
      toast({
        title: "Error",
        description: "Please select a job type",
        variant: "destructive"
      });
      return;
    }

    // For workflow jobs, require assignment
    if (jobMode === 'workflow' && !formData.assigned_to) {
      toast({
        title: "Error",
        description: "Please assign the workflow to a team member (starting with photographer)",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      if (jobMode === 'single') {
        await createSingleJob();
      } else {
        await createWorkflowJob();
      }

      setFormData({
        title: '',
        type: '',
        description: '',
        client_id: '',
        assigned_to: '',
        due_date: '',
        price: 0,
        package_included: false,
        extra_cost: 0,
        extra_cost_reason: ''
      });
      setJobMode('single');
      onJobAdded?.();
    } catch (error) {
      console.error('Error creating job:', error);
      toast({
        title: "Error",
        description: `Failed to create job: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Job</CardTitle>
        <CardDescription>Enter job details</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Type Selector - Always visible at the top */}
          <JobTypeSelector jobMode={jobMode} onJobModeChange={setJobMode} />
          
          {/* Job Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">Job Title *</label>
            <Input
              id="title"
              placeholder="Enter job title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>
          
          {/* Job Type - Only for single jobs */}
          {jobMode === 'single' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Type *</label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="photo_session">Photo Session</SelectItem>
                  <SelectItem value="video_editing">Video Editing</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Client Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Client *</label>
            <Select value={formData.client_id} onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Team Member Assignment */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {jobMode === 'workflow' ? 'Assign to Team Member (Starting Role) *' : 'Assign to Team Member'}
            </label>
            <Select value={formData.assigned_to} onValueChange={(value) => setFormData(prev => ({ ...prev, assigned_to: value }))}>
              <SelectTrigger>
                <SelectValue placeholder={jobMode === 'workflow' ? "Select starting team member (photographer recommended)" : "Assign to team member"} />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name} ({member.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Workflow Assignment Info - Only for workflow jobs */}
          {jobMode === 'workflow' && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-2">
                Workflow Process:
              </p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Job starts with Photo Session stage</li>
                <li>• After completion, transitions to Video Editing</li>
                <li>• Finally moves to Design & Delivery</li>
                <li>• Team members can reassign during transitions</li>
              </ul>
            </div>
          )}

          {/* Job Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Enter job description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Due Date</label>
            <Input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
            />
          </div>

          {/* Package Selection */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.package_included}
                onChange={(e) => setFormData(prev => ({ ...prev, package_included: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm font-medium">This job is included in a client package</span>
            </label>

            {formData.package_included && clientPackages.length > 0 && (
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm font-medium text-blue-800 mb-2">Active client packages:</p>
                {clientPackages.map(cp => (
                  <div key={cp.id} className="text-sm text-blue-700">
                    • {cp.packages.name} (expires: {new Date(cp.end_date).toLocaleDateString()})
                  </div>
                ))}
              </div>
            )}

            {formData.package_included && clientPackages.length === 0 && formData.client_id && (
              <div className="bg-yellow-50 p-3 rounded-md">
                <p className="text-sm text-yellow-800">No active packages found for this client.</p>
              </div>
            )}
          </div>

          {/* Pricing Section */}
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium">Pricing</h4>
            
            {!formData.package_included && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {jobMode === 'workflow' ? "Total Workflow Price" : "Job Price"}
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            )}

            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Extra Cost (if any)</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.extra_cost}
                  onChange={(e) => setFormData(prev => ({ ...prev, extra_cost: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              
              {formData.extra_cost > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Reason for Extra Cost</label>
                  <Textarea
                    placeholder="e.g., model fees, studio rental, special equipment"
                    value={formData.extra_cost_reason}
                    onChange={(e) => setFormData(prev => ({ ...prev, extra_cost_reason: e.target.value }))}
                    rows={2}
                  />
                </div>
              )}
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Creating...' : `Create ${jobMode === 'workflow' ? 'Workflow Job' : 'Job'}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default JobForm;
