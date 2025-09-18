'use client';

import { initializeApp, getApp, getApps } from 'firebase/app';
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithRedirect,
  GoogleAuthProvider,
  type AuthError,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// This ensures the user's session is persisted across browser tabs.
setPersistence(auth, browserLocalPersistence);

export async function signInWithEmail(email, password) {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Error signing in with email and password:', error);
    throw error;
  }
}

export async function signUpWithEmail(email, password) {
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Error signing up with email and password:', error);
    throw error;
  }
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    // Using redirect is more robust across different environments
    await signInWithRedirect(auth, provider);
  } catch (error) {
    const authError = error as AuthError;
    if (authError.code === 'auth/unauthorized-domain') {
      console.error(
        'FIREBASE AUTH ERROR: The domain of this application is not authorized. Please add it to the Firebase Console > Authentication > Settings > Authorized domains.'
      );
      throw new Error(
        'This domain is not authorized for authentication. Please contact support.'
      );
    } else {
      console.error('An error occurred during Google sign-in:', error);
      throw new Error('An unknown error occurred during sign-in.');
    }
  }
}

export async function signOut() {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out: ', error);
    throw new Error('Failed to sign out');
  }
}
