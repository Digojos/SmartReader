import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type Level = (typeof LEVELS)[number];

export const LEVEL_COLORS: Record<Level, string> = {
  A1: "bg-green-100 text-green-800",
  A2: "bg-emerald-100 text-emerald-800",
  B1: "bg-blue-100 text-blue-800",
  B2: "bg-indigo-100 text-indigo-800",
  C1: "bg-purple-100 text-purple-800",
  C2: "bg-red-100 text-red-800",
};

export const CATEGORIES = ["Daily Life", "Travel", "Technology", "Culture", "Science", "Business"] as const;
export type Category = (typeof CATEGORIES)[number];

export function getReadingTime(wordCount: number): number {
  return Math.ceil(wordCount / 200); // ~200 words per minute
}

export function getNextReviewDate(mastery: number): Date {
  const intervals = [1, 2, 4, 8, 16, 32]; // days
  const days = intervals[Math.min(mastery, 5)];
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

export function getMasteryLabel(mastery: number): string {
  const labels = ["New", "Learning", "Familiar", "Practiced", "Mastered", "Expert"];
  return labels[Math.min(mastery, 5)];
}

export function getMasteryColor(mastery: number): string {
  const colors = [
    "bg-gray-100 text-gray-700",
    "bg-orange-100 text-orange-700",
    "bg-yellow-100 text-yellow-700",
    "bg-blue-100 text-blue-700",
    "bg-green-100 text-green-700",
    "bg-purple-100 text-purple-700",
  ];
  return colors[Math.min(mastery, 5)];
}
