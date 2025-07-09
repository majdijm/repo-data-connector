
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

  console.log('🔍 JobWorkflowSelector - Component State:', {
    nextStep,
    selectedUserId,
    usersHookState: {
      users,
      isLoading,
      error,
      totalUsers: users.length
    }
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
    if (!nextStep || nextStep === 'handover') {
      console.log('🚫 No filtering needed - handover or no step selected');
      return [];
    }
    
    console.log('🔍 Filtering users for step:', nextStep);
    console.log('📊 Raw users array:', users);
    console.log('📊 Users detailed breakdown:');
    
    users.forEach((user, index) => {
      console.log(`👤 User ${index + 1}:`, {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        is_active: user.is_active,
        roleMatch: user.role === (nextStep === 'editing' ? 'editor' : 'designer'),
        activeMatch: user.is_active === true,
        bothMatch: user.role === (nextStep === 'editing' ? 'editor' : 'designer') && user.is_active === true
      });
    });
    
    const roleFilter = nextStep === 'editing' ? 'editor' : 'designer';
    console.log('🎯 Looking for role:', roleFilter);
    
    const filteredUsers = users.filter(user => {
      const roleMatch = user.role === roleFilter;
      const activeMatch = user.is_active === true;
      const matches = roleMatch && activeMatch;
      
      console.log(`🔍 User ${user.name} (${user.email}) - Role: ${user.role}, Active: ${user.is_active}`, {
        roleMatch,
        activeMatch,
        finalMatch: matches
      });
      
      return matches;
    });
    
    console.log('✅ Final filtered users:', filteredUsers);
    console.log('📈 Filter summary:', {
      totalUsers: users.length,
      targetRole: roleFilter,
      matchingUsers: filteredUsers.length,
      userNames: filteredUsers.map(u => u.name)
    });
    
    return filteredUsers;
  };

  const availableUsers = getAvailableUsers();

  // Log the specific target user we're looking for
  React.useEffect(() => {
    const targetUser = users.find(u => u.email === 'quranlight2019@gmail.com');
    if (targetUser) {
      console.log('🎯 TARGET USER FOUND:', {
        email: targetUser.email,
        name: targetUser.name,
        role: targetUser.role,
        is_active: targetUser.is_active,
        id: targetUser.id,
        shouldAppearInEditing: targetUser.role === 'editor' && targetUser.is_active === true
      });
    } else {
      console.log('❌ TARGET USER NOT FOUND in users array');
    }
  }, [users]);

  if (isLoading) {
    console.log('⏳ JobWorkflowSelector - Loading users...');
    return <div className="text-sm text-gray-500">Loading users...</div>;
  }

  if (error) {
    console.error('💥 JobWorkflowSelector - Error:', error);
    return (
      <div className="text-sm text-red-500">
        <p>Error loading users: {error}</p>
        <p className="text-xs mt-1">Check console for detailed logs</p>
      </div>
    );
  }

  console.log('✅ JobWorkflowSelector - Rendering with:', {
    totalUsers: users.length,
    availableUsers: availableUsers.length,
    nextStep,
    selectedUserId
  });

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
          
          {/* Enhanced Debug Information */}
          <div className="mt-2 p-3 bg-gray-50 rounded text-xs space-y-1">
            <p><strong>🔍 Debug Info:</strong></p>
            <p>Total users loaded: <strong>{users.length}</strong></p>
            <p>Looking for role: <strong>{nextStep === 'editing' ? 'editor' : 'designer'}</strong></p>
            <p>Available {nextStep === 'editing' ? 'editors' : 'designers'}: <strong>{availableUsers.length}</strong></p>
            
            {/* Show target user status */}
            {(() => {
              const targetUser = users.find(u => u.email === 'quranlight2019@gmail.com');
              return targetUser ? (
                <div className="mt-2 p-2 bg-blue-50 rounded">
                  <p><strong>🎯 Target User (quranlight2019@gmail.com):</strong></p>
                  <p>• Name: {targetUser.name}</p>
                  <p>• Role: {targetUser.role}</p>
                  <p>• Active: {targetUser.is_active ? 'Yes' : 'No'}</p>
                  <p>• Should appear: {targetUser.role === 'editor' && targetUser.is_active ? '✅ Yes' : '❌ No'}</p>
                </div>
              ) : (
                <div className="mt-2 p-2 bg-red-50 rounded">
                  <p><strong>❌ Target User (quranlight2019@gmail.com) not found in users array</strong></p>
                </div>
              );
            })()}
            
            {availableUsers.length === 0 && (
              <p className="text-red-600 mt-1 font-semibold">
                ⚠️ No active {nextStep === 'editing' ? 'editors' : 'designers'} found
              </p>
            )}
            
            {availableUsers.length > 0 && (
              <div className="mt-2">
                <p><strong>Available users:</strong></p>
                {availableUsers.map(user => (
                  <p key={user.id} className="ml-2">• {user.name} ({user.email})</p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobWorkflowSelector;
