
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
import { Upload, FileText, Eye, Download, Calendar, User } from 'lucide-react';

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
      fetchClients();
      fetchContracts();
    }
  }, [canManageContracts]);

  const fetchClients = async () => {
    try {
      console.log('Fetching clients...');
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, email')
        .order('name');

      if (error) {
        console.error('Error fetching clients:', error);
        throw error;
      }
      
      console.log('Clients fetched successfully:', data?.length || 0);
      setClients(data || []);
    } catch (error: any) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Error",
        description: "Failed to fetch clients",
        variant: "destructive"
      });
    }
  };

  const fetchContracts = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching contracts...');
      
      const { data, error } = await supabase
        .from('client_contracts')
        .select(`
          id,
          client_id,
          contract_name,
          file_path,
          file_size,
          uploaded_by,
          created_at,
          clients!inner (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contracts:', error);
        throw error;
      }
      
      console.log('Contracts fetched successfully:', data?.length || 0);
      setContracts(data || []);
    } catch (error: any) {
      console.error('Error fetching contracts:', error);
      toast({
        title: "Error",
        description: `Failed to fetch contracts: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, file.size);
      setSelectedFile(file);
      if (!contractName) {
        setContractName(file.name);
      }
    }
  };

  const uploadContract = async () => {
    if (!selectedFile || !selectedClientId || !contractName || !userProfile?.id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUploading(true);
      console.log('Starting contract upload...', {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        clientId: selectedClientId,
        contractName: contractName
      });

      // Upload file to storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `contracts/${fileName}`;

      console.log('Uploading file to storage...', filePath);
      const { error: uploadError } = await supabase.storage
        .from('contracts')
        .upload(filePath, selectedFile);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      console.log('File uploaded successfully, saving to database...');

      // Save contract record to database
      const { error: dbError } = await supabase
        .from('client_contracts')
        .insert({
          client_id: selectedClientId,
          contract_name: contractName,
          file_path: filePath,
          file_size: selectedFile.size,
          uploaded_by: userProfile.id
        });

      if (dbError) {
        console.error('Database insert error:', dbError);
        throw dbError;
      }

      console.log('Contract saved successfully');

      toast({
        title: "Success",
        description: "Contract uploaded successfully"
      });

      // Reset form
      setSelectedFile(null);
      setSelectedClientId('');
      setContractName('');
      
      // Reset file input
      const fileInput = document.getElementById('file') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
      // Refresh contracts list
      await fetchContracts();

    } catch (error: any) {
      console.error('Error uploading contract:', error);
      toast({
        title: "Error",
        description: `Failed to upload contract: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadContract = async (contract: Contract) => {
    try {
      console.log('Downloading contract:', contract.file_path);
      const { data, error } = await supabase.storage
        .from('contracts')
        .download(contract.file_path);

      if (error) {
        console.error('Download error:', error);
        throw error;
      }

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = contract.contract_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
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
            <Label htmlFor="client">Client *</Label>
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
            <Label htmlFor="contractName">Contract Name *</Label>
            <Input
              id="contractName"
              value={contractName}
              onChange={(e) => setContractName(e.target.value)}
              placeholder="Enter contract name"
            />
          </div>

          <div>
            <Label htmlFor="file">Contract File *</Label>
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
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : contracts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No contracts uploaded yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {contracts.map(contract => (
                <div key={contract.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{contract.contract_name}</h3>
                      <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Client: {contract.clients?.name || 'Unknown'}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Uploaded: {new Date(contract.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <Upload className="h-4 w-4" />
                          Size: {(contract.file_size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => downloadContract(contract)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
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
