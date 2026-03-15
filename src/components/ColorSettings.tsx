"use client";

import { useEffect, useRef, useState } from "react";
import { Palette, RotateCcw } from "lucide-react";

export interface ReaderColors {
  bg: string;
  text: string;
  fontSize: number;
  fontFamily: string;
  numPages?: number; // novo campo opcional
}

const DEFAULT_COLORS: ReaderColors = { bg: "", text: "", fontSize: 18, fontFamily: "", numPages: undefined };

const FONTS: Array<{ label: string; value: string; serif?: boolean }> = [
  { label: "Padrão (sistema)",     value: "" },
  { label: "Georgia",              value: "Georgia, serif",                            serif: true },
  { label: "Times New Roman",      value: "'Times New Roman', serif",                  serif: true },
  { label: "Palatino",             value: "'Palatino Linotype', Palatino, serif",       serif: true },
  { label: "Garamond",             value: "Garamond, serif",                            serif: true },
  { label: "Book Antiqua",         value: "'Book Antiqua', Palatino, serif",            serif: true },
  { label: "Arial",                value: "Arial, sans-serif" },
  { label: "Verdana",              value: "Verdana, sans-serif" },
  { label: "Trebuchet MS",         value: "'Trebuchet MS', sans-serif" },
  { label: "Tahoma",               value: "Tahoma, sans-serif" },
  { label: "Courier New",          value: "'Courier New', monospace" },
];

const PRESETS: Array<{ label: string } & ReaderColors> = [
  { label: "Padrão",       bg: "",        text: "",        fontSize: 18, fontFamily: "" },
  { label: "Sépia",        bg: "#f5efe0", text: "#3b2a1a", fontSize: 18, fontFamily: "Georgia, serif" },
  { label: "Verde suave",  bg: "#e8f5e9", text: "#1b3a22", fontSize: 18, fontFamily: "" },
  { label: "Azul suave",   bg: "#e8f0fe", text: "#0d2137", fontSize: 18, fontFamily: "" },
  { label: "Cinza escuro", bg: "#1e2330", text: "#d1d5db", fontSize: 18, fontFamily: "" },
  { label: "Preto",        bg: "#0a0a0a", text: "#e5e5e5", fontSize: 18, fontFamily: "" },
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


  function clearStorage() {
    localStorage.removeItem(STORAGE_KEY);
    onChange(DEFAULT_COLORS);
  }
  function reset() {
    onChange(DEFAULT_COLORS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_COLORS));
  }

  const isCustom =
    colors.bg !== "" ||
    colors.text !== "" ||
    colors.fontSize !== DEFAULT_COLORS.fontSize ||
    colors.fontFamily !== "";

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
        <div className="absolute right-0 top-9 z-50 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-3 gap-2">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Personalização
            </span>
            <div className="flex gap-1">
              <button
                onClick={reset}
                disabled={!isCustom}
                className="flex items-center gap-1 text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-red-500 hover:text-red-700 disabled:hover:text-red-500 px-2 py-1 rounded"
                title="Restaurar configurações padrão"
              >
                <RotateCcw size={12} /> Restaurar
              </button>
              <button
                onClick={clearStorage}
                className="flex items-center gap-1 text-xs transition-colors text-gray-500 hover:text-gray-700 px-2 py-1 rounded border border-gray-200 dark:border-gray-700"
                title="Limpar configurações do navegador"
              >
                Limpar
              </button>
            </div>
          </div>

          {/* Presets */}
          <div className="grid grid-cols-3 gap-1.5 mb-4">
            {PRESETS.map((preset) => {
              const active = colors.bg === preset.bg && colors.text === preset.text;
              return (
                <button
                  key={preset.label}
                  onClick={() => apply({ bg: preset.bg, text: preset.text, fontSize: preset.fontSize, fontFamily: preset.fontFamily })}
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

            {/* Font size */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-gray-600 dark:text-gray-400">Tamanho da fonte</label>
                <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{colors.fontSize}px</span>
              </div>
              <input
                type="range"
                min={13}
                max={28}
                step={1}
                value={colors.fontSize}
                onChange={(e) => apply({ ...colors, fontSize: Number(e.target.value) })}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                <span>13px</span>
                <span>28px</span>
              </div>
            </div>

            {/* Font family */}
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1.5">Fonte</label>
              <select
                value={colors.fontFamily}
                onChange={(e) => apply({ ...colors, fontFamily: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ fontFamily: colors.fontFamily || undefined }}
              >
                {FONTS.map((font) => (
                  <option key={font.value} value={font.value} style={{ fontFamily: font.value || undefined }}>
                    {font.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Número de páginas */}
          <div className="mt-3">
            <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1.5">Número de páginas</label>
            <input
              type="number"
              min={1}
              value={colors.numPages ?? ''}
              onChange={e => {
                const num = parseInt(e.target.value, 10);
                apply({ ...colors, numPages: isNaN(num) ? undefined : num });
              }}
              className="w-24 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 280"
            />
            <span className="text-xs text-gray-400 ml-2">(opcional, para navegação manual)</span>
          </div>

          {/* Preview */}
          <div
            className="mt-3 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
            style={{
              backgroundColor: colors.bg || undefined,
              color: colors.text || undefined,
              fontSize: colors.fontSize,
              fontFamily: colors.fontFamily || undefined,
            }}
          >
            <span className="text-[10px] text-gray-400 block mb-1 select-none" style={{ fontFamily: undefined, fontSize: 10 }}>Prévia</span>
            <em>The quick brown fox jumps over the lazy dog.</em>
          </div>
        </div>
      )}
    </div>
  );
}

export { STORAGE_KEY, DEFAULT_COLORS };
