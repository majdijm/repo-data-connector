
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Workflow, FileText } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface JobTypeSelectorProps {
  jobMode: 'single' | 'workflow';
  onJobModeChange: (mode: 'single' | 'workflow') => void;
}

const JobTypeSelector: React.FC<JobTypeSelectorProps> = ({ 
  jobMode, 
  onJobModeChange 
}) => {
  const { t } = useTranslation();

  const jobModeOptions = [
    {
      value: 'single' as const,
      label: t('singleJob'),
      description: t('createStandaloneJob'),
      icon: FileText,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      value: 'workflow' as const,
      label: t('workflowPackage'),
      description: t('createCompleteWorkflow'),
      icon: Workflow,
      color: 'bg-purple-100 text-purple-800'
    }
  ];

  const selectedOption = jobModeOptions.find(option => option.value === jobMode);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="jobMode">{t('jobType')}</Label>
        <Select value={jobMode} onValueChange={onJobModeChange}>
          <SelectTrigger>
            <SelectValue placeholder={t('selectJobType')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {t('singleJob')}
              </div>
            </SelectItem>
            <SelectItem value="workflow">
              <div className="flex items-center gap-2">
                <Workflow className="h-4 w-4" />
                {t('workflowPackage')}
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
                  <strong>{t('singleJob')}:</strong> {t('createStandaloneJob')}
                </p>
              </div>
            )}
            {jobMode === 'workflow' && (
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-sm text-purple-800">
                  <strong>{t('workflowPackage')}:</strong> {t('createCompleteWorkflow')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default JobTypeSelector;
