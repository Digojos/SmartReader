import type { JsonValue } from "@prisma/client/runtime/library";

export interface TextWithQuestions {
  id: string;
  title: string;
  content: string;
  level: string;
  category: string;
  imageUrl?: string | null;
  wordCount: number;
  readingTime: number;
  createdAt: Date;
  questions: Question[];
  _count?: { progress: number };
}

export interface Question {
  id: string;
  textId: string;
  question: string;
  type: string;
  options?: JsonValue | null;
  correctAnswer: string;
  explanation?: string | null;
  order: number;
}

export interface VocabularyItem {
  id: string;
  userId: string;
  word: string;
  translation: string;
  context?: string | null;
  textTitle?: string | null;
  mastery: number;
  nextReview: Date;
  createdAt: Date;
}

export interface UserProgressItem {
  id: string;
  userId: string;
  textId: string;
  completed: boolean;
  score?: number | null;
  timeSpent: number;
  completedAt?: Date | null;
  text?: TextWithQuestions;
}

export interface DashboardStats {
  totalTexts: number;
  completedTexts: number;
  totalVocabulary: number;
  masteredVocabulary: number;
  wordsForReview: number;
  averageScore: number;
  streakDays: number;
  level: string;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
