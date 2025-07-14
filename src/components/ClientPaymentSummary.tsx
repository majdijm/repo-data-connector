
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, CreditCard, AlertTriangle, CheckCircle, Package, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface PaymentData {
  id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  notes?: string;
}

interface PaymentRequestData {
  id: string;
  amount: number;
  status: string;
  due_date?: string;
  description?: string;
  paid_amount: number;
}

interface JobData {
  id: string;
  title: string;
  price: number;
  package_included?: boolean;
}

interface PackageData {
  id: string;
  name: string;
  price: number;
  duration_months: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface ClientPaymentSummaryProps {
  jobs: JobData[];
  payments: PaymentData[];
  paymentRequests: PaymentRequestData[];
  clientPackages?: PackageData[];
}

const ClientPaymentSummary: React.FC<ClientPaymentSummaryProps> = ({ 
  jobs, 
  payments, 
  paymentRequests,
  clientPackages = []
}) => {
  // Calculate individual job values (excluding package-included jobs)
  const individualJobs = jobs.filter(job => !job.package_included);
  const packageIncludedJobs = jobs.filter(job => job.package_included);
  
  // Calculate total individual job value
  const totalIndividualJobValue = individualJobs.reduce((sum, job) => sum + (job.price || 0), 0);
  
  // Calculate total payments received
  const totalPaid = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
  
  // Calculate active payment requests (excluding cancelled and paid ones)
  const activePaymentRequests = paymentRequests.filter(req => 
    req.status === 'pending' || req.status === 'overdue'
  );
  const totalActiveRequested = activePaymentRequests.reduce((sum, request) => sum + (request.amount || 0), 0);
  
  // Calculate package values - total package value for active packages
  const activePackages = clientPackages.filter(pkg => pkg.is_active);
  const totalPackageValue = activePackages.reduce((sum, pkg) => {
    // Package value is the monthly price * duration
    const monthlyFee = pkg.price || 0;
    const durationMonths = pkg.duration_months || 1;
    return sum + (monthlyFee * durationMonths);
  }, 0);
  
  // Total expected value: individual jobs + package subscriptions
  const totalExpectedValue = totalIndividualJobValue + totalPackageValue;
  
  // Calculate outstanding amount and overpayment
  let totalOutstanding = 0;
  let overpayment = 0;
  
  if (totalPaid < totalExpectedValue) {
    totalOutstanding = totalExpectedValue - totalPaid;
    overpayment = 0;
  } else {
    totalOutstanding = 0;
    overpayment = totalPaid - totalExpectedValue;
  }
  
  // Get the first active package for display
  const activePackage = activePackages[0];

  const pendingRequests = paymentRequests.filter(req => req.status === 'pending');
  const overdueRequests = paymentRequests.filter(req => 
    req.status === 'pending' && req.due_date && new Date(req.due_date) < new Date()
  );
  const cancelledRequests = paymentRequests.filter(req => req.status === 'cancelled');

  // Debug logging
  console.log('Payment Summary Debug - Fixed Calculations:', {
    individualJobs,
    packageIncludedJobs,
    totalIndividualJobValue,
    totalPackageValue,
    totalExpectedValue,
    totalPaid,
    totalActiveRequested,
    totalOutstanding,
    overpayment,
    activePackages,
    activePaymentRequests,
    cancelledRequests: cancelledRequests.length,
    calculations: {
      'Individual Jobs Value': totalIndividualJobValue,
      'Package Value': totalPackageValue,
      'Total Expected': totalExpectedValue,
      'Total Paid': totalPaid,
      'Outstanding': totalOutstanding,
      'Overpayment': overpayment,
      'Active Requests': totalActiveRequested
    }
  });

  return (
    <div className="space-y-6">
      {/* Active Package Info */}
      {activePackage && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-600" />
              Active Package
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Package Name</p>
                <p className="font-semibold text-purple-700">{activePackage.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Monthly Fee</p>
                <p className="font-semibold text-purple-700">${activePackage.price}/month</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Duration</p>
                <p className="font-semibold text-purple-700">{activePackage.duration_months} months</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Package Value</p>
                <p className="font-semibold text-purple-700">${totalPackageValue}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-1">Valid Until</p>
              <p className="font-semibold text-purple-700 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(activePackage.end_date), 'MMM dd, yyyy')}
              </p>
            </div>
            {packageIncludedJobs.length > 0 && (
              <div className="mt-4 p-3 bg-white rounded-lg border">
                <p className="text-sm font-medium mb-2">Package Included Services</p>
                <p className="text-sm text-muted-foreground">
                  {packageIncludedJobs.length} job(s) included in your package
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment Overview */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">${totalExpectedValue}</p>
              <p className="text-sm text-muted-foreground">Total Expected</p>
              <p className="text-xs text-gray-500 mt-1">
                Jobs: ${totalIndividualJobValue} + Package: ${totalPackageValue}
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">${totalPaid}</p>
              <p className="text-sm text-muted-foreground">Total Paid</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">${totalActiveRequested}</p>
              <p className="text-sm text-muted-foreground">Active Requests</p>
            </div>
            <div className={`text-center p-4 rounded-lg ${totalOutstanding > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
              <p className={`text-2xl font-bold ${totalOutstanding > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                ${totalOutstanding}
              </p>
              <p className="text-sm text-muted-foreground">Outstanding</p>
            </div>
            <div className={`text-center p-4 rounded-lg ${overpayment > 0 ? 'bg-emerald-50' : 'bg-gray-50'}`}>
              <p className={`text-2xl font-bold ${overpayment > 0 ? 'text-emerald-600' : 'text-gray-600'}`}>
                ${overpayment}
              </p>
              <p className="text-sm text-muted-foreground">Overpaid</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{packageIncludedJobs.length}</p>
              <p className="text-sm text-muted-foreground">Package Jobs</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Requests */}
      {paymentRequests.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Payment Requests</span>
              <div className="flex gap-2">
                {overdueRequests.length > 0 && (
                  <Badge className="bg-red-100 text-red-800">
                    {overdueRequests.length} Overdue
                  </Badge>
                )}
                {cancelledRequests.length > 0 && (
                  <Badge className="bg-gray-100 text-gray-800">
                    {cancelledRequests.length} Cancelled
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">${request.amount}</p>
                      <Badge 
                        className={
                          request.status === 'paid' 
                            ? 'bg-green-100 text-green-800'
                            : request.status === 'cancelled'
                            ? 'bg-gray-100 text-gray-800'
                            : request.due_date && new Date(request.due_date) < new Date()
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {request.status === 'paid' ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : request.status === 'cancelled' ? (
                          <span className="h-3 w-3 mr-1">✕</span>
                        ) : request.due_date && new Date(request.due_date) < new Date() ? (
                          <AlertTriangle className="h-3 w-3 mr-1" />
                        ) : null}
                        {request.status.toUpperCase()}
                      </Badge>
                    </div>
                    {request.description && (
                      <p className="text-sm text-muted-foreground mt-1">{request.description}</p>
                    )}
                    {request.due_date && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Due: {format(new Date(request.due_date), 'PPP')}
                      </p>
                    )}
                  </div>
                  {request.paid_amount > 0 && (
                    <div className="text-right">
                      <p className="text-sm text-green-600">${request.paid_amount} paid</p>
                      <p className="text-xs text-muted-foreground">
                        ${request.amount - request.paid_amount} remaining
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Payments */}
      {payments.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {payments.slice(0, 5).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">${payment.amount}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(payment.payment_date), 'PPP')} • {payment.payment_method}
                      </p>
                    </div>
                  </div>
                  {payment.notes && (
                    <p className="text-sm text-muted-foreground max-w-40 truncate">
                      {payment.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClientPaymentSummary;
