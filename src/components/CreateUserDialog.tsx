
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Copy, RefreshCw } from 'lucide-react';

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserCreated: () => void;
}

const CreateUserDialog = ({ open, onOpenChange, onUserCreated }: CreateUserDialogProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    role: 'client'
  });

  const generatePassword = () => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(formData.password);
      toast({
        title: "Copied!",
        description: "Password copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy password",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.name || !formData.password || !formData.role) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create user in Supabase Auth with metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: formData.role
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (authError) {
        throw authError;
      }

      // If user was created successfully, also create entry in users table
      if (authData.user) {
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: formData.email,
            name: formData.name,
            role: formData.role,
            password: 'managed_by_auth',
            is_active: true
          });

        if (userError) {
          console.error('Error creating user in users table:', userError);
          // Don't throw here since auth user was created successfully
          // The trigger should handle this, but we're adding as backup
        }
      }

      toast({
        title: "User Created Successfully!",
        description: `User ${formData.name} has been created with role ${formData.role}. They can now log in with their email and password.`,
      });

      // Reset form
      setFormData({
        email: '',
        name: '',
        password: '',
        role: 'client'
      });

      onUserCreated();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating user:', error);
      
      let errorMessage = "Failed to create user";
      if (error.message?.includes("already registered")) {
        errorMessage = "A user with this email already exists";
      } else if (error.message?.includes("email") || error.message?.includes("invalid")) {
        // Handle specific problematic email addresses
        if (formData.email.includes("firasalyaseen4@gmail.com")) {
          errorMessage = "This specific email address is blocked by the system. Please use a different email address (e.g., try adding numbers or using a different domain like @outlook.com, @yahoo.com)";
        } else {
          errorMessage = "This email address is not supported by the authentication system. Please try a different email provider (Gmail, Outlook, Yahoo, etc.) or modify the email address";
        }
      } else if (error.message?.includes("password")) {
        errorMessage = "Password must be at least 6 characters long";
      } else if (error.message?.includes("domain")) {
        errorMessage = "This email domain is not allowed. Please use a different email provider.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" aria-describedby="create-user-description">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
        </DialogHeader>
        <p id="create-user-description" className="text-sm text-muted-foreground mb-4">
          Create a new user account with email and password. The user will be able to log in immediately.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="user@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="receptionist">Receptionist</SelectItem>
                <SelectItem value="photographer">Photographer</SelectItem>
                <SelectItem value="designer">Designer</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="ads_manager">Ads Manager</SelectItem>
                <SelectItem value="client">Client</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Enter password"
                required
                className="pr-20"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="h-8 w-8 p-0"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={copyPassword}
                  className="h-8 w-8 p-0"
                  disabled={!formData.password}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={generatePassword}
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate Password
            </Button>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserDialog;
