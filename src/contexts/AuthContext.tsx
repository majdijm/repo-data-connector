
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

// Track profile fetching to prevent concurrent requests
const profileFetchingMap = new Map<string, Promise<UserProfile | null>>();

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    // Check if we're already fetching this profile
    if (profileFetchingMap.has(userId)) {
      console.log('Profile fetch already in progress for:', userId);
      return profileFetchingMap.get(userId)!;
    }

    const profilePromise = (async (): Promise<UserProfile | null> => {
      try {
        console.log('Fetching user profile for:', userId);
        
        // First try to get existing profile
        const { data: existingProfile, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (fetchError) {
          console.error('Error fetching user profile:', fetchError);
          // Don't return null immediately, try to create profile
        }

        if (existingProfile) {
          console.log('User profile found:', existingProfile);
          return existingProfile;
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
          .upsert(newProfileData, { 
            onConflict: 'id',
            ignoreDuplicates: false 
          })
          .select()
          .maybeSingle();

        if (createError) {
          console.error('Error creating user profile:', createError);
          // If it's a duplicate key error, try to fetch the existing profile
          if (createError.code === '23505') {
            console.log('Profile already exists, fetching existing profile');
            const { data: existingProfile } = await supabase
              .from('users')
              .select('*')
              .eq('id', userId)
              .maybeSingle();
            return existingProfile;
          }
          return null;
        }

        console.log('User profile created successfully:', newProfile);
        return newProfile;
      } catch (error) {
        console.error('Error in fetchUserProfile:', error);
        return null;
      }
    })();

    // Store the promise to prevent concurrent requests
    profileFetchingMap.set(userId, profilePromise);

    try {
      const result = await profilePromise;
      return result;
    } finally {
      // Clean up the promise from the map
      profileFetchingMap.delete(userId);
    }
  };

  const refreshUserProfile = async () => {
    if (user) {
      const profile = await fetchUserProfile(user.id);
      setUserProfile(profile);
      if (!profile) {
        setError('Failed to load or create user profile');
      } else {
        setError(null);
      }
    }
  };

  useEffect(() => {
    let mounted = true;
    
    console.log('Setting up auth state listener');

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        setError(null);
        
        // Handle profile fetching with proper async handling
        if (session?.user) {
          // Use setTimeout to avoid blocking the auth callback
          setTimeout(async () => {
            if (mounted) {
              try {
                const profile = await fetchUserProfile(session.user.id);
                if (mounted) {
                  setUserProfile(profile);
                  if (!profile) {
                    setError('Failed to load or create user profile');
                  }
                  setIsLoading(false);
                }
              } catch (error) {
                console.error('Error fetching profile in auth callback:', error);
                if (mounted) {
                  setError('Failed to load or create user profile');
                  setIsLoading(false);
                }
              }
            }
          }, 100);
        } else {
          setUserProfile(null);
          setIsLoading(false);
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error: sessionError }) => {
      if (sessionError) {
        console.error('Session error:', sessionError);
        if (mounted) {
          setError('Session error');
          setIsLoading(false);
        }
        return;
      }
      
      console.log('Initial session check:', session?.user?.email);
      
      if (!mounted) return;
      
      if (session?.user) {
        setSession(session);
        setUser(session.user);
        
        // Fetch profile for initial session
        setTimeout(async () => {
          if (mounted) {
            try {
              const profile = await fetchUserProfile(session.user.id);
              if (mounted) {
                setUserProfile(profile);
                if (!profile) {
                  setError('Failed to load or create user profile');
                }
                setIsLoading(false);
              }
            } catch (error) {
              console.error('Error fetching profile in initial session:', error);
              if (mounted) {
                setError('Failed to load or create user profile');
                setIsLoading(false);
              }
            }
          }
        }, 100);
      } else {
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
      setUserProfile(null);
      // Clear any pending profile fetches
      profileFetchingMap.clear();
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
