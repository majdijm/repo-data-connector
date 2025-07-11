
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Check, Upload } from 'lucide-react';
import JobFileUploadSection from './JobFileUploadSection';

interface JobData {
  id: string;
  title: string;
  status: string;
  assigned_to: string | null;
  type: string;
  client_id: string;
}

interface JobCompletionActionsProps {
  job: JobData;
  onJobUpdated: () => void;
}

const JobCompletionActions: React.FC<JobCompletionActionsProps> = ({ job, onJobUpdated }) => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [completionNotes, setCompletionNotes] = useState('');
  const [fileLink, setFileLink] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const canCompleteJob = userProfile && 
                         job.assigned_to === userProfile.id && 
                         ['pending', 'in_progress', 'review'].includes(job.status);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const handleJobCompletion = async () => {
    if (!canCompleteJob) {
      toast({
        title: "Error",
        description: "You don't have permission to complete this job",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Update job status to completed
      const { data: updatedJob, error: jobError } = await supabase
        .from('jobs')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', job.id)
        .select()
        .single();

      if (jobError) throw jobError;

      // Add completion notes if provided
      if (completionNotes.trim()) {
        const { error: commentError } = await supabase
          .from('job_comments')
          .insert({
            job_id: job.id,
            user_id: userProfile?.id,
            content: `Job Completed: ${completionNotes.trim()}`
          });

        if (commentError) throw commentError;
      }

      // Upload file if provided
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `job-files/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('job-files')
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const { error: fileError } = await supabase
          .from('job_files')
          .insert({
            job_id: job.id,
            file_name: selectedFile.name,
            file_path: filePath,
            file_type: selectedFile.type,
            file_size: selectedFile.size,
            uploaded_by: userProfile?.id,
            is_final: true
          });

        if (fileError) throw fileError;
      }

      // Add cloud link if provided
      if (fileLink.trim()) {
        const { error: linkError } = await supabase
          .from('job_files')
          .insert({
            job_id: job.id,
            file_name: 'Completion Files - Cloud Link',
            file_path: fileLink,
            file_type: 'link',
            file_size: 0,
            uploaded_by: userProfile?.id,
            is_cloud_link: true,
            cloud_link: fileLink,
            is_final: true
          });

        if (linkError) throw linkError;
      }

      // Notify client about job completion
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('email, name')
        .eq('id', job.client_id)
        .single();

      if (!clientError && clientData) {
        // Find client user ID
        const { data: clientUser, error: clientUserError } = await supabase
          .from('users')
          .select('id')
          .eq('email', clientData.email)
          .eq('role', 'client')
          .single();

        if (!clientUserError && clientUser) {
          await supabase
            .from('notifications')
            .insert({
              user_id: clientUser.id,
              title: 'Job Completed',
              message: `Great news! Your job "${job.title}" has been completed and is ready for review. ${selectedFile || fileLink ? 'Final files are now available.' : ''}`,
              related_job_id: job.id
            });
        }
      }

      // Notify admins/receptionists
      const { data: adminUsers, error: adminError } = await supabase
        .from('users')
        .select('id')
        .in('role', ['admin', 'receptionist'])
        .eq('is_active', true);

      if (!adminError && adminUsers) {
        const adminNotifications = adminUsers.map(user => ({
          user_id: user.id,
          title: 'Job Completed',
          message: `${userProfile?.name} has completed job "${job.title}" for ${clientData?.name}`,
          related_job_id: job.id
        }));

        await supabase
          .from('notifications')
          .insert(adminNotifications);
      }

      toast({
        title: "Success",
        description: "Job completed successfully and client has been notified"
      });

      onJobUpdated();
      setCompletionNotes('');
      setFileLink('');
      setSelectedFile(null);
    } catch (error) {
      console.error('Error completing job:', error);
      toast({
        title: "Error",
        description: "Failed to complete job",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!canCompleteJob) {
    return null;
  }

  return (
    <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30">
      <CardHeader>
        <CardTitle className="text-green-700 dark:text-green-300 flex items-center gap-2">
          <Check className="h-5 w-5" />
          Complete Job
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="completion-notes">Completion Notes (Optional)</Label>
          <Textarea
            id="completion-notes"
            value={completionNotes}
            onChange={(e) => setCompletionNotes(e.target.value)}
            placeholder="Add any notes about the completed work..."
            className="mt-1"
          />
        </div>

        <JobFileUploadSection
          selectedFile={selectedFile}
          fileLink={fileLink}
          onFileChange={handleFileChange}
          onFileLinkChange={setFileLink}
          onRemoveFile={removeFile}
        />

        <Button
          onClick={handleJobCompletion}
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Completing Job...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Mark as Completed
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default JobCompletionActions;
