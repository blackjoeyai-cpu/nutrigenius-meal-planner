'use client';

import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  auth,
  signInWithEmail as firebaseSignIn,
  signUpWithEmail as firebaseSignUp,
  signOut as firebaseSignOut,
} from '@/services/auth-service';
import type { User } from 'firebase/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null | undefined;
  loading: boolean;
  error: Error | undefined;
  signInWithEmail: (email, password) => Promise<any>;
  signUpWithEmail: (email, password) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();

  const signInWithEmail = async (email, password) => {
    return firebaseSignIn(email, password);
  };

  const signUpWithEmail = async (email, password) => {
    return firebaseSignUp(email, password);
  };

  const signOut = async () => {
    try {
      await firebaseSignOut();
      router.push('/login');
    } catch (err) {
      console.error(err);
    }
  };

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
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signInWithEmail,
        signUpWithEmail,
        signOut,
      }}
    >
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
