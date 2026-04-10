/**
 * List dogs with optional filters.
 * Input:  { status?, size?, gender?, breed?, tag?, search?, page?, limit? }
 * Output: { dogs: Dog[], total: number, page: number, limit: number }
 */
import "dotenv/config";
import { readStdinJson } from "../lib/stdin";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";

const Input = z.object({
  status: z.enum(["AVAILABLE", "ADOPTED", "IN_CARE", "PENDING_ADOPTION"]).optional(),
  size: z.enum(["SMALL", "MEDIUM", "LARGE"]).optional(),
  gender: z.enum(["MALE", "FEMALE", "UNKNOWN"]).optional(),
  breed: z.string().optional(),
  tag: z.string().optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(50).optional().default(10),
});

async function main() {
  const raw = await readStdinJson();
  const input = Input.parse(raw);

  const where: Prisma.DogWhereInput = {
    ...(input.status && { status: input.status }),
    ...(input.size && { size: input.size }),
    ...(input.gender && { gender: input.gender }),
    ...(input.breed && { breed: { contains: input.breed, mode: "insensitive" } }),
    ...(input.tag && { tags: { some: { tag: input.tag } } }),
    ...(input.search && {
      OR: [
        { name: { contains: input.search, mode: "insensitive" } },
        { description: { contains: input.search, mode: "insensitive" } },
        { personality: { contains: input.search, mode: "insensitive" } },
        { color: { contains: input.search, mode: "insensitive" } },
        { breed: { contains: input.search, mode: "insensitive" } },
      ],
    }),
  };

  const skip = (input.page - 1) * input.limit;

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
      take: input.limit,
    }),
    prisma.dog.count({ where }),
  ]);

  console.log(JSON.stringify({ dogs, total, page: input.page, limit: input.limit }));
}

main().catch((err) => {
  console.error(JSON.stringify({ error: err.message }));
  process.exit(1);
});
