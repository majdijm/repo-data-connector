import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Package, 
  Calendar, 
  FileText, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Download,
  Eye,
  Camera,
  Video,
  Palette
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface ClientData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  total_paid: number;
  total_due: number;
}

interface ClientPackageData {
  id: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  packages: {
    id: string;
    name: string;
    price: number;
    duration_months: number;
    description?: string;
    package_services: Array<{
      id: string;
      service_type: string;
      quantity_included: number;
      description?: string;
    }>;
  };
}

interface PackageUsage {
  id: string;
  client_package_id: string;
  service_type: string;
  quantity_used: number;
  usage_date: string;
  jobs: {
    title: string;
    status: string;
  };
}

interface ClientJob {
  id: string;
  title: string;
  type: string;
  status: string;
  due_date?: string;
  session_date?: string;
  price?: number;
  description?: string;
}

interface Contract {
  id: string;
  client_id: string;
  contract_name: string;
  file_path: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

interface Payment {
  id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  notes?: string;
}

const ClientPortal = () => {
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [clientPackages, setClientPackages] = useState<ClientPackageData[]>([]);
  const [packageUsage, setPackageUsage] = useState<PackageUsage[]>([]);
  const [jobs, setJobs] = useState<ClientJob[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const { userProfile } = useAuth();

  useEffect(() => {
    if (userProfile) {
      fetchClientData();
    }
  }, [userProfile]);

  const fetchClientData = async () => {
    if (!userProfile?.email) return;

    try {
      setLoading(true);

      // Fetch client data
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('email', userProfile.email)
        .single();

      if (clientError) throw clientError;
      setClientData(client);

      // Fetch client packages with services
      const { data: packages, error: packagesError } = await supabase
        .from('client_packages')
        .select(`
          *,
          packages (
            id,
            name,
            price,
            duration_months,
            description,
            package_services (
              id,
              service_type,
              quantity_included,
              description
            )
          )
        `)
        .eq('client_id', client.id)
        .order('created_at', { ascending: false });

      if (packagesError) throw packagesError;
      setClientPackages(packages || []);

      // Fetch package usage
      const { data: usage, error: usageError } = await supabase
        .from('package_usage')
        .select(`
          *,
          jobs (
            title,
            status
          )
        `)
        .in('client_package_id', packages?.map(p => p.id) || [])
        .order('usage_date', { ascending: false });

      if (usageError) throw usageError;
      setPackageUsage(usage || []);

      // Fetch client jobs
      const { data: clientJobs, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('client_id', client.id)
        .order('created_at', { ascending: false });

      if (jobsError) throw jobsError;
      setJobs(clientJobs || []);

      // Fetch contracts
      const { data: clientContracts, error: contractsError } = await supabase
        .from('client_contracts')
        .select('*')
        .eq('client_id', client.id)
        .order('created_at', { ascending: false });

      if (contractsError) throw contractsError;
      setContracts(clientContracts || []);

      // Fetch payments
      const { data: clientPayments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('client_id', client.id)
        .order('payment_date', { ascending: false });

      if (paymentsError) throw paymentsError;
      setPayments(clientPayments || []);

    } catch (error) {
      console.error('Error fetching client data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'photo_session': return Camera;
      case 'video_editing': return Video;
      case 'design': return Palette;
      default: return Package;
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-300',
      review: 'bg-purple-100 text-purple-800 border-purple-300',
      completed: 'bg-green-100 text-green-800 border-green-300',
      delivered: 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const calculateServiceUsage = (packageServices: any[], usage: PackageUsage[]) => {
    if (!packageServices || !Array.isArray(packageServices)) {
      return [];
    }
    
    return packageServices.map(service => {
      const used = usage
        .filter(u => u.service_type === service.service_type)
        .reduce((sum, u) => sum + u.quantity_used, 0);
      
      return {
        ...service,
        used,
        remaining: service.quantity_included - used,
        usage_percentage: (used / service.quantity_included) * 100
      };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!clientData) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          No client data found. Please contact support if this is an error.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-2xl shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <User size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Welcome, {clientData.name}!</h1>
            <p className="text-blue-100 mt-1">Your creative project dashboard</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Total Paid</p>
                <p className="text-2xl font-bold text-green-800">${clientData.total_paid}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700">Amount Due</p>
                <p className="text-2xl font-bold text-yellow-800">${clientData.total_due}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Active Projects</p>
                <p className="text-2xl font-bold text-blue-800">
                  {jobs.filter(j => ['pending', 'in_progress', 'review'].includes(j.status)).length}
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Packages</p>
                <p className="text-2xl font-bold text-purple-800">
                  {clientPackages.filter(p => p.is_active).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="packages">Packages</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Active Packages Overview */}
          {clientPackages.filter(p => p.is_active).map(pkg => {
            const serviceUsage = calculateServiceUsage(
              pkg.packages.package_services || [], 
              packageUsage.filter(u => u.client_package_id === pkg.id)
            );

            return (
              <Card key={pkg.id} className="shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                  <CardTitle className="flex items-center justify-between">
                    <span>{pkg.packages.name}</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {serviceUsage.map(service => {
                      const ServiceIcon = getServiceIcon(service.service_type);
                      return (
                        <div key={service.id} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <ServiceIcon className="h-5 w-5 text-blue-600" />
                            <span className="font-medium">{service.service_type.replace('_', ' ')}</span>
                          </div>
                          <Progress value={service.usage_percentage} className="mb-2" />
                          <p className="text-sm text-gray-600">
                            {service.used} / {service.quantity_included} used
                          </p>
                          {service.remaining > 0 && (
                            <p className="text-sm text-green-600 font-medium">
                              {service.remaining} remaining
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Recent Projects */}
          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {jobs.slice(0, 3).map(job => (
                  <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{job.title}</h4>
                      <p className="text-sm text-gray-600 capitalize">{job.type.replace('_', ' ')}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(job.status)}>
                        {job.status.replace('_', ' ')}
                      </Badge>
                      {job.due_date && (
                        <p className="text-sm text-gray-500 mt-1">
                          Due: {format(new Date(job.due_date), 'MMM dd, yyyy')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="packages" className="space-y-6">
          {clientPackages.map(pkg => (
            <Card key={pkg.id} className="shadow-xl border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{pkg.packages.name}</CardTitle>
                  <Badge variant={pkg.is_active ? "default" : "secondary"}>
                    {pkg.is_active ? "Active" : "Expired"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {pkg.packages.description && (
                  <p className="text-gray-600">{pkg.packages.description}</p>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Monthly Price</span>
                    <p className="text-2xl font-bold text-green-600">${pkg.packages.price}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Duration</span>
                    <p className="text-xl font-semibold">{pkg.packages.duration_months} months</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Included Services</h4>
                  {pkg.packages.package_services?.map(service => {
                    const ServiceIcon = getServiceIcon(service.service_type);
                    return (
                      <div key={service.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <ServiceIcon className="h-4 w-4 text-blue-600" />
                        <span>{service.quantity_included}x {service.service_type.replace('_', ' ')}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <p>Start Date: {format(new Date(pkg.start_date), 'MMM dd, yyyy')}</p>
                  <p>End Date: {format(new Date(pkg.end_date), 'MMM dd, yyyy')}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map(job => (
              <Card key={job.id} className="shadow-lg border-0">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    <Badge className={getStatusColor(job.status)}>
                      {job.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600 capitalize">{job.type.replace('_', ' ')}</p>
                  
                  {job.description && (
                    <p className="text-sm">{job.description}</p>
                  )}

                  {job.session_date && (
                    <p className="text-sm">
                      <span className="font-medium">Session:</span> {format(new Date(job.session_date), 'MMM dd, yyyy')}
                    </p>
                  )}

                  {job.due_date && (
                    <p className="text-sm">
                      <span className="font-medium">Due:</span> {format(new Date(job.due_date), 'MMM dd, yyyy')}
                    </p>
                  )}

                  {job.price && (
                    <p className="text-lg font-semibold text-green-600">${job.price}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-6">
          {contracts.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Contracts Yet</h3>
                <p className="text-gray-600">Contract documents will appear here once uploaded by our team</p>
              </CardContent>
            </Card>
          ) : (
            contracts.map(contract => (
              <Card key={contract.id} className="shadow-lg border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div>
                        <h3 className="font-semibold">{contract.contract_name}</h3>
                        <p className="text-sm text-gray-600">
                          Size: {(contract.file_size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-sm text-gray-600">
                    <p>Uploaded: {format(new Date(contract.created_at), 'MMM dd, yyyy')}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          {payments.map(payment => (
            <Card key={payment.id} className="shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-2xl text-green-600">${payment.amount}</h3>
                      <p className="text-sm text-gray-600 capitalize">{payment.payment_method}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-medium">{format(new Date(payment.payment_date), 'MMM dd, yyyy')}</p>
                    {payment.notes && (
                      <p className="text-sm text-gray-600 max-w-xs">{payment.notes}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {payments.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Payments Yet</h3>
                <p className="text-gray-600">Payment history will appear here once payments are made</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientPortal;