import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowLeft, FileText, Calendar } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LibraryReadingClient from "./LibraryReadingClient";

export default async function LibraryReadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  const [item, userVocab] = await Promise.all([
    prisma.libraryPdf.findFirst({
      where: { id, userId: session!.user.id },
      select: {
        id: true,
        title: true,
        originalName: true,
        fileSize: true,
        pageCount: true,
        extractedText: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.vocabulary.findMany({
      where: { userId: session!.user.id },
      select: { word: true },
    }),
  ]);

  if (!item) notFound();

  const savedWords = userVocab.map((entry) => entry.word);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/library"
          className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft size={14} /> Back to library
        </Link>

        <h1 className="text-2xl font-bold text-gray-900">{item.title}</h1>
        <p className="mt-1 text-sm text-gray-500">{item.originalName}</p>

        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><FileText size={12} /> {item.pageCount} pages</span>
          <span className="flex items-center gap-1"><Calendar size={12} /> Added {new Date(item.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <LibraryReadingClient item={item} savedWords={savedWords} />
    </div>
  );
}
