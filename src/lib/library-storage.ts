import path from "node:path";
import { promises as fs } from "node:fs";

const DEFAULT_UPLOAD_DIR = "uploads/library";

export function getLibraryUploadRoot() {
  const configured = process.env.LIBRARY_UPLOAD_DIR?.trim();
  if (!configured) return path.join(process.cwd(), DEFAULT_UPLOAD_DIR);
  return path.isAbsolute(configured)
    ? configured
    : path.join(process.cwd(), configured);
}

export function createSafeFileName(originalName: string) {
  const ext = path.extname(originalName).toLowerCase() || ".pdf";
  const base = path
    .basename(originalName, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50) || "document";

  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  return `${base}-${unique}${ext === ".pdf" ? ext : ".pdf"}`;
}

export async function ensureUserLibraryDir(userId: string) {
  const userDir = path.join(getLibraryUploadRoot(), userId);
  await fs.mkdir(userDir, { recursive: true });
  return userDir;
}
