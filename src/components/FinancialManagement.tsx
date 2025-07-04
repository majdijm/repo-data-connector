
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
import { Plus, DollarSign, Users, Receipt, TrendingUp } from 'lucide-react';

interface Salary {
  id: string;
  user_id: string;
  base_salary: number;
  bonus: number;
  effective_date: string;
  notes: string;
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
    effective_date: '',
    notes: ''
  });

  const [expenseForm, setExpenseForm] = useState({
    category: 'office_supplies',
    description: '',
    amount: 0,
    date: ''
  });

  const canManageFinancials = userProfile?.role === 'admin' || userProfile?.role === 'receptionist';

  useEffect(() => {
    if (canManageFinancials) {
      fetchUsers();
      // Skip fetching salaries and expenses until tables are created
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

  const handleCreateSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Feature Coming Soon",
      description: "Salary management will be available once the database tables are set up.",
      variant: "default"
    });
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Feature Coming Soon",
      description: "Expense management will be available once the database tables are set up.",
      variant: "default"
    });
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

          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">Salary management will be available once the database is set up.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Business Expenses</h3>
            <Button onClick={() => setShowExpenseForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Record Expense
            </Button>
          </div>

          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">Expense management will be available once the database is set up.</p>
            </CardContent>
          </Card>
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
                    <p className="text-sm text-gray-600">Monthly Payroll</p>
                    <p className="text-2xl font-bold">Coming Soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Receipt className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Monthly Expenses</p>
                    <p className="text-2xl font-bold">Coming Soon</p>
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
