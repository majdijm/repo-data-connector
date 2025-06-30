import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { User, Plus, Mail, Phone, DollarSign } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import ClientForm from '@/components/ClientForm';

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  total_paid: number;
  total_due: number;
  user_email?: string;
  created_at: string;
}

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showClientForm, setShowClientForm] = useState(false);
  const { apiCall } = useApi();
  const { user } = useAuth();

  useEffect(() => {
    fetchClients();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const canManageClients = ['admin', 'receptionist'].includes(user?.role || '');

  if (loading) {
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clients Management</h1>
            <p className="text-gray-600 mt-2">Manage client information and relationships</p>
          </div>
          {canManageClients && (
            <Dialog open={showClientForm} onOpenChange={setShowClientForm}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Client
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <ClientForm
                  onClientCreated={() => {
                    setShowClientForm(false);
                    fetchClients();
                  }}
                  onCancel={() => setShowClientForm(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              All Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            {clients.length === 0 ? (
              <div className="text-center py-12">
                <User className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No clients</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by adding your first client.</p>
                {canManageClients && (
                  <div className="mt-6">
                    <Button onClick={() => setShowClientForm(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Client
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clients.map((client) => (
                  <Card key={client.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounde d-full flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{client.name}</h3>
                          {client.user_email && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Portal Access
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Mail className="mr-2 h-4 w-4" />
                          {client.email}
                        </div>
                        
                        {client.phone && (
                          <div className="flex items-center text-gray-600">
                            <Phone className="mr-2 h-4 w-4" />
                            {client.phone}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center text-green-600">
                            <DollarSign className="mr-1 h-4 w-4" />
                            <span className="text-sm">Paid: ${client.total_paid.toLocaleString()}</span>
                          </div>
                          
                          {client.total_due > 0 && (
                            <div className="flex items-center text-red-600">
                              <DollarSign className="mr-1 h-4 w-4" />
                              <span className="text-sm">Due: ${client.total_due.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t">
                        <Button variant="outline" size="sm" className="w-full">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Clients;