
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, DollarSign, Calendar, FileText, User, Briefcase } from 'lucide-react';
import PaymentRequestManagement from './PaymentRequestManagement';

interface Payment {
  id: string;
  amount: number;
  payment_method: string;
  payment_date: string | null;
  notes: string | null;
  created_at: string;
  client_id: string | null;
  job_id: string | null;
  received_by: string | null;
  clients?: {
    name: string;
  };
  jobs?: {
    title: string;
  };
}

interface Client {
  id: string;
  name: string;
  email: string;
}

interface PaymentRequest {
  id: string;
  client_id: string;
  amount: number;
  description: string | null;
  status: string;
  paid_amount: number;
  clients: {
    name: string;
  };
}

const PaymentManagement = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [formData, setFormData] = useState({
    amount: 0,
    payment_method: 'cash',
    payment_date: '',
    client_id: '',
    notes: '',
    from_request_id: ''
  });

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          clients (
            name
          ),
          jobs (
            title
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payments",
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

  const fetchPaymentRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_requests')
        .select(`
          id,
          client_id,
          amount,
          description,
          status,
          paid_amount,
          clients (
            name
          )
        `)
        .in('status', ['pending', 'partial'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPaymentRequests(data || []);
    } catch (error) {
      console.error('Error fetching payment requests:', error);
    }
  };

  React.useEffect(() => {
    fetchPayments();
    fetchClients();
    fetchPaymentRequests();
  }, []);

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('payments')
        .insert([{
          ...formData,
          received_by: userProfile?.id,
          payment_date: formData.payment_date || new Date().toISOString(),
          from_request_id: formData.from_request_id || null
        }]);

      if (error) throw error;

      // If this payment is from a request, update the request
      if (formData.from_request_id) {
        const request = paymentRequests.find(r => r.id === formData.from_request_id);
        if (request) {
          const newPaidAmount = request.paid_amount + formData.amount;
          const newStatus = newPaidAmount >= request.amount ? 'paid' : 'partial';

          await supabase
            .from('payment_requests')
            .update({ 
              paid_amount: newPaidAmount,
              status: newStatus
            })
            .eq('id', formData.from_request_id);
        }
      }

      toast({
        title: "Success",
        description: "Payment recorded successfully"
      });

      setFormData({
        amount: 0,
        payment_method: 'cash',
        payment_date: '',
        client_id: '',
        notes: '',
        from_request_id: ''
      });
      setShowCreateForm(false);
      fetchPayments();
      fetchPaymentRequests();
    } catch (error) {
      console.error('Error creating payment:', error);
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPaymentMethodColor = (method: string) => {
    const colors = {
      cash: 'bg-green-100 text-green-800',
      card: 'bg-blue-100 text-blue-800',
      bank_transfer: 'bg-purple-100 text-purple-800',
      check: 'bg-orange-100 text-orange-800',
    };
    return colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const canManagePayments = userProfile?.role === 'admin' || userProfile?.role === 'receptionist';

  const selectedRequest = paymentRequests.find(r => r.id === formData.from_request_id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Payment Management</h2>
        {canManagePayments && (
          <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Record Payment
          </Button>
        )}
      </div>

      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payments">Payment Records</TabsTrigger>
          <TabsTrigger value="requests">Payment Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          {showCreateForm && canManagePayments && (
            <Card>
              <CardHeader>
                <CardTitle>Record New Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreatePayment} className="space-y-4">
                  <div>
                    <Label htmlFor="from_request">From Payment Request (Optional)</Label>
                    <Select value={formData.from_request_id} onValueChange={(value) => {
                      const request = paymentRequests.find(r => r.id === value);
                      setFormData({
                        ...formData, 
                        from_request_id: value,
                        client_id: request?.client_id || formData.client_id,
                        amount: request ? (request.amount - request.paid_amount) : formData.amount
                      });
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment request (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None - Regular Payment</SelectItem>
                        {paymentRequests.map(request => (
                          <SelectItem key={request.id} value={request.id}>
                            {request.clients.name} - ${request.amount - request.paid_amount} remaining
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                      {selectedRequest && (
                        <p className="text-sm text-gray-500 mt-1">
                          Remaining: ${selectedRequest.amount - selectedRequest.paid_amount}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="payment_method">Payment Method</Label>
                      <Select value={formData.payment_method} onValueChange={(value) => setFormData({...formData, payment_method: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="check">Check</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="client">Client</Label>
                    <Select value={formData.client_id} onValueChange={(value) => setFormData({...formData, client_id: value})} disabled={!!selectedRequest}>
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
                    <Label htmlFor="payment_date">Payment Date</Label>
                    <Input
                      id="payment_date"
                      type="date"
                      value={formData.payment_date}
                      onChange={(e) => setFormData({...formData, payment_date: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Recording...' : 'Record Payment'}
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
            {payments.map(payment => (
              <Card key={payment.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-green-600" />
                          <span className="font-semibold text-lg">${payment.amount}</span>
                        </div>
                        <Badge className={getPaymentMethodColor(payment.payment_method)}>
                          {payment.payment_method.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                        {payment.clients && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Client: {payment.clients.name}
                          </div>
                        )}
                        {payment.jobs && (
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            Job: {payment.jobs.title}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Paid: {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : 'Not specified'}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Recorded: {new Date(payment.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      {payment.notes && (
                        <div className="flex items-start gap-2 text-sm">
                          <FileText className="h-4 w-4 mt-0.5 text-gray-400" />
                          <p className="text-gray-700">{payment.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {payments.length === 0 && !isLoading && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No payments recorded yet. Record your first payment to get started.</p>
              </CardContent>
            </Card>
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests">
          <PaymentRequestManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentManagement;
