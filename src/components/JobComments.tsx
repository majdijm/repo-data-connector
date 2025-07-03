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
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const canManageComments = userProfile?.role === 'admin' || userProfile?.role === 'receptionist';

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      setErrorMessage('');
      
      console.log('=== DEBUGGING JOB COMMENTS ===');
      console.log('Job ID:', jobId);
      console.log('User Profile:', userProfile);
      console.log('User Role:', userProfile?.role);
      console.log('User ID:', userProfile?.id);
      
      // Test user authentication
      const { data: authUser, error: authError } = await supabase.auth.getUser();
      console.log('Auth User:', authUser);
      console.log('Auth Error:', authError);
      
      if (authError) {
        console.error('Authentication error:', authError);
        setHasError(true);
        setErrorMessage(`Authentication error: ${authError.message}`);
        return;
      }

      if (!authUser.user) {
        console.error('User not authenticated');
        setHasError(true);
        setErrorMessage('User not authenticated');
        return;
      }
      
      // Test the get_current_user_role function
      console.log('Testing get_current_user_role function...');
      const { data: roleData, error: roleError } = await supabase.rpc('get_current_user_role');
      console.log('Current user role from RPC:', roleData);
      console.log('RPC Error:', roleError);

      if (roleError) {
        console.error('Role function error:', roleError);
        setHasError(true);
        setErrorMessage(`Role function error: ${roleError.message}`);
        return;
      }

      // Test basic query without RLS first
      console.log('Testing basic query access...');
      const testQuery = await supabase
        .from('job_comments')
        .select('count', { count: 'exact' })
        .eq('job_id', jobId);
      
      console.log('Test query result:', testQuery);

      if (testQuery.error) {
        console.error('Basic query failed:', testQuery.error);
        setHasError(true);
        setErrorMessage(`Query access error: ${testQuery.error.message}`);
        return;
      }

      // Now try the full query
      console.log('Attempting full query...');
      const { data, error } = await supabase
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

      console.log('Full query result:', { data, error });

      if (error) {
        console.error('Full query error:', error);
        setHasError(true);
        setErrorMessage(`Failed to fetch comments: ${error.message} (Code: ${error.code}, Details: ${error.details})`);
        
        // Store debug info for display
        setDebugInfo({
          userRole: userProfile?.role,
          userId: userProfile?.id,
          authUserId: authUser.user.id,
          rpcRole: roleData,
          error: error,
          testQueryCount: testQuery.count
        });
        return;
      }

      console.log('Comments fetched successfully:', data);
      console.log('Number of comments:', data?.length || 0);
      setComments(data || []);
      
      // Store successful debug info
      setDebugInfo({
        userRole: userProfile?.role,
        userId: userProfile?.id,
        authUserId: authUser.user.id,
        rpcRole: roleData,
        commentsCount: data?.length || 0
      });

    } catch (error) {
      console.error('Unexpected error fetching comments:', error);
      setHasError(true);
      setErrorMessage(`An unexpected error occurred: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (jobId && userProfile) {
      console.log('JobComments component mounted for job:', jobId, 'User:', userProfile.name, 'Role:', userProfile.role);
      fetchComments();
    } else {
      console.log('Missing dependencies:', { jobId: !!jobId, userProfile: !!userProfile });
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

  // Show error state with debug information
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
          <div className="space-y-4">
            <div className="flex items-center justify-center py-4 text-red-600">
              <AlertCircle className="h-8 w-8 mr-2" />
              <div>
                <p className="font-medium">Error loading comments</p>
                <p className="text-sm text-gray-600">{errorMessage}</p>
              </div>
            </div>
            
            {debugInfo && (
              <div className="bg-gray-50 p-4 rounded-lg text-sm">
                <h4 className="font-semibold mb-2">Debug Information:</h4>
                <ul className="space-y-1">
                  <li><strong>User Role:</strong> {debugInfo.userRole}</li>
                  <li><strong>User ID:</strong> {debugInfo.userId}</li>
                  <li><strong>Auth User ID:</strong> {debugInfo.authUserId}</li>
                  <li><strong>RPC Role Result:</strong> {debugInfo.rpcRole}</li>
                  {debugInfo.testQueryCount !== undefined && (
                    <li><strong>Test Query Count:</strong> {debugInfo.testQueryCount}</li>
                  )}
                  {debugInfo.commentsCount !== undefined && (
                    <li><strong>Comments Found:</strong> {debugInfo.commentsCount}</li>
                  )}
                  {debugInfo.error && (
                    <li><strong>Error Details:</strong> {JSON.stringify(debugInfo.error, null, 2)}</li>
                  )}
                </ul>
              </div>
            )}

            <Button 
              variant="outline" 
              onClick={fetchComments}
              className="w-full"
            >
              Try Again
            </Button>
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
        {debugInfo && (
          <div className="text-xs text-gray-500">
            Role: {debugInfo.userRole} | RPC Role: {debugInfo.rpcRole}
          </div>
        )}
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
