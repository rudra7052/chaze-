import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, getRedirectResult, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { firebaseService } from './firebaseService';

const DEMO_MODE_KEY = 'chaze-demo-mode';
const DEMO_USER_ID = 'local-demo-user';

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
  isDemoUser: boolean;
  refreshProfile: () => Promise<void>;
  startDemoMode: () => void;
  logout: () => Promise<void>;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isDemoUser: false,
  refreshProfile: async () => {},
  startDemoMode: () => {},
  logout: async () => {},
  setProfile: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const buildDemoUser = (): User => ({
    uid: DEMO_USER_ID,
    email: 'demo@localhost',
    displayName: 'Local Demo',
  } as User);

  const buildFallbackProfile = (currentUser: User): UserProfile => ({
    name: currentUser.displayName || 'Learner',
    email: currentUser.email || '',
    goals: [],
    riskProfile: 'medium',
    xp: 0,
    level: 0,
    badges: [],
    completedLessons: [],
    lastActive: null,
  });

  const fetchProfile = async (currentUser: User) => {
    const fallbackProfile = buildFallbackProfile(currentUser);

    try {
      let p = await firebaseService.getProfile(currentUser.uid);
      if (!p) {
        const newProfile = {
          ...fallbackProfile,
          lastActive: undefined,
        };
        await firebaseService.createProfile(currentUser.uid, newProfile);
        p = await firebaseService.getProfile(currentUser.uid);
      }

      const normalizedProfile: UserProfile = {
        name: p?.name || p?.displayName || fallbackProfile.name,
        email: p?.email || fallbackProfile.email,
        goals: p?.goals || fallbackProfile.goals,
        riskProfile: p?.riskProfile || fallbackProfile.riskProfile,
        xp: p?.xp || fallbackProfile.xp,
        level: p?.level || fallbackProfile.level,
        badges: p?.badges || fallbackProfile.badges,
        completedLessons: p?.completedLessons || fallbackProfile.completedLessons,
        lastActive: p?.lastActive || fallbackProfile.lastActive,
      };

      setProfile(normalizedProfile);
    } catch (err) {
      console.error("Failed to fetch/create profile", err);
      setProfile((prev) => prev ?? fallbackProfile);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  const startDemoMode = () => {
    const demoUser = buildDemoUser();
    window.localStorage.setItem(DEMO_MODE_KEY, 'true');
    setUser(demoUser);
    setProfile((prev) => prev ?? buildFallbackProfile(demoUser));
    setLoading(false);
    void fetchProfile(demoUser);
  };

  const logout = async () => {
    const isDemoSession = user?.uid === DEMO_USER_ID || window.localStorage.getItem(DEMO_MODE_KEY) === 'true';

    if (isDemoSession) {
      window.localStorage.removeItem(DEMO_MODE_KEY);
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    await signOut(auth);
  };

  useEffect(() => {
    if (window.localStorage.getItem(DEMO_MODE_KEY) === 'true') {
      const demoUser = buildDemoUser();
      setUser(demoUser);
      setProfile((prev) => prev ?? buildFallbackProfile(demoUser));
      setLoading(false);
      void fetchProfile(demoUser);
      return () => {};
    }

    let isActive = true;
    const fallbackTimer = window.setTimeout(() => {
      if (!isActive) {
        return;
      }

      const currentUser = auth.currentUser;
      setUser(currentUser);

      if (currentUser) {
        setProfile((prev) => prev ?? buildFallbackProfile(currentUser));
        void fetchProfile(currentUser);
      } else {
        setProfile(null);
      }

      setLoading(false);
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!isActive) {
        return;
      }

      window.clearTimeout(fallbackTimer);
      setUser(currentUser);
      if (currentUser) {
        setProfile((prev) => prev ?? buildFallbackProfile(currentUser));
        setLoading(false);
        void fetchProfile(currentUser);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    void getRedirectResult(auth)
      .then((result) => {
        if (!isActive || !result?.user) {
          return;
        }

        window.clearTimeout(fallbackTimer);
        setUser(result.user);
        setProfile((prev) => prev ?? buildFallbackProfile(result.user));
        setLoading(false);
        void fetchProfile(result.user);
      })
      .catch((error) => {
        console.error('Failed to resolve redirect sign-in', error);
      });

    return () => {
      isActive = false;
      window.clearTimeout(fallbackTimer);
      unsubscribe();
    };
  }, []);

  const isDemoUser = user?.uid === DEMO_USER_ID;

  return (
    <AuthContext.Provider value={{ user, profile, loading, isDemoUser, refreshProfile, startDemoMode, logout, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
