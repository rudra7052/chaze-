import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function generateLessonContent(topic: string, isELIMode: boolean = false) {
  const model = "gemini-3-flash-preview";
  const prompt = `
    Explain the following financial topic: "${topic}".
    ${isELIMode ? "Use 'Explain Like I'm 18' mode: keep it very simple, use relatable analogies for a teenager/young adult, and avoid heavy jargon." : "Provide a clear, professional but beginner-friendly explanation."}
    Include 3 key takeaways.
    Format the output in a clean structure with a title, introduction, main body, and takeaways.
  `;

  try {
    const result = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return result.text;
  } catch (error) {
    console.error("AI Error:", error);
    return "Failed to generate AI content. Please try again later.";
  }
}

export async function generateQuizQuestions(topic: string) {
  const model = "gemini-3-flash-preview";
  const prompt = `
    Generate 5 multiple-choice questions for the following financial topic: "${topic}".
    Each question should also have a scenario-based twist if possible.
    Provide the output in JSON format:
    [
      {
        "question": "string",
        "options": ["string", "string", "string", "string"],
        "correctAnswer": 0, // index of correct option
        "explanation": "string explaining why it's correct"
      }
    ]
  `;

  try {
    const result = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    return JSON.parse(result.text || '[]');
  } catch (error) {
    console.error("AI Error:", error);
    return [];
  }
}

export async function getAIFeedback(type: string, data: any) {
  const model = "gemini-3-flash-preview";
  const prompt = `
    Analyze this ${type} simulation data and provide actionable feedback:
    ${JSON.stringify(data)}
    Keep it concise and encouraging.
  `;

  try {
    const result = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return result.text;
  } catch (error) {
    console.error("AI Error:", error);
    return "Feedback unavailable.";
  }
}

export async function chatWithTutor(message: string, context: string, history: any[] = []) {
  const model = "gemini-3-flash-preview";
  const systemInstruction = `
    You are Chaze Tutor, a friendly and expert financial advisor for young adults.
    The current context of the student is: ${context}.
    Answer questions simply, accurately, and encourage financial literacy.
    If the question is not about finance, politely redirect them back to financial topics.
  `;

  try {
    const chat = ai.chats.create({
      model,
      config: {
        systemInstruction,
      }
    });
    
    const response = await chat.sendMessage({
      message,
    });
    
    return response.text;
  } catch (error) {
    console.error("AI Error:", error);
    return "I'm having trouble connecting to my brain right now. Can we try again?";
  }
}
