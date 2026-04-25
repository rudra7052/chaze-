import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { firebaseService } from './firebaseService';

export interface UserProfile {
  name: string;
  email: string;
  goals: string[];
  riskProfile: string;
  xp?: number;
  level?: number;
  badges?: string[];
  completedLessons?: string[];
  lastActive?: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
  setProfile: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (currentUser: User) => {
    try {
      let p = await firebaseService.getProfile(currentUser.uid);
      if (!p) {
        const newProfile = {
          name: currentUser.displayName || 'Learner',
          email: currentUser.email || '',
          goals: [],
          riskProfile: 'medium',
          xp: 0,
          level: 0,
          badges: [],
          completedLessons: []
        };
        await firebaseService.createProfile(currentUser.uid, newProfile);
        p = await firebaseService.getProfile(currentUser.uid);
      }

      const normalizedProfile: UserProfile = {
        name: p?.name || p?.displayName || currentUser.displayName || 'Learner',
        email: p?.email || currentUser.email || '',
        goals: p?.goals || [],
        riskProfile: p?.riskProfile || 'medium',
        xp: p?.xp || 0,
        level: p?.level || 0,
        badges: p?.badges || [],
        completedLessons: p?.completedLessons || [],
        lastActive: p?.lastActive || null,
      };

      setProfile(normalizedProfile);
    } catch (err) {
      console.error("Failed to fetch/create profile", err);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
