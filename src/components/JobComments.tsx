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
    console.log('=== FETCHCOMMENTS CALLED ===');
    console.log('Job ID:', jobId);
    console.log('User Profile:', userProfile);
    
    if (!jobId || !userProfile?.id) {
      console.log('Missing jobId or userProfile.id, returning early');
      return;
    }

    try {
      setIsLoading(true);
      setHasError(false);
      setErrorMessage('');
      
      // Test the get_current_user_role function first
      console.log('Testing get_current_user_role function...');
      const { data: roleTest, error: roleError } = await supabase.rpc('get_current_user_role');
      console.log('get_current_user_role result:', roleTest, 'error:', roleError);

      // Test auth user
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      console.log('Current auth user:', authUser?.id, 'error:', authError);

      // Simple query first - just count
      console.log('Testing simple count query...');
      const { count, error: countError } = await supabase
        .from('job_comments')
        .select('*', { count: 'exact', head: true })
        .eq('job_id', jobId);
      
      console.log('Count result:', count, 'error:', countError);

      if (countError) {
        console.error('Count query failed:', countError);
        setHasError(true);
        setErrorMessage(`Count query failed: ${countError.message}`);
        setDebugInfo({
          userRole: userProfile?.role,
          userId: userProfile?.id,
          authUserId: authUser?.id,
          roleFromFunction: roleTest,
          countError: countError
        });
        return;
      }

      // Now try the full query
      console.log('Attempting full comments query...');
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

      console.log('Full query result:');
      console.log('- Data:', data);
      console.log('- Error:', error);
      console.log('- Data length:', data?.length || 0);

      if (error) {
        console.error('Full query error:', error);
        setHasError(true);
        setErrorMessage(`Query failed: ${error.message}`);
        setDebugInfo({
          userRole: userProfile?.role,
          userId: userProfile?.id,
          authUserId: authUser?.id,
          roleFromFunction: roleTest,
          error: error,
          errorDetails: error.details,
          errorHint: error.hint
        });
        return;
      }

      console.log('Comments fetched successfully:', data?.length || 0);
      setComments(data || []);
      
    } catch (error) {
      console.error('Unexpected error:', error);
      setHasError(true);
      setErrorMessage(`Unexpected error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Simplified useEffect - only trigger when we have both jobId and userProfile.id
  useEffect(() => {
    console.log('=== USEEFFECT TRIGGERED ===');
    console.log('jobId:', jobId);
    console.log('userProfile?.id:', userProfile?.id);
    console.log('userProfile?.role:', userProfile?.role);
    
    if (jobId && userProfile?.id) {
      console.log('Calling fetchComments...');
      fetchComments();
    } else {
      console.log('Not calling fetchComments - missing dependencies');
    }
  }, [jobId, userProfile?.id]); // Only depend on these two values

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

  // Early return for missing data
  if (!jobId || !userProfile?.id) {
    console.log('Rendering loading state - missing jobId or userProfile.id');
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5" />
            Progress Comments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">
            Loading user information...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    console.log('Rendering loading spinner');
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

  if (hasError) {
    console.log('Rendering error state');
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5" />
            Progress Comments - ERROR DETECTED
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
              <div className="bg-gray-50 p-4 rounded-lg text-sm max-h-96 overflow-y-auto">
                <h4 className="font-semibold mb-2">Debug Information:</h4>
                <div className="space-y-2">
                  <div><strong>User Role:</strong> {debugInfo.userRole}</div>
                  <div><strong>User ID:</strong> {debugInfo.userId}</div>
                  <div><strong>Auth User ID:</strong> {debugInfo.authUserId}</div>
                  <div><strong>Role from Function:</strong> {debugInfo.roleFromFunction}</div>
                  {debugInfo.error && (
                    <>
                      <div><strong>Error Code:</strong> {debugInfo.error?.code}</div>
                      <div><strong>Error Message:</strong> {debugInfo.error?.message}</div>
                      <div><strong>Error Details:</strong> {JSON.stringify(debugInfo.error?.details, null, 2)}</div>
                      <div><strong>Error Hint:</strong> {debugInfo.error?.hint}</div>
                    </>
                  )}
                  {debugInfo.countError && (
                    <div><strong>Count Error:</strong> {JSON.stringify(debugInfo.countError, null, 2)}</div>
                  )}
                </div>
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

  console.log('Rendering main component with', comments.length, 'comments');
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5" />
          Progress Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
