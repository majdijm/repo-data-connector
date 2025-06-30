import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApi } from '@/hooks/useApi';
import { toast } from '@/hooks/use-toast';

interface JobFormProps {
  onJobCreated: () => void;
  onCancel: () => void;
}

interface Client {
  id: number;
  name: string;
  email: string;
}

interface TeamMember {
  id: number;
  name: string;
  role: string;
}

const JobForm: React.FC<JobFormProps> = ({ onJobCreated, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    client_id: '',
    assigned_to: '',
    due_date: '',
    session_date: '',
    description: '',
    price: ''
  });
  const [clients, setClients] = useState<Client[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const { apiCall } = useApi();

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (formData.type) {
      fetchTeamMembers(formData.type);
    }
  }, [formData.type]);

  const fetchClients = async () => {
    try {
      const data = await apiCall('/clients');
      setClients(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch clients",
        variant: "destructive"
      });
    }
  };

  const fetchTeamMembers = async (jobType: string) => {
    try {
      const data = await apiCall(`/users/team?type=${jobType}`);
      setTeamMembers(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch team members",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiCall('/jobs', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          client_id: parseInt(formData.client_id),
          assigned_to: formData.assigned_to ? parseInt(formData.assigned_to) : null,
          price: formData.price ? parseFloat(formData.price) : null
        })
      });

      toast({
        title: "Success",
        description: "Job created successfully"
      });

      onJobCreated();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create job",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Job</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="type">Job Type</Label>
            <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
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
            <Label htmlFor="client">Client</Label>
            <Select value={formData.client_id} onValueChange={(value) => handleChange('client_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id.toString()}>
                    {client.name} ({client.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {teamMembers.length > 0 && (
            <div>
              <Label htmlFor="assigned_to">Assign To</Label>
              <Select value={formData.assigned_to} onValueChange={(value) => handleChange('assigned_to', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map(member => (
                    <SelectItem key={member.id} value={member.id.toString()}>
                      {member.name} ({member.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="due_date">Due Date</Label>
            <Input
              id="due_date"
              type="datetime-local"
              value={formData.due_date}
              onChange={(e) => handleChange('due_date', e.target.value)}
              required
            />
          </div>

          {formData.type === 'photo_session' && (
            <div>
              <Label htmlFor="session_date">Session Date</Label>
              <Input
                id="session_date"
                type="datetime-local"
                value={formData.session_date}
                onChange={(e) => handleChange('session_date', e.target.value)}
              />
            </div>
          )}

          <div>
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => handleChange('price', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex space-x-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Job'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default JobForm;