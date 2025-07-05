
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface NextStepOption {
  value: string;
  label: string;
  color: string;
  description: string;
}

interface JobWorkflowSelectorProps {
  nextStep: string;
  onNextStepChange: (value: string) => void;
}

const JobWorkflowSelector: React.FC<JobWorkflowSelectorProps> = ({ 
  nextStep, 
  onNextStepChange 
}) => {
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
      description: 'Will be assigned to an available editor'
    },
    { 
      value: 'design', 
      label: 'Needs Design Work', 
      color: 'bg-purple-100 text-purple-800',
      description: 'Will be assigned to an available designer'
    }
  ];

  const getSelectedOption = () => nextStepOptions.find(option => option.value === nextStep);

  return (
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
  );
};

export default JobWorkflowSelector;
