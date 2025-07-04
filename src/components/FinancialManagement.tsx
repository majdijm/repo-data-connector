
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Plus, DollarSign, Users, Receipt, TrendingUp, Calendar, User } from 'lucide-react';

interface Salary {
  id: string;
  user_id: string;
  base_salary: number;
  bonus: number;
  effective_date: string;
  notes: string;
  created_at: string;
}

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  created_at: string;
}

interface User {
  id: string;
  name: string;
  role: string;
}

const FinancialManagement = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSalaryForm, setShowSalaryForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  const [salaryForm, setSalaryForm] = useState({
    user_id: '',
    base_salary: 0,
    bonus: 0,
    effective_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [expenseForm, setExpenseForm] = useState({
    category: 'office_supplies',
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0]
  });

  const canManageFinancials = userProfile?.role === 'admin' || userProfile?.role === 'receptionist';

  useEffect(() => {
    if (canManageFinancials) {
      fetchUsers();
      fetchSalaries();
      fetchExpenses();
    }
  }, [canManageFinancials]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, role')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchSalaries = async () => {
    try {
      const { data, error } = await supabase
        .from('salaries')
        .select('*')
        .order('effective_date', { ascending: false });

      if (error) throw error;
      setSalaries(data || []);
    } catch (error) {
      console.error('Error fetching salaries:', error);
    }
  };

  const fetchExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const handleCreateSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.id) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('salaries')
        .insert([{
          ...salaryForm,
          created_by: userProfile.id
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Salary record created successfully"
      });

      setSalaryForm({
        user_id: '',
        base_salary: 0,
        bonus: 0,
        effective_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      setShowSalaryForm(false);
      fetchSalaries();
    } catch (error) {
      console.error('Error creating salary record:', error);
      toast({
        title: "Error",
        description: "Failed to create salary record",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.id) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('expenses')
        .insert([{
          ...expenseForm,
          recorded_by: userProfile.id
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Expense recorded successfully"
      });

      setExpenseForm({
        category: 'office_supplies',
        description: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0]
      });
      setShowExpenseForm(false);
      fetchExpenses();
    } catch (error) {
      console.error('Error creating expense:', error);
      toast({
        title: "Error",
        description: "Failed to record expense",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalPayroll = salaries.reduce((sum, salary) => sum + (salary.base_salary + (salary.bonus || 0)), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Get user name by ID
  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.name} (${user.role})` : userId;
  };

  if (!canManageFinancials) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">Access denied. Only admins and receptionists can manage financial records.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Financial Management</h2>
      </div>

      <Tabs defaultValue="salaries" className="space-y-4">
        <TabsList>
          <TabsTrigger value="salaries">Employee Salaries</TabsTrigger>
          <TabsTrigger value="expenses">Business Expenses</TabsTrigger>
          <TabsTrigger value="overview">Financial Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="salaries" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Employee Salaries</h3>
            <Button onClick={() => setShowSalaryForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Salary Record
            </Button>
          </div>

          {showSalaryForm && (
            <Card>
              <CardHeader>
                <CardTitle>Add Salary Record</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateSalary} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="user">Employee</Label>
                      <Select value={salaryForm.user_id} onValueChange={(value) => setSalaryForm({...salaryForm, user_id: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map(user => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} ({user.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="base_salary">Base Salary</Label>
                      <Input
                        id="base_salary"
                        type="number"
                        step="0.01"
                        value={salaryForm.base_salary}
                        onChange={(e) => setSalaryForm({...salaryForm, base_salary: Number(e.target.value)})}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bonus">Bonus</Label>
                      <Input
                        id="bonus"
                        type="number"
                        step="0.01"
                        value={salaryForm.bonus}
                        onChange={(e) => setSalaryForm({...salaryForm, bonus: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="effective_date">Effective Date</Label>
                      <Input
                        id="effective_date"
                        type="date"
                        value={salaryForm.effective_date}
                        onChange={(e) => setSalaryForm({...salaryForm, effective_date: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={salaryForm.notes}
                      onChange={(e) => setSalaryForm({...salaryForm, notes: e.target.value})}
                      rows={3}
                      placeholder="Additional notes..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Creating...' : 'Create Record'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowSalaryForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {salaries.map(salary => (
              <Card key={salary.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{getUserName(salary.user_id)}</h3>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">${salary.base_salary}</p>
                      {salary.bonus > 0 && (
                        <p className="text-sm text-green-600">+${salary.bonus} bonus</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    <p>Effective from: {new Date(salary.effective_date).toLocaleDateString()}</p>
                    {salary.notes && <p className="mt-1">{salary.notes}</p>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Business Expenses</h3>
            <Button onClick={() => setShowExpenseForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Record Expense
            </Button>
          </div>

          {showExpenseForm && (
            <Card>
              <CardHeader>
                <CardTitle>Record Expense</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateExpense} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={expenseForm.category} onValueChange={(value) => setExpenseForm({...expenseForm, category: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="office_supplies">Office Supplies</SelectItem>
                          <SelectItem value="equipment">Equipment</SelectItem>
                          <SelectItem value="utilities">Utilities</SelectItem>
                          <SelectItem value="rent">Rent</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="travel">Travel</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={expenseForm.amount}
                        onChange={(e) => setExpenseForm({...expenseForm, amount: Number(e.target.value)})}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={expenseForm.description}
                      onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                      rows={3}
                      placeholder="Expense description..."
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={expenseForm.date}
                      onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})}
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Recording...' : 'Record Expense'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowExpenseForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {expenses.map(expense => (
              <Card key={expense.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="capitalize">
                          {expense.category.replace('_', ' ')}
                        </Badge>
                        <span className="font-semibold">${expense.amount}</span>
                      </div>
                      <p className="text-gray-700">{expense.description}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Date: {new Date(expense.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Employees</p>
                    <p className="text-2xl font-bold">{users.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Payroll</p>
                    <p className="text-2xl font-bold">${totalPayroll.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Receipt className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Expenses</p>
                    <p className="text-2xl font-bold">${totalExpenses.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialManagement;
