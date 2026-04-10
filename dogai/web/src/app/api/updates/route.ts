import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const dogId = searchParams.get("dogId");
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 20)));

  const updates = await prisma.dogUpdate.findMany({
    where: dogId ? { dogId } : {},
    include: {
      dog: {
        include: { photos: { where: { isMain: true }, take: 1 } },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ updates });
}
