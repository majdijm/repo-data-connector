
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
import { Plus, DollarSign, Users, Receipt, Calendar } from 'lucide-react';

interface Salary {
  id: string;
  user_id: string;
  base_salary: number;
  effective_date: string;
  is_active: boolean;
  created_at: string;
  users: {
    name: string;
    role: string;
  };
}

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  expense_date: string;
  created_at: string;
}

interface User {
  id: string;
  name: string;
  role: string;
  email: string;
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
    effective_date: new Date().toISOString().split('T')[0]
  });

  const [expenseForm, setExpenseForm] = useState({
    category: '',
    description: '',
    amount: 0,
    expense_date: new Date().toISOString().split('T')[0]
  });

  const canManageFinancials = userProfile?.role === 'admin' || userProfile?.role === 'receptionist';

  const expenseCategories = [
    'electricity',
    'water',
    'rent',
    'equipment',
    'supplies',
    'maintenance',
    'insurance',
    'internet',
    'phone',
    'marketing',
    'other'
  ];

  useEffect(() => {
    if (canManageFinancials) {
      fetchSalaries();
      fetchExpenses();
      fetchUsers();
    }
  }, [canManageFinancials]);

  const fetchSalaries = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('salaries')
        .select(`
          *,
          users (
            name,
            role
          )
        `)
        .order('effective_date', { ascending: false });

      if (error) throw error;
      setSalaries(data || []);
    } catch (error) {
      console.error('Error fetching salaries:', error);
      toast({
        title: "Error",
        description: "Failed to fetch salaries",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast({
        title: "Error",
        description: "Failed to fetch expenses",
        variant: "destructive"
      });
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, role, email')
        .in('role', ['photographer', 'designer', 'editor'])
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const createSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    try {
      setIsLoading(true);
      
      // Deactivate previous salary for this user
      await supabase
        .from('salaries')
        .update({ is_active: false })
        .eq('user_id', salaryForm.user_id);

      // Create new salary record
      const { error } = await supabase
        .from('salaries')
        .insert({
          ...salaryForm,
          created_by: userProfile.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Salary record created successfully"
      });

      setSalaryForm({
        user_id: '',
        base_salary: 0,
        effective_date: new Date().toISOString().split('T')[0]
      });
      setShowSalaryForm(false);
      fetchSalaries();
    } catch (error) {
      console.error('Error creating salary:', error);
      toast({
        title: "Error",
        description: "Failed to create salary record",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('expenses')
        .insert({
          ...expenseForm,
          recorded_by: userProfile.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Expense recorded successfully"
      });

      setExpenseForm({
        category: '',
        description: '',
        amount: 0,
        expense_date: new Date().toISOString().split('T')[0]
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
      <h2 className="text-2xl font-bold">Financial Management</h2>

      <Tabs defaultValue="salaries" className="space-y-4">
        <TabsList>
          <TabsTrigger value="salaries">Employee Salaries</TabsTrigger>
          <TabsTrigger value="expenses">Business Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value="salaries" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Employee Salaries</h3>
            <Button onClick={() => setShowSalaryForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Salary
            </Button>
          </div>

          {showSalaryForm && (
            <Card>
              <CardHeader>
                <CardTitle>Add Employee Salary</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={createSalary} className="space-y-4">
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

                  <div className="flex gap-2">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Adding...' : 'Add Salary'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowSalaryForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {salaries.map(salary => (
              <Card key={salary.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold">{salary.users.name}</span>
                        <Badge variant="outline">{salary.users.role}</Badge>
                        {salary.is_active && <Badge className="bg-green-100 text-green-800">Active</Badge>}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span>${salary.base_salary}/month</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Effective: {new Date(salary.effective_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
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
              Add Expense
            </Button>
          </div>

          {showExpenseForm && (
            <Card>
              <CardHeader>
                <CardTitle>Record Business Expense</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={createExpense} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={expenseForm.category} onValueChange={(value) => setExpenseForm({...expenseForm, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {expenseCategories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
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
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="expense_date">Expense Date</Label>
                    <Input
                      id="expense_date"
                      type="date"
                      value={expenseForm.expense_date}
                      onChange={(e) => setExpenseForm({...expenseForm, expense_date: e.target.value})}
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

          <div className="grid gap-4">
            {expenses.map(expense => (
              <Card key={expense.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Receipt className="h-5 w-5 text-orange-600" />
                        <span className="font-semibold">{expense.description}</span>
                        <Badge variant="outline">{expense.category}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span>${expense.amount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(expense.expense_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialManagement;
