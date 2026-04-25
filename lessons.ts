import { Router } from "express";
import admin from "firebase-admin";
import { LESSONS } from "./lessonData";

const router = Router();
const sortLessons = () => [...LESSONS].sort((a, b) => a.unitNumber - b.unitNumber);

// GET /api/lessons
router.get("/", async (req, res) => {
  try {
    if (!admin.apps.length) {
      return res.json(sortLessons());
    }

    const db = admin.firestore();
    const snapshot = await db.collection("lessons").orderBy("unitNumber").get();
    const lessons = snapshot.docs.map(doc => doc.data());
    res.json(lessons);
  } catch (error) {
    console.warn("Falling back to local lesson data:", error);
    res.json(sortLessons());
  }
});

// GET /api/lessons/:id
router.get("/:id", async (req, res) => {
  try {
    if (!admin.apps.length) {
      const lesson = LESSONS.find((item) => item.id === req.params.id);
      if (!lesson) {
        return res.status(404).json({ error: "Lesson not found" });
      }
      return res.json(lesson);
    }

    const db = admin.firestore();
    const doc = await db.collection("lessons").doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Lesson not found" });
    }
    res.json(doc.data());
  } catch (error) {
    const lesson = LESSONS.find((item) => item.id === req.params.id);
    if (!lesson) {
      return res.status(500).json({ error: (error as Error).message });
    }
    res.json(lesson);
  }
});

export default router;
