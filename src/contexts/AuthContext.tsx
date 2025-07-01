
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

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

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
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (!mounted) return;
        
        // Only synchronous state updates here
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer async operations with setTimeout to prevent blocking
        if (session?.user) {
          setTimeout(() => {
            if (mounted) {
              fetchUserProfile(session.user.id).then(profile => {
                if (mounted) {
                  setUserProfile(profile);
                  setIsLoading(false);
                }
              }).catch(err => {
                console.error('Profile fetch error:', err);
                if (mounted) {
                  setError('Failed to load user profile');
                  setIsLoading(false);
                }
              });
            }
          }, 0);
        } else {
          setUserProfile(null);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Session error:', error);
        setError('Session error');
        setIsLoading(false);
        return;
      }
      
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id).then(profile => {
          if (mounted) {
            setUserProfile(profile);
            setIsLoading(false);
          }
        }).catch(err => {
          console.error('Profile fetch error:', err);
          if (mounted) {
            setError('Failed to load user profile');
            setIsLoading(false);
          }
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      setError(error.message);
    }
    
    return { error };
  };

  const signup = async (email: string, password: string, name: string) => {
    setError(null);
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
    }
    
    return { error };
  };

  const logout = async () => {
    setError(null);
    await supabase.auth.signOut();
    setUserProfile(null);
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
