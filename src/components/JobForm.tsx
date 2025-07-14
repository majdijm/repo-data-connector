
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useJobNotifications } from '@/hooks/useJobNotifications';

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

interface JobFormProps {
  onJobAdded: () => void;
}

const JobForm: React.FC<JobFormProps> = ({ onJobAdded }) => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const { notifyJobCreated } = useJobNotifications();
  
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    client_id: '',
    assigned_to: '',
    due_date: '',
    description: '',
    price: '',
    package_included: false,
    extra_cost: '',
    extra_cost_reason: ''
  });

  useEffect(() => {
    fetchClients();
    fetchUsers();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.type || !formData.client_id || !formData.due_date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      console.log('🚀 Creating job with data:', formData);

      const jobData = {
        title: formData.title,
        type: formData.type,
        client_id: formData.client_id,
        assigned_to: formData.assigned_to || null,
        due_date: formData.due_date,
        description: formData.description || null,
        price: parseFloat(formData.price) || 0,
        package_included: formData.package_included,
        extra_cost: parseFloat(formData.extra_cost) || 0,
        extra_cost_reason: formData.extra_cost_reason || null,
        created_by: userProfile?.id,
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('jobs')
        .insert([jobData])
        .select('id')
        .single();

      if (error) {
        console.error('❌ Error creating job:', error);
        throw error;
      }

      console.log('✅ Job created successfully:', data);

      // Get client and assignee info for notifications
      const client = clients.find(c => c.id === formData.client_id);
      
      // Send notifications
      await notifyJobCreated({
        jobId: data.id,
        jobTitle: formData.title,
        jobType: formData.type,
        clientName: client?.name,
        assignedToId: formData.assigned_to || undefined,
        createdById: userProfile?.id
      });

      toast({
        title: "Success",
        description: "Job created successfully and notifications sent!"
      });

      // Reset form
      setFormData({
        title: '',
        type: '',
        client_id: '',
        assigned_to: '',
        due_date: '',
        description: '',
        price: '',
        package_included: false,
        extra_cost: '',
        extra_cost_reason: ''
      });

      onJobAdded();
    } catch (error) {
      console.error('💥 Error creating job:', error);
      toast({
        title: "Error",
        description: "Failed to create job. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Job Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter job title"
            required
          />
        </div>

        <div>
          <Label htmlFor="type">Job Type *</Label>
          <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
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

        <div>
          <Label htmlFor="client_id">Client *</Label>
          <Select value={formData.client_id} onValueChange={(value) => handleInputChange('client_id', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map(client => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name} ({client.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="assigned_to">Assign To</Label>
          <Select value={formData.assigned_to} onValueChange={(value) => handleInputChange('assigned_to', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select team member" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Unassigned</SelectItem>
              {users.map(user => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="due_date">Due Date *</Label>
          <Input
            id="due_date"
            type="date"
            value={formData.due_date}
            onChange={(e) => handleInputChange('due_date', e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="price">Price ($)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => handleInputChange('price', e.target.value)}
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Enter job description"
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="package_included"
          checked={formData.package_included}
          onCheckedChange={(checked) => handleInputChange('package_included', checked)}
        />
        <Label htmlFor="package_included">Part of client's package</Label>
      </div>

      {formData.package_included && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="extra_cost">Extra Cost ($)</Label>
            <Input
              id="extra_cost"
              type="number"
              step="0.01"
              value={formData.extra_cost}
              onChange={(e) => handleInputChange('extra_cost', e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <Label htmlFor="extra_cost_reason">Extra Cost Reason</Label>
            <Input
              id="extra_cost_reason"
              value={formData.extra_cost_reason}
              onChange={(e) => handleInputChange('extra_cost_reason', e.target.value)}
              placeholder="Reason for extra cost"
            />
          </div>
        </div>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Creating...' : 'Create Job'}
      </Button>
    </form>
  );
};

export default JobForm;
