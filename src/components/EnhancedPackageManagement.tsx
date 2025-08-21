import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  DollarSign,
  Camera,
  Video,
  Palette,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Package {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration_months: number;
  is_active: boolean;
  created_at: string;
  package_services?: PackageService[];
}

interface PackageService {
  id: string;
  package_id?: string;
  service_type: string;
  quantity_included: number;
  description?: string;
}

interface ClientPackage {
  id: string;
  client_id: string;
  package_id: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  packages: {
    id?: string;
    name: string;
    price: number;
    duration_months: number;
    description?: string;
    is_active?: boolean;
    created_at?: string;
  };
  clients: {
    name: string;
    email: string;
  };
}

const serviceTypes = [
  { value: 'photo_session', label: 'Photo Session', icon: Camera },
  { value: 'video_editing', label: 'Video Editing', icon: Video },
  { value: 'design', label: 'Design Work', icon: Palette },
  { value: 'consultation', label: 'Consultation', icon: Clock },
  { value: 'retouching', label: 'Photo Retouching', icon: Edit }
];

const EnhancedPackageManagement = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [clientPackages, setClientPackages] = useState<ClientPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('packages');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration_months: '',
    services: [] as { service_type: string; quantity_included: number; description: string }[]
  });

  const { userProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchPackages();
    fetchClientPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select(`
          *,
          package_services (
            id,
            service_type,
            quantity_included,
            description
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast({
        title: "Error",
        description: "Failed to fetch packages",
        variant: "destructive"
      });
    }
  };

  const fetchClientPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('client_packages')
        .select(`
          *,
          packages (
            name,
            price,
            duration_months,
            description
          ),
          clients (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClientPackages(data || []);
    } catch (error) {
      console.error('Error fetching client packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: packageData, error: packageError } = await supabase
        .from('packages')
        .insert({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          duration_months: parseInt(formData.duration_months)
        })
        .select()
        .single();

      if (packageError) throw packageError;

      // Insert package services
      if (formData.services.length > 0) {
        const services = formData.services.map(service => ({
          package_id: packageData.id,
          service_type: service.service_type,
          quantity_included: service.quantity_included,
          description: service.description
        }));

        const { error: servicesError } = await supabase
          .from('package_services')
          .insert(services);

        if (servicesError) throw servicesError;
      }

      toast({
        title: "Success",
        description: "Package created successfully"
      });

      resetForm();
      setShowCreateDialog(false);
      fetchPackages();
    } catch (error) {
      console.error('Error creating package:', error);
      toast({
        title: "Error",
        description: "Failed to create package",
        variant: "destructive"
      });
    }
  };

  const togglePackageStatus = async (packageId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('packages')
        .update({ is_active: !currentStatus })
        .eq('id', packageId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Package ${!currentStatus ? 'activated' : 'deactivated'} successfully`
      });
      
      fetchPackages();
    } catch (error) {
      console.error('Error toggling package status:', error);
      toast({
        title: "Error",
        description: "Failed to update package status",
        variant: "destructive"
      });
    }
  };

  const addService = () => {
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, { service_type: '', quantity_included: 1, description: '' }]
    }));
  };

  const updateService = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map((service, i) => 
        i === index ? { ...service, [field]: value } : service
      )
    }));
  };

  const removeService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      duration_months: '',
      services: []
    });
    setEditingPackage(null);
  };

  const getServiceIcon = (serviceType: string) => {
    const service = serviceTypes.find(s => s.value === serviceType);
    return service ? service.icon : Package;
  };

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
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <Package size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Enhanced Package Management</h1>
              <p className="text-purple-100 mt-1">Comprehensive service packages with financial tracking</p>
            </div>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30" size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Create Package
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Package</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleCreatePackage} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Package Name</label>
                    <Input
                      placeholder="e.g., Premium Photography Package"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Monthly Price ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="299.00"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Duration (Months)</label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="12"
                    value={formData.duration_months}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration_months: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    placeholder="Package description and benefits..."
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                {/* Package Services */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Included Services</h3>
                    <Button type="button" onClick={addService} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Service
                    </Button>
                  </div>

                  {formData.services.map((service, index) => (
                    <Card key={index} className="p-4">
                      <div className="grid grid-cols-12 gap-4 items-end">
                        <div className="col-span-4">
                          <label className="block text-sm font-medium mb-2">Service Type</label>
                          <Select
                            value={service.service_type}
                            onValueChange={(value) => updateService(index, 'service_type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select service" />
                            </SelectTrigger>
                            <SelectContent>
                              {serviceTypes.map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                  <div className="flex items-center gap-2">
                                    <type.icon className="h-4 w-4" />
                                    {type.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="col-span-2">
                          <label className="block text-sm font-medium mb-2">Quantity</label>
                          <Input
                            type="number"
                            min="1"
                            value={service.quantity_included}
                            onChange={(e) => updateService(index, 'quantity_included', parseInt(e.target.value))}
                          />
                        </div>

                        <div className="col-span-5">
                          <label className="block text-sm font-medium mb-2">Description</label>
                          <Input
                            placeholder="e.g., Professional photo sessions"
                            value={service.description}
                            onChange={(e) => updateService(index, 'description', e.target.value)}
                          />
                        </div>

                        <div className="col-span-1">
                          <Button
                            type="button"
                            onClick={() => removeService(index)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">Create Package</Button>
                  <Button type="button" onClick={resetForm} variant="outline">Reset</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="packages">Package Templates</TabsTrigger>
          <TabsTrigger value="assignments">Client Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="packages" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map(pkg => (
              <Card key={pkg.id} className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-bold">{pkg.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={pkg.is_active ? "default" : "secondary"}>
                        {pkg.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  {pkg.description && (
                    <p className="text-gray-600 text-sm mt-2">{pkg.description}</p>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Monthly Price</span>
                    <span className="text-2xl font-bold text-green-600">${pkg.price}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Duration: {pkg.duration_months} months</span>
                  </div>

                  {/* Package Services */}
                  {pkg.package_services && pkg.package_services.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Included Services</h4>
                      {pkg.package_services.map(service => {
                        const ServiceIcon = getServiceIcon(service.service_type);
                        return (
                          <div key={service.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            <ServiceIcon className="h-4 w-4 text-blue-600" />
                            <span className="text-sm">
                              {service.quantity_included}x {service.service_type.replace('_', ' ')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => togglePackageStatus(pkg.id, pkg.is_active)}
                      variant={pkg.is_active ? "outline" : "default"}
                      size="sm"
                      className="flex-1"
                    >
                      {pkg.is_active ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {packages.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Packages Created</h3>
                <p className="text-gray-600 mb-4">Create your first service package to get started</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="assignments" className="space-y-6">
          {/* Client Package Assignments */}
          <div className="space-y-4">
            {clientPackages.map(assignment => (
              <Card key={assignment.id} className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{assignment.clients.name}</h3>
                        <p className="text-gray-500 text-sm">{assignment.clients.email}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <h4 className="font-medium text-gray-900">{assignment.packages.name}</h4>
                      <p className="text-2xl font-bold text-green-600">${assignment.packages.price}/mo</p>
                    </div>
                    
                    <Badge variant={assignment.is_active ? "default" : "secondary"}>
                      {assignment.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  
                  <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                    <span>Start: {new Date(assignment.start_date).toLocaleDateString()}</span>
                    <span>End: {new Date(assignment.end_date).toLocaleDateString()}</span>
                    <span>Duration: {assignment.packages.duration_months} months</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {clientPackages.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Package Assignments</h3>
                <p className="text-gray-600 mb-4">No clients have been assigned packages yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedPackageManagement;