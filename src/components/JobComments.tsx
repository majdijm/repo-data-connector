import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import { MessageSquare, Edit2, Trash2, Plus, AlertCircle } from 'lucide-react';

interface JobComment {
  id: string;
  job_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  users: {
    name: string;
    role: string;
  } | null;
}

interface JobCommentsProps {
  jobId: string;
  jobTitle: string;
  clientName?: string;
}

const JobComments: React.FC<JobCommentsProps> = ({ jobId, jobTitle, clientName }) => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const { createNotification } = useNotifications();
  const [comments, setComments] = useState<JobComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermissionError, setHasPermissionError] = useState(false);

  // Check if user has permission to view comments
  const hasCommentsPermission = userProfile?.role && ['admin', 'receptionist', 'photographer', 'designer', 'editor', 'client'].includes(userProfile.role);
  const canManageComments = userProfile?.role === 'admin' || userProfile?.role === 'receptionist';
  const canAddComments = userProfile?.role && ['admin', 'receptionist', 'photographer', 'designer', 'editor', 'client'].includes(userProfile.role);

  const fetchComments = async () => {
    if (!jobId || !userProfile?.id || !hasCommentsPermission) {
      console.log('Skipping fetchComments - missing requirements or permissions');
      return;
    }

    try {
      setIsLoading(true);
      setHasPermissionError(false);
      
      console.log('Fetching comments for job:', jobId, 'as user:', userProfile.role);

      let query = supabase
        .from('job_comments')
        .select(`
          id,
          job_id,
          user_id,
          content,
          created_at,
          updated_at,
          users (
            name,
            role
          )
        `)
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching comments:', error);
        
        // If it's a permission error for client, try alternative approach
        if (userProfile?.role === 'client' && (error.code === 'PGRST301' || error.message.includes('permission'))) {
          console.log('Permission error for client, trying alternative query...');
          
          // Try to get comments through the job relationship for clients
          const { data: jobData, error: jobError } = await supabase
            .from('jobs')
            .select(`
              id,
              client_id,
              job_comments!inner(
                id,
                job_id,
                user_id,
                content,
                created_at,
                updated_at,
                users (
                  name,
                  role
                )
              )
            `)
            .eq('id', jobId);

          if (jobError) {
            console.error('Alternative query also failed:', jobError);
            setHasPermissionError(true);
            return;
          }

          const commentsFromJob = jobData?.[0]?.job_comments || [];
          console.log('Comments from alternative query:', commentsFromJob.length);
          setComments(commentsFromJob);
          return;
        }
        
        if (error.code === 'PGRST301' || error.message.includes('permission')) {
          setHasPermissionError(true);
        } else {
          toast({
            title: "Error",
            description: "Failed to load comments",
            variant: "destructive"
          });
        }
        return;
      }

      console.log('Comments fetched successfully:', data?.length || 0);
      setComments(data || []);
      
    } catch (error) {
      console.error('Unexpected error fetching comments:', error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (hasCommentsPermission) {
      fetchComments();
    }
  }, [jobId, userProfile?.id, hasCommentsPermission]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !userProfile || !canAddComments) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('job_comments')
        .insert([{
          job_id: jobId,
          user_id: userProfile.id,
          content: newComment.trim()
        }]);

      if (error) throw error;

      await notifyCommentAdded();

      setNewComment('');
      await fetchComments();
      
      toast({
        title: "Success",
        description: "Comment added successfully"
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('job_comments')
        .update({
          content: editContent.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId);

      if (error) throw error;

      setEditingComment(null);
      setEditContent('');
      await fetchComments();
      
      toast({
        title: "Success",
        description: "Comment updated successfully"
      });
    } catch (error) {
      console.error('Error updating comment:', error);
      toast({
        title: "Error",
        description: "Failed to update comment",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('job_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      await fetchComments();
      
      toast({
        title: "Success",
        description: "Comment deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const notifyCommentAdded = async () => {
    try {
      const { data: jobData } = await supabase
        .from('jobs')
        .select('assigned_to, created_by')
        .eq('id', jobId)
        .single();

      if (!jobData) return;

      const notifications = [];

      if (jobData.assigned_to && jobData.assigned_to !== userProfile?.id) {
        notifications.push({
          user_id: jobData.assigned_to,
          title: 'New Comment on Your Job',
          message: `${userProfile?.name} added a comment on "${jobTitle}"${clientName ? ` for ${clientName}` : ''}`,
          type: 'info' as const,
          related_job_id: jobId
        });
      }

      if (jobData.created_by && jobData.created_by !== userProfile?.id && jobData.created_by !== jobData.assigned_to) {
        notifications.push({
          user_id: jobData.created_by,
          title: 'New Comment on Job',
          message: `${userProfile?.name} added a comment on "${jobTitle}"${clientName ? ` for ${clientName}` : ''}`,
          type: 'info' as const,
          related_job_id: jobId
        });
      }

      const { data: adminUsers } = await supabase
        .from('users')
        .select('id')
        .in('role', ['admin', 'receptionist'])
        .eq('is_active', true)
        .neq('id', userProfile?.id);

      if (adminUsers) {
        adminUsers.forEach(user => {
          if (user.id !== jobData.assigned_to && user.id !== jobData.created_by) {
            notifications.push({
              user_id: user.id,
              title: 'New Job Comment',
              message: `${userProfile?.name} added a comment on "${jobTitle}"${clientName ? ` for ${clientName}` : ''}`,
              type: 'info' as const,
              related_job_id: jobId
            });
          }
        });
      }

      for (const notification of notifications) {
        await createNotification(notification);
      }
    } catch (error) {
      console.error('Error sending comment notifications:', error);
    }
  };

  const canEditComment = (comment: JobComment) => {
    return comment.user_id === userProfile?.id || canManageComments;
  };

  const canDeleteComment = (comment: JobComment) => {
    return comment.user_id === userProfile?.id || canManageComments;
  };

  // If user doesn't have permission, show restricted message
  if (!hasCommentsPermission) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5" />
            {userProfile?.role === 'client' ? 'Handover Notes' : 'Progress Comments'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">
            Comments are only available to team members and clients for completed work.
          </p>
        </CardContent>
      </Card>
    );
  }

  // If there's a permission error from the database
  if (hasPermissionError) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5" />
            {userProfile?.role === 'client' ? 'Handover Notes' : 'Progress Comments'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4 text-orange-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            <div className="text-center">
              <p className="font-medium">Access Restricted</p>
              <p className="text-sm text-gray-600">
                You don't have permission to view comments for this job.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Role: {userProfile?.role} | Job: {jobId}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5" />
            {userProfile?.role === 'client' ? 'Handover Notes' : 'Progress Comments'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading comments...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5" />
          {userProfile?.role === 'client' ? 'Handover Notes' : 'Progress Comments'} ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Comment Section - For team members and handover notes */}
        {canAddComments && (
          <div className="space-y-2">
            <Textarea
              placeholder={userProfile?.role === 'client' 
                ? "Add feedback or questions about the handover..." 
                : "Add a comment about the job progress, handover notes, or updates..."
              }
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            <Button 
              onClick={handleAddComment} 
              disabled={!newComment.trim() || isLoading}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {userProfile?.role === 'client' ? 'Add Feedback' : 'Add Comment'}
            </Button>
          </div>
        )}

        {/* Special note for handover instructions */}
        {userProfile?.role === 'client' && comments.length === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">About Handover Notes</h4>
            <p className="text-sm text-blue-700">
              This section contains important handover notes from our team about your completed project. 
              You can also add your own feedback or questions here.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="border rounded-lg p-3 bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{comment.users?.name || 'Unknown User'}</span>
                  <Badge variant="outline" className="text-xs">
                    {comment.users?.role || 'Unknown'}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                  {comment.updated_at !== comment.created_at && (
                    <span className="text-xs text-gray-400">(edited)</span>
                  )}
                </div>
                
                {(canEditComment(comment) || canDeleteComment(comment)) && (
                  <div className="flex gap-1">
                    {canEditComment(comment) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingComment(comment.id);
                          setEditContent(comment.content);
                        }}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    )}
                    {canDeleteComment(comment) && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="text-red-600">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this comment? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteComment(comment.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                )}
              </div>
              
              {editingComment === comment.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleEditComment(comment.id)}>
                      Save
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        setEditingComment(null);
                        setEditContent('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
              )}
            </div>
          ))}
          
          {comments.length === 0 && !isLoading && (
            <p className="text-gray-500 text-center py-4">
              {userProfile?.role === 'client' 
                ? 'No handover notes available yet.'
                : 'No comments yet. Add the first comment to track progress.'
              }
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default JobComments;
