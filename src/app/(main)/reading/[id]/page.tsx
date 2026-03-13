import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import { LEVEL_COLORS, type Level } from "@/lib/utils";
import { ArrowLeft, Clock, Target, Brain } from "lucide-react";
import Link from "next/link";
import { ReadingClient } from "./ReadingClient";

export default async function ReadingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const [text, userVocab, progress] = await Promise.all([
    prisma.text.findUnique({
      where: { id },
      include: { questions: { orderBy: { order: "asc" } } },
    }),
    prisma.vocabulary.findMany({
      where: { userId: session!.user.id },
      select: { word: true },
    }),
    prisma.userProgress.findUnique({
      where: { userId_textId: { userId: session!.user.id, textId: id } },
    }),
  ]);

  if (!text) notFound();

  const savedWords = userVocab.map((v) => v.word);

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div>
        <Link href="/reading" className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-4 transition-colors">
          <ArrowLeft size={14} /> Back to Reading
        </Link>
        <div className="flex flex-wrap items-start gap-3">
          <h1 className="text-2xl font-bold text-gray-900 flex-1">{text.title}</h1>
          <span className={`text-sm px-3 py-1 rounded-full font-semibold ${LEVEL_COLORS[text.level as Level]}`}>
            {text.level}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
          <span className="flex items-center gap-1"><Target size={13} /> {text.category}</span>
          <span className="flex items-center gap-1"><Clock size={13} /> {text.readingTime} min read</span>
          <span className="flex items-center gap-1"><Brain size={13} /> {text.questions.length} questions</span>
        </div>
      </div>

      {/* Client component handles Reader, Quiz, and saving */}
      <ReadingClient
        text={text}
        savedWords={savedWords}
        userId={session!.user.id}
        initialProgress={progress}
      />
    </div>
  );
}
