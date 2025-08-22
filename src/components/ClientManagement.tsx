import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Mail, Phone, MapPin, DollarSign, Edit, Eye, Upload, FileText, Download, Calendar, User, Package, CreditCard } from 'lucide-react';
import ClientPackageAssignment from './ClientPackageAssignment';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  total_paid: number | null;
  total_due: number | null;
  created_at: string;
}

interface Contract {
  id: string;
  client_id: string;
  contract_name: string;
  file_path: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
}

const ClientManagement = () => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [contracts, setContracts] = useState<{ [clientId: string]: Contract[] }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showContracts, setShowContracts] = useState<{ [clientId: string]: boolean }>({});

  // Contract upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [contractName, setContractName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadClientId, setUploadClientId] = useState<string | null>(null);

  // Payment states
  const [showPaymentForm, setShowPaymentForm] = useState<{ [clientId: string]: boolean }>({});
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    payment_method: 'cash',
    notes: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Error",
        description: "Failed to fetch clients",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClientContracts = async (clientId: string) => {
    if (!user) return;

    try {
      console.log('Fetching contracts for client:', clientId);
      
      const { data: contractsData, error: contractsError } = await supabase
        .from('client_contracts')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (contractsError) {
        console.error('Error fetching contracts:', contractsError);
        throw contractsError;
      }

      console.log('Contracts fetched successfully:', contractsData?.length || 0);
      setContracts(prev => ({
        ...prev,
        [clientId]: contractsData || []
      }));
    } catch (error: any) {
      console.error('Error fetching contracts:', error);
      toast({
        title: "Error",
        description: `Failed to fetch contracts: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const handleShowContracts = (clientId: string) => {
    const isCurrentlyShown = showContracts[clientId];
    setShowContracts(prev => ({
      ...prev,
      [clientId]: !isCurrentlyShown
    }));

    if (!isCurrentlyShown && !contracts[clientId]) {
      fetchClientContracts(clientId);
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
    if (!selectedFile || !contractName || !user?.id || !uploadClientId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and ensure you're logged in",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUploading(true);
      console.log('Starting contract upload...', {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        clientId: uploadClientId,
        contractName: contractName,
        userId: user.id
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
          client_id: uploadClientId,
          contract_name: contractName,
          file_path: filePath,
          file_size: selectedFile.size,
          uploaded_by: user.id
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
      setContractName('');
      setUploadClientId(null);
      
      // Reset file input
      const fileInput = document.getElementById('file') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
      // Refresh contracts for this client
      await fetchClientContracts(uploadClientId);

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

  React.useEffect(() => {
    fetchClients();
  }, []);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('clients')
        .insert([formData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Client created successfully"
      });

      setFormData({
        name: '',
        email: '',
        phone: '',
        address: ''
      });
      setShowCreateForm(false);
      fetchClients();
    } catch (error) {
      console.error('Error creating client:', error);
      toast({
        title: "Error",
        description: "Failed to create client",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateClient = async (clientId: string, updates: Partial<Client>) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', clientId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Client updated successfully"
      });

      fetchClients();
      setSelectedClient(null);
    } catch (error) {
      console.error('Error updating client:', error);
      toast({
        title: "Error",
        description: "Failed to update client",
        variant: "destructive"
      });
    }
  };

  const handleCreatePayment = async (clientId: string) => {
    if (!user?.id || !paymentData.amount) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('payments')
        .insert([{
          client_id: clientId,
          amount: paymentData.amount,
          payment_method: paymentData.payment_method,
          notes: paymentData.notes,
          received_by: user.id,
          payment_date: new Date().toISOString()
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment recorded successfully"
      });

      setPaymentData({
        amount: 0,
        payment_method: 'cash',
        notes: ''
      });
      
      setShowPaymentForm(prev => ({ ...prev, [clientId]: false }));
      fetchClients(); // Refresh to update financial data
    } catch (error: any) {
      console.error('Error creating payment:', error);
      toast({
        title: "Error",
        description: `Failed to record payment: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canManageClients = userProfile?.role === 'admin' || userProfile?.role === 'receptionist';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Client Management</h2>
        {canManageClients && (
          <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Client
          </Button>
        )}
      </div>

      {/* Create Client Form */}
      {showCreateForm && canManageClients && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Client</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Client Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Client'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Client List */}
      <div className="grid gap-4">
        {clients.map(client => (
          <Card key={client.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-semibold text-lg">{client.name}</h3>
                    <Badge variant="outline">Client</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4" />
                      {client.email}
                    </div>
                    {client.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-4 w-4" />
                        {client.phone}
                      </div>
                    )}
                    {client.address && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        {client.address}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      Paid: ${client.total_paid || 0} | Due: ${client.total_due || 0}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    Created: {new Date(client.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedClient(client)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  {canManageClients && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData({
                          name: client.name,
                          email: client.email,
                          phone: client.phone || '',
                          address: client.address || ''
                        });
                        setSelectedClient(client);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>

              {/* Client Management Tabs */}
              {canManageClients && (
                <Tabs defaultValue="packages" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="packages" className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Packages
                    </TabsTrigger>
                    <TabsTrigger value="contracts" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Contracts
                    </TabsTrigger>
                    <TabsTrigger value="payments" className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Payments
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="packages" className="mt-4">
                    <ClientPackageAssignment
                      clientId={client.id}
                      clientName={client.name}
                      onAssignmentChange={fetchClients}
                    />
                  </TabsContent>
                  
                  <TabsContent value="contracts" className="mt-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-lg flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Contracts ({contracts[client.id]?.length || 0})
                        </h4>
                        <Button
                          size="sm"
                          onClick={() => setUploadClientId(uploadClientId === client.id ? null : client.id)}
                          variant={uploadClientId === client.id ? "default" : "outline"}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {uploadClientId === client.id ? 'Cancel Upload' : 'Upload Contract'}
                        </Button>
                      </div>

                      {/* Upload Form */}
                      {uploadClientId === client.id && (
                        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                          <div>
                            <Label htmlFor={`contractName-${client.id}`}>Contract Name *</Label>
                            <Input
                              id={`contractName-${client.id}`}
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
                            disabled={!selectedFile || !contractName || isUploading}
                            size="sm"
                          >
                            {isUploading ? 'Uploading...' : 'Upload Contract'}
                          </Button>
                        </div>
                      )}

                      {/* Contracts List */}
                      <div className="space-y-3">
                        {!contracts[client.id] && (
                          <Button
                            variant="outline"
                            onClick={() => fetchClientContracts(client.id)}
                            className="w-full"
                          >
                            Load Contracts
                          </Button>
                        )}
                        
                        {contracts[client.id]?.length === 0 ? (
                          <div className="text-center py-4">
                            <p className="text-gray-500">No contracts uploaded yet.</p>
                          </div>
                        ) : (
                          contracts[client.id]?.map(contract => (
                            <div key={contract.id} className="border rounded-lg p-3 bg-white">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h5 className="font-medium">{contract.contract_name}</h5>
                                  <div className="grid grid-cols-2 gap-2 mt-1 text-xs text-gray-600">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {new Date(contract.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Upload className="h-3 w-3" />
                                      {(contract.file_size / 1024 / 1024).toFixed(2)} MB
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  onClick={() => downloadContract(contract)}
                                  variant="outline"
                                  size="sm"
                                  className="ml-2"
                                >
                                  <Download className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="payments" className="mt-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-lg flex items-center gap-2">
                          <CreditCard className="h-5 w-5" />
                          Record Payment
                        </h4>
                        <Button
                          size="sm"
                          onClick={() => setShowPaymentForm(prev => ({ ...prev, [client.id]: !prev[client.id] }))}
                          variant={showPaymentForm[client.id] ? "default" : "outline"}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {showPaymentForm[client.id] ? 'Cancel' : 'Add Payment'}
                        </Button>
                      </div>

                      {/* Payment Form */}
                      {showPaymentForm[client.id] && (
                        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`amount-${client.id}`}>Amount *</Label>
                              <Input
                                id={`amount-${client.id}`}
                                type="number"
                                step="0.01"
                                value={paymentData.amount}
                                onChange={(e) => setPaymentData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                                placeholder="Enter amount"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`payment_method-${client.id}`}>Payment Method</Label>
                              <Select 
                                value={paymentData.payment_method} 
                                onValueChange={(value) => setPaymentData(prev => ({ ...prev, payment_method: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="cash">Cash</SelectItem>
                                  <SelectItem value="card">Card</SelectItem>
                                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                  <SelectItem value="check">Check</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor={`notes-${client.id}`}>Notes</Label>
                            <Input
                              id={`notes-${client.id}`}
                              value={paymentData.notes}
                              onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                              placeholder="Payment notes (optional)"
                            />
                          </div>

                          <Button 
                            onClick={() => handleCreatePayment(client.id)}
                            disabled={!paymentData.amount || isLoading}
                            size="sm"
                          >
                            {isLoading ? 'Recording...' : 'Record Payment'}
                          </Button>
                        </div>
                      )}

                      <div className="text-center py-4">
                        <p className="text-gray-500 text-sm">
                          Current Balance: Paid ${client.total_paid || 0} | Due ${client.total_due || 0}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Visit the Payments page for detailed payment history
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Client Details Modal */}
      {selectedClient && (
        <Card>
          <CardHeader>
            <CardTitle>Client Details - {selectedClient.name}</CardTitle>
          </CardHeader>
          <CardContent>
            {canManageClients ? (
              <form onSubmit={(e) => {
                e.preventDefault();
                handleUpdateClient(selectedClient.id, formData);
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name">Client Name</Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-phone">Phone</Label>
                    <Input
                      id="edit-phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-address">Address</Label>
                    <Input
                      id="edit-address"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit">Update Client</Button>
                  <Button type="button" variant="outline" onClick={() => setSelectedClient(null)}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <p className="text-sm text-gray-700">{selectedClient.name}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="text-sm text-gray-700">{selectedClient.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Phone</Label>
                    <p className="text-sm text-gray-700">{selectedClient.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label>Address</Label>
                    <p className="text-sm text-gray-700">{selectedClient.address || 'Not provided'}</p>
                  </div>
                </div>
                <Button variant="outline" onClick={() => setSelectedClient(null)}>
                  Close
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {clients.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No clients found. Add your first client to get started.</p>
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

export default ClientManagement;
