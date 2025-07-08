
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const UserRoleChecker: React.FC = () => {
  const { userProfile } = useAuth();
  const [email, setEmail] = useState('quranlight2019@gmail.com');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkUser = async () => {
    setLoading(true);
    try {
      console.log('🔍 Checking user:', email);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        console.error('❌ Error checking user:', error);
        setResult({ error: error.message });
      } else {
        console.log('✅ User found:', data);
        setResult({ user: data });
      }
    } catch (err) {
      console.error('💥 Exception checking user:', err);
      setResult({ error: 'Exception occurred' });
    } finally {
      setLoading(false);
    }
  };

  const checkAllUsers = async () => {
    setLoading(true);
    try {
      console.log('🔍 Fetching all users...');
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching all users:', error);
        setResult({ error: error.message });
      } else {
        console.log('✅ All users found:', data);
        setResult({ allUsers: data });
      }
    } catch (err) {
      console.error('💥 Exception fetching all users:', err);
      setResult({ error: 'Exception occurred' });
    } finally {
      setLoading(false);
    }
  };

  // Only show for admin users
  if (!userProfile || userProfile.role !== 'admin') {
    return null;
  }

  return (
    <Card className="mt-4 bg-yellow-50 border-yellow-200">
      <CardHeader>
        <CardTitle className="text-sm">User Role Checker & Debugger</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email to check"
              className="flex-1"
            />
            <Button onClick={checkUser} disabled={loading} size="sm">
              {loading ? 'Checking...' : 'Check User'}
            </Button>
            <Button onClick={checkAllUsers} disabled={loading} size="sm" variant="outline">
              {loading ? 'Loading...' : 'Check All Users'}
            </Button>
          </div>
          
          {result && (
            <div className="mt-2 p-3 bg-white rounded border max-h-96 overflow-auto">
              <pre className="text-xs">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserRoleChecker;
