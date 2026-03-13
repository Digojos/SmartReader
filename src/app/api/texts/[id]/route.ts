import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const text = await prisma.text.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { order: "asc" } },
    },
  });

  if (!text) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(text);
}
