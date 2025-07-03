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
  };
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
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const canManageComments = userProfile?.role === 'admin' || userProfile?.role === 'receptionist';

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      setErrorMessage('');
      
      console.log('Fetching comments for job:', jobId, 'User role:', userProfile?.role, 'User ID:', userProfile?.id);
      
      // Test user authentication and role
      const { data: authUser } = await supabase.auth.getUser();
      console.log('Auth user:', authUser);
      
      // Test the get_current_user_role function
      const { data: roleData, error: roleError } = await supabase.rpc('get_current_user_role');
      console.log('Current user role from RPC:', roleData, 'Error:', roleError);
      
      const { data, error } = await supabase
        .from('job_comments')
        .select(`
          *,
          users (
            name,
            role
          )
        `)
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching comments:', error);
        setHasError(true);
        setErrorMessage(`Failed to fetch comments: ${error.message}`);
        return;
      }

      console.log('Comments fetched successfully:', data);
      setComments(data || []);
    } catch (error) {
      console.error('Unexpected error fetching comments:', error);
      setHasError(true);
      setErrorMessage('An unexpected error occurred while fetching comments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (jobId && userProfile) {
      console.log('JobComments component mounted for job:', jobId, 'User:', userProfile.name, 'Role:', userProfile.role);
      fetchComments();
    }
  }, [jobId, userProfile]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !userProfile) return;

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

      // Notify all parties related to the job
      await notifyCommentAdded();

      setNewComment('');
      fetchComments();
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
      fetchComments();
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

      fetchComments();
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
      // Get job details to find all related parties
      const { data: jobData } = await supabase
        .from('jobs')
        .select('assigned_to, created_by')
        .eq('id', jobId)
        .single();

      if (!jobData) return;

      const notifications = [];

      // Notify assigned user if different from commenter
      if (jobData.assigned_to && jobData.assigned_to !== userProfile?.id) {
        notifications.push({
          user_id: jobData.assigned_to,
          title: 'New Comment on Your Job',
          message: `${userProfile?.name} added a comment on "${jobTitle}"${clientName ? ` for ${clientName}` : ''}`,
          type: 'info' as const,
          related_job_id: jobId
        });
      }

      // Notify job creator if different from commenter
      if (jobData.created_by && jobData.created_by !== userProfile?.id && jobData.created_by !== jobData.assigned_to) {
        notifications.push({
          user_id: jobData.created_by,
          title: 'New Comment on Job',
          message: `${userProfile?.name} added a comment on "${jobTitle}"${clientName ? ` for ${clientName}` : ''}`,
          type: 'info' as const,
          related_job_id: jobId
        });
      }

      // Notify admins and receptionists (except commenter)
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

      // Send all notifications
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

  // Show loading state
  if (isLoading && comments.length === 0) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5" />
            Progress Comments
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

  // Show error state
  if (hasError) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5" />
            Progress Comments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-red-600">
            <AlertCircle className="h-8 w-8 mr-2" />
            <div>
              <p className="font-medium">Error loading comments</p>
              <p className="text-sm text-gray-600">{errorMessage}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchComments}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
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
          Progress Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new comment */}
        <div className="space-y-2">
          <Textarea
            placeholder="Add a comment about the job progress, issues, or updates..."
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
            Add Comment
          </Button>
        </div>

        {/* Comments list */}
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="border rounded-lg p-3 bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{comment.users.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {comment.users.role}
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
          
          {comments.length === 0 && !isLoading && !hasError && (
            <p className="text-gray-500 text-center py-4">
              No comments yet. Add the first comment to track progress.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default JobComments;
