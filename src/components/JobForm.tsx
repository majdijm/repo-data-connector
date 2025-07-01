
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

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
  const [clients, setClients] = useState<Client[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [clientPackages, setClientPackages] = useState<any[]>([]);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('jobs')
        .insert([{
          ...formData,
          status: 'pending',
          created_by: session.user.id
        }]);

      if (error) throw error;

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
      onJobAdded?.();
    } catch (error) {
      console.error('Error adding job:', error);
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
          <Input
            placeholder="Job Title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
          />
          
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
                placeholder="Job Price"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              />
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
            {isLoading ? 'Creating...' : 'Create Job'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default JobForm;
