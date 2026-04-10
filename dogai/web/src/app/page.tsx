import Link from "next/link";
import Image from "next/image";
import { Heart, Home, Rss, Dog } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { telegramLink, formatRelativeTime } from "@/lib/utils";
import { DogCard } from "@/components/DogCard";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

async function getHomeData() {
  const [featuredDogs, stats, latestUpdates] = await Promise.all([
    prisma.dog.findMany({
      where: { status: "AVAILABLE" },
      include: {
        photos: { where: { isMain: true }, take: 1 },
        _count: { select: { follows: true } },
      },
      orderBy: { registeredAt: "desc" },
      take: 6,
    }),
    Promise.all([
      prisma.dog.count(),
      prisma.dog.count({ where: { status: "ADOPTED" } }),
      prisma.follow.count(),
    ]),
    prisma.dogUpdate.findMany({
      include: { dog: { include: { photos: { where: { isMain: true }, take: 1 } } } },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  return {
    featuredDogs,
    stats: { total: stats[0], adopted: stats[1], follows: stats[2] },
    latestUpdates,
  };
}

export default async function HomePage() {
  const { featuredDogs, stats, latestUpdates } = await getHomeData();
  const botUrl = process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL ?? "https://t.me/PawHomeBot";

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-cream to-teal-50 py-20 px-4">
        {/* Decorative dots */}
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage: "radial-gradient(circle, #fbbf24 1px, transparent 1px)", backgroundSize: "32px 32px" }}
        />
        <div className="relative max-w-2xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 text-sm font-medium px-3 py-1 rounded-full mb-5">
            🐾 ช่วยกันหาบ้านให้น้องหมา
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight mb-4">
            น้องหมากำลัง<br className="sm:hidden" />
            <span className="text-amber-500">รอบ้านอบอุ่น</span>
          </h1>
          <p className="text-gray-500 text-lg mb-8 max-w-lg mx-auto">
            ติดตามชีวิตประจำวัน รับอัพเดท และรับเลี้ยงได้เลย — ผ่านเว็บหรือ Telegram Bot
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/dogs"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-7 py-3.5 rounded-full shadow-sm hover:shadow transition-all"
            >
              <Dog size={18} /> ดูน้องหมาทั้งหมด
            </Link>
            <a
              href={botUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-7 py-3.5 rounded-full border border-gray-200 shadow-sm transition-all"
            >
              💬 คุยกับ Bot
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: <Dog size={20} className="text-amber-500" />, value: stats.total,   label: "น้องหมาในระบบ" },
            { icon: <Home size={20} className="text-teal-500" />,  value: stats.adopted, label: "มีบ้านแล้ว" },
            { icon: <Heart size={20} className="text-coral-500 fill-coral-500" />, value: stats.follows, label: "คนติดตาม" },
          ].map(({ icon, value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div className="mb-1">{icon}</div>
              <p className="text-3xl font-bold text-gray-800 tabular-nums">{value}</p>
              <p className="text-sm text-gray-400">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured dogs ────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">น้องหมากำลังรอบ้าน</h2>
          <Link href="/dogs" className="text-sm text-amber-600 hover:underline">ดูทั้งหมด →</Link>
        </div>
        {featuredDogs.length === 0 ? (
          <p className="text-center text-gray-400 py-16">ยังไม่มีน้องหมาในระบบค่ะ</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {featuredDogs.map((dog) => (
              <DogCard key={dog.id} dog={dog} size="sm" />
            ))}
          </div>
        )}
      </section>

      {/* ── Latest updates ───────────────────────────────────────────── */}
      {latestUpdates.length > 0 && (
        <section className="bg-white border-y border-gray-100 py-12">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
                <Rss size={18} className="text-amber-500" /> อัพเดทล่าสุด
              </h2>
              <Link href="/updates" className="text-sm text-amber-600 hover:underline">ดูทั้งหมด →</Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {latestUpdates.map((update) => {
                const photo = update.dog.photos[0];
                return (
                  <Link
                    key={update.id}
                    href={`/dogs/${update.dog.id}`}
                    className="flex gap-3 items-start p-4 rounded-2xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50/30 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-amber-50 shrink-0">
                      {photo ? (
                        <Image src={photo.url} alt={update.dog.name} width={48} height={48} className="object-cover w-full h-full" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-xl">🐶</div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-gray-800">{update.dog.name}</p>
                        {update.mood && <Badge variant="amber" className="text-xs">{update.mood}</Badge>}
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2">{update.narrative}</p>
                      <p className="text-xs text-gray-300 mt-1">{formatRelativeTime(update.createdAt)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 text-center">
        <p className="text-3xl mb-2">🐾</p>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">พร้อมรับน้องหมาแล้วใช่ไหมคะ?</h2>
        <p className="text-gray-500 mb-8">ติดต่อขอรับเลี้ยงผ่านเว็บ หรือคุยกับ Bot ได้เลยค่ะ</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/dogs"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-7 py-3.5 rounded-full shadow-sm transition-all"
          >
            <Dog size={18} /> เลือกน้องหมา
          </Link>
          <a
            href={telegramLink("start", "home")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-gray-700 font-semibold px-7 py-3.5 rounded-full border border-gray-200 shadow-sm hover:shadow transition-all"
          >
            💬 คุยกับ Bot
          </a>
        </div>
      </section>
    </div>
  );
}
