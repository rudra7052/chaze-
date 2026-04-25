import express from "express";
import dotenv from "dotenv";

dotenv.config();

import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";
import fs from "fs";
import aiRoutes from "./ai";
import simulationRoutes from "./simulation";
import learningRoutes from "./learning";
import lessonsRoutes from "./lessons";

// ESM polyfill for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Firebase Admin
  const serviceAccountPath = path.join(__dirname, "serviceAccount.json");
  if (fs.existsSync(serviceAccountPath)) {
    try {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
      }
      console.log("Firebase Admin initialized successfully.");
    } catch (error) {
      console.error("Error initializing Firebase Admin:", error);
    }
  } else {
    console.warn("Service account file not found at:", serviceAccountPath);
    console.warn("Running with local lesson fallbacks only.");
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
      firebase: admin.apps.length > 0 ? "connected" : "not connected" 
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
