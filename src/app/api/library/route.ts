import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import path from "node:path";
import { promises as fs } from "node:fs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSafeFileName, ensureUserLibraryDir } from "@/lib/library-storage";

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await prisma.libraryPdf.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      title: true,
      originalName: true,
      fileSize: true,
      pageCount: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const fileField = formData.get("file");

    if (!(fileField instanceof File)) {
      return NextResponse.json({ error: "PDF file is required" }, { status: 400 });
    }

    const originalName = fileField.name || "document.pdf";
    const hasPdfExt = originalName.toLowerCase().endsWith(".pdf");
    const isPdfMime = fileField.type === "application/pdf" || fileField.type === "application/octet-stream";

    if (!hasPdfExt && !isPdfMime) {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }

    if (fileField.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: "File too large. Max 25MB" }, { status: 400 });
    }

    const titleField = formData.get("title")?.toString().trim();
    const title = (titleField || path.basename(originalName, path.extname(originalName))).slice(0, 120) || "Untitled PDF";

    const userDir = await ensureUserLibraryDir(session.user.id);
    const safeFileName = createSafeFileName(originalName);
    const absolutePath = path.join(userDir, safeFileName);
    const storagePath = path.join(session.user.id, safeFileName);

    const buffer = Buffer.from(await fileField.arrayBuffer());
    await fs.writeFile(absolutePath, buffer);

    const pdfParse = (await import("pdf-parse")).default;
    const parsed = await pdfParse(buffer);

    const extractedText = (parsed.text || "").replace(/\s+/g, " ").trim();
    if (!extractedText) {
      await fs.unlink(absolutePath).catch(() => undefined);
      return NextResponse.json({ error: "Could not extract text from PDF" }, { status: 400 });
    }

    const created = await prisma.libraryPdf.create({
      data: {
        userId: session.user.id,
        title,
        originalName,
        storagePath,
        fileSize: fileField.size,
        pageCount: parsed.numpages || 0,
        extractedText,
      },
      select: {
        id: true,
        title: true,
        originalName: true,
        fileSize: true,
        pageCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Library upload error:", error);
    return NextResponse.json({ error: "Failed to upload PDF" }, { status: 500 });
  }
}
