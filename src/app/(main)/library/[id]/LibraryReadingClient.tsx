"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { Reader } from "@/components/Reader";
import type { LibraryPdfDetail } from "@/types";

interface Props {
  item: LibraryPdfDetail;
  savedWords: string[];
}

export default function LibraryReadingClient({ item, savedWords: initialSavedWords }: Props) {
  const [savedWords, setSavedWords] = useState<string[]>(initialSavedWords);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotif = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 2200);
  };

  const handleWordSave = async (word: string, translation: string) => {
    if (savedWords.includes(word)) return;

    setSavedWords((prev) => [...prev, word]);
    showNotif(`\"${word}\" saved to vocabulary`);

    await fetch("/api/vocabulary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word, translation, textTitle: item.title }),
    });
  };

  return (
    <div className="space-y-6">
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm text-white shadow-lg">
          <Bookmark size={14} className="text-indigo-400" />
          {notification}
        </div>
      )}

      <Reader
        title={item.title}
        text={item.extractedText}
        savedWords={savedWords}
        onWordSave={handleWordSave}
      />
    </div>
  );
}
