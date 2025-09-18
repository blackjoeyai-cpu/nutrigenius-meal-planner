'use client';

import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  auth,
  signInWithGoogle,
  signOut as firebaseSignOut,
} from '@/services/auth-service';
import type { User } from 'firebase/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null | undefined;
  loading: boolean;
  error: Error | undefined;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();

  const signIn = async () => {
    try {
      // This will now initiate a redirect, not return a user.
      await signInWithGoogle();
    } catch (err) {
      console.error('Failed to initiate sign-in:', err);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut();
      router.push('/login');
    } catch (err) {
      console.error(err);
    }
  };

  // After a redirect, useAuthState will update the user state automatically.
  // We can still use this effect to redirect logged-in users.
  useEffect(() => {
    if (!loading && user) {
      if (
        router.pathname === '/login' ||
        router.pathname === '/' ||
        router.pathname === ''
      ) {
        router.replace('/dashboard');
      }
    }
  }, [user, loading, router]);

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
