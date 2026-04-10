export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { dogSizeLabel, dogGenderLabel, formatRelativeTime } from "@/lib/utils";
import { DogStatusBadge } from "@/components/DogStatusBadge";
import { Badge } from "@/components/ui/badge";
import { DogActionButtons } from "./DogActionButtons";

async function getDog(id: string) {
  return prisma.dog.findUnique({
    where: { id },
    include: {
      photos:  { orderBy: { isMain: "desc" } },
      tags:    true,
      updates: { orderBy: { createdAt: "desc" }, take: 20 },
      _count:  { select: { follows: true } },
    },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const dog = await getDog(id);
  if (!dog) return { title: "ไม่พบน้องหมา" };
  const mainPhoto = dog.photos.find((p) => p.isMain) ?? dog.photos[0];
  return {
    title: dog.name,
    description: dog.description,
    openGraph: {
      title: `น้อง${dog.name} | PawHome`,
      description: dog.description,
      images: mainPhoto ? [{ url: mainPhoto.url }] : [],
    },
  };
}

export default async function DogProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dog = await getDog(id);
  if (!dog) notFound();

  const mainPhoto   = dog.photos.find((p) => p.isMain) ?? dog.photos[0];
  const otherPhotos = dog.photos.filter((p) => p.id !== mainPhoto?.id);
  const isAvailable = dog.status === "AVAILABLE";

  const infoItems = [
    dog.breed        && { label: "พันธุ์",           value: dog.breed },
    dog.estimatedAge && { label: "อายุโดยประมาณ",   value: dog.estimatedAge },
    { label: "ขนาด",  value: dogSizeLabel(dog.size) },
    { label: "เพศ",   value: dogGenderLabel(dog.gender) },
    dog.color        && { label: "สีขน",             value: dog.color },
    dog.weight       && { label: "น้ำหนัก",           value: `${dog.weight} กก.` },
    dog.location     && { label: "สถานที่",            value: dog.location },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link href="/dogs" className="inline-flex items-center gap-1 text-sm text-amber-600 hover:underline mb-6">
        ← กลับ
      </Link>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* ── Photos ──────────────────────────────── */}
        <div className="space-y-3">
          <div className="aspect-square relative rounded-3xl overflow-hidden bg-amber-50 shadow-sm">
            {mainPhoto ? (
              <Image src={mainPhoto.url} alt={dog.name} fill className="object-cover" priority />
            ) : (
              <div className="flex items-center justify-center h-full text-7xl">🐶</div>
            )}
          </div>
          {otherPhotos.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {otherPhotos.slice(0, 4).map((p) => (
                <div key={p.id} className="aspect-square relative rounded-xl overflow-hidden bg-amber-50">
                  <Image src={p.url} alt={dog.name} fill className="object-cover hover:scale-105 transition-transform duration-200" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Info ────────────────────────────────── */}
        <div>
          <div className="flex items-start gap-3 mb-2 flex-wrap">
            <h1 className="text-3xl font-bold text-gray-800">{dog.name}</h1>
            <DogStatusBadge status={dog.status} />
          </div>

          {dog.nameOrigin && (
            <p className="text-sm text-gray-400 italic mb-4">&ldquo;{dog.nameOrigin}&rdquo;</p>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            {infoItems.map(({ label, value }) => (
              <div key={label} className="bg-white border border-gray-100 rounded-xl p-3">
                <p className="text-gray-400 text-xs mb-0.5">{label}</p>
                <p className="font-medium text-gray-700 text-sm">{value}</p>
              </div>
            ))}
          </div>

          <p className="text-gray-600 leading-relaxed mb-4 text-sm">{dog.description}</p>

          {dog.personality && (
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">นิสัย</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{dog.personality}</p>
            </div>
          )}

          {dog.healthNotes && (
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">สุขภาพ</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{dog.healthNotes}</p>
            </div>
          )}

          {dog.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {dog.tags.map((t) => (
                <Badge key={t.id} variant="teal">#{t.tag}</Badge>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-6">
            <Heart size={14} className="text-coral-500 fill-coral-500" />
            {dog._count.follows} คนติดตามอยู่
          </div>

          {/* Action buttons — client component for modals */}
          <DogActionButtons dogId={dog.id} dogName={dog.name} isAvailable={isAvailable} />
        </div>
      </div>

      {/* ── Updates Timeline ─────────────────────── */}
      {dog.updates.length > 0 && (
        <section className="border-t border-gray-100 pt-10">
          <h2 className="text-xl font-bold text-gray-800 mb-8">อัพเดทล่าสุด</h2>
          <div className="relative space-y-8 pl-6 before:absolute before:left-0 before:top-1 before:bottom-0 before:w-px before:bg-amber-100">
            {dog.updates.map((update) => (
              <div key={update.id} className="relative">
                <div className="absolute -left-[22px] top-1 w-3 h-3 bg-amber-400 rounded-full ring-2 ring-amber-100" />
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-400">{formatRelativeTime(update.createdAt)}</span>
                  {update.mood && <Badge variant="amber">{update.mood}</Badge>}
                </div>
                {update.photoUrl && (
                  <div className="relative aspect-video max-w-sm rounded-2xl overflow-hidden mb-3">
                    <Image src={update.photoUrl} alt="update" fill className="object-cover" />
                  </div>
                )}
                <p className="text-gray-700 text-sm leading-relaxed">{update.narrative}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
