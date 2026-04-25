import { Router } from "express";
import { generateSummaryAndQuiz } from "./learningService";
import admin from "firebase-admin";
import { LESSONS } from "./lessonData";

const router = Router();
const localProfiles = new Map<string, {
  xp: number;
  level: number;
  completedLessons: string[];
  badges: string[];
}>();

router.post("/complete", async (req, res) => {
  try {
    const { userId, lessonId, score } = req.body;
    
    console.log("Received completion:", userId, lessonId);

    if (!userId || !lessonId) {
      return res.status(400).json({ error: "Missing data" });
    }

    const fallbackLesson = LESSONS.find((lesson) => lesson.id === lessonId);
    const defaultXpReward = fallbackLesson?.xpReward ?? 50;

    if (!admin.apps.length) {
      const currentProfile = localProfiles.get(userId) ?? {
        xp: 0,
        level: 0,
        completedLessons: [],
        badges: [],
      };

      if (!fallbackLesson) {
        return res.status(404).json({ error: "Lesson not found" });
      }

      let xp = currentProfile.xp;
      const completedLessons = [...currentProfile.completedLessons];
      const badges = [...currentProfile.badges];

      if (!completedLessons.includes(lessonId)) {
        xp += defaultXpReward;
        if (score > 80) xp += 30;
        completedLessons.push(lessonId);

        if (completedLessons.length === 1 && !badges.includes("Starter")) {
          badges.push("Starter");
        }
        if (completedLessons.length >= 3 && !badges.includes("Consistent Learner")) {
          badges.push("Consistent Learner");
        }
      }

      const level = Math.floor(xp / 100);
      localProfiles.set(userId, { xp, level, completedLessons, badges });

      return res.json({
        success: true,
        xp,
        level,
        completedLessons,
        badges,
      });
    }

    const db = admin.firestore();
    const lessonDoc = await db.collection("lessons").doc(lessonId).get();
    if (!lessonDoc.exists) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    const lessonData = lessonDoc.data()!;
    const xpReward = lessonData.xpReward ?? defaultXpReward;

    await db.collection("progress").add({
      userId,
      lessonId,
      completed: true,
      score,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.exists ? userDoc.data()! : {};

    let xp = userData.xp || 0;
    const completedLessons = userData.completedLessons || [];
    const badges = userData.badges || [];

    if (!completedLessons.includes(lessonId)) {
      xp += xpReward;
      if (score > 80) xp += 30;
      completedLessons.push(lessonId);

      if (completedLessons.length === 1 && !badges.includes("Starter")) {
        badges.push("Starter");
      }
      if (completedLessons.length >= 3 && !badges.includes("Consistent Learner")) {
        badges.push("Consistent Learner");
      }
    }

    const level = Math.floor(xp / 100);

    await userRef.set({
      xp,
      level,
      completedLessons,
      badges,
      lastActive: new Date().toISOString(),
    }, { merge: true });

    res.json({
      success: true,
      xp,
      level,
      completedLessons,
      badges
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/generate-summary-quiz", async (req, res) => {
  try {
    const { content } = req.body;
    const result = await generateSummaryAndQuiz(content);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
