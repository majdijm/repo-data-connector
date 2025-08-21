
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, CheckCircle, User } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import JobWorkflowActions from '@/components/JobWorkflowActions';

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
  clients?: {
    name: string;
    email: string;
  };
}

const JobDetails = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const { canViewJobs } = useRoleAccess();

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId || typeof jobId !== 'string') {
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('jobs')
          .select(`
            *,
            clients (
              name,
              email
            )
          `)
          .eq('id', jobId)
          .single();

        if (error) {
          console.error('Error fetching job:', error);
          toast({
            title: 'Error',
            description: 'Failed to fetch job details',
            variant: 'destructive',
          });
        }

        setJob(data);
      } catch (error) {
        console.error('Error fetching job:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch job details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  const refetchJob = async () => {
    if (!jobId || typeof jobId !== 'string') {
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          clients (
            name,
            email
          )
        `)
        .eq('id', jobId)
        .single();

      if (error) {
        console.error('Error fetching job:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch job details',
          variant: 'destructive',
        });
      }

      setJob(data);
    } catch (error) {
      console.error('Error fetching job:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch job details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!canViewJobs()) {
    return (
      <div className="flex justify-center items-center h-64">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground">You do not have permission to view this job.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!job) {
    return (
      <div className="flex justify-center items-center h-64">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground">Job not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'photo_session': return 'Photo Session';
      case 'video_editing': return 'Video Editing';
      case 'design': return 'Design';
      default: return type;
    }
  };

  return (
    <div className="container mx-auto p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{job.title}</h1>
        <Button onClick={() => navigate(-1)}>Back to Jobs</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <Badge className={getStatusColor(job.status)}>
                {job.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Type:</span>
              <Badge variant="secondary">{getTypeLabel(job.type)}</Badge>
            </div>

            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-gray-500" />
              <span>Due Date: {format(new Date(job.due_date), 'PPP')}</span>
            </div>

            {job.session_date && (
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-gray-500" />
                <span>Session Date: {format(new Date(job.session_date), 'PPP')}</span>
              </div>
            )}

            {job.clients && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span>Client: {job.clients.name} ({job.clients.email})</span>
              </div>
            )}

            {job.assigned_to && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span>Assigned To: {job.assigned_to}</span>
              </div>
            )}

            {job.description && (
              <div>
                <span className="text-sm font-medium">Description:</span>
                <p className="text-gray-600">{job.description}</p>
              </div>
            )}

            {job.price && (
              <div>
                <span className="text-sm font-medium">Price:</span>
                <p className="text-gray-600">${job.price}</p>
              </div>
            )}
          </CardContent>
        </Card>

        
              <JobWorkflowActions 
                job={job} 
                onJobUpdate={refetchJob}
              />
      </div>
    </div>
  );
};

export default JobDetails;
