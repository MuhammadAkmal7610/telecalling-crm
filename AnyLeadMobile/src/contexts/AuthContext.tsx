import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, User } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { ApiService } from '../services/ApiService';
import CommunicationService from '../services/CommunicationService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateUserWorkspace: (workspaceId: string) => Promise<{ error: any }>;
  fetchUserProfile: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session with proper error handling
    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data.session;
        setSession(session);
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.warn('Initial session retrieval failed:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes with proper error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          setSession(session);
          if (session?.user) {
            setLoading(true);
            await fetchUserProfile(session.user.id);
          } else {
            setUser(null);
            setLoading(false);
          }
        } catch (error) {
          console.error('Auth state change error:', error);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    ApiService.setActiveWorkspace(user?.workspace_id || null);
    
    // Initialize Dialer Socket if user is logged in
    if (user?.id && session?.access_token) {
      CommunicationService.setupDialerSocket(user.id, session.access_token);
    }
  }, [user?.id, user?.workspace_id, session?.access_token]);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await ApiService.getUserProfile();

      if (data && !error) {
        console.warn('Fetched Profile:', JSON.stringify(data));
        setUser({
          id: data.id,
          email: data.email,
          name: data.fullName ?? data.name ?? '',
          role: data.role ?? 'user',
          organization_id: data.organization_id || data.organizationId || '',
          workspace_id: data.workspace_id || data.workspaceId || null,
        });
      } else {
        // Fall back to session user_metadata if no DB row exists
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const meta = sessionData?.session?.user?.user_metadata;
          const authUser = sessionData?.session?.user;
          if (authUser) {
            setUser({
              id: authUser.id,
              email: authUser.email ?? '',
              name: meta?.full_name ?? meta?.name ?? '',
              role: meta?.role ?? 'user',
              organization_id: meta?.organization_id ?? '',
              workspace_id: meta?.workspace_id ?? meta?.workspaceId ?? user?.workspace_id,
            });
          }
        } catch (sessionError) {
          console.warn('Session fallback failed:', sessionError);
        }
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      // Even on error, try to use session metadata so user isn't stuck
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const meta = sessionData?.session?.user?.user_metadata;
        const authUser = sessionData?.session?.user;
        if (authUser) {
          setUser({
            id: authUser.id,
            email: authUser.email ?? '',
            name: meta?.full_name ?? meta?.name ?? '',
            role: meta?.role ?? 'user',
            organization_id: meta?.organization_id ?? '',
            workspace_id: meta?.workspace_id ?? meta?.workspaceId ?? user?.workspace_id,
          });
        }
      } catch (sessionError) {
        console.warn('Session fallback in catch block failed:', sessionError);
      }
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (!error && data.user) {
      // Create user profile
      await supabase.from('users').insert({
        id: data.user.id,
        email: data.user.email!,
        name,
        role: 'user',
        organization_id: 'default-org', // You'll need to handle this properly
      });
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateUserWorkspace = async (workspaceId: string) => {
    if (!user) return { error: { message: 'Not logged in' } };
    
    try {
      // 1. Force optimistic update locally first
      const updatedUser = { ...user, workspace_id: workspaceId };
      setUser(updatedUser);

      // 2. Persist to backend DB
      const { error } = await ApiService.updateUser({ workspace_id: workspaceId });
      
      if (!error) {
        // 3. Persist to Supabase Auth Metadata as well for redundancy
        await supabase.auth.updateUser({
          data: { workspace_id: workspaceId }
        });
      } else {
        console.error('Failed to persist workspace selection to DB:', error);
        // Sync back with actual server state if update failed
        await fetchUserProfile(user.id);
        return { error };
      }

      // 4. Sync profile to ensure everything is consistent
      await fetchUserProfile(user.id);
      
      return { error: null };
    } catch (err: any) {
      console.error('updateUserWorkspace error:', err);
      return { error: { message: err.message } };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        updateUserWorkspace,
        fetchUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
