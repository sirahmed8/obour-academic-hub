'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { User } from '@/types';
import { auth, googleProvider, db } from '@/lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'admin' || user?.role === 'owner';
  const isOwner = user?.role === 'owner';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          // Check if user is owner
          if (firebaseUser.email === process.env.NEXT_PUBLIC_OWNER_EMAIL || 
              firebaseUser.email === 'a7medorabe7@gmail.com') {
            userData.role = 'owner';
          }
          setUser(userData);
          // Update last login
          await updateDoc(userDocRef, { lastLogin: new Date().toISOString() });
        } else {
          // Create new user
          const isOwnerEmail = firebaseUser.email === 'a7medorabe7@gmail.com';
          const newUser: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'New Student',
            role: isOwnerEmail ? 'owner' : 'student',
            photoURL: firebaseUser.photoURL || undefined,
            createdAt: new Date().toISOString(),
          };
          await setDoc(userDocRef, newUser);
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Login failed:', error);
      if (error?.code === 'auth/unauthorized-domain') {
        toast.error(language === 'ar' ? 'نطاق غير مصرح به. يرجى إضافته في Firebase.' : 'Unauthorized Domain. Please add to Firebase Console.');
      } else if (error?.code === 'auth/popup-closed-by-user') {
        toast.warning(language === 'ar' ? 'تم إغلاق النافذة' : 'Login popup closed');
      } else {
        toast.error(language === 'ar' ? 'فشل تسجيل الدخول' : 'Login failed. Check console.');
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, data);
    setUser({ ...user, ...data });
  };

  const value = useMemo(() => ({
    user,
    loading,
    isAdmin,
    isOwner,
    login,
    logout,
    updateProfile
  }), [user, loading, isAdmin, isOwner]);

  return (
    <AuthContext.Provider value={value}>
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
