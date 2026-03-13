import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/texts - list texts with optional filters
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const level = searchParams.get("level");
  const category = searchParams.get("category");

  const texts = await prisma.text.findMany({
    where: {
      ...(level ? { level } : {}),
      ...(category ? { category } : {}),
    },
    include: { _count: { select: { questions: true, progress: true } } },
    orderBy: [{ level: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json(texts);
}
