"use client";

import { useEffect, useRef, useState } from "react";
import { Palette, RotateCcw } from "lucide-react";

export interface ReaderColors {
  bg: string;
  text: string;
}

const DEFAULT_COLORS: ReaderColors = { bg: "", text: "" };

const PRESETS: Array<{ label: string } & ReaderColors> = [
  { label: "Padrão",      bg: "",        text: ""        },
  { label: "Sépia",       bg: "#f5efe0", text: "#3b2a1a" },
  { label: "Verde suave", bg: "#e8f5e9", text: "#1b3a22" },
  { label: "Azul suave",  bg: "#e8f0fe", text: "#0d2137" },
  { label: "Cinza escuro",bg: "#1e2330", text: "#d1d5db" },
  { label: "Preto",       bg: "#0a0a0a", text: "#e5e5e5" },
];

const STORAGE_KEY = "reader-custom-colors";

interface Props {
  colors: ReaderColors;
  onChange: (c: ReaderColors) => void;
}

export default function ColorSettings({ colors, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click/touch
  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e instanceof TouchEvent ? e.touches[0]?.target : e.target;
      if (panelRef.current && target instanceof Node && !panelRef.current.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler as EventListener);
    document.addEventListener("touchstart", handler as EventListener);
    return () => {
      document.removeEventListener("mousedown", handler as EventListener);
      document.removeEventListener("touchstart", handler as EventListener);
    };
  }, []);

  function apply(c: ReaderColors) {
    onChange(c);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
  }

  function reset() {
    onChange(DEFAULT_COLORS);
    localStorage.removeItem(STORAGE_KEY);
  }

  const isCustom = colors.bg !== "" || colors.text !== "";

  return (
    <div ref={panelRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`p-1.5 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
          isCustom
            ? "text-blue-600 dark:text-blue-400"
            : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        }`}
        title="Personalizar cores"
        aria-label="Personalizar cores"
      >
        <Palette size={16} />
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-50 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Cores da leitura
            </span>
            {isCustom && (
              <button
                onClick={reset}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
                title="Restaurar padrão"
              >
                <RotateCcw size={12} /> Restaurar
              </button>
            )}
          </div>

          {/* Presets */}
          <div className="grid grid-cols-3 gap-1.5 mb-4">
            {PRESETS.map((preset) => {
              const active = colors.bg === preset.bg && colors.text === preset.text;
              return (
                <button
                  key={preset.label}
                  onClick={() => apply({ bg: preset.bg, text: preset.text })}
                  className={`relative rounded-lg border-2 transition-all overflow-hidden ${
                    active
                      ? "border-blue-500 scale-105 shadow"
                      : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                  }`}
                  title={preset.label}
                >
                  <div
                    className="h-8 w-full"
                    style={{
                      backgroundColor: preset.bg || "#ffffff",
                    }}
                  />
                  <div
                    className="text-center py-0.5 text-[10px] font-medium truncate px-1"
                    style={{
                      backgroundColor: preset.bg || "#ffffff",
                      color: preset.text || "#1f2937",
                    }}
                  >
                    {preset.label}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom pickers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-600 dark:text-gray-400">Cor do fundo</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-mono">
                  {colors.bg || "(padrão)"}
                </span>
                <input
                  type="color"
                  value={colors.bg || "#ffffff"}
                  onChange={(e) => apply({ ...colors, bg: e.target.value })}
                  className="w-8 h-7 rounded cursor-pointer border border-gray-300 dark:border-gray-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-600 dark:text-gray-400">Cor da letra</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-mono">
                  {colors.text || "(padrão)"}
                </span>
                <input
                  type="color"
                  value={colors.text || "#1f2937"}
                  onChange={(e) => apply({ ...colors, text: e.target.value })}
                  className="w-8 h-7 rounded cursor-pointer border border-gray-300 dark:border-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          {isCustom && (
            <div
              className="mt-3 rounded-lg p-3 text-xs border border-gray-200 dark:border-gray-700"
              style={{ backgroundColor: colors.bg, color: colors.text }}
            >
              Prévia: <em>The quick brown fox jumps over the lazy dog.</em>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { STORAGE_KEY, DEFAULT_COLORS };
