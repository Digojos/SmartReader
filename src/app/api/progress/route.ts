import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/progress - user progress overview
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const progress = await prisma.userProgress.findMany({
    where: { userId: session.user.id },
    include: { text: { select: { title: true, level: true, category: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(progress);
}

// POST /api/progress - save or update progress
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { textId, completed, score, timeSpent } = await req.json();

  const progress = await prisma.userProgress.upsert({
    where: { userId_textId: { userId: session.user.id, textId } },
    update: {
      completed: completed ?? undefined,
      score: score ?? undefined,
      timeSpent: timeSpent ?? undefined,
      completedAt: completed ? new Date() : undefined,
    },
    create: {
      userId: session.user.id,
      textId,
      completed: completed ?? false,
      score,
      timeSpent: timeSpent ?? 0,
      completedAt: completed ? new Date() : null,
    },
  });

  // Update streak
  if (completed) {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (user) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastStudy = user.lastStudyDate ? new Date(user.lastStudyDate) : null;
      if (lastStudy) lastStudy.setHours(0, 0, 0, 0);

      const isNewDay = !lastStudy || lastStudy.getTime() < today.getTime();
      const isConsecutive =
        lastStudy &&
        today.getTime() - lastStudy.getTime() === 86400000;

      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          lastStudyDate: new Date(),
          streakDays: isNewDay ? (isConsecutive ? user.streakDays + 1 : 1) : user.streakDays,
        },
      });
    }
  }

  return NextResponse.json(progress);
}
