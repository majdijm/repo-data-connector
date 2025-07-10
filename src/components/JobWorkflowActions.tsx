
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';
import { Check, ArrowRight } from 'lucide-react';

interface JobData {
  id: string;
  title: string;
  status: string;
  workflow_stage: string | null;
  workflow_order: number | null;
  assigned_to: string | null;
}

interface JobWorkflowActionsProps {
  job: JobData;
  onJobUpdated: () => void;
}

const JobWorkflowActions: React.FC<JobWorkflowActionsProps> = ({ job, onJobUpdated }) => {
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleCompleteStage = async () => {
    if (!job.workflow_stage) return;

    try {
      setIsProcessing(true);

      // Complete current stage and move to next
      const { error } = await supabase.rpc('update_job_workflow_stage', {
        job_id: job.id,
        new_stage: 'editing',
        new_assigned_to: null, // Will be assigned to an editor
        stage_notes: notes
      });

      if (error) throw error;

      toast({
        title: t('success'),
        description: t('workflowStageCompleted')
      });

      onJobUpdated();
      setNotes('');
    } catch (error) {
      console.error('Error completing workflow stage:', error);
      toast({
        title: t('error'),
        description: t('failedToCompleteStage'),
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkAsCompleted = async () => {
    try {
      setIsProcessing(true);

      const { error } = await supabase
        .from('jobs')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', job.id);

      if (error) throw error;

      toast({
        title: t('success'),
        description: t('jobMarkedAsCompleted')
      });

      onJobUpdated();
    } catch (error) {
      console.error('Error marking job as completed:', error);
      toast({
        title: t('error'),
        description: t('failedToMarkAsCompleted'),
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!job.workflow_stage) {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
      <CardHeader>
        <CardTitle className="text-blue-700 dark:text-blue-300">
          {t('workflowActions')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="stage-notes">{t('stageNotes')}</Label>
          <Textarea
            id="stage-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('addNotesForNextStage')}
            className="mt-1"
          />
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={handleCompleteStage}
            disabled={isProcessing}
            className="flex items-center gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            {t('moveToNextStage')}
          </Button>

          <Button
            onClick={handleMarkAsCompleted}
            disabled={isProcessing}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            {t('markAsCompleted')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobWorkflowActions;
