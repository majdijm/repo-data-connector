
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
import { Plus, DollarSign, Clock, Check, X, Calendar, User, Briefcase } from 'lucide-react';

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

interface Job {
  id: string;
  title: string;
  client_id: string;
  price: number;
  extra_cost: number;
  status: string;
  clients: {
    name: string;
  };
}

interface Package {
  id: string;
  name: string;
  price: number;
  client_packages: {
    client_id: string;
    is_active: boolean;
    clients: {
      name: string;
    };
  }[];
}

const PaymentRequestManagement = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [pendingJobs, setPendingJobs] = useState<Job[]>([]);
  const [activePackages, setActivePackages] = useState<Package[]>([]);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [requestForm, setRequestForm] = useState({
    client_id: '',
    amount: 0,
    description: '',
    due_date: ''
  });

  useEffect(() => {
    fetchClients();
    fetchPaymentRequests();
    fetchPendingJobs();
    fetchActivePackages();
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

  const fetchPaymentRequests = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('payment_requests')
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

  const fetchPendingJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          clients (
            name
          )
        `)
        .in('status', ['pending', 'in_progress'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingJobs(data || []);
    } catch (error) {
      console.error('Error fetching pending jobs:', error);
    }
  };

  const fetchActivePackages = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select(`
          *,
          client_packages!inner (
            client_id,
            is_active,
            clients (
              name
            )
          )
        `)
        .eq('client_packages.is_active', true)
        .order('name');

      if (error) throw error;
      setActivePackages(data || []);
    } catch (error) {
      console.error('Error fetching active packages:', error);
    }
  };

  const createPaymentRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.id) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('payment_requests')
        .insert([{
          ...requestForm,
          requested_by: userProfile.id
        }]);

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

  const updateRequestStatus = async (requestId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('payment_requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment request status updated"
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
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'paid':
        return <Check className="h-4 w-4" />;
      case 'overdue':
        return <X className="h-4 w-4" />;
      case 'cancelled':
        return <X className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Calculate pending payments from jobs and packages
  const calculatePendingPayments = () => {
    const jobPayments = pendingJobs.map(job => ({
      client_name: job.clients?.name || 'Unknown Client',
      amount: (job.price || 0) + (job.extra_cost || 0),
      description: `Job: ${job.title}`,
      type: 'job',
      id: job.id
    }));

    const packagePayments = activePackages.flatMap(pkg => 
      pkg.client_packages.map(cp => ({
        client_name: cp.clients?.name || 'Unknown Client',
        amount: pkg.price,
        description: `Package: ${pkg.name}`,
        type: 'package',
        id: pkg.id
      }))
    );

    return [...jobPayments, ...packagePayments];
  };

  const pendingPayments = calculatePendingPayments();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Payment Requests</h2>
        <Button onClick={() => setShowRequestForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Request
        </Button>
      </div>

      {/* Pending Payments Section */}
      {pendingPayments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Pending Payments ({pendingPayments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {pendingPayments.map((payment, index) => (
                <div key={`${payment.type}-${payment.id}-${index}`} className="flex items-center justify-between p-4 border rounded-lg bg-orange-50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {payment.type === 'job' ? <Briefcase className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />}
                      <span className="font-medium">{payment.client_name}</span>
                    </div>
                    <span className="text-sm text-gray-600">{payment.description}</span>
                  </div>
                  <div className="font-semibold text-lg text-orange-600">
                    ${payment.amount}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
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
                        <span className="flex items-center gap-1">
                          {getStatusIcon(request.status)}
                          {request.status}
                        </span>
                      </Badge>
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
                        <Calendar className="h-4 w-4" />
                        Created: {new Date(request.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    {request.description && (
                      <p className="text-gray-700 text-sm">{request.description}</p>
                    )}
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateRequestStatus(request.id, 'paid')}
                      >
                        Mark as Paid
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateRequestStatus(request.id, 'cancelled')}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
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
