
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, Mail, RefreshCw } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface BulkUserActionsProps {
  users: User[];
  adminEmail: string;
  onUsersUpdated: () => void;
}

const BulkUserActions = ({ users, adminEmail, onUsersUpdated }: BulkUserActionsProps) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { deleteUser } = useUsers();

  // Filter out admin users
  const nonAdminUsers = users.filter(user => 
    user.email !== adminEmail && user.role !== 'admin'
  );

  const handleBulkDelete = async () => {
    if (nonAdminUsers.length === 0) {
      toast({
        title: "No users to delete",
        description: "All remaining users are administrators",
        variant: "destructive"
      });
      return;
    }

    setIsDeleting(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const user of nonAdminUsers) {
        try {
          await deleteUser(user.id);
          successCount++;
        } catch (error) {
          console.error(`Failed to delete user ${user.email}:`, error);
          errorCount++;
        }
      }

      toast({
        title: "Bulk Delete Complete",
        description: `Successfully deleted ${successCount} users. ${errorCount > 0 ? `Failed to delete ${errorCount} users.` : ''}`,
      });

      onUsersUpdated();
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast({
        title: "Error",
        description: "Failed to complete bulk delete operation",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResendInvitations = async () => {
    if (nonAdminUsers.length === 0) {
      toast({
        title: "No users found",
        description: "No non-admin users to resend invitations to",
        variant: "destructive"
      });
      return;
    }

    setIsResending(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const user of nonAdminUsers) {
        try {
          // Generate a new password for the user
          const newPassword = Math.random().toString(36).slice(-12) + 'A1!';
          
          // Create a new auth user (this will trigger the email)
          const { error } = await supabase.auth.signUp({
            email: user.email,
            password: newPassword,
            options: {
              data: {
                name: user.name,
                role: user.role
              },
              emailRedirectTo: `${window.location.origin}/`
            }
          });

          if (error && !error.message.includes('already registered')) {
            throw error;
          }
          
          successCount++;
        } catch (error) {
          console.error(`Failed to resend invitation to ${user.email}:`, error);
          errorCount++;
        }
      }

      toast({
        title: "Invitations Sent",
        description: `Successfully sent ${successCount} invitations. ${errorCount > 0 ? `Failed to send ${errorCount} invitations.` : ''}`,
      });
    } catch (error) {
      console.error('Resend invitations error:', error);
      toast({
        title: "Error",
        description: "Failed to complete resend operation",
        variant: "destructive"
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="mt-6 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-orange-800 flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          Bulk User Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-orange-700 mb-4">
          <p className="font-medium">Found {nonAdminUsers.length} non-admin users:</p>
          <div className="mt-2 max-h-32 overflow-y-auto bg-white rounded p-2 border">
            {nonAdminUsers.map(user => (
              <div key={user.id} className="text-xs py-1">
                {user.name} ({user.email}) - {user.role}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                className="flex-1"
                disabled={isDeleting || nonAdminUsers.length === 0}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeleting ? 'Deleting...' : `Delete All Non-Admin Users (${nonAdminUsers.length})`}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-red-600">Delete All Non-Admin Users</AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <p>Are you sure you want to delete <strong>{nonAdminUsers.length} users</strong>?</p>
                  <div className="bg-red-50 p-3 rounded border border-red-200">
                    <p className="text-sm text-red-800 font-medium">⚠️ This action cannot be undone!</p>
                    <p className="text-sm text-red-700 mt-1">This will permanently delete:</p>
                    <ul className="text-sm text-red-700 mt-1 list-disc list-inside">
                      <li>All user accounts except admins</li>
                      <li>All their associated data</li>
                      <li>All their job assignments</li>
                    </ul>
                    <p className="text-sm text-red-700 mt-2 font-medium">
                      Admin users (like {adminEmail}) will be preserved.
                    </p>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleBulkDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete All Users
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button 
            variant="outline"
            className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
            onClick={handleResendInvitations}
            disabled={isResending || nonAdminUsers.length === 0}
          >
            <Mail className="w-4 h-4 mr-2" />
            {isResending ? 'Sending...' : `Resend Invitations (${nonAdminUsers.length})`}
          </Button>
        </div>

        <div className="text-xs text-orange-600 bg-orange-100 p-2 rounded">
          <p><strong>Note:</strong> The admin user ({adminEmail}) will always be preserved and is excluded from these operations.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkUserActions;
