export type Subject = 'budget' | 'investment' | 'tax';

export interface Unit {
  id: string;
  title: string;
  description: string;
  order: number;
}

export interface Course {
  id: Subject;
  title: string;
  units: Unit[];
}

export interface UserProgress {
  userId: string;
  completedUnits: string[]; // unit ids
  quizScores: Record<string, number>; // unitId -> score
  xp: number;
  streak: number;
  lastActive: string; // ISO date
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Pro';
  badges: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface SimulationResult {
  type: 'budget' | 'tax' | 'investment';
  input: any;
  output: any;
  feedback: string;
}
