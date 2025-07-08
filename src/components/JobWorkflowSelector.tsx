
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useUsers } from '@/hooks/useUsers';

interface NextStepOption {
  value: string;
  label: string;
  color: string;
  description: string;
}

interface JobWorkflowSelectorProps {
  nextStep: string;
  onNextStepChange: (value: string) => void;
  selectedUserId?: string;
  onSelectedUserChange?: (userId: string) => void;
}

const JobWorkflowSelector: React.FC<JobWorkflowSelectorProps> = ({ 
  nextStep, 
  onNextStepChange,
  selectedUserId,
  onSelectedUserChange
}) => {
  const { users, isLoading, error } = useUsers();

  console.log('JobWorkflowSelector Debug:', {
    users,
    isLoading,
    error,
    nextStep,
    selectedUserId,
    totalUsers: users.length
  });

  const nextStepOptions: NextStepOption[] = [
    { 
      value: 'handover', 
      label: 'Ready for Client Handover', 
      color: 'bg-green-100 text-green-800',
      description: 'Job will be marked as completed and ready for client delivery'
    },
    { 
      value: 'editing', 
      label: 'Needs Video Editing', 
      color: 'bg-blue-100 text-blue-800',
      description: 'Will be assigned to a selected editor'
    },
    { 
      value: 'design', 
      label: 'Needs Design Work', 
      color: 'bg-purple-100 text-purple-800',
      description: 'Will be assigned to a selected designer'
    }
  ];

  const getSelectedOption = () => nextStepOptions.find(option => option.value === nextStep);
  
  // Get available users based on selected next step
  const getAvailableUsers = () => {
    if (!nextStep || nextStep === 'handover') return [];
    
    console.log('Getting available users for step:', nextStep);
    console.log('All users:', users);
    console.log('User roles breakdown:', users.map(u => ({ name: u.name, role: u.role, active: u.is_active })));
    
    const roleFilter = nextStep === 'editing' ? 'editor' : 'designer';
    const filteredUsers = users.filter(user => {
      const matches = user.role === roleFilter && user.is_active;
      console.log(`User ${user.name} (${user.role}) - matches ${roleFilter}:`, matches);
      return matches;
    });
    
    console.log('Filtered users for', roleFilter, ':', filteredUsers);
    return filteredUsers;
  };

  const availableUsers = getAvailableUsers();

  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading users...</div>;
  }

  if (error) {
    console.error('Error in JobWorkflowSelector:', error);
    return (
      <div className="text-sm text-red-500">
        <p>Error loading users: {error}</p>
        <p className="text-xs mt-1">Please check console for details</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="nextStep">What's the next step for this job?</Label>
        <Select value={nextStep} onValueChange={onNextStepChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select next step..." />
          </SelectTrigger>
          <SelectContent>
            {nextStepOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {nextStep && (
          <div className="mt-2">
            <Badge className={getSelectedOption()?.color}>
              {getSelectedOption()?.label}
            </Badge>
            <p className="text-sm text-gray-600 mt-1">
              {getSelectedOption()?.description}
            </p>
          </div>
        )}
      </div>

      {/* User Selection for editing/design steps */}
      {(nextStep === 'editing' || nextStep === 'design') && (
        <div>
          <Label htmlFor="assignUser">
            Assign to {nextStep === 'editing' ? 'Editor' : 'Designer'}
          </Label>
          <Select 
            value={selectedUserId || 'auto-assign'} 
            onValueChange={(value) => onSelectedUserChange?.(value === 'auto-assign' ? '' : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${nextStep === 'editing' ? 'editor' : 'designer'}...`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto-assign">Auto-assign to available {nextStep === 'editing' ? 'editor' : 'designer'}</SelectItem>
              {availableUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Debug information */}
          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
            <p><strong>Debug Info:</strong></p>
            <p>Total users loaded: {users.length}</p>
            <p>Looking for role: {nextStep === 'editing' ? 'editor' : 'designer'}</p>
            <p>Available {nextStep === 'editing' ? 'editors' : 'designers'}: {availableUsers.length}</p>
            {availableUsers.length === 0 && (
              <p className="text-red-600 mt-1">
                No active {nextStep === 'editing' ? 'editors' : 'designers'} found in the system
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobWorkflowSelector;
