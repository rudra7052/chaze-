import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { UserProfile, UserProgress } from '../types';

// NOTE: Since the automated setup failed, we'll try to use placeholder config 
// if the file doesn't exist, but we really want user to fix it.
// For now, we'll use a localStorage-backed mock to keep the app functional 
// during the preview if Firebase is still failing.

const MOCK_UID = "user-123";

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock user login for now
    const mockUser = {
      uid: MOCK_UID,
      email: "rpsb8288@gmail.com",
      displayName: "RPSB User",
    };
    setUser(mockUser);
    setLoading(false);
  }, []);

  return { user, loading };
};

export const progressService = {
  async getProgress(userId: string): Promise<UserProgress> {
    const stored = localStorage.getItem(`progress_${userId}`);
    if (stored) return JSON.parse(stored);
    
    const initial: UserProgress = {
      userId,
      completedUnits: [],
      quizScores: {},
      xp: 0,
      streak: 1,
      lastActive: new Date().toISOString()
    };
    this.saveProgress(userId, initial);
    return initial;
  },

  async saveProgress(userId: string, progress: UserProgress) {
    localStorage.setItem(`progress_${userId}`, JSON.stringify(progress));
  },

  async completeUnit(userId: string, unitId: string, xpGain: number) {
    const progress = await this.getProgress(userId);
    if (!progress.completedUnits.includes(unitId)) {
      progress.completedUnits.push(unitId);
      progress.xp += xpGain;
      await this.saveProgress(userId, progress);
    }
  },

  async saveQuizScore(userId: string, unitId: string, score: number, xpGain: number) {
    const progress = await this.getProgress(userId);
    progress.quizScores[unitId] = Math.max(progress.quizScores[unitId] || 0, score);
    progress.xp += xpGain;
    await this.saveProgress(userId, progress);
  }
};

export const profileService = {
  async getProfile(userId: string): Promise<UserProfile> {
    const stored = localStorage.getItem(`profile_${userId}`);
    if (stored) return JSON.parse(stored);

    const initial: UserProfile = {
      uid: userId,
      email: "rpsb8288@gmail.com",
      displayName: "Smart Investor",
      level: 'Beginner',
      badges: []
    };
    this.saveProfile(userId, initial);
    return initial;
  },

  async saveProfile(userId: string, profile: UserProfile) {
    localStorage.setItem(`profile_${userId}`, JSON.stringify(profile));
  }
};
