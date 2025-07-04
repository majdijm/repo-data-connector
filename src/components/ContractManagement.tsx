
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Eye, Download } from 'lucide-react';

interface Contract {
  id: string;
  client_id: string;
  contract_name: string;
  file_path: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
  clients: {
    name: string;
  };
}

interface Client {
  id: string;
  name: string;
  email: string;
}

const ContractManagement = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [contractName, setContractName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const canManageContracts = userProfile?.role === 'admin' || userProfile?.role === 'receptionist';

  useEffect(() => {
    if (canManageContracts) {
      fetchContracts();
      fetchClients();
    }
  }, [canManageContracts]);

  const fetchContracts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('client_contracts' as any)
        .select(`
          *,
          clients (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContracts(data || []);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch contracts",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, email')
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!contractName) {
        setContractName(file.name);
      }
    }
  };

  const uploadContract = async () => {
    if (!selectedFile || !selectedClientId || !contractName || !userProfile) return;

    setIsUploading(true);
    try {
      // Generate unique file path
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `contracts/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('contracts')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Save contract record to database
      const { error: dbError } = await supabase
        .from('client_contracts' as any)
        .insert({
          client_id: selectedClientId,
          contract_name: contractName,
          file_path: filePath,
          file_size: selectedFile.size,
          uploaded_by: userProfile.id
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Contract uploaded successfully"
      });

      // Reset form
      setSelectedFile(null);
      setSelectedClientId('');
      setContractName('');
      fetchContracts();
    } catch (error) {
      console.error('Error uploading contract:', error);
      toast({
        title: "Error",
        description: "Failed to upload contract",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadContract = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('contracts')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading contract:', error);
      toast({
        title: "Error",
        description: "Failed to download contract",
        variant: "destructive"
      });
    }
  };

  if (!canManageContracts) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">Access denied. Only admins and receptionists can manage contracts.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Client Contract
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="client">Client</Label>
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="contractName">Contract Name</Label>
            <Input
              id="contractName"
              value={contractName}
              onChange={(e) => setContractName(e.target.value)}
              placeholder="Enter contract name"
            />
          </div>

          <div>
            <Label htmlFor="file">Contract File</Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
          </div>

          <Button 
            onClick={uploadContract}
            disabled={!selectedFile || !selectedClientId || !contractName || isUploading}
            className="w-full"
          >
            {isUploading ? 'Uploading...' : 'Upload Contract'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Client Contracts ({contracts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : contracts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No contracts uploaded yet.</p>
          ) : (
            <div className="space-y-4">
              {contracts.map(contract => (
                <div key={contract.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{contract.contract_name}</h3>
                      <p className="text-sm text-gray-600">Client: {contract.clients.name}</p>
                      <p className="text-xs text-gray-500">
                        Uploaded: {new Date(contract.created_at).toLocaleDateString()}
                        {' • '}
                        Size: {(contract.file_size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadContract(contract.file_path, contract.contract_name)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
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

export default ContractManagement;
