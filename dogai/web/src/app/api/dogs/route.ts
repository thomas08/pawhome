import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { DogStatus, DogSize, DogGender } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const status = searchParams.get("status") as DogStatus | null;
  const size = searchParams.get("size") as DogSize | null;
  const gender = searchParams.get("gender") as DogGender | null;
  const search = searchParams.get("search");
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 12)));
  const skip = (page - 1) * limit;

  const where = {
    ...(status && { status }),
    ...(size && { size }),
    ...(gender && { gender }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
        { breed: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [dogs, total] = await Promise.all([
    prisma.dog.findMany({
      where,
      include: {
        photos: { where: { isMain: true }, take: 1 },
        tags: true,
        _count: { select: { follows: true } },
      },
      orderBy: { registeredAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.dog.count({ where }),
  ]);

  return NextResponse.json({ dogs, total, page, limit });
}
