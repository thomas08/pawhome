import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const [totalDogs, availableDogs, adoptedDogs, totalFollows, totalUpdates] =
    await Promise.all([
      prisma.dog.count(),
      prisma.dog.count({ where: { status: "AVAILABLE" } }),
      prisma.dog.count({ where: { status: "ADOPTED" } }),
      prisma.follow.count(),
      prisma.dogUpdate.count(),
    ]);

  return NextResponse.json({
    dogs: { total: totalDogs, available: availableDogs, adopted: adoptedDogs },
    follows: { total: totalFollows },
    updates: { total: totalUpdates },
  });
}
