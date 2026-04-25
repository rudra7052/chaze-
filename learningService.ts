import { generateAIResponse } from "./aiService";

export async function generateSummaryAndQuiz(content: string) {
  const prompt = `
    Summarize this content and generate 3 MCQs: ${content}
    
    Return the response in strictly JSON format like this:
    {
        "summary": "...",
        "quiz": [
            {
                "question": "...",
                "options": ["A", "B", "C", "D"],
                "answer": "Correct Option Value"
            }
        ]
    }
  `;
  
  try {
    const responseText = await generateAIResponse(prompt);
    
    // Basic cleaning for markdown blocks
    let jsonStr = responseText || "";
    if (jsonStr.includes("```json")) {
      jsonStr = jsonStr.split("```json")[1].split("```")[0].trim();
    } else if (jsonStr.includes("```")) {
      jsonStr = jsonStr.split("```")[1].split("```")[0].trim();
    }
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Failed to parse AI JSON:", error);
    
    // Fallback if AI fails (e.g. invalid API key)
    return {
      summary: "This is a fallback summary as the AI service is currently unavailable. " + content.substring(0, 100) + "...",
      quiz: [
        {
          question: "What is the primary topic of this content?",
          options: ["Finance", "Cooking", "Sports", "Gaming"],
          answer: "Finance"
        },
        {
          question: "Why is tracking your progress important?",
          options: ["It wastes time", "It provides visibility into habits", "It decreases savings", "None of the above"],
          answer: "It provides visibility into habits"
        },
        {
          question: "Which of these is a key recommendation?",
          options: ["Spend more than you earn", "Avoid looking at bank statements", "Pay yourself first", "Max out credit cards"],
          answer: "Pay yourself first"
        }
      ],
      raw: "Error generating content. Please check your API key."
    };
  }
}
