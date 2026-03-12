import React, { createContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
} from 'firebase/auth';
import { collection, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { User, AuthContextType } from '../types/auth';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(collection(db, 'users'), firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              role: userData.role || 'viewer',
            });
          } else {
            // Create user doc on first login
            await setDoc(userDocRef, {
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || '',
              role: 'admin',
              createdAt: serverTimestamp(),
            });

            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              role: 'admin',
            });
          }
        } catch (error) {
          console.error('Error setting up user:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const signup = async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Create user document in Firestore
    const userDocRef = doc(collection(db, 'users'), userCredential.user.uid);
    await setDoc(userDocRef, {
      email,
      displayName,
      role: 'admin',
      createdAt: serverTimestamp(),
    });
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    loginWithGoogle,
    logout,
    signup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
