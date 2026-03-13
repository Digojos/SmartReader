import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/quiz - submit quiz answers
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { textId, answers } = await req.json();
  // answers: { [questionId]: selectedAnswer }

  const questions = await prisma.question.findMany({ where: { textId } });

  if (questions.length === 0) {
    return NextResponse.json({ error: "No questions found" }, { status: 404 });
  }

  let correct = 0;
  const results: Record<string, { correct: boolean; correctAnswer: string; explanation?: string | null }> = {};

  for (const q of questions) {
    const userAnswer = answers[q.id];
    const isCorrect = userAnswer?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
    if (isCorrect) correct++;
    results[q.id] = { correct: isCorrect, correctAnswer: q.correctAnswer, explanation: q.explanation };
  }

  const score = Math.round((correct / questions.length) * 100);

  // Save quiz attempt
  const attempt = await prisma.quizAttempt.create({
    data: {
      userId: session.user.id,
      textId,
      score,
      answers,
    },
  });

  // If score >= 70, mark text as completed
  if (score >= 70) {
    await prisma.userProgress.upsert({
      where: { userId_textId: { userId: session.user.id, textId } },
      update: { completed: true, score, completedAt: new Date() },
      create: {
        userId: session.user.id,
        textId,
        completed: true,
        score,
        completedAt: new Date(),
      },
    });
  }

  return NextResponse.json({ score, correct, total: questions.length, results, attemptId: attempt.id });
}
