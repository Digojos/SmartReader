"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Upload, BookOpen, Trash2, FileText } from "lucide-react";
import type { LibraryPdfListItem } from "@/types";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let index = 0;

  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }

  return `${value.toFixed(1)} ${units[index]}`;
}

interface Props {
  initialItems: LibraryPdfListItem[];
}

export function LibraryManager({ initialItems }: Props) {
  const [items, setItems] = useState<LibraryPdfListItem[]>(initialItems);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(file: File | null) {
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/library", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Upload failed");
      setUploading(false);
      return;
    }

    setItems((prev) => [data, ...prev]);
    setUploading(false);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const res = await fetch(`/api/library/${id}`, { method: "DELETE" });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to delete item");
      setDeletingId(null);
      return;
    }

    setItems((prev) => prev.filter((item) => item.id !== id));
    setDeletingId(null);
  }

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [items]
  );

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-indigo-300 bg-indigo-50 px-4 py-7 text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition-colors">
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {uploading ? "Uploading and extracting text..." : "Upload English PDF"}
          <input
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const selected = e.target.files?.[0] || null;
              void handleUpload(selected);
              e.currentTarget.value = "";
            }}
          />
        </label>
        <p className="mt-2 text-xs text-gray-500">PDF files only. Max 25MB per file.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {sortedItems.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white py-16 text-center text-gray-400">
          <BookOpen size={40} className="mx-auto mb-3 opacity-40" />
          <p>No PDFs in your library yet.</p>
          <p className="mt-1 text-sm">Upload an English PDF to start reading.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {sortedItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-gray-900">{item.title}</p>
                <p className="mt-1 text-sm text-gray-500 truncate">{item.originalName}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><FileText size={12} /> {item.pageCount} pages</span>
                  <span>{formatFileSize(item.fileSize)}</span>
                </div>
              </div>

              <div className="ml-4 flex items-center gap-2">
                <Link
                  href={`/library/${item.id}`}
                  className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
                >
                  Open
                </Link>
                <button
                  onClick={() => void handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-60"
                >
                  {deletingId === item.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
