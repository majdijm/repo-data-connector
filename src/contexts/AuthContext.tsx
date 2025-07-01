
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<{ error: any }>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const createUserProfile = async (userId: string, email: string, name?: string): Promise<UserProfile | null> => {
    try {
      console.log('Creating user profile for:', userId, email);
      
      // Use upsert to handle cases where the user might already exist
      const { data: profile, error } = await supabase
        .from('users')
        .upsert({
          id: userId,
          email: email,
          name: name || email.split('@')[0],
          role: 'client',
          password: 'managed_by_auth', // Required field, but actual auth is handled by Supabase Auth
          is_active: true
        }, {
          onConflict: 'id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        return null;
      }

      console.log('User profile created:', profile);
      return profile;
    } catch (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
  };

  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log('Fetching user profile for:', userId);
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        // If user doesn't exist, try to create one
        if (error.code === 'PGRST116') {
          const currentUser = await supabase.auth.getUser();
          if (currentUser.data.user) {
            const newProfile = await createUserProfile(
              currentUser.data.user.id,
              currentUser.data.user.email!,
              currentUser.data.user.user_metadata?.name
            );
            return newProfile;
          }
        }
        return null;
      }

      console.log('User profile fetched:', profile);
      return profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const refreshUserProfile = async () => {
    if (user) {
      const profile = await fetchUserProfile(user.id);
      setUserProfile(profile);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    console.log('Setting up auth state listener');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Use setTimeout to avoid blocking the auth state change
          setTimeout(() => {
            if (mounted) {
              fetchUserProfile(session.user.id)
                .then(profile => {
                  if (mounted) {
                    setUserProfile(profile);
                    setIsLoading(false);
                    setError(profile ? null : 'Failed to load or create user profile');
                  }
                })
                .catch(err => {
                  console.error('Profile fetch error:', err);
                  if (mounted) {
                    setError('Failed to load user profile');
                    setIsLoading(false);
                  }
                });
            }
          }, 100);
        } else {
          setUserProfile(null);
          setIsLoading(false);
          setError(null);
        }
      }
    );

    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.error('Session error:', error);
          setError('Session error');
          setIsLoading(false);
          return;
        }
        
        if (!mounted) return;
        
        console.log('Initial session check:', session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          fetchUserProfile(session.user.id)
            .then(profile => {
              if (mounted) {
                setUserProfile(profile);
                setIsLoading(false);
                setError(profile ? null : 'Failed to load or create user profile');
              }
            })
            .catch(err => {
              console.error('Profile fetch error:', err);
              if (mounted) {
                setError('Failed to load user profile');
                setIsLoading(false);
              }
            });
        } else {
          setIsLoading(false);
        }
      })
      .catch(err => {
        console.error('Get session error:', err);
        if (mounted) {
          setError('Failed to get session');
          setIsLoading(false);
        }
      });

    return () => {
      console.log('Cleaning up auth listener');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        setError(error.message);
        setIsLoading(false);
      }
      
      return { error };
    } catch (err: any) {
      const errorMessage = err?.message || 'An unexpected error occurred';
      setError(errorMessage);
      setIsLoading(false);
      return { error: err };
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setError(null);
    setIsLoading(true);
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: name,
          }
        }
      });
      
      if (error) {
        setError(error.message);
        setIsLoading(false);
      }
      
      return { error };
    } catch (err: any) {
      const errorMessage = err?.message || 'An unexpected error occurred';
      setError(errorMessage);
      setIsLoading(false);
      return { error: err };
    }
  };

  const logout = async () => {
    setError(null);
    
    try {
      await supabase.auth.signOut();
    } catch (err: any) {
      console.error('Logout error:', err);
      setError('Failed to logout');
    }
  };

  const value = {
    user,
    userProfile,
    session,
    isLoading,
    error,
    login,
    logout,
    signup,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
