import { Router } from "express";
import { generateAIResponse } from "./aiService";

const router = Router();

router.post("/chat", async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await generateAIResponse(prompt);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/explain", async (req, res) => {
  try {
    const { content } = req.body;
    const response = await generateAIResponse(`Explain this simply: ${content}`);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
