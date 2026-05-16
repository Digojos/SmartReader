import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import path from "node:path";
import { promises as fs } from "node:fs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLibraryUploadRoot } from "@/lib/library-storage";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const item = await prisma.libraryPdf.findFirst({
    where: { id, userId: session.user.id },
    select: {
      id: true,
      title: true,
      originalName: true,
      fileSize: true,
      pageCount: true,
      extractedText: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const item = await prisma.libraryPdf.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true, storagePath: true },
  });

  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.libraryPdf.delete({ where: { id: item.id } });

  const filePath = path.join(getLibraryUploadRoot(), item.storagePath);
  await fs.unlink(filePath).catch(() => undefined);

  return NextResponse.json({ success: true });
}
