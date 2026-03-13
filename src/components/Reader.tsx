"use client";

import { useState, useCallback } from "react";
import { WordTooltip } from "./WordTooltip";
import { AudioPlayer } from "./AudioPlayer";
import { BookmarkPlus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReaderProps {
  text: string;
  title: string;
  savedWords?: string[];
  onWordSave?: (word: string, translation: string) => void;
}

export function Reader({ text, title, savedWords = [], onWordSave }: ReaderProps) {
  const [activeWord, setActiveWord] = useState<string | null>(null);
  const [highlightedWordIndex, setHighlightedWordIndex] = useState<number>(-1);

  const words = text.split(/(\s+)/);

  const handleWordClick = useCallback((word: string) => {
    const clean = word.replace(/[^a-zA-Z'-]/g, "").toLowerCase();
    if (clean.length < 2) return;
    setActiveWord(clean === activeWord ? null : clean);
  }, [activeWord]);

  const handleBoundary = useCallback((charIndex: number) => {
    let count = 0;
    let wordIdx = 0;
    for (let i = 0; i < words.length; i++) {
      if (words[i].trim()) {
        if (count >= charIndex) {
          wordIdx = i;
          break;
        }
        count += words[i].length + 1;
      }
    }
    setHighlightedWordIndex(wordIdx);
  }, [words]);

  const handleSpeechEnd = useCallback(() => {
    setHighlightedWordIndex(-1);
  }, []);

  return (
    <div className="space-y-4">
      <AudioPlayer
        text={text}
        onBoundary={handleBoundary}
        onEnd={handleSpeechEnd}
      />

      <div className="prose prose-lg max-w-none bg-white rounded-xl border border-gray-200 p-6 leading-relaxed">
        {words.map((segment, i) => {
          if (/^\s+$/.test(segment)) return <span key={i}>{segment}</span>;

          const clean = segment.replace(/[^a-zA-Z'-]/g, "").toLowerCase();
          const isSaved = savedWords.includes(clean);
          const isActive = activeWord === clean;
          const isHighlighted = highlightedWordIndex === i;

          return (
            <span key={i} className="relative inline">
              <span
                onClick={() => handleWordClick(segment)}
                className={cn(
                  "cursor-pointer rounded px-0.5 transition-colors",
                  isHighlighted && "bg-yellow-200",
                  isSaved && !isHighlighted && "bg-green-100 text-green-800",
                  isActive && !isHighlighted && "bg-indigo-100 text-indigo-800",
                  !isActive && !isSaved && !isHighlighted && "hover:bg-gray-100"
                )}
              >
                {segment}
              </span>

              {isActive && clean.length >= 2 && (
                <WordTooltip
                  word={clean}
                  onSave={(translation) => {
                    onWordSave?.(clean, translation);
                    setActiveWord(null);
                  }}
                  isSaved={isSaved}
                />
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
