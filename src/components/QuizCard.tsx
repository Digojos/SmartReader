"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Question } from "@/types";

interface QuizCardProps {
  question: Question;
  index: number;
  onAnswer: (questionId: string, answer: string) => void;
  result?: { correct: boolean; correctAnswer: string; explanation?: string | null };
  submitted: boolean;
}

export function QuizCard({ question, index, onAnswer, result, submitted }: QuizCardProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (option: string) => {
    if (submitted) return;
    setSelected(option);
    onAnswer(question.id, option);
  };

  const options = question.options as string[] | null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <p className="font-medium text-gray-900 mb-4">
        <span className="text-indigo-500 font-bold mr-2">{index + 1}.</span>
        {question.question}
      </p>

      {options && (
        <div className="space-y-2">
          {options.map((option) => {
            const isSelected = selected === option;
            const isCorrect = result?.correctAnswer === option;
            const isWrong = submitted && isSelected && !result?.correct;

            return (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                disabled={submitted}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors",
                  !submitted && "hover:border-indigo-400 hover:bg-indigo-50",
                  isSelected && !submitted && "border-indigo-500 bg-indigo-50",
                  submitted && isCorrect && "border-green-500 bg-green-50 text-green-800",
                  isWrong && "border-red-400 bg-red-50 text-red-800",
                  submitted && !isSelected && !isCorrect && "border-gray-200 text-gray-500",
                  !isSelected && !submitted && "border-gray-200"
                )}
              >
                <span className="flex items-center justify-between">
                  {option}
                  {submitted && isCorrect && <Check size={16} className="text-green-600" />}
                  {isWrong && <X size={16} className="text-red-500" />}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {question.type === "fill_gap" && !options && (
        <input
          type="text"
          disabled={submitted}
          placeholder="Your answer..."
          onChange={(e) => onAnswer(question.id, e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      )}

      {submitted && result?.explanation && (
        <p className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-200">
          💡 {result.explanation}
        </p>
      )}
    </div>
  );
}
