/**
 * Get or create a user by Telegram ID.
 * Input:  { telegramId: string, telegramHandle?: string, name?: string }
 * Output: { user: User }
 */
import "dotenv/config";
import { readStdinJson } from "../lib/stdin";
import { z } from "zod";
import prisma from "../lib/prisma";

const Input = z.object({
  telegramId: z.string(),
  telegramHandle: z.string().optional(),
  name: z.string().optional(),
});

async function main() {
  const raw = await readStdinJson();
  const input = Input.parse(raw);

  const user = await prisma.user.upsert({
    where: { telegramId: input.telegramId },
    create: {
      telegramId: input.telegramId,
      telegramHandle: input.telegramHandle,
      name: input.name,
    },
    update: {
      telegramHandle: input.telegramHandle ?? undefined,
      name: input.name ?? undefined,
    },
  });

  console.log(JSON.stringify({ user }));
}

main().catch((err) => {
  console.error(JSON.stringify({ error: err.message }));
  process.exit(1);
});
