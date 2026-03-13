"use client";

import { useEffect, useState } from "react";
import { BookmarkPlus, Check, Volume2, Loader2 } from "lucide-react";

interface WordTooltipProps {
  word: string;
  onSave: (translation: string) => void;
  isSaved: boolean;
}

export function WordTooltip({ word, onSave, isSaved }: WordTooltipProps) {
  const [translation, setTranslation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setTranslation(null);

    fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: word }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setTranslation(data.translatedText || null);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [word]);

  const speak = () => {
    const u = new SpeechSynthesisUtterance(word);
    u.lang = "en-US";
    window.speechSynthesis.speak(u);
  };

  return (
    <span className="absolute z-50 left-0 top-6 w-52 bg-gray-900 text-white text-sm rounded-lg shadow-xl p-3 flex flex-col gap-2">
      <span className="font-semibold text-indigo-300">{word}</span>

      {loading && (
        <span className="flex items-center gap-1 text-gray-400 text-xs">
          <Loader2 size={12} className="animate-spin" /> Translating...
        </span>
      )}
      {error && <span className="text-red-400 text-xs">Translation unavailable</span>}
      {translation && <span className="text-gray-100">{translation}</span>}

      <div className="flex gap-2 mt-1">
        <button
          onClick={speak}
          className="flex items-center gap-1 text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded transition-colors"
        >
          <Volume2 size={12} /> Listen
        </button>
        <button
          onClick={() => translation && onSave(translation)}
          disabled={isSaved || !translation}
          className="flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-2 py-1 rounded transition-colors"
        >
          {isSaved ? <><Check size={12} /> Saved</> : <><BookmarkPlus size={12} /> Save</>}
        </button>
      </div>
    </span>
  );
}
