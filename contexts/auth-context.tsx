"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createAuthClient } from 'better-auth/client';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Session {
  user: User;
  token?: string;
  session?: {
    id: string;
    userId: string;
    expiresAt: Date;
  };
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  googleSignIn: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authClient = createAuthClient({
  baseURL: process.env.NODE_ENV === 'production' 
    ? process.env.NEXT_PUBLIC_APP_URL 
    : 'http://localhost:3000',
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const isAuthenticated = !!session;

  // Initialize auth state
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      setError(null);
      const sessionData = await authClient.getSession();
      
      if (sessionData.data) {
        const sessionUser = sessionData.data.user as User;
        setSession({ 
          user: sessionUser,
          token: (sessionData.data as any).token,
          session: (sessionData.data as any).session
        });
        setUser(sessionUser);
      } else {
        setSession(null);
        setUser(null);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setError('Failed to check authentication status');
      setSession(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async () => {
    await checkAuth();
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await authClient.signIn.email({
        email,
        password,
      });
      
      if (result.data) {
        const sessionUser = result.data.user as User;
        setSession({ 
          user: sessionUser,
          token: (result.data as any).token,
          session: (result.data as any).session
        });
        setUser(sessionUser);
        router.push('/dashboard');
      } else if (result.error) {
        throw new Error(result.error.message || 'Sign in failed');
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.message || 'Failed to sign in');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await authClient.signUp.email({
        email,
        password,
        name,
      });
      
      if (result.data) {
        const sessionUser = result.data.user as User;
        setSession({ 
          user: sessionUser,
          token: (result.data as any).token,
          session: (result.data as any).session
        });
        setUser(sessionUser);
        router.push('/dashboard');
      } else if (result.error) {
        throw new Error(result.error.message || 'Sign up failed');
      }
    } catch (err: any) {
      console.error('Sign up error:', err);
      setError(err.message || 'Failed to sign up');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const googleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/dashboard',
      });
      
      // Google sign in redirects, so we don't need to handle the result here
    } catch (err: any) {
      console.error('Google sign in error:', err);
      setError(err.message || 'Failed to sign in with Google');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await authClient.signOut();
      setSession(null);
      setUser(null);
      router.push('/');
    } catch (err: any) {
      console.error('Sign out error:', err);
      setError(err.message || 'Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    error,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    googleSignIn,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}