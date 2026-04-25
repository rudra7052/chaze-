import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, orderBy, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { COURSES as MOCK_COURSES } from './constants';

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
