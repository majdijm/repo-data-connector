import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Calendar, BarChart3, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MonthlyReport {
  id: string;
  month_year: string;
  total_revenue: number;
  total_expenses: number;
  total_salaries: number;
  total_session_payments: number;
  net_profit: number;
  created_at: string;
  updated_at: string;
}

interface MonthlyData {
  month_year: string;
  revenue: number;
  expenses: number;
  salaries: number;
  session_payments: number;
  profit: number;
}

const MonthlyFinancialReports = () => {
  const { toast } = useToast();
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [selectedYear]);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('monthly_reports')
        .select('*')
        .gte('month_year', `${selectedYear}-01-01`)
        .lte('month_year', `${selectedYear}-12-31`)
        .order('month_year', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching monthly reports:', error);
      toast({
        title: "Error",
        description: "Failed to fetch monthly reports",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (monthYear: string) => {
    setRefreshing(true);
    try {
      // Get payments (revenue)
      const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .gte('payment_date', `${monthYear}-01`)
        .lt('payment_date', getNextMonth(monthYear));

      // Get expenses
      const { data: expenses } = await supabase
        .from('expenses')
        .select('amount')
        .gte('date', `${monthYear}-01`)
        .lt('date', getNextMonth(monthYear));

      // Get monthly salaries
      const { data: salaries } = await supabase
        .from('monthly_salaries')
        .select('base_salary, bonuses, deductions')
        .eq('month_year', `${monthYear}-01`);

      // Get session payments
      const { data: sessionPayments } = await supabase
        .from('session_payments')
        .select('total_amount')
        .eq('month_year', `${monthYear}-01`)
        .eq('status', 'approved');

      const totalRevenue = payments?.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0) || 0;
      const totalExpenses = expenses?.reduce((sum, e) => sum + parseFloat(e.amount.toString()), 0) || 0;
      const totalSalaries = salaries?.reduce((sum, s) => sum + parseFloat(s.base_salary.toString()) + parseFloat(s.bonuses?.toString() || '0') - parseFloat(s.deductions?.toString() || '0'), 0) || 0;
      const totalSessionPayments = sessionPayments?.reduce((sum, sp) => sum + parseFloat(sp.total_amount.toString()), 0) || 0;

      // Upsert report
      const { error } = await supabase
        .from('monthly_reports')
        .upsert({
          month_year: `${monthYear}-01`,
          total_revenue: totalRevenue,
          total_expenses: totalExpenses,
          total_salaries: totalSalaries,
          total_session_payments: totalSessionPayments
        }, {
          onConflict: 'month_year'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Monthly report generated successfully"
      });

      fetchReports();
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate monthly report",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  const getNextMonth = (monthYear: string) => {
    const date = new Date(monthYear + '-01');
    date.setMonth(date.getMonth() + 1);
    return date.toISOString().slice(0, 10); // Return full date format YYYY-MM-DD
  };

  const getCurrentMonthYear = () => {
    return new Date().toISOString().slice(0, 7);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getProfitColor = (profit: number) => {
    if (profit > 0) return 'text-green-600';
    if (profit < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getProfitIcon = (profit: number) => {
    if (profit > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (profit < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <BarChart3 className="w-4 h-4 text-gray-600" />;
  };

  const getTotalForYear = (field: keyof MonthlyReport) => {
    return reports.reduce((sum, report) => sum + parseFloat(report[field]?.toString() || '0'), 0);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Monthly Financial Reports</h2>
          <p className="text-muted-foreground">Track monthly revenue, expenses, and profit</p>
        </div>
        <div className="flex gap-2">
          <Input
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="w-24"
            min="2020"
            max="2030"
            placeholder="Year"
          />
          <Button
            onClick={() => generateReport(getCurrentMonthYear())}
            disabled={refreshing}
            variant="outline"
          >
            {refreshing ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Generate Current Month
          </Button>
        </div>
      </div>

      {/* Year Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(getTotalForYear('total_revenue'))}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(getTotalForYear('total_expenses'))}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Salaries</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(getTotalForYear('total_salaries'))}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Session Payments</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(getTotalForYear('total_session_payments'))}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
                <p className={`text-2xl font-bold ${getProfitColor(getTotalForYear('net_profit'))}`}>
                  {formatCurrency(getTotalForYear('net_profit'))}
                </p>
              </div>
              {getProfitIcon(getTotalForYear('net_profit'))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Reports */}
      <div className="grid gap-4">
        {reports.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No reports found for {selectedYear}</p>
              <Button 
                onClick={() => generateReport(getCurrentMonthYear())} 
                className="mt-4"
                disabled={refreshing}
              >
                Generate Report for Current Month
              </Button>
            </CardContent>
          </Card>
        ) : (
          reports.map((report) => (
            <Card key={report.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <h3 className="text-lg font-semibold">
                      {new Date(report.month_year).toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {getProfitIcon(report.net_profit)}
                    <span className={`text-xl font-bold ${getProfitColor(report.net_profit)}`}>
                      {formatCurrency(report.net_profit)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(report.total_revenue)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Expenses</p>
                    <p className="text-lg font-semibold text-red-600">
                      {formatCurrency(report.total_expenses)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Salaries</p>
                    <p className="text-lg font-semibold text-orange-600">
                      {formatCurrency(report.total_salaries)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Sessions</p>
                    <p className="text-lg font-semibold text-blue-600">
                      {formatCurrency(report.total_session_payments)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 text-xs text-muted-foreground text-right">
                  Last updated: {new Date(report.updated_at).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MonthlyFinancialReports;