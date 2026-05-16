import path from "node:path";
import os from "node:os";
import { promises as fs } from "node:fs";
import { afterEach, describe, expect, it } from "vitest";
import {
  createSafeFileName,
  ensureUserLibraryDir,
  getLibraryUploadRoot,
} from "./library-storage";

const originalUploadDir = process.env.LIBRARY_UPLOAD_DIR;
const createdDirs: string[] = [];

afterEach(async () => {
  process.env.LIBRARY_UPLOAD_DIR = originalUploadDir;

  for (const dir of createdDirs.splice(0)) {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

describe("library-storage", () => {
  it("creates safe file names with .pdf extension", () => {
    const safe = createSafeFileName("My File (Final).PDF");

    expect(safe.endsWith(".pdf")).toBe(true);
    expect(safe).toMatch(/^[a-z0-9-]+-[a-z0-9]+\.pdf$/);
  });

  it("uses configured absolute upload directory", () => {
    const tmpDir = path.join(os.tmpdir(), `english-lib-${Date.now()}-abs`);
    process.env.LIBRARY_UPLOAD_DIR = tmpDir;

    expect(getLibraryUploadRoot()).toBe(tmpDir);
  });

  it("creates user directory under configured relative upload root", async () => {
    const tmpBase = await fs.mkdtemp(path.join(os.tmpdir(), "english-lib-"));
    createdDirs.push(tmpBase);

    process.env.LIBRARY_UPLOAD_DIR = path.join(tmpBase, "uploads");

    const userDir = await ensureUserLibraryDir("user-123");
    const stats = await fs.stat(userDir);

    expect(stats.isDirectory()).toBe(true);
    expect(userDir.endsWith(path.join("uploads", "user-123"))).toBe(true);
  });
});
