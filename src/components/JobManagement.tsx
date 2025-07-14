import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/lib/i18n';
import { 
  Plus, 
  Calendar, 
  User, 
  DollarSign, 
  AlertCircle,
  Camera,
  Palette,
  Video,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import JobForm from './JobForm';
import JobComments from './JobComments';
import JobWorkflowActions from './JobWorkflowActions';
import JobCompletionActions from './JobCompletionActions';
import FileUpload from './FileUpload';
import JobFilesDisplay from './JobFilesDisplay';

interface WorkflowHistoryEntry {
  previous_stage?: string;
  new_stage?: string;
  transitioned_at?: string;
  notes?: string;
  transitioned_by?: string;
}

interface JobData {
  id: string;
  title: string;
  type: string;
  status: string;
  client_id: string;
  assigned_to: string | null;
  due_date: string | null;
  price: number;
  description: string | null;
  created_at: string;
  updated_at: string;
  package_included: boolean | null;
  extra_cost: number | null;
  extra_cost_reason: string | null;
  workflow_stage: string | null;
  workflow_order: number | null;
  depends_on_job_id: string | null;
  created_by: string | null;
  workflow_history?: WorkflowHistoryEntry[] | null;
  clients?: {
    name: string;
    email: string;
  };
  users?: {
    name: string;
  } | null;
}

interface Client {
  id: string;
  name: string;
  email: string;
}

interface User {
  id: string;
  name: string;
  role: string;
}

const JobManagement = () => {
  const { userProfile, user } = useAuth();
  const roleAccess = useRoleAccess();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobData | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());
  
  const fetchingRef = useRef(false);
  const hasInitializedRef = useRef(false);

  const canViewJobsValue = useMemo(() => roleAccess.canViewJobs(), [roleAccess]);
  const canManageJobsValue = useMemo(() => roleAccess.canManageJobs(), [roleAccess]);
  const isTeamMemberValue = useMemo(() => roleAccess.isTeamMember(), [roleAccess]);

  useEffect(() => {
    if (!hasInitializedRef.current && canViewJobsValue && userProfile && user) {
      hasInitializedRef.current = true;
      fetchJobs();
      if (canManageJobsValue) {
        fetchClients();
        fetchUsers();
      }
    }
  }, [canViewJobsValue, canManageJobsValue, userProfile?.id, user?.id]);

  const fetchJobs = async () => {
    if (fetchingRef.current) {
      console.log('Fetch already in progress, skipping...');
      return;
    }

    try {
      fetchingRef.current = true;
      setIsLoading(true);
      console.log('🔍 Starting to fetch jobs...');
      console.log('🔍 User profile:', userProfile);
      console.log('🔍 Auth user:', user);
      console.log('🔍 User role access:', { canViewJobs: canViewJobsValue, isTeamMember: isTeamMemberValue });
      
      let jobsQuery = supabase.from('jobs').select('*');

      if (isTeamMemberValue && user?.id) {
        console.log('🔍 Team member view - getting jobs assigned to user OR jobs they worked on');
        
        // For team members, get jobs assigned to them OR jobs they have worked on
        jobsQuery = jobsQuery.or(`assigned_to.eq.${user.id},workflow_history.cs.[{"transitioned_by": "${user.id}"}]`);
      } else {
        console.log('🔍 Admin/receptionist view - getting all jobs');
      }

      jobsQuery = jobsQuery.order('created_at', { ascending: false });

      console.log('🔍 Executing jobs query...');
      const { data: jobsData, error: jobsError } = await jobsQuery;

      if (jobsError) {
        console.error('❌ Jobs query error:', jobsError);
        toast({
          title: t('error'),
          description: `${t('failedToFetchJobs')}: ${jobsError.message}`,
          variant: "destructive"
        });
        throw jobsError;
      }
      
      console.log('🔍 Raw jobs data:', jobsData);
      console.log('🔍 Jobs found:', jobsData?.length || 0);

      if (!jobsData || jobsData.length === 0) {
        console.log('🔍 No jobs found for user');
        setJobs([]);
        return;
      }

      // Get clients data separately
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('id, name, email');

      if (clientsError) {
        console.error('❌ Clients query error:', clientsError);
        console.warn('Continuing without client data');
      }

      // Get users data separately  
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, name');

      if (usersError) {
        console.error('❌ Users query error:', usersError);
        console.warn('Continuing without user data');
      }

      // Transform and combine the data
      const transformedJobs = jobsData.map(job => {
        const client = clientsData?.find(c => c.id === job.client_id);
        const assignedUser = usersData?.find(u => u.id === job.assigned_to);
        
        return {
          ...job,
          clients: client ? { name: client.name, email: client.email } : undefined,
          users: assignedUser ? { name: assignedUser.name } : null
        };
      }) as JobData[];
      
      console.log('🔍 Final transformed jobs:', transformedJobs);
      setJobs(transformedJobs);
      
      toast({
        title: t('success'),
        description: `${t('loaded')} ${transformedJobs.length} ${t('jobsCount')}`
      });
      
    } catch (error) {
      console.error('💥 Error fetching jobs:', error);
      toast({
        title: t('error'),
        description: `${t('failedToFetchJobs')}: ${error instanceof Error ? error.message : t('unknownError')}`,
        variant: "destructive"
      });
      setJobs([]);
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, email')
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, role')
        .eq('is_active', true)
        .in('role', ['photographer', 'designer', 'editor'])
        .order('name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleJobCreated = () => {
    fetchJobs();
    setIsCreateDialogOpen(false);
  };

  const handleJobUpdated = () => {
    fetchJobs();
    setIsEditDialogOpen(false);
    setSelectedJob(null);
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm(t('confirmDeleteJob'))) return;

    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;

      toast({
        title: t('success'),
        description: t('jobDeletedSuccessfully')
      });
      fetchJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
      toast({
        title: t('error'),
        description: t('failedToDeleteJob'),
        variant: "destructive"
      });
    }
  };

  const updateJobStatus = async (jobId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', jobId);

      if (error) throw error;

      toast({
        title: t('success'),
        description: t('jobStatusUpdatedSuccessfully')
      });
      fetchJobs();
    } catch (error) {
      console.error('Error updating job status:', error);
      toast({
        title: t('error'),
        description: t('failedToUpdateJobStatus'),
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'review': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'delivered': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'photo_session': return <Camera className="h-4 w-4" />;
      case 'video_editing': return <Video className="h-4 w-4" />;
      case 'design': return <Palette className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const toggleJobExpansion = (jobId: string) => {
    const newExpanded = new Set(expandedJobs);
    if (newExpanded.has(jobId)) {
      newExpanded.delete(jobId);
    } else {
      newExpanded.add(jobId);
    }
    setExpandedJobs(newExpanded);
  };

  const getStatusTranslationKey = (status: string): TranslationKey => {
    const statusMap: Record<string, TranslationKey> = {
      'pending': 'pending',
      'in_progress': 'in_progress',
      'review': 'review',
      'completed': 'completed',
      'delivered': 'delivered'
    };
    return statusMap[status] || 'unknown';
  };

  if (!canViewJobsValue) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">{t('noPermissionToViewJobs')}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 rtl:mr-2 rtl:ml-0">{t('loadingJobs')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          {isTeamMemberValue ? t('myJobs') : t('jobManagement')}
        </h2>
        {canManageJobsValue && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl transition-all duration-300">
                <Plus className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                {t('createJob')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('createNewJob')}</DialogTitle>
              </DialogHeader>
              <JobForm onJobAdded={handleJobCreated} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {jobs.length === 0 ? (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card via-card/50 to-muted/30">
          <CardContent className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-full flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-primary" />
            </div>
            <p className="text-muted-foreground text-lg">
              {isTeamMemberValue ? t('noJobsAssignedYet') : t('noJobsCreatedYet')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            // Check if this is a workflow job and determine user's involvement
            const isWorkflowJob = job.workflow_history && Array.isArray(job.workflow_history) && job.workflow_history.length > 0;
            const userWorkedOnJob = isWorkflowJob && job.workflow_history.some((entry: WorkflowHistoryEntry) => entry.transitioned_by === user?.id);
            const isCurrentlyAssigned = job.assigned_to === user?.id;

            return (
              <Card key={job.id} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card via-card/80 to-muted/20">
                <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-purple-600/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div className="p-2 bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-lg">
                        {getTypeIcon(job.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">{job.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {t('client')}: {job.clients?.name || t('unknown')}
                        </p>
                        {isWorkflowJob && (
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-purple-600 dark:text-purple-400">
                              Workflow Job
                            </p>
                            {userWorkedOnJob && !isCurrentlyAssigned && (
                              <Badge variant="outline" className="text-xs text-green-700 border-green-300">
                                Previously worked on
                              </Badge>
                            )}
                            {isCurrentlyAssigned && (
                              <Badge variant="default" className="text-xs">
                                Currently assigned
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Badge className={getStatusColor(job.status)}>
                        {t(getStatusTranslationKey(job.status))}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleJobExpansion(job.id)}
                        className="hover:bg-primary/10"
                      >
                        {expandedJobs.has(job.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {expandedJobs.has(job.id) && (
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-3 rounded-lg">
                        <User className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">
                          {t('assigned')}: {job.users?.name || t('unassigned')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-3 rounded-lg">
                        <Calendar className="h-4 w-4 text-green-600" />
                        <span className="text-sm">
                          {t('due')}: {job.due_date ? new Date(job.due_date).toLocaleDateString() : t('noDueDate')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 p-3 rounded-lg">
                        <DollarSign className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm">
                          {t('price')}: ${job.price}
                        </span>
                      </div>
                    </div>

                    {job.description && (
                      <div className="mb-4 p-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg">
                        <h4 className="font-semibold mb-2 text-primary">{t('description')}</h4>
                        <p className="text-sm text-muted-foreground">{job.description}</p>
                      </div>
                    )}

                    {/* Workflow History Display */}
                    {isWorkflowJob && job.workflow_history && job.workflow_history.length > 0 && (
                      <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-lg">
                        <h4 className="font-semibold mb-2 text-purple-700 dark:text-purple-300">Workflow History</h4>
                        <div className="space-y-2">
                          {job.workflow_history.map((entry: WorkflowHistoryEntry, index: number) => (
                            <div key={index} className="text-sm border-l-2 border-purple-300 pl-3">
                              <div className="font-medium">
                                {entry.previous_stage?.replace('_', ' ')} → {entry.new_stage?.replace('_', ' ')}
                              </div>
                              <div className="text-gray-600 text-xs">
                                {entry.transitioned_at && new Date(entry.transitioned_at).toLocaleString()}
                              </div>
                              {entry.notes && (
                                <div className="text-gray-700 text-xs mt-1">
                                  Note: {entry.notes}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {canManageJobsValue && (
                      <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
                        <Label htmlFor={`status-${job.id}`} className="text-sm font-medium">
                          {t('status')}:
                        </Label>
                        <Select
                          value={job.status}
                          onValueChange={(value) => updateJobStatus(job.id, value)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">{t('pending')}</SelectItem>
                            <SelectItem value="in_progress">{t('in_progress')}</SelectItem>
                            <SelectItem value="review">{t('review')}</SelectItem>
                            <SelectItem value="completed">{t('completed')}</SelectItem>
                            <SelectItem value="delivered">{t('delivered')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {canManageJobsValue && (
                      <div className="flex space-x-2 rtl:space-x-reverse mb-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedJob(job);
                            setIsEditDialogOpen(true);
                          }}
                          className="hover:bg-primary/10 hover:border-primary/50"
                        >
                          <Edit className="h-4 w-4 mr-1 rtl:mr-0 rtl:ml-1" />
                          {t('edit')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteJob(job.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/50"
                        >
                          <Trash2 className="h-4 w-4 mr-1 rtl:mr-0 rtl:ml-1" />
                          {t('delete')}
                        </Button>
                      </div>
                    )}

                    {/* File Upload Section - Show for team members */}
                    {isTeamMemberValue && (isCurrentlyAssigned || userWorkedOnJob) && (
                      <div className="mb-4">
                        <FileUpload jobId={job.id} onFileUploaded={fetchJobs} />
                      </div>
                    )}

                    {/* Job Files Display */}
                    <JobFilesDisplay jobId={job.id} />

                    {/* Job Completion Actions */}
                    {(() => {
                      const canCompleteJob = isTeamMemberValue && isCurrentlyAssigned && 
                                           ['pending', 'in_progress', 'review'].includes(job.status);
                      
                      if (!canCompleteJob) {
                        return null;
                      }

                      // Show workflow actions for photo sessions that can transition
                      if (job.type === 'photo_session') {
                        return (
                          <JobWorkflowActions 
                            job={job} 
                            onJobUpdated={handleJobUpdated}
                          />
                        );
                      }

                      // Show workflow actions for video editing and design jobs too
                      if (['video_editing', 'design'].includes(job.type)) {
                        return (
                          <JobWorkflowActions 
                            job={job} 
                            onJobUpdated={handleJobUpdated}
                          />
                        );
                      }

                      // Show simple completion actions for other jobs
                      return (
                        <JobCompletionActions 
                          job={job} 
                          onJobUpdated={handleJobUpdated}
                        />
                      );
                    })()}

                    {/* Job Comments Section */}
                    <JobComments 
                      jobId={job.id} 
                      jobTitle={job.title}
                      clientName={job.clients?.name}
                    />
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Job Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('editJob')}</DialogTitle>
          </DialogHeader>
          {selectedJob && (
            <JobForm onJobAdded={handleJobUpdated} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobManagement;
