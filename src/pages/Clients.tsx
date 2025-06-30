
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import ClientForm from '@/components/ClientForm';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  total_paid: number;
  total_due: number;
}

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setClients(data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleClientAdded = () => {
    fetchClients();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-2">Manage your client base</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ClientForm onClientAdded={handleClientAdded} />
          </div>
          
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  All Clients
                </CardTitle>
              </CardHeader>
              <CardContent>
                {clients.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No clients found. Add your first client!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {clients.map((client) => (
                      <div key={client.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900">{client.name}</h3>
                            <p className="text-sm text-gray-600">{client.email}</p>
                            {client.phone && (
                              <p className="text-sm text-gray-600">{client.phone}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-green-600">
                              Paid: ${client.total_paid || 0}
                            </p>
                            <p className="text-sm text-red-600">
                              Due: ${client.total_due || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Clients;
