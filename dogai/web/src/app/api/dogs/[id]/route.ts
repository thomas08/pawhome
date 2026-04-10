import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const dog = await prisma.dog.findUnique({
    where: { id },
    include: {
      photos: { orderBy: { isMain: "desc" } },
      tags: true,
      updates: { orderBy: { createdAt: "desc" }, take: 20 },
      _count: { select: { follows: true } },
    },
  });

  if (!dog) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ dog });
}
