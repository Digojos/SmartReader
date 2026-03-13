import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BookOpen, Clock, Target, Check } from "lucide-react";
import { LEVELS, CATEGORIES, LEVEL_COLORS, type Level } from "@/lib/utils";

interface SearchParams { level?: string; category?: string }

export default async function ReadingPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const session = await getServerSession(authOptions);
  const { level, category } = await searchParams;

  const [texts, userProgress] = await Promise.all([
    prisma.text.findMany({
      where: {
        ...(level ? { level } : {}),
        ...(category ? { category } : {}),
      },
      include: { _count: { select: { questions: true } } },
      orderBy: [{ level: "asc" }, { createdAt: "asc" }],
    }),
    prisma.userProgress.findMany({
      where: { userId: session!.user.id },
      select: { textId: true, completed: true, score: true },
    }),
  ]);

  const progressMap = new Map(userProgress.map((p) => [p.textId, p]));

  const buildUrl = (params: SearchParams) => {
    const p = new URLSearchParams();
    if (params.level) p.set("level", params.level);
    if (params.category) p.set("category", params.category);
    return `/reading${p.toString() ? `?${p}` : ""}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reading</h1>
        <p className="text-gray-500 mt-1">Click a word while reading to see its translation</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Link
          href={buildUrl({ category })}
          className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${!level ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400"}`}
        >
          All Levels
        </Link>
        {LEVELS.map((l) => (
          <Link
            key={l}
            href={buildUrl({ level: l, category })}
            className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${level === l ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400"}`}
          >
            {l}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={buildUrl({ level })}
          className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${!category ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-600 border-gray-300 hover:border-gray-500"}`}
        >
          All Categories
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            href={buildUrl({ level, category: c })}
            className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${category === c ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-600 border-gray-300 hover:border-gray-500"}`}
          >
            {c}
          </Link>
        ))}
      </div>

      {/* Text Grid */}
      {texts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <BookOpen size={40} className="mx-auto mb-3 opacity-40" />
          <p>No texts found for these filters</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {texts.map((text) => {
            const progress = progressMap.get(text.id);
            return (
              <Link
                key={text.id}
                href={`/reading/${text.id}`}
                className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LEVEL_COLORS[text.level as Level]}`}>
                    {text.level}
                  </span>
                  {progress?.completed && (
                    <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      <Check size={11} /> Done
                    </span>
                  )}
                </div>

                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors line-clamp-2">
                  {text.title}
                </h3>

                <div className="mt-auto flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1"><Target size={11} /> {text.category}</span>
                  <span className="flex items-center gap-1"><Clock size={11} /> {text.readingTime} min</span>
                  <span className="flex items-center gap-1"><BookOpen size={11} /> {text._count.questions} Q</span>
                </div>

                {progress && !progress.completed && (
                  <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-400 rounded-full w-1/2" />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
