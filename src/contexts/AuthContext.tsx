import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  is_active: boolean;
  created_at: string;
  language?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ error: any }>;
  signup: (email: string, password: string, name: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  userProfile: null,
  isLoading: true,
  error: null,
  signOut: async () => {},
  refreshUserProfile: async () => {},
  login: async () => ({ error: null }),
  signup: async () => ({ error: null }),
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUserProfile = async (userId: string, userEmail?: string) => {
    try {
      console.log('Fetching user profile for:', userId, userEmail);
      
      // First try to find by ID
      let { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile by ID:', error);
        setError(`Profile error: ${error.message}`);
        return;
      }

      // If no user found by ID but we have an email, try to find by email and sync
      if (!data && userEmail) {
        console.log('User not found by ID, trying by email:', userEmail);
        
        const { data: emailUser, error: emailError } = await supabase
          .from('users')
          .select('*')
          .eq('email', userEmail)
          .maybeSingle();

        if (emailError) {
          console.error('Error fetching user profile by email:', emailError);
          setUserProfile(null);
          setError(null);
          return;
        }

        if (emailUser) {
          console.log('Found user by email, syncing ID...');
          // Update the user's ID to match the auth user ID
          const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update({ id: userId })
            .eq('email', userEmail)
            .select()
            .single();

          if (updateError) {
            console.error('Error updating user ID:', updateError);
            setUserProfile(emailUser);
          } else {
            console.log('User ID synced successfully');
            setUserProfile(updatedUser);
          }
        } else {
          console.log('User profile not found, this is expected for new users');
          setUserProfile(null);
        }
      } else if (data) {
        console.log('User profile fetched successfully:', data);
        setUserProfile(data);
      } else {
        console.log('User profile not found');
        setUserProfile(null);
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Error in fetchUserProfile:', err);
      setError(`Failed to fetch user profile: ${err.message}`);
    }
  };

  const refreshUserProfile = async () => {
    if (user?.id) {
      await fetchUserProfile(user.id, user.email);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        setError(error.message);
        return { error };
      }

      console.log('Login successful:', data);
      return { error: null };
    } catch (err: any) {
      console.error('Login exception:', err);
      const errorMessage = err.message || 'Unknown login error';
      setError(errorMessage);
      return { error: { message: errorMessage } };
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      console.log('Attempting signup for:', email);
      setError(null);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        console.error('Signup error:', error);
        setError(error.message);
        return { error };
      }

      console.log('Signup successful:', data);
      return { error: null };
    } catch (err: any) {
      console.error('Signup exception:', err);
      const errorMessage = err.message || 'Unknown signup error';
      setError(errorMessage);
      return { error: { message: errorMessage } };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      setUserProfile(null);
      setError(null);
      
      toast({
        title: "Success",
        description: "Signed out successfully"
      });
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    console.log('Setting up auth state listener...');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile fetching to avoid blocking auth state changes
          setTimeout(() => {
            fetchUserProfile(session.user.id, session.user.email);
          }, 100);
        } else {
          setUserProfile(null);
          setError(null);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id, session.user.email);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    session,
    userProfile,
    isLoading,
    error,
    signOut,
    refreshUserProfile,
    login,
    signup,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
