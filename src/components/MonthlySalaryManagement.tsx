import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, DollarSign, Users, Plus, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MonthlySalary {
  id: string;
  user_id: string;
  month_year: string;
  base_salary: number;
  session_payments_total: number;
  bonuses: number | null;
  deductions: number | null;
  total_salary: number;
  payment_date: string | null;
  status: string;
  processed_by: string | null;
  processed_at: string | null;
  notes: string | null;
  user_name?: string;
  processed_by_name?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const MonthlySalaryManagement = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [monthlySalaries, setMonthlySalaries] = useState<MonthlySalary[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [formData, setFormData] = useState({
    user_id: '',
    month_year: new Date().toISOString().slice(0, 7) + '-01',
    base_salary: 0,
    bonuses: 0,
    deductions: 0,
    payment_date: '',
    notes: ''
  });

  const isManager = userProfile?.role === 'admin' || userProfile?.role === 'manager' || userProfile?.role === 'receptionist';

  useEffect(() => {
    if (isManager) {
      fetchMonthlySalaries();
      fetchUsers();
    } else if (userProfile) {
      fetchUserSalaries();
    }
  }, [userProfile, selectedMonth]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role')
        .neq('role', 'client')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchMonthlySalaries = async () => {
    try {
      const { data, error } = await supabase
        .from('monthly_salaries')
        .select(`
          *,
          users!monthly_salaries_user_id_fkey(name),
          processed_by_user:users!monthly_salaries_processed_by_fkey(name)
        `)
        .ilike('month_year', `${selectedMonth}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = data?.map(item => ({
        ...item,
        user_name: item.users?.name,
        processed_by_name: item.processed_by_user?.name
      })) || [];

      setMonthlySalaries(formattedData);
    } catch (error) {
      console.error('Error fetching monthly salaries:', error);
      toast({
        title: "Error",
        description: "Failed to fetch monthly salaries",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSalaries = async () => {
    try {
      const { data, error } = await supabase
        .from('monthly_salaries')
        .select('*')
        .eq('user_id', userProfile?.id)
        .order('month_year', { ascending: false });

      if (error) throw error;
      setMonthlySalaries(data || []);
    } catch (error) {
      console.error('Error fetching user salaries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isManager) return;

    try {
      const { error } = await supabase
        .from('monthly_salaries')
        .insert({
          user_id: formData.user_id,
          month_year: formData.month_year,
          base_salary: formData.base_salary,
          bonuses: formData.bonuses,
          deductions: formData.deductions,
          payment_date: formData.payment_date || null,
          notes: formData.notes,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Monthly salary record created successfully"
      });

      setShowForm(false);
      setFormData({
        user_id: '',
        month_year: new Date().toISOString().slice(0, 7) + '-01',
        base_salary: 0,
        bonuses: 0,
        deductions: 0,
        payment_date: '',
        notes: ''
      });
      fetchMonthlySalaries();
    } catch (error) {
      console.error('Error creating monthly salary:', error);
      toast({
        title: "Error",
        description: "Failed to create monthly salary record",
        variant: "destructive"
      });
    }
  };

  const handleStatusUpdate = async (id: string, status: 'processed' | 'paid') => {
    try {
      const { error } = await supabase
        .from('monthly_salaries')
        .update({
          status,
          processed_by: userProfile?.id,
          processed_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Salary marked as ${status} successfully`
      });

      fetchMonthlySalaries();
    } catch (error) {
      console.error('Error updating salary status:', error);
      toast({
        title: "Error",
        description: "Failed to update salary status",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      processed: "default",
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
          <h2 className="text-2xl font-bold">Monthly Salaries</h2>
          <p className="text-muted-foreground">
            {isManager ? 'Manage employee monthly salaries' : 'View your salary history'}
          </p>
        </div>
        <div className="flex gap-2">
          {isManager && (
            <>
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-40"
              />
              <Button onClick={() => setShowForm(!showForm)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Salary
              </Button>
            </>
          )}
        </div>
      </div>

      {showForm && isManager && (
        <Card>
          <CardHeader>
            <CardTitle>Create Monthly Salary Record</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="user_id">Employee</Label>
                  <Select
                    value={formData.user_id}
                    onValueChange={(value) => setFormData({ ...formData, user_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                <div>
                  <Label htmlFor="base_salary">Base Salary ($)</Label>
                  <Input
                    id="base_salary"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.base_salary}
                    onChange={(e) => setFormData({ ...formData, base_salary: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="bonuses">Bonuses ($)</Label>
                  <Input
                    id="bonuses"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.bonuses}
                    onChange={(e) => setFormData({ ...formData, bonuses: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="deductions">Deductions ($)</Label>
                  <Input
                    id="deductions"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.deductions}
                    onChange={(e) => setFormData({ ...formData, deductions: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="payment_date">Payment Date</Label>
                  <Input
                    id="payment_date"
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Create Record</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {monthlySalaries.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No salary records found</p>
            </CardContent>
          </Card>
        ) : (
          monthlySalaries.map((salary) => (
            <Card key={salary.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(salary.month_year).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                      {isManager && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <span>{salary.user_name}</span>
                        </>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Base: ${salary.base_salary} | Sessions: ${salary.session_payments_total} | Bonuses: ${salary.bonuses} | Deductions: ${salary.deductions}
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(salary.status)}
                    <div className="flex items-center gap-1 mt-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-semibold text-lg">${salary.total_salary}</span>
                    </div>
                  </div>
                </div>

                {salary.payment_date && (
                  <div className="text-sm text-muted-foreground mb-2">
                    Payment Date: {new Date(salary.payment_date).toLocaleDateString()}
                  </div>
                )}

                {salary.notes && (
                  <p className="text-sm text-muted-foreground mb-4">{salary.notes}</p>
                )}

                {isManager && salary.status !== 'paid' && (
                  <div className="flex gap-2">
                    {salary.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(salary.id, 'processed')}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Mark Processed
                      </Button>
                    )}
                    {salary.status === 'processed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(salary.id, 'paid')}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Mark Paid
                      </Button>
                    )}
                  </div>
                )}

                {salary.processed_by_name && (
                  <div className="text-xs text-muted-foreground mt-2">
                    {salary.status} by {salary.processed_by_name} on{' '}
                    {new Date(salary.processed_at).toLocaleDateString()}
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

export default MonthlySalaryManagement;