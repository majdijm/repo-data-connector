
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, CreditCard, AlertTriangle, CheckCircle } from 'lucide-react';
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
}

interface ClientPaymentSummaryProps {
  jobs: JobData[];
  payments: PaymentData[];
  paymentRequests: PaymentRequestData[];
}

const ClientPaymentSummary: React.FC<ClientPaymentSummaryProps> = ({ 
  jobs, 
  payments, 
  paymentRequests 
}) => {
  const totalJobValue = jobs.reduce((sum, job) => sum + (job.price || 0), 0);
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalRequested = paymentRequests.reduce((sum, request) => sum + request.amount, 0);
  const totalOutstanding = totalJobValue - totalPaid;

  const pendingRequests = paymentRequests.filter(req => req.status === 'pending');
  const overdueRequests = paymentRequests.filter(req => 
    req.status === 'pending' && req.due_date && new Date(req.due_date) < new Date()
  );

  return (
    <div className="space-y-6">
      {/* Payment Overview */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">${totalJobValue}</p>
              <p className="text-sm text-muted-foreground">Total Value</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">${totalPaid}</p>
              <p className="text-sm text-muted-foreground">Paid</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">${totalRequested}</p>
              <p className="text-sm text-muted-foreground">Requested</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">${totalOutstanding}</p>
              <p className="text-sm text-muted-foreground">Outstanding</p>
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
              {overdueRequests.length > 0 && (
                <Badge className="bg-red-100 text-red-800">
                  {overdueRequests.length} Overdue
                </Badge>
              )}
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
                            : request.due_date && new Date(request.due_date) < new Date()
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {request.status === 'paid' ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
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
