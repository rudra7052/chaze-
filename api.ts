
export interface BudgetData {
  income: number;
  needs: number;
  wants: number;
  savings: number;
}

export interface InvestmentData {
  monthly: number;
  years: number;
  risk: 'safe' | 'moderate' | 'aggressive';
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

export interface LearningResponse {
  summary: string;
  quiz: QuizQuestion[];
  raw?: string;
}

export interface LessonData {
  id: string;
  subject: string;
  unitNumber: number;
  title: string;
  content: string;
  xpReward: number;
  difficulty: "easy" | "medium" | "hard";
}

export interface CompleteLessonResponse {
  success: boolean;
  xp: number;
  level: number;
  badges: string[];
  completedLessons: string[];
}

/**
 * Centered API Service Layer
 * Connects frontend components to the Node.js backend routes
 */
class ApiService {
  private base = "/api";

  async getLessons(): Promise<LessonData[]> {
    const res = await fetch(`${this.base}/lessons`);
    if (!res.ok) throw new Error("Failed to load lessons");
    return res.json();
  }

  async getLesson(id: string): Promise<LessonData> {
    const res = await fetch(`${this.base}/lessons/${id}`);
    if (!res.ok) throw new Error("Failed to load lesson");
    return res.json();
  }

  async completeLesson(userId: string, lessonId: string, score: number): Promise<CompleteLessonResponse> {
    const res = await fetch(`${this.base}/learning/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, lessonId, score }),
    });
    if (!res.ok) {
      if (res.status === 401) {
        console.warn("Unauthorized, but not redirecting");
      }
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to complete lesson");
    }
    return res.json();
  }

  async budgetSimulation(data: BudgetData) {
    const res = await fetch(`${this.base}/simulation/budget`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Budget simulation failed");
    return res.json();
  }

  async investmentSimulation(data: InvestmentData) {
    const res = await fetch(`${this.base}/simulation/investment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Investment simulation failed");
    return res.json();
  }

  async generateSummaryQuiz(content: string): Promise<LearningResponse> {
    const res = await fetch(`${this.base}/learning/generate-summary-quiz`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) throw new Error("Learning generation failed");
    return res.json();
  }

  async aiChat(prompt: string): Promise<{ response: string }> {
    const res = await fetch(`${this.base}/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) throw new Error("AI Chat failed");
    return res.json();
  }
}

export const api = new ApiService();
