import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LibraryManager } from "@/components/LibraryManager";

export default async function LibraryPage() {
  const session = await getServerSession(authOptions);

  const initialItems = await prisma.libraryPdf.findMany({
    where: { userId: session!.user.id },
    select: {
      id: true,
      title: true,
      originalName: true,
      fileSize: true,
      pageCount: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Library</h1>
        <p className="mt-1 text-gray-500">
          Upload your English PDFs and keep them in your personal reading library.
        </p>
      </div>

      <LibraryManager initialItems={initialItems} />
    </div>
  );
}
