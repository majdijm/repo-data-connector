
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
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    description: '',
    client_id: '',
    assigned_to: '',
    due_date: '',
    price: 0
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

    fetchClients();
    fetchTeamMembers();
  }, []);

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
        price: 0
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

          <Input
            type="number"
            placeholder="Price"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
          />

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Job'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default JobForm;
