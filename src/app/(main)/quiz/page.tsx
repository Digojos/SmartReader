import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Brain, ArrowRight, CheckCircle, XCircle } from "lucide-react";
import { LEVEL_COLORS, type Level } from "@/lib/utils";

export default async function QuizPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const [texts, quizAttempts] = await Promise.all([
    prisma.text.findMany({
      include: { _count: { select: { questions: true } } },
      where: { questions: { some: {} } },
      orderBy: [{ level: "asc" }],
    }),
    prisma.quizAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Best score per text
  const bestScores = new Map<string, number>();
  for (const a of quizAttempts) {
    const current = bestScores.get(a.textId) ?? -1;
    if (a.score > current) bestScores.set(a.textId, a.score);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quiz</h1>
        <p className="text-gray-500 mt-1">Test your comprehension — score 70%+ to complete a text</p>
      </div>

      {texts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Brain size={40} className="mx-auto mb-3 opacity-40" />
          <p>No quizzes available yet.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {texts.map((text) => {
            const best = bestScores.get(text.id);
            const passed = best !== undefined && best >= 70;

            return (
              <Link
                key={text.id}
                href={`/reading/${text.id}`}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-sm transition-all flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LEVEL_COLORS[text.level as Level]}`}>
                    {text.level}
                  </span>
                  {best !== undefined && (
                    <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${passed ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                      {passed ? <CheckCircle size={11} /> : <XCircle size={11} />}
                      Best: {best}%
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">{text.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{text._count.questions} questions</p>
                </div>

                <div className="flex items-center gap-1 text-sm text-indigo-600 font-medium mt-auto">
                  {best !== undefined ? "Retake quiz" : "Start quiz"}
                  <ArrowRight size={14} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
