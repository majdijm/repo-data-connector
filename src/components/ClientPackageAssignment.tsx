
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Package, Calendar, DollarSign, Plus } from 'lucide-react';

interface Package {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_months: number;
  is_active: boolean;
}

interface ClientPackage {
  id: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  packages: Package;
}

interface ClientPackageAssignmentProps {
  clientId: string;
  clientName: string;
  onAssignmentChange?: () => void;
}

const ClientPackageAssignment: React.FC<ClientPackageAssignmentProps> = ({ 
  clientId, 
  clientName, 
  onAssignmentChange 
}) => {
  const { toast } = useToast();
  const [packages, setPackages] = useState<Package[]>([]);
  const [clientPackages, setClientPackages] = useState<ClientPackage[]>([]);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  const fetchClientPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('client_packages')
        .select(`
          *,
          packages (*)
        `)
        .eq('client_id', clientId)
        .order('start_date', { ascending: false });

      if (error) throw error;
      setClientPackages(data || []);
    } catch (error) {
      console.error('Error fetching client packages:', error);
    }
  };

  React.useEffect(() => {
    fetchPackages();
    fetchClientPackages();
  }, [clientId]);

  const handleAssignPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackageId) return;

    try {
      setIsLoading(true);
      const selectedPackage = packages.find(p => p.id === selectedPackageId);
      if (!selectedPackage) return;

      const start = new Date(startDate);
      const end = new Date(start);
      end.setMonth(end.getMonth() + selectedPackage.duration_months);

      const { error } = await supabase
        .from('client_packages')
        .insert([{
          client_id: clientId,
          package_id: selectedPackageId,
          start_date: start.toISOString(),
          end_date: end.toISOString()
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Package assigned successfully"
      });

      setSelectedPackageId('');
      setStartDate(new Date().toISOString().split('T')[0]);
      setShowAssignForm(false);
      fetchClientPackages();
      onAssignmentChange?.();
    } catch (error) {
      console.error('Error assigning package:', error);
      toast({
        title: "Error",
        description: "Failed to assign package",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePackageStatus = async (packageId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('client_packages')
        .update({ is_active: !currentStatus })
        .eq('id', packageId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Package ${!currentStatus ? 'activated' : 'deactivated'} successfully`
      });

      fetchClientPackages();
      onAssignmentChange?.();
    } catch (error) {
      console.error('Error updating package status:', error);
      toast({
        title: "Error",
        description: "Failed to update package status",
        variant: "destructive"
      });
    }
  };

  const isPackageActive = (endDate: string) => {
    return new Date(endDate) > new Date();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Packages for {clientName}</h3>
        <Button
          onClick={() => setShowAssignForm(true)}
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Assign Package
        </Button>
      </div>

      {showAssignForm && (
        <Card>
          <CardHeader>
            <CardTitle>Assign Package</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAssignPackage} className="space-y-4">
              <div>
                <Label htmlFor="package">Select Package</Label>
                <Select value={selectedPackageId} onValueChange={setSelectedPackageId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a package" />
                  </SelectTrigger>
                  <SelectContent>
                    {packages.map(pkg => (
                      <SelectItem key={pkg.id} value={pkg.id}>
                        {pkg.name} - ${pkg.price} ({pkg.duration_months} months)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading || !selectedPackageId}>
                  {isLoading ? 'Assigning...' : 'Assign Package'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAssignForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {clientPackages.map(clientPackage => (
          <Card key={clientPackage.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="h-4 w-4 text-blue-600" />
                  <div>
                    <h4 className="font-medium">{clientPackage.packages.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        ${clientPackage.packages.price}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(clientPackage.start_date).toLocaleDateString()} - {new Date(clientPackage.end_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    clientPackage.is_active && isPackageActive(clientPackage.end_date) 
                      ? "default" 
                      : "secondary"
                  }>
                    {clientPackage.is_active && isPackageActive(clientPackage.end_date) 
                      ? 'Active' 
                      : 'Inactive'}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePackageStatus(clientPackage.id, clientPackage.is_active)}
                  >
                    {clientPackage.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {clientPackages.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No packages assigned to this client yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClientPackageAssignment;
