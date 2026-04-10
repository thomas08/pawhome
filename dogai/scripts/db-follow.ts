/**
 * Follow or unfollow a dog.
 * Input:  { telegramId: string, dogName: string, action: "follow" | "unfollow" }
 * Output: { success: true, action, dogName, dogId } | { error }
 */
import "dotenv/config";
import { readStdinJson } from "../lib/stdin";
import { z } from "zod";
import prisma from "../lib/prisma";

const Input = z.object({
  telegramId: z.string(),
  dogName: z.string(),
  action: z.enum(["follow", "unfollow"]),
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
    console.error(JSON.stringify({ error: "User not found — call db-get-user.ts first" }));
    process.exit(1);
  }
  if (!dog) {
    console.error(JSON.stringify({ error: `ไม่พบน้องหมาชื่อ "${input.dogName}"` }));
    process.exit(1);
  }

  if (input.action === "follow") {
    await prisma.follow.upsert({
      where: { userId_dogId: { userId: user.id, dogId: dog.id } },
      create: { userId: user.id, dogId: dog.id },
      update: {},
    });
  } else {
    await prisma.follow.deleteMany({
      where: { userId: user.id, dogId: dog.id },
    });
  }

  console.log(JSON.stringify({ success: true, action: input.action, dogName: dog.name, dogId: dog.id }));
}

main().catch((err) => {
  console.error(JSON.stringify({ error: err.message }));
  process.exit(1);
});
