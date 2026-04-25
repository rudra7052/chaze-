import { readFileSync, createWriteStream } from 'fs';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import * as dotenv from 'dotenv';
dotenv.config();

let testEnv: any;
const PROJECT_ID = "chazex-test";

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync('DRAFT_firestore.rules', 'utf8'),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe('ChazeX Security Rules', () => {
  it('must deny access without authentication', async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    await assertFails(unauthedDb.collection('users').doc('123').get());
  });

  describe('The Dirty Dozen Payloads', () => {
    it('1. Spoofed User ID Profile Edit', async () => {
      const authedContext = testEnv.authenticatedContext('uid123', { email_verified: true });
      const authedDb = authedContext.firestore();
      
      const p1 = authedDb.collection('users').doc('uid123').set({
        userId: 'malicious_uid',
        name: 'Jane',
        email: 'test@example.com',
        createdAt: authedContext.firestore.FieldValue.serverTimestamp()
      });
      await assertFails(p1);

      const p2 = authedDb.collection('users').doc('malicious_uid').set({
        userId: 'malicious_uid',
        name: 'Jane',
        email: 'test@example.com',
        createdAt: authedContext.firestore.FieldValue.serverTimestamp()
      });
      await assertFails(p2);
    });

    it('2. Giant Profile Attack', async () => {
      const authedContext = testEnv.authenticatedContext('uid123', { email_verified: true });
      const authedDb = authedContext.firestore();
      const largeName = 'a'.repeat(200);
      await assertFails(authedDb.collection('users').doc('uid123').set({
        userId: 'uid123',
        name: largeName,
        email: 'test@example.com',
        createdAt: authedContext.firestore.FieldValue.serverTimestamp()
      }));
    });

    it('3. Elevation of Privilege', async () => {
      const authedContext = testEnv.authenticatedContext('uid123', { email_verified: true });
      const authedDb = authedContext.firestore();
      
      await assertFails(authedDb.collection('users').doc('uid123').set({
        userId: 'uid123',
        name: 'Jane',
        email: 'test@example.com',
        createdAt: authedContext.firestore.FieldValue.serverTimestamp(),
        isAdmin: true
      }));
    });

    it('4. Unverified user edit', async () => {
      const authedContext = testEnv.authenticatedContext('uid123', { email_verified: false }); // false
      const authedDb = authedContext.firestore();
      
      await assertFails(authedDb.collection('users').doc('uid123').set({
        userId: 'uid123',
        name: 'Jane',
        email: 'test@example.com',
        createdAt: authedContext.firestore.FieldValue.serverTimestamp(),
      }));
    });

    it('5. Create Course by Non-Admin', async () => {
      const authedContext = testEnv.authenticatedContext('uid123', { email_verified: true }); 
      const authedDb = authedContext.firestore();
      
      await assertFails(authedDb.collection('courses').doc('course1').set({
        courseId: 'course1',
        title: 'Title',
        description: 'Desc',
        category: 'basics',
        difficulty: 'beginner',
        modules: []
      }));
    });

    it('6. Edit Other Users Progress', async () => {
      const authedContext = testEnv.authenticatedContext('attacker', { email_verified: true }); 
      const authedDb = authedContext.firestore();
      
      await assertFails(authedDb.collection('user_progress').doc('prog123').set({
        progressId: 'prog123',
        userId: 'victim_123', // mismatch auth
        courseId: 'crs101',
        completedModules: [],
        progressPercentage: 50,
        lastAccessed: authedContext.firestore.FieldValue.serverTimestamp(),
        quizScores: []
      }));
    });

    it('7. Fake Timestamp Create', async () => {
      const authedContext = testEnv.authenticatedContext('uid123', { email_verified: true }); 
      const authedDb = authedContext.firestore();
      
      await assertFails(authedDb.collection('simulation_results').doc('sim123').set({
        simulationId: 'sim123',
        userId: 'uid123',
        type: 'budget',
        inputData: {},
        resultData: {},
        score: 100,
        createdAt: 1000 // fake timestamp
      }));
    });

    it('8. Fake Timestamp Update', async () => {
      const authedContext = testEnv.authenticatedContext('uid123', { email_verified: true }); 
      const authedDb = authedContext.firestore();
      
      await testEnv.withSecurityRulesDisabled(async (context: any) => {
        await context.firestore().collection('user_progress').doc('prog123').set({
          progressId: 'prog123',
          userId: 'uid123',
          courseId: 'crs101',
          completedModules: [],
          progressPercentage: 50,
          lastAccessed: 12345,
          quizScores: []
        });
      });

      await assertFails(authedDb.collection('user_progress').doc('prog123').update({
        lastAccessed: 1000 // Fake update
      }));
    });

    it('9. Oversize Array', async () => {
      const authedContext = testEnv.authenticatedContext('uid123', { email_verified: true }); 
      const authedDb = authedContext.firestore();
      const largeGoals = [];
      for (let i = 0; i < 30; i++) largeGoals.push('goal');

      await assertFails(authedDb.collection('users').doc('uid123').set({
        userId: 'uid123',
        name: 'Jane',
        email: 'test@example.com',
        createdAt: authedContext.firestore.FieldValue.serverTimestamp(),
        goals: largeGoals
      }));
    });

    it('10. Incomplete Schema', async () => {
      const authedContext = testEnv.authenticatedContext('uid123', { email_verified: true }); 
      const authedDb = authedContext.firestore();
      
      await assertFails(authedDb.collection('user_progress').doc('prog123').set({
        progressId: 'prog123',
        userId: 'uid123',
        completedModules: [],
        progressPercentage: 0,
        lastAccessed: authedContext.firestore.FieldValue.serverTimestamp(),
        quizScores: []
      }));
    });

    it('11. Unauthorized Read List', async () => {
      const authedContext = testEnv.authenticatedContext('uid123', { email_verified: true }); 
      const authedDb = authedContext.firestore();
      
      // Attempting to list all interactions without a where constraint
      await assertFails(authedDb.collection('ai_interactions').get());
    });

    it('12. Invalid Simulation Score Type', async () => {
      const authedContext = testEnv.authenticatedContext('uid123', { email_verified: true }); 
      const authedDb = authedContext.firestore();
      
      await assertFails(authedDb.collection('simulation_results').doc('sim123').set({
        simulationId: 'sim123',
        userId: 'uid123',
        type: 'budget',
        inputData: {},
        resultData: {},
        score: "100" as any, // Not a number
        createdAt: authedContext.firestore.FieldValue.serverTimestamp()
      }));
    });

  });
});
