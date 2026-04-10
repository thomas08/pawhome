import Image from "next/image";
import Link from "next/link";
import { Rss } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatRelativeTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "อัพเดทล่าสุด" };

export default async function UpdatesPage() {
  const updates = await prisma.dogUpdate.findMany({
    include: { dog: { include: { photos: { where: { isMain: true }, take: 1 } } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-2 mb-8">
        <Rss size={22} className="text-amber-500" />
        <h1 className="text-3xl font-bold text-gray-800">อัพเดทล่าสุด</h1>
      </div>

      {updates.length === 0 ? (
        <p className="text-gray-400 text-center py-20">ยังไม่มีอัพเดทค่ะ</p>
      ) : (
        <div className="space-y-5">
          {updates.map((update) => {
            const photo = update.dog.photos[0];
            return (
              <article key={update.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-amber-200 transition-colors">
                {update.photoUrl && (
                  <div className="relative aspect-video">
                    <Image src={update.photoUrl} alt="update photo" fill className="object-cover" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <Link href={`/dogs/${update.dog.id}`} className="flex items-center gap-2.5 group">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-amber-50 shrink-0">
                        {photo ? (
                          <Image src={photo.url} alt={update.dog.name} width={36} height={36} className="object-cover w-full h-full" />
                        ) : (
                          <div className="flex items-center justify-center h-full">🐶</div>
                        )}
                      </div>
                      <span className="font-semibold text-sm text-gray-800 group-hover:text-amber-600 transition-colors">
                        {update.dog.name}
                      </span>
                    </Link>
                    {update.mood && <Badge variant="amber">{update.mood}</Badge>}
                    <span className="ml-auto text-xs text-gray-300">{formatRelativeTime(update.createdAt)}</span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{update.narrative}</p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
