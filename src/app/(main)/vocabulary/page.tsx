"use client";

import { useEffect, useState } from "react";
import { FlashCard } from "@/components/FlashCard";
import { BookMarked, RotateCcw, Filter } from "lucide-react";
import { getMasteryLabel, getMasteryColor } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { VocabularyItem } from "@/types";

type Mode = "all" | "review";

export default function VocabularyPage() {
  const [vocab, setVocab] = useState<VocabularyItem[]>([]);
  const [mode, setMode] = useState<Mode>("all");
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewQueue, setReviewQueue] = useState<VocabularyItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);

  const load = async (reviewOnly = false) => {
    setLoading(true);
    const url = reviewOnly ? "/api/vocabulary?review=true" : "/api/vocabulary";
    const res = await fetch(url);
    const data = await res.json();
    setVocab(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const startReview = async () => {
    const res = await fetch("/api/vocabulary?review=true");
    const data = await res.json();
    if (data.length === 0) return;
    setReviewQueue(data);
    setCurrentIdx(0);
    setDone(false);
    setReviewMode(true);
  };

  const handleResult = async (id: string, correct: boolean) => {
    await fetch("/api/vocabulary", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, correct }),
    });

    // Update local vocab
    setVocab((prev) =>
      prev.map((v) => v.id === id ? { ...v, mastery: correct ? Math.min(v.mastery + 1, 5) : 0 } : v)
    );

    setTimeout(() => {
      if (currentIdx + 1 >= reviewQueue.length) {
        setDone(true);
      } else {
        setCurrentIdx((i) => i + 1);
      }
    }, 600);
  };

  const wordsForReview = vocab.filter((v) => new Date(v.nextReview) <= new Date()).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vocabulary</h1>
          <p className="text-gray-500 mt-1">{vocab.length} words saved • {vocab.filter(v => v.mastery >= 4).length} mastered</p>
        </div>
        {!reviewMode && wordsForReview > 0 && (
          <button
            onClick={startReview}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <RotateCcw size={15} /> Review {wordsForReview} words
          </button>
        )}
      </div>

      {/* Review Mode */}
      {reviewMode && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {done ? "All done!" : `${currentIdx + 1} / ${reviewQueue.length}`}
            </div>
            <button
              onClick={() => { setReviewMode(false); load(); }}
              className="text-sm text-gray-500 hover:text-gray-800"
            >
              Exit review
            </button>
          </div>

          {!done && reviewQueue[currentIdx] ? (
            <>
              {/* Progress bar */}
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${((currentIdx) / reviewQueue.length) * 100}%` }}
                />
              </div>
              <FlashCard
                item={reviewQueue[currentIdx]}
                onResult={handleResult}
              />
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-2xl mb-2">🎉</p>
              <p className="text-xl font-semibold text-gray-900">Review complete!</p>
              <p className="text-gray-500 mt-1">Great job reviewing your vocabulary.</p>
              <button
                onClick={() => { setReviewMode(false); load(); }}
                className="mt-6 bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Back to vocabulary
              </button>
            </div>
          )}
        </div>
      )}

      {/* Vocabulary List */}
      {!reviewMode && (
        <>
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading vocabulary...</div>
          ) : vocab.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <BookMarked size={40} className="mx-auto mb-3 opacity-40" />
              <p>No words saved yet.</p>
              <p className="text-sm mt-1">Click on words while reading to save them here.</p>
            </div>
          ) : (
            <div className="grid gap-2">
              {vocab.map((item) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-900">{item.word}</span>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", getMasteryColor(item.mastery))}>
                        {getMasteryLabel(item.mastery)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{item.translation}</p>
                    {item.context && (
                      <p className="text-xs text-gray-400 mt-1 italic truncate">"{item.context}"</p>
                    )}
                  </div>
                  {item.textTitle && (
                    <span className="text-xs text-gray-400 ml-4 flex-shrink-0 hidden sm:block">
                      {item.textTitle}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
