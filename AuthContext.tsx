import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, getRedirectResult, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { firebaseService } from './firebaseService';

const LEGACY_DEMO_MODE_KEY = 'chaze-demo-mode';
const GUEST_MODE_KEY = 'chaze-guest-mode';
// Keep the legacy local user id so existing browser-stored demo data still loads in guest mode.
const GUEST_USER_ID = 'local-demo-user';

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
  isGuestUser: boolean;
  refreshProfile: () => Promise<void>;
  startGuestMode: () => void;
  logout: () => Promise<void>;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isGuestUser: false,
  refreshProfile: async () => {},
  startGuestMode: () => {},
  logout: async () => {},
  setProfile: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const isGuestSessionStored = () => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.localStorage.getItem(GUEST_MODE_KEY) === 'true'
      || window.localStorage.getItem(LEGACY_DEMO_MODE_KEY) === 'true';
  };

  const persistGuestSession = () => {
    window.localStorage.setItem(GUEST_MODE_KEY, 'true');
    window.localStorage.setItem(LEGACY_DEMO_MODE_KEY, 'true');
  };

  const clearGuestSession = () => {
    window.localStorage.removeItem(GUEST_MODE_KEY);
    window.localStorage.removeItem(LEGACY_DEMO_MODE_KEY);
  };

  const buildGuestUser = (): User => ({
    uid: GUEST_USER_ID,
    email: 'guest@chaze-x.local',
    displayName: 'Guest User',
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

  const startGuestMode = () => {
    const guestUser = buildGuestUser();
    persistGuestSession();
    setUser(guestUser);
    setProfile((prev) => prev ?? buildFallbackProfile(guestUser));
    setLoading(false);
    void fetchProfile(guestUser);
  };

  const logout = async () => {
    const isGuestSession = user?.uid === GUEST_USER_ID || isGuestSessionStored();

    if (isGuestSession) {
      clearGuestSession();
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    await signOut(auth);
  };

  useEffect(() => {
    if (isGuestSessionStored()) {
      const guestUser = buildGuestUser();
      setUser(guestUser);
      setProfile((prev) => prev ?? buildFallbackProfile(guestUser));
      setLoading(false);
      void fetchProfile(guestUser);
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

  const isGuestUser = user?.uid === GUEST_USER_ID;

  return (
    <AuthContext.Provider value={{ user, profile, loading, isGuestUser, refreshProfile, startGuestMode, logout, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
