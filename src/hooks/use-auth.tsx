'use client';

import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  auth,
  signInWithEmail as firebaseSignIn,
  signUpWithEmail as firebaseSignUp,
  signOut as firebaseSignOut,
  signInWithGoogle as firebaseSignInWithGoogle,
} from '@/services/auth-service';
import type { User } from 'firebase/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null | undefined;
  loading: boolean;
  error: Error | undefined;
  signInWithEmail: (email: string, password: string) => Promise<any>;
  signUpWithEmail: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // useAuthState handles the user state, including after a redirect
  const [user, authLoading, authError] = useAuthState(auth);
  const [appLoading, setAppLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setAppLoading(authLoading);
  }, [authLoading]);

  const signInWithEmail = async (email, password) => {
    return firebaseSignIn(email, password);
  };

  const signUpWithEmail = async (email, password) => {
    return firebaseSignUp(email, password);
  };

  const signInWithGoogle = async () => {
    setAppLoading(true);
    await firebaseSignInWithGoogle();
    // The user will be redirected, and useAuthState will update upon return.
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
    if (!authLoading && user) {
      if (
        router.pathname === '/login' ||
        router.pathname === '/' ||
        router.pathname === ''
      ) {
        router.replace('/dashboard');
      }
    }
  }, [user, authLoading, router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: appLoading,
        error: authError,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
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
