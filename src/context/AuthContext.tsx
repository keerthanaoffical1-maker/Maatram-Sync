import React, { createContext, useContext, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { supabaseAuthService } from '../services/auth/supabaseAuthService';
import type { AuthUser, SignInCredentials, SignInResult, UserRole } from '../types/auth';

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  loading: boolean;
  isMock: boolean;
  signIn: (credentials: SignInCredentials) => Promise<SignInResult>;
  signOut: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_SESSION_KEY = 'maatram.auth.session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Sync session state on mount & listen to Supabase auth events
  useEffect(() => {
    let mounted = true;

    async function initSession() {
      try {
        if (isSupabaseConfigured) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data } = await supabase
              .from('profiles')
              .select('id, full_name, email, role, account_status')
              .eq('id', session.user.id)
              .single();
            const profile: any = data;

            if (profile && profile.account_status === 'Active' && mounted) {
              const current: AuthUser = {
                id: profile.id,
                email: profile.email,
                name: profile.full_name,
                role: profile.role,
              };
              setUser(current);
              localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(current));
            } else if (profile?.account_status === 'Inactive') {
              await supabase.auth.signOut();
              if (mounted) setUser(null);
              localStorage.removeItem(STORAGE_SESSION_KEY);
            }
          } else {
            // No active supabase session
            if (mounted) setUser(null);
            localStorage.removeItem(STORAGE_SESSION_KEY);
          }
        }
      } catch (err) {
        console.error('Failed to initialize auth session:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initSession();

    // Setup Supabase auth state change listener
    let authListener: { subscription: { unsubscribe: () => void } } | null = null;
    if (isSupabaseConfigured) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          if (mounted) setUser(null);
          localStorage.removeItem(STORAGE_SESSION_KEY);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session.user) {
            const { data } = await supabase
              .from('profiles')
              .select('id, full_name, email, role, account_status')
              .eq('id', session.user.id)
              .single();
            const profile: any = data;

            if (profile && profile.account_status === 'Active' && mounted) {
              const current: AuthUser = {
                id: profile.id,
                email: profile.email,
                name: profile.full_name,
                role: profile.role,
              };
              setUser(current);
              localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(current));
            }
          }
        }
      });
      authListener = data;
    }

    return () => {
      mounted = false;
      if (authListener) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const signIn = async (credentials: SignInCredentials): Promise<SignInResult> => {
    setLoading(true);
    try {
      const result = await supabaseAuthService.signIn(credentials);
      if (result.ok) {
        setUser(result.user);
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(result.user));
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabaseAuthService.signOut();
      setUser(null);
      localStorage.removeItem(STORAGE_SESSION_KEY);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        loading,
        isMock: supabaseAuthService.isMock,
        signIn,
        signOut,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
