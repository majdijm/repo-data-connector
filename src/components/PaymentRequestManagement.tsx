
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, DollarSign, Clock, Check, X } from 'lucide-react';

interface PaymentRequest {
  id: string;
  client_id: string;
  amount: number;
  description: string;
  due_date: string;
  status: string;
  paid_amount: number;
  created_at: string;
  clients: {
    name: string;
    email: string;
  };
}

interface Client {
  id: string;
  name: string;
  email: string;
}

const PaymentRequestManagement = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [requestForm, setRequestForm] = useState({
    client_id: '',
    amount: 0,
    description: '',
    due_date: ''
  });

  useEffect(() => {
    fetchPaymentRequests();
    fetchClients();
  }, []);

  const fetchPaymentRequests = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('payment_requests' as any)
        .select(`
          *,
          clients (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPaymentRequests(data || []);
    } catch (error) {
      console.error('Error fetching payment requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payment requests",
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

  const createPaymentRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('payment_requests' as any)
        .insert({
          ...requestForm,
          requested_by: userProfile.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment request created successfully"
      });

      setRequestForm({
        client_id: '',
        amount: 0,
        description: '',
        due_date: ''
      });
      setShowRequestForm(false);
      fetchPaymentRequests();
    } catch (error) {
      console.error('Error creating payment request:', error);
      toast({
        title: "Error",
        description: "Failed to create payment request",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: string, paidAmount?: number) => {
    try {
      const updateData: any = { status };
      if (paidAmount !== undefined) {
        updateData.paid_amount = paidAmount;
      }

      const { error } = await supabase
        .from('payment_requests' as any)
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment request updated successfully"
      });

      fetchPaymentRequests();
    } catch (error) {
      console.error('Error updating payment request:', error);
      toast({
        title: "Error",
        description: "Failed to update payment request",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Payment Requests</h2>
        <Button onClick={() => setShowRequestForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Request
        </Button>
      </div>

      {showRequestForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Payment Request</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createPaymentRequest} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client">Client</Label>
                  <Select value={requestForm.client_id} onValueChange={(value) => setRequestForm({...requestForm, client_id: value})}>
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
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={requestForm.amount}
                    onChange={(e) => setRequestForm({...requestForm, amount: Number(e.target.value)})}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={requestForm.description}
                  onChange={(e) => setRequestForm({...requestForm, description: e.target.value})}
                  rows={3}
                  placeholder="Payment description..."
                />
              </div>

              <div>
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={requestForm.due_date}
                  onChange={(e) => setRequestForm({...requestForm, due_date: e.target.value})}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Request'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowRequestForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {paymentRequests.map(request => (
          <Card key={request.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold">{request.clients.name}</span>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>Amount:</strong> ${request.amount}</p>
                    {request.paid_amount > 0 && (
                      <p><strong>Paid:</strong> ${request.paid_amount}</p>
                    )}
                    {request.description && (
                      <p><strong>Description:</strong> {request.description}</p>
                    )}
                    {request.due_date && (
                      <p><strong>Due Date:</strong> {new Date(request.due_date).toLocaleDateString()}</p>
                    )}
                    <p><strong>Created:</strong> {new Date(request.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {request.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateRequestStatus(request.id, 'paid', request.amount)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateRequestStatus(request.id, 'cancelled')}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PaymentRequestManagement;
