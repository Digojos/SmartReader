"use client";

import { useState, useRef, useCallback } from "react";
import { Play, Pause, Square, Volume2 } from "lucide-react";

interface AudioPlayerProps {
  text: string;
  onBoundary?: (charIndex: number) => void;
  onEnd?: () => void;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function AudioPlayer({ text, onBoundary, onEnd }: AudioPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setPlaying(false);
    onEnd?.();
  }, [onEnd]);

  const play = useCallback(() => {
    if (playing) { stop(); return; }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = speed;

    utterance.onboundary = (e) => {
      if (e.name === "word") onBoundary?.(e.charIndex);
    };

    utterance.onend = () => {
      setPlaying(false);
      onEnd?.();
    };

    utterance.onerror = () => setPlaying(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setPlaying(true);
  }, [playing, text, speed, stop, onBoundary, onEnd]);

  const changeSpeed = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (playing) {
      stop();
      // Small delay to restart with new speed
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        utterance.rate = newSpeed;
        utterance.onend = () => { setPlaying(false); onEnd?.(); };
        utterance.onboundary = (e) => { if (e.name === "word") onBoundary?.(e.charIndex); };
        window.speechSynthesis.speak(utterance);
        setPlaying(true);
      }, 100);
    }
  };

  return (
    <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3">
      <Volume2 size={18} className="text-indigo-500 flex-shrink-0" />

      <button
        onClick={play}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
      >
        {playing ? <Pause size={14} /> : <Play size={14} />}
        {playing ? "Pause" : "Listen"}
      </button>

      {playing && (
        <button
          onClick={stop}
          className="flex items-center gap-1 text-gray-600 hover:text-red-600 px-2 py-1.5 rounded-lg text-sm transition-colors"
        >
          <Square size={14} /> Stop
        </button>
      )}

      <div className="ml-auto flex items-center gap-1">
        <span className="text-xs text-gray-500 mr-1">Speed:</span>
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => changeSpeed(s)}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              speed === s
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-600 hover:bg-indigo-100"
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
}
