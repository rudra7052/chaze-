import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, orderBy, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { COURSES as MOCK_COURSES } from './constants';

const LOCAL_DEMO_PREFIX = 'local-demo';
const LOCAL_STORAGE_PREFIX = 'chaze-local';

function isLocalDemoUser(userId: string) {
  return userId.startsWith(LOCAL_DEMO_PREFIX);
}

function getLocalStorageKey(resource: string, userId: string) {
  return `${LOCAL_STORAGE_PREFIX}:${resource}:${userId}`;
}

function readLocalData<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch (error) {
    console.error('Failed to read local demo data', error);
    return fallback;
  }
}

function writeLocalData(key: string, value: unknown) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to write local demo data', error);
  }
}

export const firebaseService = {
  // COURSES
  async getCourses() {
    try {
      const q = query(collection(db, 'courses'));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        console.log("No courses found in Firestore. Check your database.");
        // Fallback to constants for display if none exist
        return MOCK_COURSES;
      }
      
      const courses: Record<string, any> = {};
      snapshot.forEach(docSnap => {
        courses[docSnap.id] = docSnap.data();
      });
      return courses;
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'courses');
      return {};
    }
  },

  // USER PROFILE
  async getProfile(userId: string) {
    if (isLocalDemoUser(userId)) {
      return readLocalData<Record<string, any> | null>(getLocalStorageKey('profile', userId), null);
    }

    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, `users/${userId}`);
      return null;
    }
  },

  async createProfile(userId: string, data: any) {
    if (isLocalDemoUser(userId)) {
      writeLocalData(getLocalStorageKey('profile', userId), {
        userId,
        ...data,
        createdAt: new Date().toISOString(),
      });
      return;
    }

    try {
      await setDoc(doc(db, 'users', userId), {
        userId,
        ...data,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `users/${userId}`);
    }
  },

  // USER PROGRESS
  async getUserProgress(userId: string) {
    if (isLocalDemoUser(userId)) {
      return readLocalData<any[]>(getLocalStorageKey('user_progress', userId), []);
    }

    try {
      const q = query(collection(db, 'user_progress'), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return [];
      return snapshot.docs.map(doc => doc.data());
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'user_progress');
      return [];
    }
  },

  async saveProgress(userId: string, courseId: string, completedModules: string[], progressPercentage: number, quizScores: any[]) {
    if (isLocalDemoUser(userId)) {
      const key = getLocalStorageKey('user_progress', userId);
      const existing = readLocalData<any[]>(key, []);
      const progressId = `${userId}_${courseId}`;
      const next = existing.filter((entry) => entry.progressId !== progressId);

      next.push({
        progressId,
        userId,
        courseId,
        completedModules,
        progressPercentage,
        quizScores,
        lastAccessed: new Date().toISOString(),
      });

      writeLocalData(key, next);
      return;
    }

    try {
      const progressId = `${userId}_${courseId}`;
      const docRef = doc(db, 'user_progress', progressId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        await updateDoc(docRef, {
          completedModules,
          progressPercentage,
          lastAccessed: serverTimestamp(),
          quizScores
        });
      } else {
        await setDoc(docRef, {
          progressId,
          userId,
          courseId,
          completedModules,
          progressPercentage,
          lastAccessed: serverTimestamp(),
          quizScores
        });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `user_progress`);
    }
  },

  // SIMULATIONS
  async saveSimulationResult(userId: string, type: string, inputData: any, resultData: any, score: number) {
    if (isLocalDemoUser(userId)) {
      const key = getLocalStorageKey('simulation_results', userId);
      const existing = readLocalData<any[]>(key, []);

      existing.unshift({
        simulationId: `${type}_${Math.random().toString(36).substring(2, 9)}`,
        userId,
        type,
        inputData,
        resultData,
        score,
        createdAt: new Date().toISOString(),
      });

      writeLocalData(key, existing);
      return;
    }

    try {
      const simulationId = `${type}_${Math.random().toString(36).substring(2, 9)}`;
      await setDoc(doc(db, 'simulation_results', simulationId), {
        simulationId,
        userId,
        type,
        inputData,
        resultData,
        score,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `simulation_results`);
    }
  },

  async getSimulationResults(userId: string) {
    if (isLocalDemoUser(userId)) {
      return readLocalData<any[]>(getLocalStorageKey('simulation_results', userId), []);
    }

    try {
      const q = query(collection(db, 'simulation_results'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => d.data());
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, `simulation_results`);
      return [];
    }
  },

  // AI INTERACTIONS
  async saveAIInteraction(userId: string, type: string, input: string, output: string) {
    if (isLocalDemoUser(userId)) {
      const key = getLocalStorageKey('ai_interactions', userId);
      const existing = readLocalData<any[]>(key, []);

      existing.unshift({
        interactionId: `ai_${Math.random().toString(36).substring(2, 9)}`,
        userId,
        type,
        input,
        output,
        timestamp: new Date().toISOString(),
      });

      writeLocalData(key, existing);
      return;
    }

    try {
      const interactionId = `ai_${Math.random().toString(36).substring(2, 9)}`;
      await setDoc(doc(db, 'ai_interactions', interactionId), {
        interactionId,
        userId,
        type,
        input,
        output,
        timestamp: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `ai_interactions`);
    }
  }
};
