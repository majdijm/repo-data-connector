
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

  // Track if we're currently fetching a profile to prevent duplicate requests
  const [fetchingProfile, setFetchingProfile] = useState<string | null>(null);

  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    // Prevent duplicate fetches for the same user
    if (fetchingProfile === userId) {
      return null;
    }

    try {
      setFetchingProfile(userId);
      console.log('Fetching user profile for:', userId);
      
      const { data: profile, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching user profile:', fetchError);
        return null;
      }

      if (profile) {
        console.log('User profile found:', profile);
        return profile;
      }

      // If no profile exists, create one
      console.log('No profile found, creating new profile');
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        console.error('No authenticated user found');
        return null;
      }

      const newProfileData = {
        id: authUser.id,
        email: authUser.email!,
        name: authUser.user_metadata?.name || authUser.email!.split('@')[0],
        role: 'client',
        password: 'managed_by_auth',
        is_active: true
      };

      const { data: newProfile, error: createError } = await supabase
        .from('users')
        .upsert(newProfileData, { onConflict: 'id' })
        .select()
        .maybeSingle();

      if (createError) {
        console.error('Error creating user profile:', createError);
        return null;
      }

      console.log('User profile created successfully:', newProfile);
      return newProfile;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    } finally {
      setFetchingProfile(null);
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
    
    // Get initial session first
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          if (mounted) {
            setError('Session error');
            setIsLoading(false);
          }
          return;
        }
        
        if (!mounted) return;
        
        console.log('Initial session check:', session?.user?.email);
        
        if (session?.user) {
          setSession(session);
          setUser(session.user);
          
          // Fetch profile for initial session
          const profile = await fetchUserProfile(session.user.id);
          if (mounted) {
            setUserProfile(profile);
            if (!profile) {
              setError('Failed to load or create user profile');
            }
            setIsLoading(false);
          }
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Initialize auth error:', err);
        if (mounted) {
          setError('Failed to initialize authentication');
          setIsLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        setError(null);
        
        if (session?.user) {
          // Only fetch profile if we don't already have one for this user
          if (!userProfile || userProfile.id !== session.user.id) {
            const profile = await fetchUserProfile(session.user.id);
            if (mounted) {
              setUserProfile(profile);
              if (!profile) {
                setError('Failed to load or create user profile');
              }
            }
          }
        } else {
          setUserProfile(null);
        }
        
        if (mounted) {
          setIsLoading(false);
        }
      }
    );

    initializeAuth();

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
      setUserProfile(null);
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
