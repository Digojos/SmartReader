"use client";

import { useState } from "react";
import { Reader } from "@/components/Reader";
import { QuizCard } from "@/components/QuizCard";
import { Bookmark, CheckCircle, XCircle } from "lucide-react";
import type { TextWithQuestions, Question } from "@/types";

interface Props {
  text: TextWithQuestions;
  savedWords: string[];
  userId: string;
  initialProgress: { completed: boolean; score?: number | null } | null;
}

export function ReadingClient({ text, savedWords: initial, userId, initialProgress }: Props) {
  const [savedWords, setSavedWords] = useState<string[]>(initial);
  const [showQuiz, setShowQuiz] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{
    score: number;
    correct: number;
    total: number;
    results: Record<string, { correct: boolean; correctAnswer: string; explanation?: string | null }>;
  } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  const handleWordSave = async (word: string, translation: string) => {
    if (savedWords.includes(word)) return;

    setSavedWords((prev) => [...prev, word]);
    showNotif(`"${word}" saved to vocabulary`);

    await fetch("/api/vocabulary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word, translation, textTitle: text.title }),
    });
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitQuiz = async () => {
    setSaving(true);
    const res = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ textId: text.id, answers }),
    });
    const data = await res.json();
    setResult(data);
    setSubmitted(true);
    setSaving(false);
  };

  const allAnswered = text.questions.length > 0 && Object.keys(answers).length >= text.questions.length;

  return (
    <div className="space-y-6">
      {/* Notification toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-2">
          <Bookmark size={14} className="text-indigo-400" /> {notification}
        </div>
      )}

      {/* Already completed banner */}
      {initialProgress?.completed && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-800 text-sm">
          <CheckCircle size={16} /> You completed this text with a score of {initialProgress.score}%
        </div>
      )}

      {/* Reader */}
      <Reader
        text={text.content}
        title={text.title}
        savedWords={savedWords}
        onWordSave={handleWordSave}
      />

      {/* Quiz section */}
      {text.questions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Comprehension Quiz</h2>
            {!showQuiz && (
              <button
                onClick={() => setShowQuiz(true)}
                className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Start Quiz
              </button>
            )}
          </div>

          {showQuiz && (
            <>
              <div className="space-y-4">
                {text.questions.map((q, i) => (
                  <QuizCard
                    key={q.id}
                    question={q as Question}
                    index={i}
                    onAnswer={handleAnswer}
                    result={result?.results[q.id]}
                    submitted={submitted}
                  />
                ))}
              </div>

              {/* Score */}
              {submitted && result && (
                <div className={`rounded-xl p-5 border text-center ${result.score >= 70 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {result.score >= 70
                      ? <CheckCircle size={24} className="text-green-600" />
                      : <XCircle size={24} className="text-red-500" />}
                    <span className="text-3xl font-bold">{result.score}%</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {result.correct} of {result.total} correct
                    {result.score >= 70
                      ? " — Text marked as completed! 🎉"
                      : " — Keep practicing!"}
                  </p>
                </div>
              )}

              {!submitted && (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={!allAnswered || saving}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors"
                >
                  {saving ? "Submitting..." : "Submit Quiz"}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
