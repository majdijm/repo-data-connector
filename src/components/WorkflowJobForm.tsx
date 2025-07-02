import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useJobWorkflow } from '@/hooks/useJobWorkflow';
import { supabase } from '@/integrations/supabase/client';
import { useUsers } from '@/hooks/useUsers';
import { Camera, Video, Palette, ArrowRight, Package, DollarSign, AlertTriangle } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
}

interface ClientPackage {
  id: string;
  client_id: string;
  package_id: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  packages: {
    id: string;
    name: string;
    description: string;
    price: number;
    duration_months: number;
  };
}

interface WorkflowJobFormProps {
  onJobsCreated?: () => void;
  onCancel?: () => void;
}

const WorkflowJobForm: React.FC<WorkflowJobFormProps> = ({ onJobsCreated, onCancel }) => {
  const { createWorkflowJobs, isLoading } = useJobWorkflow();
  const { users } = useUsers();
  const [clients, setClients] = useState<Client[]>([]);
  const [clientPackages, setClientPackages] = useState<ClientPackage[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    client_id: '',
    package_included: false,
    
    // Photo Session Job
    photo_title: '',
    photo_assigned_to: '',
    photo_due_date: '',
    photo_description: '',
    photo_price: 0,
    photo_extra_cost: 0,
    photo_extra_reason: '',
    
    // Video Editing Job
    video_title: '',
    video_assigned_to: '',
    video_due_date: '',
    video_description: '',
    video_price: 0,
    video_extra_cost: 0,
    video_extra_reason: '',
    
    // Design Job
    design_title: '',
    design_assigned_to: '',
    design_due_date: '',
    design_description: '',
    design_price: 0,
    design_extra_cost: 0,
    design_extra_reason: ''
  });

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (formData.client_id) {
      fetchClientPackages(formData.client_id);
    } else {
      setClientPackages([]);
    }
  }, [formData.client_id]);

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

  const fetchClientPackages = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('client_packages')
        .select(`
          *,
          packages (*)
        `)
        .eq('client_id', clientId)
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString());

      if (error) throw error;
      setClientPackages(data || []);
    } catch (error) {
      console.error('Error fetching client packages:', error);
      setClientPackages([]);
    }
  };

  const getTeamMembersByRole = (role: string) => {
    return users.filter(user => user.role === role && user.is_active);
  };

  const photographers = getTeamMembersByRole('photographer');
  const editors = getTeamMembersByRole('editor');
  const designers = getTeamMembersByRole('designer');

  const validateForm = () => {
    const newErrors: string[] = [];

    // Required field validations
    if (!formData.client_id) newErrors.push('Please select a client');
    if (!formData.photo_title.trim()) newErrors.push('Photo session title is required');
    if (!formData.video_title.trim()) newErrors.push('Video editing title is required');
    if (!formData.design_title.trim()) newErrors.push('Design title is required');
    if (!formData.photo_assigned_to) newErrors.push('Please assign a photographer');
    if (!formData.video_assigned_to) newErrors.push('Please assign a video editor');
    if (!formData.design_assigned_to) newErrors.push('Please assign a designer');
    if (!formData.photo_due_date) newErrors.push('Photo session due date is required');
    if (!formData.video_due_date) newErrors.push('Video editing due date is required');
    if (!formData.design_due_date) newErrors.push('Design due date is required');

    // Team member availability validations
    if (photographers.length === 0) newErrors.push('No active photographers available');
    if (editors.length === 0) newErrors.push('No active video editors available');
    if (designers.length === 0) newErrors.push('No active designers available');

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await createWorkflowJobs(
        formData.client_id,
        {
          title: formData.photo_title.trim(),
          type: 'photo_session',
          assigned_to: formData.photo_assigned_to,
          due_date: formData.photo_due_date,
          description: formData.photo_description.trim() || undefined,
          extra_cost: formData.photo_extra_cost,
          extra_cost_reason: formData.photo_extra_reason.trim() || undefined
        },
        {
          title: formData.video_title.trim(),
          type: 'video_editing',
          assigned_to: formData.video_assigned_to,
          due_date: formData.video_due_date,
          description: formData.video_description.trim() || undefined,
          extra_cost: formData.video_extra_cost,
          extra_cost_reason: formData.video_extra_reason.trim() || undefined
        },
        {
          title: formData.design_title.trim(),
          type: 'design',
          assigned_to: formData.design_assigned_to,
          due_date: formData.design_due_date,
          description: formData.design_description.trim() || undefined,
          extra_cost: formData.design_extra_cost,
          extra_cost_reason: formData.design_extra_reason.trim() || undefined
        },
        formData.package_included
      );

      onJobsCreated?.();
    } catch (error) {
      console.error('Error creating workflow jobs:', error);
    }
  };

  const calculateTotalCost = () => {
    if (formData.package_included) {
      return formData.photo_extra_cost + formData.video_extra_cost + formData.design_extra_cost;
    }
    return formData.photo_price + formData.video_price + formData.design_price + 
           formData.photo_extra_cost + formData.video_extra_cost + formData.design_extra_cost;
  };

  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Create Photo Session Workflow
        </CardTitle>
        <p className="text-sm text-gray-600">
          Create a complete workflow: Photo Session → Video Editing → Design & Delivery
        </p>
      </CardHeader>
      <CardContent>
        {errors.length > 0 && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="font-semibold mb-2">Please fix the following errors:</div>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Client Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Client & Package</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client">Client *</Label>
                <Select value={formData.client_id} onValueChange={(value) => setFormData({...formData, client_id: value})}>
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

              <div className="flex items-center space-x-2 pt-8">
                <Checkbox
                  id="package_included"
                  checked={formData.package_included}
                  onCheckedChange={(checked) => 
                    setFormData({...formData, package_included: !!checked})
                  }
                />
                <Label htmlFor="package_included" className="text-sm font-medium">
                  Included in client package
                </Label>
              </div>
            </div>

            {formData.package_included && formData.client_id && (
              <div className="mt-3">
                {clientPackages.length > 0 ? (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <p className="text-sm font-medium text-blue-800 mb-2">Active client packages:</p>
                    {clientPackages.map(cp => (
                      <div key={cp.id} className="text-sm text-blue-700 flex items-center gap-2">
                        <Package className="h-3 w-3" />
                        {cp.packages.name} - ${cp.packages.price} 
                        (expires: {new Date(cp.end_date).toLocaleDateString()})
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <AlertDescription className="text-yellow-800">
                      No active packages found for this client.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>

          {/* Workflow Steps */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <Badge variant="default" className="flex items-center gap-2">
                <Camera className="h-3 w-3" />
                Photo Session
              </Badge>
              <ArrowRight className="h-4 w-4 text-gray-400" />
              <Badge variant="secondary" className="flex items-center gap-2">
                <Video className="h-3 w-3" />
                Video Editing
              </Badge>
              <ArrowRight className="h-4 w-4 text-gray-400" />
              <Badge variant="outline" className="flex items-center gap-2">
                <Palette className="h-3 w-3" />
                Design & Delivery
              </Badge>
            </div>

            {/* Photo Session Job */}
            <Card className="border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-blue-700">
                  <Camera className="h-4 w-4" />
                  1. Photo Session Job
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="photo_title">Job Title *</Label>
                    <Input
                      id="photo_title"
                      value={formData.photo_title}
                      onChange={(e) => setFormData({...formData, photo_title: e.target.value})}
                      placeholder="Photo session title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="photo_assigned_to">Assign to Photographer *</Label>
                    <Select 
                      value={formData.photo_assigned_to} 
                      onValueChange={(value) => setFormData({...formData, photo_assigned_to: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select photographer" />
                      </SelectTrigger>
                      <SelectContent>
                        {photographers.map(photographer => (
                          <SelectItem key={photographer.id} value={photographer.id}>
                            {photographer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="photo_due_date">Due Date *</Label>
                    <Input
                      id="photo_due_date"
                      type="datetime-local"
                      value={formData.photo_due_date}
                      onChange={(e) => setFormData({...formData, photo_due_date: e.target.value})}
                    />
                  </div>
                  {!formData.package_included && (
                    <div>
                      <Label htmlFor="photo_price">Price</Label>
                      <Input
                        id="photo_price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.photo_price}
                        onChange={(e) => setFormData({...formData, photo_price: Number(e.target.value)})}
                        placeholder="0.00"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="photo_description">Description</Label>
                  <Textarea
                    id="photo_description"
                    value={formData.photo_description}
                    onChange={(e) => setFormData({...formData, photo_description: e.target.value})}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="photo_extra_cost">Extra Cost</Label>
                    <Input
                      id="photo_extra_cost"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.photo_extra_cost}
                      onChange={(e) => setFormData({...formData, photo_extra_cost: Number(e.target.value)})}
                      placeholder="0.00"
                    />
                  </div>
                  {formData.photo_extra_cost > 0 && (
                    <div>
                      <Label htmlFor="photo_extra_reason">Extra Cost Reason</Label>
                      <Input
                        id="photo_extra_reason"
                        value={formData.photo_extra_reason}
                        onChange={(e) => setFormData({...formData, photo_extra_reason: e.target.value})}
                        placeholder="e.g., studio rental, special equipment"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Video Editing Job */}
            <Card className="border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-green-700">
                  <Video className="h-4 w-4" />
                  2. Video Editing Job
                  <Badge variant="outline" className="ml-2 text-xs">
                    Starts after photo session
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="video_title">Job Title *</Label>
                    <Input
                      id="video_title"
                      value={formData.video_title}
                      onChange={(e) => setFormData({...formData, video_title: e.target.value})}
                      placeholder="Video editing title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="video_assigned_to">Assign to Editor *</Label>
                    <Select 
                      value={formData.video_assigned_to} 
                      onValueChange={(value) => setFormData({...formData, video_assigned_to: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select editor" />
                      </SelectTrigger>
                      <SelectContent>
                        {editors.map(editor => (
                          <SelectItem key={editor.id} value={editor.id}>
                            {editor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="video_due_date">Due Date *</Label>
                    <Input
                      id="video_due_date"
                      type="datetime-local"
                      value={formData.video_due_date}
                      onChange={(e) => setFormData({...formData, video_due_date: e.target.value})}
                    />
                  </div>
                  {!formData.package_included && (
                    <div>
                      <Label htmlFor="video_price">Price</Label>
                      <Input
                        id="video_price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.video_price}
                        onChange={(e) => setFormData({...formData, video_price: Number(e.target.value)})}
                        placeholder="0.00"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="video_description">Description</Label>
                  <Textarea
                    id="video_description"
                    value={formData.video_description}
                    onChange={(e) => setFormData({...formData, video_description: e.target.value})}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="video_extra_cost">Extra Cost</Label>
                    <Input
                      id="video_extra_cost"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.video_extra_cost}
                      onChange={(e) => setFormData({...formData, video_extra_cost: Number(e.target.value)})}
                      placeholder="0.00"
                    />
                  </div>
                  {formData.video_extra_cost > 0 && (
                    <div>
                      <Label htmlFor="video_extra_reason">Extra Cost Reason</Label>
                      <Input
                        id="video_extra_reason"
                        value={formData.video_extra_reason}
                        onChange={(e) => setFormData({...formData, video_extra_reason: e.target.value})}
                        placeholder="e.g., special effects, music licensing"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Design Job */}
            <Card className="border-purple-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-purple-700">
                  <Palette className="h-4 w-4" />
                  3. Design & Delivery Job
                  <Badge variant="outline" className="ml-2 text-xs">
                    Starts after video editing
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="design_title">Job Title *</Label>
                    <Input
                      id="design_title"
                      value={formData.design_title}
                      onChange={(e) => setFormData({...formData, design_title: e.target.value})}
                      placeholder="Design and delivery title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="design_assigned_to">Assign to Designer *</Label>
                    <Select 
                      value={formData.design_assigned_to} 
                      onValueChange={(value) => setFormData({...formData, design_assigned_to: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select designer" />
                      </SelectTrigger>
                      <SelectContent>
                        {designers.map(designer => (
                          <SelectItem key={designer.id} value={designer.id}>
                            {designer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="design_due_date">Due Date *</Label>
                    <Input
                      id="design_due_date"
                      type="datetime-local"
                      value={formData.design_due_date}
                      onChange={(e) => setFormData({...formData, design_due_date: e.target.value})}
                    />
                  </div>
                  {!formData.package_included && (
                    <div>
                      <Label htmlFor="design_price">Price</Label>
                      <Input
                        id="design_price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.design_price}
                        onChange={(e) => setFormData({...formData, design_price: Number(e.target.value)})}
                        placeholder="0.00"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="design_description">Description</Label>
                  <Textarea
                    id="design_description"
                    value={formData.design_description}
                    onChange={(e) => setFormData({...formData, design_description: e.target.value})}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="design_extra_cost">Extra Cost</Label>
                    <Input
                      id="design_extra_cost"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.design_extra_cost}
                      onChange={(e) => setFormData({...formData, design_extra_cost: Number(e.target.value)})}
                      placeholder="0.00"
                    />
                  </div>
                  {formData.design_extra_cost > 0 && (
                    <div>
                      <Label htmlFor="design_extra_reason">Extra Cost Reason</Label>
                      <Input
                        id="design_extra_reason"
                        value={formData.design_extra_reason}
                        onChange={(e) => setFormData({...formData, design_extra_reason: e.target.value})}
                        placeholder="e.g., premium materials, rush delivery"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Total Cost Summary */}
          <Card className="bg-gray-50">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Total Workflow Cost:
                </span>
                <span className="text-2xl font-bold text-green-600">
                  {formData.package_included ? 
                    `Package + $${calculateTotalCost().toFixed(2)} extra` : 
                    `$${calculateTotalCost().toFixed(2)}`
                  }
                </span>
              </div>
              {formData.package_included && (
                <p className="text-sm text-gray-600 mt-2">
                  Main services included in client package, only extra costs shown
                </p>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Creating Workflow...' : 'Create Complete Workflow'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default WorkflowJobForm;
