/**
 * Get all followers of a dog.
 * Input:  { dogId?: string, dogName?: string }
 * Output: { followers: { telegramId, name, telegramHandle }[], total: number }
 */
import "dotenv/config";
import { readStdinJson } from "../lib/stdin";
import { z } from "zod";
import prisma from "../lib/prisma";

const Input = z.object({
  dogId: z.string().optional(),
  dogName: z.string().optional(),
}).refine((d) => d.dogId || d.dogName, { message: "dogId or dogName required" });

async function main() {
  const raw = await readStdinJson();
  const input = Input.parse(raw);

  const dog = await prisma.dog.findFirst({
    where: input.dogId
      ? { id: input.dogId }
      : { name: { equals: input.dogName, mode: "insensitive" } },
  });

  if (!dog) {
    console.error(JSON.stringify({ error: "Dog not found" }));
    process.exit(1);
  }

  const follows = await prisma.follow.findMany({
    where: { dogId: dog.id, notifyTelegram: true },
    include: { user: { select: { telegramId: true, name: true, telegramHandle: true } } },
  });

  const followers = follows.map((f) => f.user);

  console.log(JSON.stringify({ followers, total: followers.length }));
}

main().catch((err) => {
  console.error(JSON.stringify({ error: err.message }));
  process.exit(1);
});
