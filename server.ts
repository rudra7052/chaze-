import express from "express";
import dotenv from "dotenv";

dotenv.config();

import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import aiRoutes from "./ai";
import simulationRoutes from "./simulation";
import learningRoutes from "./learning";
import lessonsRoutes from "./lessons";
import { admin, initializeFirebaseAdmin } from "./firebaseAdmin";

// ESM polyfill for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  // Initialize Firebase Admin
  try {
    const firebaseStatus = initializeFirebaseAdmin();
    if (firebaseStatus.initialized) {
      console.log(`Firebase Admin initialized successfully from ${firebaseStatus.source}.`);
    } else {
      console.warn("Firebase Admin credentials were not found.");
      console.warn("Running with local lesson fallbacks only.");
    }
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
  }

  app.use(express.json());

  // Backend API Routes (Node-based migration of requested Python structure)
  app.use("/api/ai", aiRoutes);
  app.use("/api/simulation", simulationRoutes);
  app.use("/api/learning", learningRoutes);
  app.use("/api/lessons", lessonsRoutes);

  // API Route Example
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      firebase: admin.apps.length > 0 ? "connected" : "not connected",
      environment: process.env.NODE_ENV || "development",
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
