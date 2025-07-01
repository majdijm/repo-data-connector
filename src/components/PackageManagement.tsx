
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Eye, Package, Calendar, DollarSign } from 'lucide-react';

interface Package {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_months: number;
  is_active: boolean;
  created_at: string;
}

const PackageManagement = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    duration_months: 1
  });

  const fetchPackages = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('packages')
        .select('*')
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
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchPackages();
  }, []);

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('packages')
        .insert([formData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Package created successfully"
      });

      setFormData({
        name: '',
        description: '',
        price: 0,
        duration_months: 1
      });
      setShowCreateForm(false);
      fetchPackages();
    } catch (error) {
      console.error('Error creating package:', error);
      toast({
        title: "Error",
        description: "Failed to create package",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePackage = async (packageId: string, updates: Partial<Package>) => {
    try {
      const { error } = await supabase
        .from('packages')
        .update(updates)
        .eq('id', packageId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Package updated successfully"
      });

      fetchPackages();
      setSelectedPackage(null);
    } catch (error) {
      console.error('Error updating package:', error);
      toast({
        title: "Error",
        description: "Failed to update package",
        variant: "destructive"
      });
    }
  };

  const togglePackageStatus = async (packageId: string, currentStatus: boolean) => {
    await handleUpdatePackage(packageId, { is_active: !currentStatus });
  };

  const canManagePackages = userProfile?.role === 'admin' || userProfile?.role === 'receptionist';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Package Management</h2>
        {canManagePackages && (
          <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Package
          </Button>
        )}
      </div>

      {showCreateForm && canManagePackages && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Package</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreatePackage} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Package Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="duration_months">Duration (Months)</Label>
                <Input
                  id="duration_months"
                  type="number"
                  min="1"
                  value={formData.duration_months}
                  onChange={(e) => setFormData({...formData, duration_months: Number(e.target.value)})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Package'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {packages.map(pkg => (
          <Card key={pkg.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Package className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-lg">{pkg.name}</h3>
                    <Badge variant={pkg.is_active ? "default" : "secondary"}>
                      {pkg.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      ${pkg.price.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      {pkg.duration_months} month{pkg.duration_months > 1 ? 's' : ''}
                    </div>
                  </div>

                  {pkg.description && (
                    <p className="text-sm text-gray-700 mb-3">{pkg.description}</p>
                  )}

                  <div className="text-xs text-gray-500">
                    Created: {new Date(pkg.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {canManagePackages && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFormData({
                            name: pkg.name,
                            description: pkg.description || '',
                            price: pkg.price,
                            duration_months: pkg.duration_months
                          });
                          setSelectedPackage(pkg);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={pkg.is_active ? "destructive" : "default"}
                        size="sm"
                        onClick={() => togglePackageStatus(pkg.id, pkg.is_active)}
                      >
                        {pkg.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedPackage && (
        <Card>
          <CardHeader>
            <CardTitle>Package Details - {selectedPackage.name}</CardTitle>
          </CardHeader>
          <CardContent>
            {canManagePackages ? (
              <form onSubmit={(e) => {
                e.preventDefault();
                handleUpdatePackage(selectedPackage.id, formData);
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name">Package Name</Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-price">Price ($)</Label>
                    <Input
                      id="edit-price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-duration">Duration (Months)</Label>
                  <Input
                    id="edit-duration"
                    type="number"
                    min="1"
                    value={formData.duration_months}
                    onChange={(e) => setFormData({...formData, duration_months: Number(e.target.value)})}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit">Update Package</Button>
                  <Button type="button" variant="outline" onClick={() => setSelectedPackage(null)}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <p className="text-sm text-gray-700">{selectedPackage.name}</p>
                  </div>
                  <div>
                    <Label>Price</Label>
                    <p className="text-sm text-gray-700">${selectedPackage.price.toLocaleString()}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Duration</Label>
                    <p className="text-sm text-gray-700">{selectedPackage.duration_months} months</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <p className="text-sm text-gray-700">{selectedPackage.is_active ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>
                {selectedPackage.description && (
                  <div>
                    <Label>Description</Label>
                    <p className="text-sm text-gray-700">{selectedPackage.description}</p>
                  </div>
                )}
                <Button variant="outline" onClick={() => setSelectedPackage(null)}>
                  Close
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {packages.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No packages found. Create your first package to get started.</p>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};

export default PackageManagement;
