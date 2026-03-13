"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, X, Loader2 } from "lucide-react";

interface PopupPosition {
  top: number;      // bottom of selection + gap (preferred position)
  rectTop: number;  // top of selection (used to flip above)
  left: number;
}

interface SelectionPopupProps {
  text: string;
  position: PopupPosition;
  onClose: () => void;
}

export default function SelectionPopup({ text, position, onClose }: SelectionPopupProps) {
  const [translation, setTranslation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [adjustedStyle, setAdjustedStyle] = useState<React.CSSProperties>({ position: "fixed", opacity: 0, zIndex: 9998 });

  // Limits
  const MAX_TTS_CHARS = 500; // safe across all browsers and MyMemory fallback

  // Resolve the best available English voice
  function getEnglishVoice(): SpeechSynthesisVoice | null {
    const voices = window.speechSynthesis.getVoices();
    // Preference order: en-US, en-GB, any en-* voice
    return (
      voices.find((v) => v.lang === "en-US") ??
      voices.find((v) => v.lang === "en-GB") ??
      voices.find((v) => v.lang.startsWith("en")) ??
      null
    );
  }

  // Fetch translation on mount
  useEffect(() => {
    if (!text) return;
    setLoading(true);
    setError(null);
    fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, source: "en", target: "pt" }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.translatedText) {
          setTranslation(data.translatedText);
        } else {
          setError("Não foi possível traduzir.");
        }
      })
      .catch(() => setError("Erro ao conectar ao serviço de tradução."))
      .finally(() => setLoading(false));
  }, [text]);

  // Close popup on outside click or touch
  useEffect(() => {
    const handlePointer = (e: MouseEvent | TouchEvent) => {
      const target = e instanceof TouchEvent ? e.touches[0]?.target : e.target;
      if (popupRef.current && target instanceof Node && !popupRef.current.contains(target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handlePointer as EventListener);
    document.addEventListener("touchstart", handlePointer as EventListener);
    return () => {
      document.removeEventListener("mousedown", handlePointer as EventListener);
      document.removeEventListener("touchstart", handlePointer as EventListener);
    };
  }, [onClose]);

  function handleSpeak() {
    if (!text || speaking) return;
    window.speechSynthesis.cancel();

    // Truncate to safe TTS limit
    const ttsText = text.length > MAX_TTS_CHARS ? text.slice(0, MAX_TTS_CHARS) : text;
    const wasTruncated = text.length > MAX_TTS_CHARS;

    const speak = () => {
      const utterance = new SpeechSynthesisUtterance(ttsText);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      const voice = getEnglishVoice();
      if (voice) utterance.voice = voice;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    };

    // getVoices() may return [] on first call — wait for the list to load
    if (window.speechSynthesis.getVoices().length > 0) {
      speak();
    } else {
      window.speechSynthesis.addEventListener("voiceschanged", speak, { once: true });
    }

    if (wasTruncated) {
      // Brief note about truncation (shown via speaking label)
      console.info(`TTS truncado: ${text.length} → ${MAX_TTS_CHARS} caracteres`);
    }
  }

  // Recompute position every time the popup size may have changed
  // (on mount, on translation load, on position change)
  useEffect(() => {
    const el = popupRef.current;
    if (!el) return;

    const isMobile = window.innerWidth < 640;
    if (isMobile) {
      setAdjustedStyle({ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9998 });
      return;
    }

    const MARGIN = 8;
    const popupW = el.offsetWidth || 288;
    const popupH = el.offsetHeight || 200;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Horizontal: center on selection, clamped inside viewport
    let left = position.left;
    if (left + popupW + MARGIN > vw) left = vw - popupW - MARGIN;
    if (left < MARGIN) left = MARGIN;

    // Vertical: prefer below selection; flip above if not enough room
    let top = position.top;
    if (top + popupH + MARGIN > vh) {
      // Flip above the selection
      top = position.rectTop - popupH - MARGIN;
    }
    if (top < MARGIN) top = MARGIN;

    setAdjustedStyle({ position: "fixed", top, left, zIndex: 9998, opacity: 1 });
  }, [position, translation, error, loading]);

  const isMobile = "bottom" in adjustedStyle;

  return (
    <div
      ref={popupRef}
      style={adjustedStyle}
      className={
        isMobile
          ? "w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 rounded-t-2xl shadow-2xl p-4 pb-8"
          : "w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-4"
      }
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 line-clamp-3 leading-snug">
          {text.length > 120 ? text.slice(0, 120) + "…" : text}
        </p>
        <button
          onClick={onClose}
          className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Fechar"
        >
          <X size={16} />
        </button>
      </div>

      {/* Character count */}
      <div className="flex items-center gap-1.5 mb-3">
        <div className="flex-1 h-1 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              text.length > MAX_TTS_CHARS
                ? "bg-red-500"
                : text.length > MAX_TTS_CHARS * 0.8
                ? "bg-amber-400"
                : "bg-green-500"
            }`}
            style={{ width: `${Math.min((text.length / MAX_TTS_CHARS) * 100, 100)}%` }}
          />
        </div>
        <span
          className={`text-xs tabular-nums shrink-0 ${
            text.length > MAX_TTS_CHARS
              ? "text-red-500 font-semibold"
              : text.length > MAX_TTS_CHARS * 0.8
              ? "text-amber-500"
              : "text-gray-400 dark:text-gray-500"
          }`}
        >
          {text.length}/{MAX_TTS_CHARS}
        </span>
      </div>

      {/* Translation */}
      <div className="min-h-[40px] mb-3">
        {loading && (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Loader2 size={14} className="animate-spin" />
            Traduzindo…
          </div>
        )}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {translation && (
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{translation}</p>
        )}
      </div>

      {/* Audio button */}
      <button
        onClick={handleSpeak}
        disabled={speaking}
        className="flex items-center gap-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-1.5 rounded-lg transition-colors w-full justify-center"
      >
        <Volume2 size={14} />
        {speaking ? "Reproduzindo…" : "Ouvir em inglês"}
      </button>
      {text.length > MAX_TTS_CHARS && (
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 text-center">
          ⚠️ Áudio limitado aos primeiros {MAX_TTS_CHARS} caracteres
        </p>
      )}
    </div>
  );
}
