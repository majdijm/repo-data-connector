import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, DollarSign, Plus, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SessionPayment {
  id: string;
  user_id: string;
  session_date: string;
  session_count: number;
  rate_per_session: number;
  total_amount: number;
  description: string | null;
  status: string;
  approved_by: string | null;
  approved_at: string | null;
  month_year: string;
  created_at: string;
  notes: string | null;
  user_name?: string;
  approved_by_name?: string;
}

const SessionPaymentManagement = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [sessionPayments, setSessionPayments] = useState<SessionPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    session_date: '',
    session_count: 1,
    rate_per_session: 0,
    description: '',
    month_year: new Date().toISOString().slice(0, 7) + '-01'
  });

  const isManager = userProfile?.role === 'admin' || userProfile?.role === 'manager' || userProfile?.role === 'receptionist';

  useEffect(() => {
    fetchSessionPayments();
  }, [userProfile]);

  const fetchSessionPayments = async () => {
    try {
      let query = supabase
        .from('session_payments')
        .select(`
          *,
          users!session_payments_user_id_fkey(name),
          approved_by_user:users!session_payments_approved_by_fkey(name)
        `)
        .order('created_at', { ascending: false });

      if (!isManager && userProfile) {
        query = query.eq('user_id', userProfile.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedData = data?.map(item => ({
        ...item,
        user_name: item.users?.name,
        approved_by_name: item.approved_by_user?.name
      })) || [];

      setSessionPayments(formattedData);
    } catch (error) {
      console.error('Error fetching session payments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch session payments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    try {
      const { error } = await supabase
        .from('session_payments')
        .insert({
          user_id: userProfile.id,
          session_date: formData.session_date,
          session_count: formData.session_count,
          rate_per_session: formData.rate_per_session,
          description: formData.description,
          month_year: formData.month_year,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Session payment request created successfully"
      });

      setShowForm(false);
      setFormData({
        session_date: '',
        session_count: 1,
        rate_per_session: 0,
        description: '',
        month_year: new Date().toISOString().slice(0, 7) + '-01'
      });
      fetchSessionPayments();
    } catch (error) {
      console.error('Error creating session payment:', error);
      toast({
        title: "Error",
        description: "Failed to create session payment request",
        variant: "destructive"
      });
    }
  };

  const handleApproval = async (id: string, status: 'approved' | 'rejected', notes?: string) => {
    try {
      const { error } = await supabase
        .from('session_payments')
        .update({
          status,
          approved_by: userProfile?.id,
          approved_at: new Date().toISOString(),
          notes
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Session payment ${status} successfully`
      });

      fetchSessionPayments();
    } catch (error) {
      console.error('Error updating session payment:', error);
      toast({
        title: "Error",
        description: "Failed to update session payment",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
      paid: "outline"
    } as const;

    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Session Payments</h2>
          <p className="text-muted-foreground">
            {isManager ? 'Manage employee session payments' : 'Track your out-session payments'}
          </p>
        </div>
        {!isManager && (
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Session Payment
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Session Payment Request</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="session_date">Session Date</Label>
                  <Input
                    id="session_date"
                    type="date"
                    value={formData.session_date}
                    onChange={(e) => setFormData({ ...formData, session_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="session_count">Number of Sessions</Label>
                  <Input
                    id="session_count"
                    type="number"
                    min="1"
                    value={formData.session_count}
                    onChange={(e) => setFormData({ ...formData, session_count: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="rate_per_session">Rate per Session ($)</Label>
                  <Input
                    id="rate_per_session"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.rate_per_session}
                    onChange={(e) => setFormData({ ...formData, rate_per_session: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="month_year">Month</Label>
                  <Input
                    id="month_year"
                    type="date"
                    value={formData.month_year}
                    onChange={(e) => setFormData({ ...formData, month_year: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the out-session work..."
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Create Request</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {sessionPayments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No session payments found</p>
            </CardContent>
          </Card>
        ) : (
          sessionPayments.map((payment) => (
            <Card key={payment.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(payment.session_date).toLocaleDateString()}</span>
                      {isManager && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <span>{payment.user_name}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{payment.session_count} session(s)</span>
                      <span className="text-muted-foreground">•</span>
                      <span>${payment.rate_per_session} per session</span>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(payment.status)}
                    <div className="flex items-center gap-1 mt-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-semibold">${payment.total_amount}</span>
                    </div>
                  </div>
                </div>

                {payment.description && (
                  <p className="text-sm text-muted-foreground mb-4">{payment.description}</p>
                )}

                {payment.status === 'pending' && isManager && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApproval(payment.id, 'approved')}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleApproval(payment.id, 'rejected')}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}

                {payment.approved_by_name && (
                  <div className="text-xs text-muted-foreground mt-2">
                    {payment.status} by {payment.approved_by_name} on{' '}
                    {new Date(payment.approved_at).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default SessionPaymentManagement;