import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { dogGenderLabel } from "@/lib/utils";
import { DogCard } from "@/components/DogCard";
import type { DogStatus, DogSize, DogGender } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata = { title: "น้องหมาทั้งหมด" };

interface SearchParams { status?: string; size?: string; gender?: string; search?: string; page?: string }

export default async function DogsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const page  = Number(params.page ?? 1);
  const limit = 16;
  const skip  = (page - 1) * limit;

  const where = {
    ...(params.status && { status: params.status as DogStatus }),
    ...(params.size   && { size:   params.size   as DogSize   }),
    ...(params.gender && { gender: params.gender as DogGender }),
    ...(params.search && {
      OR: [
        { name:        { contains: params.search, mode: "insensitive" as const } },
        { breed:       { contains: params.search, mode: "insensitive" as const } },
        { description: { contains: params.search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [dogs, total] = await Promise.all([
    prisma.dog.findMany({
      where,
      include: {
        photos: { where: { isMain: true }, take: 1 },
        _count: { select: { follows: true } },
      },
      orderBy: { registeredAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.dog.count({ where }),
  ]);

  const totalPages  = Math.ceil(total / limit);
  const hasFilters  = !!(params.status || params.size || params.gender || params.search);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-1">น้องหมาทั้งหมด</h1>
        <p className="text-gray-400 text-sm">พบ {total} ตัว</p>
      </div>

      {/* Filter bar */}
      <form className="sticky top-16 z-30 bg-cream/95 backdrop-blur-sm py-3 -mx-4 px-4 mb-8 flex flex-wrap gap-2 items-center border-b border-gray-100">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            name="search"
            defaultValue={params.search}
            placeholder="ชื่อ, พันธุ์, คำอธิบาย..."
            className="w-full pl-9 pr-4 py-2 rounded-full border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {/* Status */}
          <div className="relative">
            <select
              name="status"
              defaultValue={params.status ?? ""}
              className="appearance-none pl-3 pr-7 py-2 rounded-full border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">สถานะทั้งหมด</option>
              <option value="AVAILABLE">หาบ้าน</option>
              <option value="IN_CARE">กำลังดูแล</option>
              <option value="PENDING_ADOPTION">กำลังดำเนินการ</option>
              <option value="ADOPTED">มีบ้านแล้ว</option>
            </select>
            <SlidersHorizontal size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Size */}
          <div className="relative">
            <select
              name="size"
              defaultValue={params.size ?? ""}
              className="appearance-none pl-3 pr-7 py-2 rounded-full border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">ขนาดทั้งหมด</option>
              <option value="SMALL">เล็ก</option>
              <option value="MEDIUM">กลาง</option>
              <option value="LARGE">ใหญ่</option>
            </select>
            <SlidersHorizontal size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Gender */}
          <div className="relative">
            <select
              name="gender"
              defaultValue={params.gender ?? ""}
              className="appearance-none pl-3 pr-7 py-2 rounded-full border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">เพศทั้งหมด</option>
              <option value="MALE">{dogGenderLabel("MALE")}</option>
              <option value="FEMALE">{dogGenderLabel("FEMALE")}</option>
            </select>
            <SlidersHorizontal size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-5 py-2 rounded-full transition-colors">
            ค้นหา
          </button>

          {hasFilters && (
            <Link href="/dogs" className="text-sm text-gray-400 hover:text-gray-600 px-4 py-2 rounded-full border border-gray-200 transition-colors">
              ล้างตัวกรอง
            </Link>
          )}
        </div>
      </form>

      {/* Grid */}
      {dogs.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <p className="text-5xl mb-4">🐾</p>
          <p className="text-lg">ไม่พบน้องหมาที่ต้องการค่ะ</p>
          {hasFilters && <Link href="/dogs" className="mt-4 inline-block text-amber-600 hover:underline text-sm">ล้างตัวกรองทั้งหมด</Link>}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {dogs.map((dog) => <DogCard key={dog.id} dog={dog} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {page > 1 && (
            <Link href={{ pathname: "/dogs", query: { ...params, page: page - 1 } }}
              className="px-4 py-2 rounded-full border border-gray-200 bg-white text-sm text-gray-600 hover:border-amber-300 transition-colors">
              ← ก่อนหน้า
            </Link>
          )}
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={{ pathname: "/dogs", query: { ...params, page: p } }}
              className={`w-9 h-9 flex items-center justify-center rounded-full text-sm transition-colors ${
                p === page ? "bg-amber-500 text-white font-semibold" : "bg-white border border-gray-200 text-gray-600 hover:border-amber-300"
              }`}
            >
              {p}
            </Link>
          ))}
          {page < totalPages && (
            <Link href={{ pathname: "/dogs", query: { ...params, page: page + 1 } }}
              className="px-4 py-2 rounded-full border border-gray-200 bg-white text-sm text-gray-600 hover:border-amber-300 transition-colors">
              ถัดไป →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
