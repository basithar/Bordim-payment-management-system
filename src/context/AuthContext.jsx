import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase/config';
import { getUserProfile, createUserProfile } from '../services/dbService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); // Firebase Auth User / Demo user
  const [userProfile, setUserProfile] = useState(null); // Firestore extended user data
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(!isFirebaseConfigured);

  // Monitor Firebase Auth state if configured
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setCurrentUser(user);
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
        } else {
          setCurrentUser(null);
          setUserProfile(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // Default to Kasun Perera (Student) in demo mode initially
      loadDemoUser("student-1");
      setLoading(false);
    }
  }, []);

  const loadDemoUser = async (uid) => {
    setLoading(true);
    const profile = await getUserProfile(uid);
    if (profile) {
      setCurrentUser({ uid: profile.uid, email: profile.email });
      setUserProfile(profile);
    }
    setLoading(false);
  };

  // Sign up handler
  const signUp = async (email, password, extendedData) => {
    if (isFirebaseConfigured) {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const profile = await createUserProfile(user.uid, {
        email,
        ...extendedData
      });
      setUserProfile(profile);
      return user;
    } else {
      // Demo registration
      const newUid = `demo-${Date.now()}`;
      const profile = await createUserProfile(newUid, {
        email,
        ...extendedData
      });
      setCurrentUser({ uid: newUid, email });
      setUserProfile(profile);
      return { uid: newUid, email };
    }
  };

  // Sign in handler
  const signIn = async (email, password) => {
    if (isFirebaseConfigured) {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
      return user;
    } else {
      // Demo Sign In
      if (email.toLowerCase().includes('admin')) {
        await loadDemoUser("admin-1");
      } else {
        await loadDemoUser("student-1");
      }
      return true;
    }
  };

  // Logout handler
  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await firebaseSignOut(auth);
    }
    setCurrentUser(null);
    setUserProfile(null);
  };

  // Quick switch role handler for demo testing
  const switchDemoRole = (role) => {
    if (role === 'admin') {
      loadDemoUser('admin-1');
    } else if (role === 'student-2') {
      loadDemoUser('student-2');
    } else {
      loadDemoUser('student-1');
    }
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    isDemoMode,
    signUp,
    signIn,
    logout,
    switchDemoRole,
    refreshUserProfile: async () => {
      if (currentUser?.uid) {
        const p = await getUserProfile(currentUser.uid);
        setUserProfile(p);
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
