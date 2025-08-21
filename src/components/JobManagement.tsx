import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { JobForm } from './JobForm';
import { JobCard } from './JobCard';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Job {
  id: string;
  title: string;
  type: string;
  status: string;
  assigned_to?: string;
  due_date: string;
  session_date?: string;
  price?: number;
  client_id: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export const JobManagement = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const { jobs, loading, refetch } = useSupabaseData();
  const { canManageJobs, isLoading } = useRoleAccess();

  const filteredJobs = jobs.filter(job => {
    if (!filterStatus || filterStatus.trim() === '') return true;
    return job.status === filterStatus;
  });

  const handleUpdateJob = async (jobId: string, updates: any) => {
    try {
      console.log(`Updating job ${jobId} with`, updates);
      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', jobId)
        .select();

      if (error) {
        console.error('Error updating job:', error);
        toast({
          title: 'Error',
          description: 'Failed to update job',
          variant: 'destructive',
        });
      } else {
        console.log('Job updated successfully:', data);
        toast({
          title: 'Success',
          description: 'Job updated successfully',
        });
        refetch();
      }
    } catch (error) {
      console.error('Error updating job:', error);
      toast({
        title: 'Error',
        description: 'Failed to update job',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      console.log('Deleting job with ID:', jobId);
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) {
        console.error('Error deleting job:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete job',
          variant: 'destructive',
        });
      } else {
        console.log('Job deleted successfully');
        toast({
          title: 'Success',
          description: 'Job deleted successfully',
        });
        refetch();
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete job',
        variant: 'destructive',
      });
    }
  };

  const validStatusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'delivered', label: 'Delivered' }
  ].filter(option => option.value && option.value.trim() !== '');

  if (loading || isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Job Management</h2>
        {canManageJobs() && (
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Job
          </Button>
        )}
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <Label htmlFor="status-filter">Filter by Status</Label>
          <Select value={filterStatus || 'all'} onValueChange={(value) => setFilterStatus(value === 'all' ? '' : value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select status..." />
            </SelectTrigger>
            <SelectContent>
              {validStatusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Job</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowCreateForm(false)}
              className="w-fit"
            >
              Cancel
            </Button>
          </CardHeader>
          <CardContent>
            <JobForm onJobAdded={() => {
              setShowCreateForm(false);
              refetch();
            }} />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground">No jobs found</p>
            </CardContent>
          </Card>
        ) : (
          filteredJobs.map((job) => (
            <JobCard 
              key={job.id} 
              job={job} 
              onUpdate={refetch}
              onDelete={handleDeleteJob}
            />
          ))
        )}
      </div>
    </div>
  );
};
