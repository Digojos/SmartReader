import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookOpen, BookMarked, Brain, Flame, Trophy, Clock, Target } from "lucide-react";
import Link from "next/link";
import { LEVEL_COLORS, type Level } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const [totalTexts, completedProgress, vocabulary, quizAttempts, user, recentTexts] =
    await Promise.all([
      prisma.text.count(),
      prisma.userProgress.findMany({ where: { userId, completed: true } }),
      prisma.vocabulary.findMany({ where: { userId } }),
      prisma.quizAttempt.findMany({ where: { userId } }),
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.text.findMany({ take: 4, orderBy: { createdAt: "desc" } }),
    ]);

  const masteredWords = vocabulary.filter((v: { mastery: number }) => v.mastery >= 4).length;
  const wordsForReview = vocabulary.filter((v: { nextReview: Date | string }) => new Date(v.nextReview) <= new Date()).length;
  const avgScore =
    quizAttempts.length > 0
      ? Math.round(quizAttempts.reduce((s: number, a: { score: number }) => s + a.score, 0) / quizAttempts.length)
      : 0;

  const stats = [
    { label: "Texts Completed", value: completedProgress.length, total: totalTexts, icon: BookOpen, color: "indigo" },
    { label: "Words Saved", value: vocabulary.length, extra: `${masteredWords} mastered`, icon: BookMarked, color: "emerald" },
    { label: "Avg Quiz Score", value: `${avgScore}%`, extra: `${quizAttempts.length} quizzes`, icon: Brain, color: "violet" },
    { label: "Study Streak", value: `${user?.streakDays ?? 0} days`, extra: wordsForReview > 0 ? `${wordsForReview} to review` : "Up to date!", icon: Flame, color: "orange" },
  ];

  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {session?.user?.name?.split(" ")[0] || "learner"}! 👋
        </h1>
        <p className="text-gray-500 mt-1">Keep up the great work on your English journey.</p>
      </div>

      {/* Level badge */}
      {user?.level && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Your level:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${LEVEL_COLORS[user.level as Level]}`}>
            {user.level}
          </span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, total, extra, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className={`w-9 h-9 rounded-lg bg-${color}-100 flex items-center justify-center mb-3`}>
              <Icon size={18} className={`text-${color}-600`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {total !== undefined && (
              <p className="text-xs text-gray-400 mt-0.5">of {total} total</p>
            )}
            {extra && <p className="text-xs text-gray-400 mt-0.5">{extra}</p>}
            <p className="text-sm text-gray-600 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Words for review alert */}
      {wordsForReview > 0 && (
        <Link
          href="/vocabulary"
          className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 hover:bg-amber-100 transition-colors"
        >
          <Clock size={20} className="text-amber-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-amber-800">
              {wordsForReview} word{wordsForReview > 1 ? "s" : ""} ready for review
            </p>
            <p className="text-sm text-amber-600">Click to start your flashcard session</p>
          </div>
        </Link>
      )}

      {/* Recent texts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Continue Reading</h2>
          <Link href="/reading" className="text-sm text-indigo-600 hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {recentTexts.map((text) => (
            <Link
              key={text.id}
              href={`/reading/${text.id}`}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="font-medium text-gray-900 text-sm line-clamp-2">{text.title}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${LEVEL_COLORS[text.level as Level]}`}>
                  {text.level}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Target size={11} /> {text.category}</span>
                <span className="flex items-center gap-1"><Clock size={11} /> {text.readingTime} min</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
