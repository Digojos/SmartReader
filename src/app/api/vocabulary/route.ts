import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getNextReviewDate } from "@/lib/utils";

// GET /api/vocabulary - list user vocab
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const forReview = searchParams.get("review") === "true";

  const where = {
    userId: session.user.id,
    ...(forReview ? { nextReview: { lte: new Date() } } : {}),
  };

  const vocab = await prisma.vocabulary.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(vocab);
}

// POST /api/vocabulary - save a word
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { word, translation, context, textTitle } = await req.json();

  if (!word || !translation) {
    return NextResponse.json({ error: "Word and translation required" }, { status: 400 });
  }

  const vocab = await prisma.vocabulary.upsert({
    where: { userId_word: { userId: session.user.id, word: word.toLowerCase() } },
    update: { translation, context, textTitle },
    create: {
      userId: session.user.id,
      word: word.toLowerCase(),
      translation,
      context,
      textTitle,
    },
  });

  return NextResponse.json(vocab, { status: 201 });
}

// PATCH /api/vocabulary - update mastery after review
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, correct } = await req.json();

  const vocab = await prisma.vocabulary.findUnique({ where: { id } });
  if (!vocab || vocab.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const newMastery = correct ? Math.min(vocab.mastery + 1, 5) : 0;
  const nextReview = getNextReviewDate(newMastery);

  const updated = await prisma.vocabulary.update({
    where: { id },
    data: { mastery: newMastery, nextReview },
  });

  return NextResponse.json(updated);
}
