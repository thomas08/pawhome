/**
 * List users (admin only — role check is done by the agent).
 * Input:  { role?: "PUBLIC" | "ADMIN" | "SUPER_ADMIN", page?: number, limit?: number }
 * Output: { users: User[], total: number }
 */
import "dotenv/config";
import { readStdinJson } from "../lib/stdin";
import { z } from "zod";
import prisma from "../lib/prisma";

const Input = z.object({
  role: z.enum(["PUBLIC", "ADMIN", "SUPER_ADMIN"]).optional(),
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
});

async function main() {
  const raw = await readStdinJson();
  const input = Input.parse(raw);

  const where = input.role ? { role: input.role } : {};
  const skip = (input.page - 1) * input.limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: input.limit,
      include: { _count: { select: { follows: true, adoptions: true } } },
    }),
    prisma.user.count({ where }),
  ]);

  console.log(JSON.stringify({ users, total }));
}

main().catch((err) => {
  console.error(JSON.stringify({ error: err.message }));
  process.exit(1);
});
