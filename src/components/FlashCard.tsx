"use client";

import { useState } from "react";
import { Volume2, Check, X, RotateCcw } from "lucide-react";
import { cn, getMasteryLabel, getMasteryColor } from "@/lib/utils";
import type { VocabularyItem } from "@/types";

interface FlashCardProps {
  item: VocabularyItem;
  onResult: (id: string, correct: boolean) => void;
}

export function FlashCard({ item, onResult }: FlashCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [answered, setAnswered] = useState(false);

  const speak = () => {
    const u = new SpeechSynthesisUtterance(item.word);
    u.lang = "en-US";
    window.speechSynthesis.speak(u);
  };

  const handleResult = (correct: boolean) => {
    setAnswered(true);
    onResult(item.id, correct);
  };

  return (
    <div
      className={cn(
        "relative w-full max-w-md mx-auto bg-white border-2 rounded-2xl shadow-sm cursor-pointer select-none transition-all min-h-56 p-6 flex flex-col justify-between",
        flipped ? "border-indigo-400" : "border-gray-200 hover:border-indigo-300"
      )}
      onClick={() => !answered && setFlipped((f) => !f)}
    >
      {/* Mastery badge */}
      <div className="flex justify-between items-start mb-4">
        <span className={cn("text-xs px-2 py-1 rounded-full font-medium", getMasteryColor(item.mastery))}>
          {getMasteryLabel(item.mastery)}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); speak(); }}
          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition-colors"
        >
          <Volume2 size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
        {!flipped ? (
          <>
            <p className="text-3xl font-bold text-gray-900">{item.word}</p>
            {item.context && (
              <p className="text-sm text-gray-500 italic max-w-xs">"{item.context}"</p>
            )}
            <p className="text-xs text-indigo-400 mt-2">Click to reveal translation</p>
          </>
        ) : (
          <>
            <p className="text-2xl font-semibold text-indigo-700">{item.translation}</p>
            {item.textTitle && (
              <p className="text-xs text-gray-400">From: {item.textTitle}</p>
            )}
          </>
        )}
      </div>

      {/* Action buttons (only when flipped and not answered) */}
      {flipped && !answered && (
        <div className="flex gap-3 mt-4">
          <button
            onClick={(e) => { e.stopPropagation(); handleResult(false); }}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-medium text-sm transition-colors"
          >
            <X size={16} /> Hard
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleResult(true); }}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-green-50 hover:bg-green-100 text-green-600 font-medium text-sm transition-colors"
          >
            <Check size={16} /> Easy
          </button>
        </div>
      )}

      {answered && (
        <div className="mt-4 text-center text-sm text-gray-400 flex items-center justify-center gap-1">
          <RotateCcw size={12} /> Next card coming up...
        </div>
      )}
    </div>
  );
}
