
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

interface ClientFormProps {
  onClientAdded?: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ onClientAdded }) => {
  const { session } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('clients')
        .insert([formData]);

      if (error) throw error;

      setFormData({ name: '', email: '', phone: '', address: '' });
      onClientAdded?.();
    } catch (error) {
      console.error('Error adding client:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Client</CardTitle>
        <CardDescription>Enter client information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="name"
            placeholder="Client Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <Input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
          />
          <Input
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Client'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ClientForm;
