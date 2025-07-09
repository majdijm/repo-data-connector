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

  const createWorkflowJobs = async () => {
    if (!formData.client_id) {
      throw new Error('Client must be selected for workflow jobs');
    }

    const photographer = teamMembers.find(m => m.role === 'photographer');
    const editor = teamMembers.find(m => m.role === 'editor');
    const designer = teamMembers.find(m => m.role === 'designer');

    // Create the three workflow jobs
    const workflowJobs = [
      {
        title: `${formData.title} - Photo Session`,
        type: 'photo_session',
        status: 'pending',
        client_id: formData.client_id,
        assigned_to: photographer?.id || null,
        due_date: formData.due_date,
        description: `Photo session for ${formData.title}`,
        price: formData.price / 3, // Divide price equally among workflow stages
        package_included: formData.package_included,
        extra_cost: formData.extra_cost,
        extra_cost_reason: formData.extra_cost_reason,
        created_by: session?.user.id,
        workflow_stage: 'photo_session',
        workflow_order: 1,
        depends_on_job_id: null
      },
      {
        title: `${formData.title} - Video Editing`,
        type: 'video_editing',
        status: 'pending',
        client_id: formData.client_id,
        assigned_to: editor?.id || null,
        due_date: formData.due_date,
        description: `Video editing for ${formData.title}`,
        price: formData.price / 3,
        package_included: formData.package_included,
        extra_cost: 0,
        extra_cost_reason: null,
        created_by: session?.user.id,
        workflow_stage: 'video_editing',
        workflow_order: 2,
        depends_on_job_id: null // Will be updated after first job is created
      },
      {
        title: `${formData.title} - Design`,
        type: 'design',
        status: 'pending',
        client_id: formData.client_id,
        assigned_to: designer?.id || null,
        due_date: formData.due_date,
        description: `Design work for ${formData.title}`,
        price: formData.price / 3,
        package_included: formData.package_included,
        extra_cost: 0,
        extra_cost_reason: null,
        created_by: session?.user.id,
        workflow_stage: 'design',
        workflow_order: 3,
        depends_on_job_id: null // Will be updated after second job is created
      }
    ];

    // Insert first job (photo session)
    const { data: firstJob, error: firstError } = await supabase
      .from('jobs')
      .insert([workflowJobs[0]])
      .select()
      .single();

    if (firstError) throw firstError;

    // Insert second job (video editing) with dependency on first job
    workflowJobs[1].depends_on_job_id = firstJob.id;
    const { data: secondJob, error: secondError } = await supabase
      .from('jobs')
      .insert([workflowJobs[1]])
      .select()
      .single();

    if (secondError) throw secondError;

    // Insert third job (design) with dependency on second job
    workflowJobs[2].depends_on_job_id = secondJob.id;
    const { error: thirdError } = await supabase
      .from('jobs')
      .insert([workflowJobs[2]]);

    if (thirdError) throw thirdError;

    toast({
      title: "Success",
      description: "Workflow created successfully with 3 connected jobs"
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    if (!formData.title || !formData.type || !formData.client_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      if (jobMode === 'single') {
        await createSingleJob();
      } else {
        await createWorkflowJobs();
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <JobTypeSelector jobMode={jobMode} onJobModeChange={setJobMode} />
          
          <Input
            placeholder="Job Title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
          />
          
          {jobMode === 'single' && (
            <Select onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select job type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="photo_session">Photo Session</SelectItem>
                <SelectItem value="video_editing">Video Editing</SelectItem>
                <SelectItem value="design">Design</SelectItem>
              </SelectContent>
            </Select>
          )}

          {jobMode === 'workflow' && (
            <div className="bg-purple-50 p-3 rounded-md">
              <p className="text-sm text-purple-800">
                This will create 3 connected jobs: Photo Session → Video Editing → Design
              </p>
            </div>
          )}

          <Select onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}>
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

          {jobMode === 'single' && (
            <Select onValueChange={(value) => setFormData(prev => ({ ...prev, assigned_to: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Assign to team member" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name} ({member.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {jobMode === 'workflow' && (
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-800">
                Team members will be automatically assigned based on their roles:
              </p>
              <ul className="text-sm text-blue-700 mt-1">
                <li>• Photo Session → Photographer</li>
                <li>• Video Editing → Editor</li>
                <li>• Design → Designer</li>
              </ul>
            </div>
          )}

          <Textarea
            placeholder="Job Description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />

          <Input
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
          />

          {/* Package Selection */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.package_included}
                onChange={(e) => setFormData(prev => ({ ...prev, package_included: e.target.checked }))}
              />
              <span>This job is included in a client package</span>
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
          <div className="space-y-4 bg-gray-50 p-4 rounded-md">
            <h4 className="font-medium">Pricing</h4>
            
            {!formData.package_included && (
              <Input
                type="number"
                placeholder={jobMode === 'workflow' ? "Total Workflow Price" : "Job Price"}
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              />
            )}

            {jobMode === 'workflow' && formData.price > 0 && (
              <div className="bg-purple-50 p-3 rounded-md">
                <p className="text-sm text-purple-800">
                  Price will be divided equally among the 3 workflow stages: ${(formData.price / 3).toFixed(2)} each
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Input
                type="number"
                placeholder="Extra Cost (if any)"
                value={formData.extra_cost}
                onChange={(e) => setFormData(prev => ({ ...prev, extra_cost: parseFloat(e.target.value) || 0 }))}
              />
              
              {formData.extra_cost > 0 && (
                <Textarea
                  placeholder="Reason for extra cost (e.g., model fees, studio rental, special equipment)"
                  value={formData.extra_cost_reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, extra_cost_reason: e.target.value }))}
                  rows={2}
                />
              )}
            </div>
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : `Create ${jobMode === 'workflow' ? 'Workflow' : 'Job'}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default JobForm;
