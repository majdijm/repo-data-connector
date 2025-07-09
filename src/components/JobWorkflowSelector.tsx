
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useUsers } from '@/hooks/useUsers';

interface JobWorkflowSelectorProps {
  nextStep: string;
  onNextStepChange: (value: string) => void;
  selectedUserId: string;
  onSelectedUserChange: (value: string) => void;
  currentWorkflowStage?: string;
}

const JobWorkflowSelector: React.FC<JobWorkflowSelectorProps> = ({
  nextStep,
  onNextStepChange,
  selectedUserId,
  onSelectedUserChange,
  currentWorkflowStage
}) => {
  const { users } = useUsers();

  // Get available next steps based on current workflow stage
  const getAvailableSteps = () => {
    switch (currentWorkflowStage) {
      case 'photo_session':
        return [
          { value: 'editing', label: 'Send to Video Editing', needsAssignment: true },
          { value: 'design', label: 'Send to Design', needsAssignment: true },
          { value: 'handover', label: 'Complete & Deliver to Client', needsAssignment: false }
        ];
      case 'video_editing':
        return [
          { value: 'design', label: 'Send to Design', needsAssignment: true },
          { value: 'handover', label: 'Complete & Deliver to Client', needsAssignment: false }
        ];
      case 'design':
        return [
          { value: 'handover', label: 'Complete & Deliver to Client', needsAssignment: false }
        ];
      default:
        return [
          { value: 'handover', label: 'Complete & Deliver to Client', needsAssignment: false }
        ];
    }
  };

  const availableSteps = getAvailableSteps();
  const currentStep = availableSteps.find(step => step.value === nextStep);
  const needsUserSelection = currentStep?.needsAssignment && nextStep;

  // Filter users based on the selected next step
  const getFilteredUsers = () => {
    if (!nextStep) return [];

    let targetRole = '';
    switch (nextStep) {
      case 'editing':
        targetRole = 'editor';
        break;
      case 'design':
        targetRole = 'designer';
        break;
      default:
        return [];
    }

    console.log('🔍 Filtering users for step:', nextStep);
    console.log('📊 Raw users array:', users);
    console.log('📊 Users detailed breakdown:');
    
    users.forEach((user, index) => {
      console.log(`👤 User ${index + 1}:`, user);
    });

    console.log('🎯 Looking for role:', targetRole);

    const filteredUsers = users.filter(user => {
      const roleMatch = user.role === targetRole;
      const activeMatch = user.is_active === true;
      const finalMatch = roleMatch && activeMatch;
      
      console.log(`🔍 User ${user.name} (${user.email}) - Role: ${user.role}, Active: ${user.is_active}`, {
        roleMatch,
        activeMatch,
        finalMatch
      });
      
      return finalMatch;
    });

    console.log('✅ Final filtered users:', filteredUsers);
    console.log('📈 Filter summary:', {
      totalUsers: users.length,
      targetRole,
      matchingUsers: filteredUsers.length,
      userNames: filteredUsers.map(u => u.name)
    });

    return filteredUsers;
  };

  const filteredUsers = getFilteredUsers();

  console.log('✅ JobWorkflowSelector - Rendering with:', {
    totalUsers: users.length,
    availableUsers: filteredUsers.length,
    nextStep,
    selectedUserId,
    currentWorkflowStage,
    availableSteps: availableSteps.map(s => s.label)
  });

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="nextStep">What happens next?</Label>
        <Select value={nextStep} onValueChange={onNextStepChange}>
          <SelectTrigger>
            <SelectValue placeholder="Choose next step..." />
          </SelectTrigger>
          <SelectContent>
            {availableSteps.map(step => (
              <SelectItem key={step.value} value={step.value}>
                {step.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {needsUserSelection && (
        <div>
          <Label htmlFor="assignUser">
            Assign to {nextStep === 'editing' ? 'Editor' : 'Designer'}
          </Label>
          <Select value={selectedUserId} onValueChange={onSelectedUserChange}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${nextStep === 'editing' ? 'editor' : 'designer'}...`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Auto-assign (first available)</SelectItem>
              {filteredUsers.map(user => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {filteredUsers.length === 0 && (
            <p className="text-sm text-yellow-600 mt-1">
              ⚠️ No available {nextStep === 'editing' ? 'editors' : 'designers'} found. Job will be auto-assigned if possible.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default JobWorkflowSelector;
