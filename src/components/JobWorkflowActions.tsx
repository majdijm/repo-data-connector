
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Upload, Link as LinkIcon, MessageSquare } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  status: string;
  next_step: string | null;
  photographer_notes: string | null;
  assigned_to: string | null;
}

interface JobWorkflowActionsProps {
  job: Job;
  onJobUpdated: () => void;
}

const JobWorkflowActions: React.FC<JobWorkflowActionsProps> = ({ job, onJobUpdated }) => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [nextStep, setNextStep] = useState(job.next_step || '');
  const [photographerNotes, setPhotographerNotes] = useState(job.photographer_notes || '');
  const [fileLink, setFileLink] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isPhotographer = userProfile?.role === 'photographer' && job.assigned_to === userProfile.id;
  const canUpdateWorkflow = isPhotographer && job.status === 'in_progress';

  const updateJobWorkflow = async () => {
    if (!canUpdateWorkflow) return;

    setIsLoading(true);
    try {
      // Update job with next step and photographer notes
      const { error: jobError } = await supabase
        .from('jobs')
        .update({
          next_step: nextStep,
          photographer_notes: photographerNotes,
          status: nextStep === 'handover' ? 'completed' : 'review'
        })
        .eq('id', job.id);

      if (jobError) throw jobError;

      // Upload file if provided
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `job-files/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('job-files')
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        // Save file record
        const { error: fileError } = await supabase
          .from('job_files')
          .insert({
            job_id: job.id,
            file_name: selectedFile.name,
            file_path: filePath,
            file_type: selectedFile.type,
            file_size: selectedFile.size,
            uploaded_by: userProfile?.id,
            is_final: nextStep === 'handover'
          });

        if (fileError) throw fileError;
      }

      // Add cloud link if provided
      if (fileLink.trim()) {
        const { error: linkError } = await supabase
          .from('job_files')
          .insert({
            job_id: job.id,
            file_name: 'Cloud Link',
            file_path: fileLink,
            file_type: 'link',
            file_size: 0,
            uploaded_by: userProfile?.id,
            is_cloud_link: true,
            cloud_link: fileLink,
            is_final: nextStep === 'handover'
          });

        if (linkError) throw linkError;
      }

      toast({
        title: "Success",
        description: `Job updated - Next step: ${nextStep}`
      });

      onJobUpdated();
      
      // Reset form
      setSelectedFile(null);
      setFileLink('');
    } catch (error) {
      console.error('Error updating job workflow:', error);
      toast({
        title: "Error",
        description: "Failed to update job workflow",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!canUpdateWorkflow) {
    return null;
  }

  const getNextStepColor = (step: string) => {
    const colors = {
      handover: 'bg-green-100 text-green-800',
      editing: 'bg-blue-100 text-blue-800',
      design: 'bg-purple-100 text-purple-800',
    };
    return colors[step as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRight className="h-5 w-5" />
          Photographer Workflow Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="nextStep">Next Step</Label>
          <Select value={nextStep} onValueChange={setNextStep}>
            <SelectTrigger>
              <SelectValue placeholder="Select next step" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="handover">Ready for Client Handover</SelectItem>
              <SelectItem value="editing">Needs Video Editing</SelectItem>
              <SelectItem value="design">Needs Design Work</SelectItem>
            </SelectContent>
          </Select>
          {nextStep && (
            <Badge className={`mt-2 ${getNextStepColor(nextStep)}`}>
              {nextStep === 'handover' && 'Will be marked as completed'}
              {nextStep === 'editing' && 'Will be assigned to editor'}
              {nextStep === 'design' && 'Will be assigned to designer'}
            </Badge>
          )}
        </div>

        <div>
          <Label htmlFor="photographerNotes">Photographer Notes</Label>
          <Textarea
            id="photographerNotes"
            value={photographerNotes}
            onChange={(e) => setPhotographerNotes(e.target.value)}
            rows={3}
            placeholder="Add notes about the job progress, issues, or instructions for next steps..."
          />
        </div>

        <div className="space-y-3">
          <Label>Attach Files or Links</Label>
          
          <div>
            <Label htmlFor="file" className="text-sm">Upload File</Label>
            <Input
              id="file"
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              accept="image/*,video/*,.pdf,.doc,.docx"
            />
            {selectedFile && (
              <p className="text-sm text-gray-600 mt-1">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="fileLink" className="text-sm">Cloud Drive Link</Label>
            <Input
              id="fileLink"
              value={fileLink}
              onChange={(e) => setFileLink(e.target.value)}
              placeholder="https://drive.google.com/... or https://dropbox.com/..."
            />
          </div>
        </div>

        <Button 
          onClick={updateJobWorkflow} 
          disabled={!nextStep || isLoading}
          className="w-full"
        >
          {isLoading ? 'Updating...' : `Update Job - Next: ${nextStep || 'Select Step'}`}
        </Button>
      </CardContent>
    </Card>
  );
};

export default JobWorkflowActions;
