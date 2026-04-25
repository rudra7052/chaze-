import admin from "firebase-admin";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { LESSONS } from "./lessonData";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, "serviceAccount.json");
if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log("Firebase Admin initialized successfully.");
} else {
  console.error("Service account file not found! Please place it at backend/serviceAccount.json");
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
