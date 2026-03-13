import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const [
    totalTexts,
    completedProgress,
    vocabulary,
    quizAttempts,
    user,
  ] = await Promise.all([
    prisma.text.count(),
    prisma.userProgress.findMany({ where: { userId, completed: true } }),
    prisma.vocabulary.findMany({ where: { userId } }),
    prisma.quizAttempt.findMany({ where: { userId } }),
    prisma.user.findUnique({ where: { id: userId }, select: { streakDays: true, level: true } }),
  ]);

  const masteredVocabulary = vocabulary.filter((v) => v.mastery >= 4).length;
  const wordsForReview = vocabulary.filter((v) => new Date(v.nextReview) <= new Date()).length;
  const averageScore =
    quizAttempts.length > 0
      ? Math.round(quizAttempts.reduce((acc, a) => acc + a.score, 0) / quizAttempts.length)
      : 0;

  return NextResponse.json({
    totalTexts,
    completedTexts: completedProgress.length,
    totalVocabulary: vocabulary.length,
    masteredVocabulary,
    wordsForReview,
    averageScore,
    streakDays: user?.streakDays ?? 0,
    level: user?.level ?? "A1",
  });
}
