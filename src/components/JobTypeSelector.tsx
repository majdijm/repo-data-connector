
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Workflow, FileText } from 'lucide-react';

interface JobTypeSelectorProps {
  jobMode: 'single' | 'workflow';
  onJobModeChange: (mode: 'single' | 'workflow') => void;
}

const JobTypeSelector: React.FC<JobTypeSelectorProps> = ({ 
  jobMode, 
  onJobModeChange 
}) => {
  const jobModeOptions = [
    {
      value: 'single' as const,
      label: 'Single Job',
      description: 'Create a standalone job',
      icon: FileText,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      value: 'workflow' as const,
      label: 'Workflow Package',
      description: 'Create a complete workflow with photo session → editing → design',
      icon: Workflow,
      color: 'bg-purple-100 text-purple-800'
    }
  ];

  const selectedOption = jobModeOptions.find(option => option.value === jobMode);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="jobMode">Job Type</Label>
        <Select value={jobMode} onValueChange={onJobModeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select job type..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Single Job
              </div>
            </SelectItem>
            <SelectItem value="workflow">
              <div className="flex items-center gap-2">
                <Workflow className="h-4 w-4" />
                Workflow Package
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedOption && (
        <Card className="border-2 border-dashed">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <selectedOption.icon className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">{selectedOption.label}</CardTitle>
              <Badge className={selectedOption.color}>
                {selectedOption.label}
              </Badge>
            </div>
            <CardDescription>{selectedOption.description}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {jobMode === 'single' && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Single Job:</strong> Create one independent job that can be assigned to any team member. 
                  Perfect for standalone tasks like individual photo sessions, design work, or video editing.
                </p>
              </div>
            )}
            {jobMode === 'workflow' && (
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-sm text-purple-800">
                  <strong>Workflow Package:</strong> Create a complete workflow with three connected jobs:
                </p>
                <ul className="text-sm text-purple-700 mt-2 space-y-1">
                  <li>1. Photo Session (Photographer)</li>
                  <li>2. Video Editing (Editor) - starts after photo session</li>
                  <li>3. Design Work (Designer) - starts after video editing</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default JobTypeSelector;
