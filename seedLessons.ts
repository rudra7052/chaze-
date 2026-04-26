import { LESSONS } from "./lessonData";
import { admin, initializeFirebaseAdmin } from "./firebaseAdmin";

try {
  const firebaseStatus = initializeFirebaseAdmin({ required: true });
  console.log(`Firebase Admin initialized successfully from ${firebaseStatus.source}.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

const db = admin.firestore();

async function seed() {
  const batch = db.batch();
  const lessonsRef = db.collection("lessons");

  console.log("Starting seed process...");

  for (const lesson of LESSONS) {
    const docRef = lessonsRef.doc(lesson.id);
    batch.set(docRef, lesson);
  }

  try {
    await batch.commit();
    console.log("Successfully seeded lessons collection!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding lessons:", error);
    process.exit(1);
  }
}

seed();
