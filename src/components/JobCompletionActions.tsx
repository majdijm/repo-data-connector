
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

interface Job {
  id: string;
  title: string;
  status: string;
  assigned_to: string | null;
  type: string;
}

interface JobCompletionActionsProps {
  job: Job;
  onJobUpdated: () => void;
}

const JobCompletionActions: React.FC<JobCompletionActionsProps> = ({ job, onJobUpdated }) => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [completionNotes, setCompletionNotes] = useState('');
  const [fileLink, setFileLink] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user can complete job - must be the assigned team member
  const canCompleteJob = userProfile && 
                         job.assigned_to === userProfile.id && 
                         ['pending', 'in_progress', 'review'].includes(job.status);

  console.log('JobCompletionActions Debug:', {
    userRole: userProfile?.role,
    userId: userProfile?.id,
    jobAssignedTo: job.assigned_to,
    jobStatus: job.status,
    canCompleteJob
  });

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
      console.log('🔄 Starting job completion for job:', job.id);
      
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

      if (jobError) {
        console.error('❌ Error updating job:', jobError);
        throw jobError;
      }

      console.log('✅ Job marked as completed:', updatedJob);

      // Add completion notes if provided
      if (completionNotes.trim()) {
        console.log('💬 Adding completion notes...');
        const { error: commentError } = await supabase
          .from('job_comments')
          .insert({
            job_id: job.id,
            user_id: userProfile?.id,
            content: `Job Completed: ${completionNotes.trim()}`
          });

        if (commentError) {
          console.error('❌ Error adding completion notes:', commentError);
          throw commentError;
        }
        console.log('✅ Completion notes added successfully');
      }

      // Upload file if provided
      if (selectedFile) {
        console.log('📁 Uploading completion file:', selectedFile.name);
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `job-files/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('job-files')
          .upload(filePath, selectedFile);

        if (uploadError) {
          console.error('❌ Error uploading file:', uploadError);
          throw uploadError;
        }

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
            is_final: true
          });

        if (fileError) {
          console.error('❌ Error saving file record:', fileError);
          throw fileError;
        }
        console.log('✅ File uploaded and recorded successfully');
      }

      // Add cloud link if provided
      if (fileLink.trim()) {
        console.log('🔗 Adding cloud link...');
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

        if (linkError) {
          console.error('❌ Error adding cloud link:', linkError);
          throw linkError;
        }
        console.log('✅ Cloud link added successfully');
      }

      // Create notification for job creator/admin
      if (updatedJob.created_by && updatedJob.created_by !== userProfile?.id) {
        console.log('📬 Creating completion notification...');
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: updatedJob.created_by,
            title: 'Job Completed',
            message: `"${job.title}" has been completed by ${userProfile?.name}`,
            related_job_id: job.id
          });

        if (notificationError) {
          console.error('❌ Error creating notification:', notificationError);
        } else {
          console.log('✅ Completion notification created successfully');
        }
      }

      console.log('🎉 Job completion process finished successfully');

      toast({
        title: "Success",
        description: "Job marked as completed successfully"
      });

      // Call onJobUpdated to refresh the job list
      onJobUpdated();
      
      // Reset form
      setCompletionNotes('');
      setSelectedFile(null);
      setFileLink('');
      
    } catch (error) {
      console.error('💥 Error completing job:', error);
      toast({
        title: "Error",
        description: `Failed to complete job: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if user can't complete job
  if (!canCompleteJob) {
    console.log('🚫 JobCompletionActions: Not rendering - user cannot complete job');
    return null;
  }

  console.log('✅ JobCompletionActions: Rendering completion actions');

  return (
    <Card className="mt-4 border-2 border-green-200">
      <CardHeader className="bg-green-50">
        <CardTitle className="flex items-center gap-2 text-green-800">
          <Check className="h-5 w-5" />
          Complete Job
        </CardTitle>
        <p className="text-sm text-green-600">
          Mark this job as completed and optionally add files or notes.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div>
          <Label htmlFor="completionNotes">Completion Notes (Optional)</Label>
          <Textarea
            id="completionNotes"
            value={completionNotes}
            onChange={(e) => setCompletionNotes(e.target.value)}
            rows={3}
            placeholder="Add any notes about the completed work, deliverables, or important information..."
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
            'Processing...'
          ) : (
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              Mark Job as Completed
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default JobCompletionActions;
