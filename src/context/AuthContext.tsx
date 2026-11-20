import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import {
  auth,
  db,
  signInWithGoogle,
  signOutUser,
  BOOTSTRAPPED_ADMIN_EMAIL,
} from '../lib/firebase';
import { syncUserProfile } from '../lib/firestoreService';

interface AuthContextValue {
  user: User | null;
  authReady: boolean;
  isAdmin: boolean;
  adminVerifiedServer: boolean;
  idToken: string | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshAdminStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminVerifiedServer, setAdminVerifiedServer] = useState(false);
  const [idToken, setIdToken] = useState<string | null>(null);

  const checkAdminRole = useCallback(async (firebaseUser: User | null): Promise<boolean> => {
    if (!firebaseUser) {
      setIsAdmin(false);
      setAdminVerifiedServer(false);
      setIdToken(null);
      return false;
    }

    const token = await firebaseUser.getIdToken();
    setIdToken(token);

    let adminFlag =
      firebaseUser.email === BOOTSTRAPPED_ADMIN_EMAIL && firebaseUser.emailVerified;

    if (!adminFlag) {
      try {
        const adminDoc = await getDoc(doc(db, 'admins', firebaseUser.uid));
        if (adminDoc.exists()) adminFlag = true;
      } catch {
        // Non-admin read denial expected
      }
    }

    // Always verify server-side /api/admin/verify
    let serverVerified = false;
    try {
      const res = await fetch('/api/admin/verify', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        serverVerified = true;
        adminFlag = true;
      }
    } catch {
      serverVerified = false;
    }

    setIsAdmin(adminFlag);
    setAdminVerifiedServer(serverVerified);
    return adminFlag;
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          await syncUserProfile(
            firebaseUser.uid,
            firebaseUser.email || '',
            firebaseUser.displayName || ''
          );
        } catch (err) {
          console.warn('Profile sync warning:', err);
        }
        await checkAdminRole(firebaseUser);
      } else {
        setIsAdmin(false);
        setAdminVerifiedServer(false);
        setIdToken(null);
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, [checkAdminRole]);

  const loginWithGoogle = useCallback(async () => {
    const cred = await signInWithGoogle();
    if (cred.user) {
      await syncUserProfile(
        cred.user.uid,
        cred.user.email || '',
        cred.user.displayName || ''
      );
      await checkAdminRole(cred.user);
    }
  }, [checkAdminRole]);

  const logout = useCallback(async () => {
    await signOutUser();
    setUser(null);
    setIsAdmin(false);
    setAdminVerifiedServer(false);
    setIdToken(null);
  }, []);

  const refreshAdminStatus = useCallback(async () => {
    return checkAdminRole(auth.currentUser);
  }, [checkAdminRole]);

  return (
    <AuthContext.Provider
      value={{
        user,
        authReady,
        isAdmin,
        adminVerifiedServer,
        idToken,
        loginWithGoogle,
        logout,
        refreshAdminStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
