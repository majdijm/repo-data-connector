
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, DollarSign, Calendar, User, Clock, CheckCircle, XCircle } from 'lucide-react';

interface PaymentRequest {
  id: string;
  client_id: string;
  amount: number;
  description: string | null;
  due_date: string | null;
  status: string;
  paid_amount: number;
  created_at: string;
  clients: {
    name: string;
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
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    client_id: '',
    amount: 0,
    description: '',
    due_date: ''
  });

  const canManagePaymentRequests = userProfile?.role === 'admin' || userProfile?.role === 'receptionist';

  useEffect(() => {
    if (canManagePaymentRequests) {
      fetchPaymentRequests();
      fetchClients();
    }
  }, [canManagePaymentRequests]);

  const fetchPaymentRequests = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('payment_requests')
        .select(`
          *,
          clients (
            name
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
        .from('payment_requests')
        .insert({
          ...formData,
          requested_by: userProfile.id,
          due_date: formData.due_date || null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment request created successfully"
      });

      setFormData({
        client_id: '',
        amount: 0,
        description: '',
        due_date: ''
      });
      setShowCreateForm(false);
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

  const updatePaymentRequestStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('payment_requests')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Payment request ${status}`
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

  const recordPaymentForRequest = async (requestId: string, amount: number) => {
    try {
      const request = paymentRequests.find(r => r.id === requestId);
      if (!request) return;

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          client_id: request.client_id,
          amount: amount,
          payment_method: 'cash',
          received_by: userProfile?.id,
          notes: `Payment for request: ${request.description || 'Payment request'}`
        });

      if (paymentError) throw paymentError;

      // Update payment request
      const newPaidAmount = request.paid_amount + amount;
      const newStatus = newPaidAmount >= request.amount ? 'paid' : 'partial';

      const { error: updateError } = await supabase
        .from('payment_requests')
        .update({ 
          paid_amount: newPaidAmount,
          status: newStatus
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Payment recorded successfully"
      });

      fetchPaymentRequests();
    } catch (error) {
      console.error('Error recording payment:', error);
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      partial: 'bg-blue-100 text-blue-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (!canManagePaymentRequests) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">Access denied. Only admins and receptionists can manage payment requests.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Payment Requests</h2>
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Request Payment
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Payment Request</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createPaymentRequest} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client">Client</Label>
                  <Select value={formData.client_id} onValueChange={(value) => setFormData({...formData, client_id: value})}>
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
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="due_date">Due Date (Optional)</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  placeholder="Payment description or reason"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Request'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : paymentRequests.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No payment requests created yet.</p>
            </CardContent>
          </Card>
        ) : (
          paymentRequests.map(request => (
            <Card key={request.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <span className="font-semibold text-lg">${request.amount}</span>
                      </div>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                      {request.paid_amount > 0 && (
                        <Badge variant="outline">
                          Paid: ${request.paid_amount}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Client: {request.clients.name}
                      </div>
                      {request.due_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Due: {new Date(request.due_date).toLocaleDateString()}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Created: {new Date(request.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    {request.description && (
                      <p className="text-sm text-gray-700 mb-3">{request.description}</p>
                    )}

                    <div className="flex gap-2">
                      {request.status === 'pending' && (
                        <>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Record Payment
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Record Payment</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Record full payment of ${request.amount} for this request?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => recordPaymentForRequest(request.id, request.amount)}>
                                  Record Payment
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updatePaymentRequestStatus(request.id, 'cancelled')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default PaymentRequestManagement;
