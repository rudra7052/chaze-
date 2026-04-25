import { GoogleGenAI } from "@google/genai";

export async function generateAIResponse(prompt: string): Promise<string> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  if (!geminiKey && !groqKey) {
    console.warn("WARNING: Both GEMINI_API_KEY and GROQ_API_KEY are missing.");
  }

  // 1. Try Gemini first
  try {
    if (!geminiKey) throw new Error("GEMINI_API_KEY is not defined");
    
    console.log("Gemini Key Loaded:", !!geminiKey);
    console.log("AI Provider: Gemini");
    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });
    
    if (response.text) {
      return response.text;
    } else {
      throw new Error("Gemini returned empty response");
    }
  } catch (geminiError: any) {
    let cleanMsg = geminiError?.message || String(geminiError);
    if (cleanMsg.includes('API_KEY_INVALID') || cleanMsg.includes('API key not valid')) {
      cleanMsg = 'API key not valid. Please pass a valid API key.';
    }
    console.error("Gemini failed:", cleanMsg);

    // 2. Try Groq fallback
    try {
      if (!groqKey) throw new Error("GROQ_API_KEY is not defined");
      
      console.log("AI Provider: Groq (Fallback)");
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "groq/compound-mini",
          messages: [{ role: "user", content: prompt }]
        })
      });
      
      if (!res.ok) {
        throw new Error(`Groq API error: ${res.statusText}`);
      }
      
      const data = await res.json();
      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content;
      } else {
        throw new Error("Groq returned empty response");
      }
    } catch (groqError) {
      console.error("Both AI services failed. Groq error:", groqError instanceof Error ? groqError.message : groqError);
    }
  }
  
  return "AI service is temporarily unavailable.";
}
