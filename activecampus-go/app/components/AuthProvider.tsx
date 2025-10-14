// Authentication Context Provider
// Manages user authentication state across the app
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUser, User as AppUser } from '@/lib/firestore';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: AppUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signOut: async () => {},
  refreshUserProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserProfile = async () => {
    if (user) {
      const profile = await getUser(user.uid);
      setUserProfile(profile);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch user profile from Firestore
        const profile = await getUser(firebaseUser.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signOut, refreshUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
