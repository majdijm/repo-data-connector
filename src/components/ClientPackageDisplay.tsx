import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

interface ClientPackageProps {
  clientPackages: any[];
  loading?: boolean;
}

const ClientPackageDisplay: React.FC<ClientPackageProps> = ({ clientPackages, loading }) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading packages...</p>
        </CardContent>
      </Card>
    );
  }

  if (!clientPackages || clientPackages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Your Packages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No active packages found. Contact us to learn about our available packages.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Package className="h-5 w-5" />
        Your Active Packages
      </h3>
      
      {clientPackages.map((clientPackage) => {
        const packageInfo = clientPackage.packages || {};
        
        return (
          <Card key={clientPackage.id} className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-purple-600" />
                  <span>{packageInfo.name || 'Package'}</span>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  Active
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Monthly Fee</p>
                  <p className="font-semibold text-purple-700 flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    ${packageInfo.price || 0}/month
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Duration</p>
                  <p className="font-semibold text-purple-700">
                    {packageInfo.duration_months || 0} months
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Start Date</p>
                  <p className="font-semibold text-purple-700 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {clientPackage.start_date ? format(new Date(clientPackage.start_date), 'MMM dd, yyyy') : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">End Date</p>
                  <p className="font-semibold text-purple-700 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {clientPackage.end_date ? format(new Date(clientPackage.end_date), 'MMM dd, yyyy') : 'N/A'}
                  </p>
                </div>
              </div>
              
              {packageInfo.description && (
                <div className="mt-4 p-3 bg-white rounded-lg border">
                  <p className="text-sm font-medium mb-1">Package Description</p>
                  <p className="text-sm text-muted-foreground">{packageInfo.description}</p>
                </div>
              )}
              
              <div className="mt-4 p-3 bg-white rounded-lg border">
                <p className="text-sm font-medium mb-1">Package Value</p>
                <p className="text-lg font-bold text-purple-700">
                  ${(packageInfo.price || 0) * (packageInfo.duration_months || 0)} total
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ClientPackageDisplay;