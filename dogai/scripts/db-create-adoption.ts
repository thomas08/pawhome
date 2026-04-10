/**
 * Create an adoption request.
 * Input:  { telegramId: string, dogName: string, reason?: string }
 * Output: { adoption: Adoption } | { error }
 */
import "dotenv/config";
import { readStdinJson } from "../lib/stdin";
import { z } from "zod";
import prisma from "../lib/prisma";

const Input = z.object({
  telegramId: z.string(),
  dogName: z.string(),
  reason: z.string().optional(),
});

async function main() {
  const raw = await readStdinJson();
  const input = Input.parse(raw);

  const [user, dog] = await Promise.all([
    prisma.user.findUnique({ where: { telegramId: input.telegramId } }),
    prisma.dog.findFirst({
      where: { name: { equals: input.dogName, mode: "insensitive" } },
    }),
  ]);

  if (!user) {
    console.error(JSON.stringify({ error: "User not found" }));
    process.exit(1);
  }
  if (!dog) {
    console.error(JSON.stringify({ error: `ไม่พบน้องหมาชื่อ "${input.dogName}"` }));
    process.exit(1);
  }
  if (dog.status !== "AVAILABLE") {
    console.error(JSON.stringify({ error: `น้อง${dog.name}ไม่พร้อมรับเลี้ยงในขณะนี้ค่ะ` }));
    process.exit(1);
  }

  // Check existing pending adoption
  const existing = await prisma.adoption.findFirst({
    where: { userId: user.id, dogId: dog.id, status: "pending" },
  });
  if (existing) {
    console.error(JSON.stringify({ error: "มีคำขอรับเลี้ยงที่รอดำเนินการอยู่แล้วค่ะ" }));
    process.exit(1);
  }

  const adoption = await prisma.adoption.create({
    data: {
      dogId: dog.id,
      userId: user.id,
      reason: input.reason,
      status: "pending",
    },
    include: { dog: true, user: true },
  });

  // Update dog status to pending
  await prisma.dog.update({
    where: { id: dog.id },
    data: { status: "PENDING_ADOPTION" },
  });

  console.log(JSON.stringify({ adoption }));
}

main().catch((err) => {
  console.error(JSON.stringify({ error: err.message }));
  process.exit(1);
});
