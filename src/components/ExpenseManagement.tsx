import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Receipt, 
  Plus, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  FileText,
  Filter,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
}

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  recorded_by: string;
  receipt_file_path?: string;
  category_id?: string;
  created_at: string;
  expense_categories?: {
    name: string;
  } | null;
  users?: {
    name: string;
  } | null;
}

const ExpenseManagement = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [formData, setFormData] = useState({
    amount: '',
    category_id: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    receipt_file: null as File | null
  });

  const { userProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
    fetchExpenses();
  }, [selectedMonth, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      
      const startDate = `${selectedMonth}-01`;
      const endDate = `${selectedMonth}-31`;

      let query = supabase
        .from('expenses')
        .select(`
          id,
          amount,
          category,
          description,
          date,
          recorded_by,
          receipt_file_path,
          category_id,
          created_at,
          expense_categories (name)
        `)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast({
        title: "Error",
        description: "Failed to fetch expenses",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userProfile?.id) return;

    try {
      const expenseData = {
        amount: parseFloat(formData.amount),
        category: categories.find(c => c.id === formData.category_id)?.name || '',
        category_id: formData.category_id,
        description: formData.description,
        date: formData.date,
        recorded_by: userProfile.id
      };

      const { data, error } = await supabase
        .from('expenses')
        .insert(expenseData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Expense recorded successfully"
      });

      setFormData({
        amount: '',
        category_id: '',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        receipt_file: null
      });
      
      setShowCreateDialog(false);
      fetchExpenses();
    } catch (error) {
      console.error('Error creating expense:', error);
      toast({
        title: "Error",
        description: "Failed to record expense",
        variant: "destructive"
      });
    }
  };

  const calculateMonthlyStats = () => {
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const categoryTotals = expenses.reduce((acc, expense) => {
      const categoryName = expense.expense_categories?.name || expense.category;
      acc[categoryName] = (acc[categoryName] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)[0];

    return {
      total,
      count: expenses.length,
      average: expenses.length > 0 ? total / expenses.length : 0,
      topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null
    };
  };

  const stats = calculateMonthlyStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-8 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <Receipt size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Expense Management</h1>
              <p className="text-red-100 mt-1">Track and categorize business expenses</p>
            </div>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30" size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Record Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record New Expense</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleCreateExpense} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Amount ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Date</label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    placeholder="Expense description..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    required
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">Record Expense</Button>
                  <Button type="button" onClick={() => setShowCreateDialog(false)} variant="outline">
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Monthly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Total Expenses</p>
                <p className="text-2xl font-bold text-red-800">${stats.total.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Expense Count</p>
                <p className="text-2xl font-bold text-blue-800">{stats.count}</p>
              </div>
              <Receipt className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Average</p>
                <p className="text-2xl font-bold text-green-800">${stats.average.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Top Category</p>
                <p className="text-lg font-bold text-purple-800">
                  {stats.topCategory ? stats.topCategory.name : 'N/A'}
                </p>
                {stats.topCategory && (
                  <p className="text-sm text-purple-600">${stats.topCategory.amount.toFixed(2)}</p>
                )}
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Month</label>
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <Card className="shadow-xl border-0">
        <CardHeader>
          <CardTitle>Expense Records - {format(new Date(selectedMonth), 'MMMM yyyy')}</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Expenses Found</h3>
              <p className="text-gray-600">No expenses recorded for this period</p>
            </div>
          ) : (
            <div className="space-y-4">
              {expenses.map(expense => (
                <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <Receipt className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{expense.description}</h4>
                      <p className="text-sm text-gray-600">
                        {expense.expense_categories?.name || expense.category}
                      </p>
                      <p className="text-sm text-gray-500">
                        Recorded by: {expense.users?.name || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600">${expense.amount}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(expense.date), 'MMM dd, yyyy')}
                    </p>
                    {expense.receipt_file_path && (
                      <Button size="sm" variant="outline" className="mt-2">
                        <Download className="h-4 w-4 mr-2" />
                        Receipt
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseManagement;