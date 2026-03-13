"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, Upload, ChevronLeft, ChevronRight, Pencil, Check, X, Download, Maximize, Minimize } from "lucide-react";
import SelectionPopup from "./SelectionPopup";
import ThemeToggle from "./ThemeToggle";
import ColorSettings, { ReaderColors, DEFAULT_COLORS, STORAGE_KEY as COLOR_KEY } from "./ColorSettings";

interface PopupState {
  text: string;
  position: { top: number; left: number };
}

export default function PdfReader() {
  const [pages, setPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [popup, setPopup] = useState<PopupState | null>(null);
  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectionWarning, setSelectionWarning] = useState<string | null>(null);
  const [readerColors, setReaderColors] = useState<ReaderColors>(DEFAULT_COLORS);
  const textRef = useRef<HTMLDivElement>(null);

  // Load saved colors from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(COLOR_KEY);
    if (saved) {
      try { setReaderColors(JSON.parse(saved)); } catch {}
    }
  }, []);

  // Limits
  const MAX_TRANSLATE_CHARS = 1000; // safe for LibreTranslate + MyMemory fallback

  // Track actual fullscreen state (handles Esc key exit too)
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  function startEdit() {
    setEditDraft(pages[currentPage] ?? "");
    setPopup(null);
    setEditing(true);
  }

  function saveEdit() {
    setPages((prev) => {
      const next = [...prev];
      next[currentPage] = editDraft;
      return next;
    });
    setEditing(false);
  }

  function cancelEdit() {
    setEditing(false);
  }

  // Auto-save pages to localStorage whenever they change
  useEffect(() => {
    if (fileName && pages.length > 0) {
      localStorage.setItem(`pdf-reader:${fileName}`, JSON.stringify(pages));
    }
  }, [pages, fileName]);

  function downloadTxt() {
    const content = pages
      .map((text, i) => (pages.length > 1 ? `--- Page ${i + 1} ---\n\n${text}` : text))
      .join("\n\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (fileName ?? "document").replace(/\.pdf$/i, ".txt");
    a.click();
    URL.revokeObjectURL(url);
  }

  // Load pdfjs dynamically to avoid SSR issues
  async function extractPdfText(file: File): Promise<string[]> {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pageTexts: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const text = content.items
        .map((item) => {
          if ("str" in item) return item.str;
          return "";
        })
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      pageTexts.push(text);
    }

    return pageTexts;
  }

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: import("react-dropzone").FileRejection[]) => {
    if (rejectedFiles.length > 0 && acceptedFiles.length === 0) {
      setError("Por favor envie um arquivo PDF.");
      return;
    }
    const file = acceptedFiles[0];
    if (!file) {
      setError("Por favor envie um arquivo PDF.");
      return;
    }
    // Windows drag-and-drop can report file.type as "" — fall back to extension check
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setError("Por favor envie um arquivo PDF.");
      return;
    }

    setLoading(true);
    setError(null);
    setPages([]);
    setCurrentPage(0);
    setPopup(null);
    setFileName(file.name);

    try {
      // Restore previously saved edits for this file, if any
      const saved = localStorage.getItem(`pdf-reader:${file.name}`);
      if (saved) {
        setPages(JSON.parse(saved));
      } else {
        const pageTexts = await extractPdfText(file);
        setPages(pageTexts);
      }
    } catch (err) {
      console.error(err);
      setError("Não foi possível ler o PDF. Tente outro arquivo.");
    } finally {
      setLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    // Accept both MIME type and extension; Windows drag-drop often sends empty MIME type
    accept: { "application/pdf": [".pdf"], "application/octet-stream": [".pdf"] },
    maxFiles: 1,
  });

  function handleMouseUp() {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    showPopupForSelection(selection);
  }

  function handleTouchEnd() {
    // Small delay so the browser finishes updating the selection
    setTimeout(() => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;
      showPopupForSelection(selection);
    }, 150);
  }

  function showPopupForSelection(selection: Selection) {
    const selectedText = selection.toString().trim();
    if (!selectedText || selectedText.length < 2) return;

    if (selectedText.length > MAX_TRANSLATE_CHARS) {
      selection.removeAllRanges();
      setSelectionWarning(
        `Seleção muito longa (${selectedText.length} caracteres). Máximo: ${MAX_TRANSLATE_CHARS}.`
      );
      // Auto-dismiss after 3s
      setTimeout(() => setSelectionWarning(null), 3000);
      return;
    }

    setSelectionWarning(null);
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    setPopup({
      text: selectedText,
      position: {
        top: rect.bottom + 8,
        left: rect.left + rect.width / 2 - 144, // center the 288px popup
      },
    });
  }

  function closePopup() {
    setPopup(null);
    window.getSelection()?.removeAllRanges();
  }

  function resetPdf() {
    setPages([]);
    setCurrentPage(0);
    setFileName(null);
    setPopup(null);
    setError(null);
    setEditing(false);
  }

  const pageText = pages[currentPage] ?? "";

  // ── Render: Upload screen ───────────────────────────────────────────────────
  if (pages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-6">
        <div className="max-w-lg w-full">
          {/* Title */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 dark:bg-blue-900 rounded-2xl mb-4">
              <FileText className="text-blue-600 dark:text-blue-400" size={28} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">English Reader</h1>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
              Envie um PDF em inglês, selecione qualquer trecho e veja a tradução instantânea.
            </p>
          </div>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-colors
              ${isDragActive
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                : "border-gray-300 dark:border-gray-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"
              }
            `}
          >
            <input {...getInputProps()} />
            <Upload
              size={36}
              className={`mx-auto mb-3 ${isDragActive ? "text-blue-500" : "text-gray-400"}`}
            />
            {isDragActive ? (
              <p className="text-blue-600 dark:text-blue-400 font-medium">Solte o PDF aqui…</p>
            ) : (
              <>
                <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Arraste e solte um PDF
                </p>
                <p className="text-gray-400 text-sm">ou toque para selecionar</p>
              </>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div className="mt-4 text-center text-gray-500 dark:text-gray-400 text-sm animate-pulse">
              Extraindo texto do PDF…
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-red-700 dark:text-red-400 text-sm text-center">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Render: Reader screen ───────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors"
      style={readerColors.bg ? { backgroundColor: readerColors.bg } : undefined}
    >
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
        {/* Filename */}
        <div className="flex items-center gap-2 min-w-0">
          <FileText size={18} className="text-blue-600 shrink-0" />
          <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[120px] sm:max-w-xs">
            {fileName}
          </span>
        </div>

        {/* Page navigation */}
        {pages.length > 1 && (
          <div className="flex items-center gap-1 sm:gap-2 text-sm text-gray-600 dark:text-gray-400 shrink-0">
            <button
              onClick={() => { setCurrentPage((p) => Math.max(0, p - 1)); setPopup(null); }}
              disabled={currentPage === 0}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
              aria-label="Página anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="tabular-nums text-xs sm:text-sm">
              {currentPage + 1} / {pages.length}
            </span>
            <button
              onClick={() => { setCurrentPage((p) => Math.min(pages.length - 1, p + 1)); setPopup(null); }}
              disabled={currentPage === pages.length - 1}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
              aria-label="Próxima página"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {editing ? (
            <>
              <button
                onClick={saveEdit}
                className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm bg-green-600 hover:bg-green-700 text-white px-2 sm:px-3 py-1.5 rounded-lg transition-colors"
              >
                <Check size={14} /> <span className="hidden sm:inline">Salvar</span>
              </button>
              <button
                onClick={cancelEdit}
                className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-2 sm:px-3 py-1.5 rounded-lg transition-colors"
              >
                <X size={14} /> <span className="hidden sm:inline">Cancelar</span>
              </button>
            </>
          ) : (
            <button
              onClick={startEdit}
              className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title="Editar texto desta página"
            >
              <Pencil size={14} /> <span className="hidden sm:inline">Editar</span>
            </button>
          )}
          <ThemeToggle />
          <ColorSettings colors={readerColors} onChange={setReaderColors} />
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={isFullscreen ? "Sair do fullscreen" : "Tela cheia"}
            aria-label={isFullscreen ? "Sair do fullscreen" : "Tela cheia"}
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
          <button
            onClick={downloadTxt}
            className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title="Baixar texto como .txt"
          >
            <Download size={14} /> <span className="hidden sm:inline">Baixar .txt</span>
          </button>
          <button
            onClick={resetPdf}
            className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors whitespace-nowrap"
          >
            <span className="hidden sm:inline">Trocar PDF</span>
            <span className="sm:hidden">Trocar</span>
          </button>
        </div>
      </header>

      {/* Text content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {editing ? (
          <>
            <p className="text-xs text-gray-400 mb-4 select-none">
              Edite o texto abaixo para corrigir artefatos do PDF (títulos colados, letras separadas, etc.).
            </p>
            <textarea
              value={editDraft}
              onChange={(e) => setEditDraft(e.target.value)}
              className="w-full min-h-[70vh] text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl p-4 text-sm sm:text-base leading-relaxed font-serif resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                ...(readerColors.bg ? { backgroundColor: readerColors.bg } : {}),
                ...(readerColors.text ? { color: readerColors.text } : {}),
              }}
              spellCheck={false}
            />
          </>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-4 sm:mb-6 select-none">
              Selecione qualquer trecho do texto para ver a tradução e ouvir a pronúncia.
            </p>
            {selectionWarning && (
              <div className="mb-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs rounded-lg px-3 py-2 select-none">
                {selectionWarning}
              </div>
            )}
            <div
              ref={textRef}
              onMouseUp={handleMouseUp}
              onTouchEnd={handleTouchEnd}
              className="text-gray-800 dark:text-gray-200 text-base sm:text-lg leading-relaxed sm:leading-relaxed whitespace-pre-wrap select-text font-serif"
              style={readerColors.text ? { color: readerColors.text } : undefined}
            >
              {pageText}
            </div>
          </>
        )}
      </main>

      {/* Selection popup */}
      {popup && (
        <SelectionPopup
          text={popup.text}
          position={popup.position}
          onClose={closePopup}
        />
      )}
    </div>
  );
}
