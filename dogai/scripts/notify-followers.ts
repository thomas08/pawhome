/**
 * Broadcast a message to all followers of a dog (or all dogs).
 * Input:  { dogId?: string, dogName?: string, message: string, photoUrl?: string }
 *         Omit dogId/dogName to broadcast to all users.
 * Output: { sent: number, failed: number }
 */
import "dotenv/config";
import { readStdinJson } from "../lib/stdin";
import { z } from "zod";
import prisma from "../lib/prisma";
import { sendMessage, sendPhoto } from "../lib/telegram";

const Input = z.object({
  dogId: z.string().optional(),
  dogName: z.string().optional(),
  message: z.string(),
  photoUrl: z.string().url().optional(),
});

async function main() {
  const raw = await readStdinJson();
  const input = Input.parse(raw);

  let telegramIds: string[];

  if (input.dogId || input.dogName) {
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
      include: { user: { select: { telegramId: true } } },
    });
    telegramIds = follows.map((f) => f.user.telegramId);
  } else {
    const users = await prisma.user.findMany({ select: { telegramId: true } });
    telegramIds = users.map((u) => u.telegramId);
  }

  let sent = 0;
  let failed = 0;

  for (const chatId of telegramIds) {
    try {
      if (input.photoUrl) {
        await sendPhoto(chatId, input.photoUrl, input.message);
      } else {
        await sendMessage(chatId, input.message);
      }
      sent++;
    } catch {
      failed++;
    }
  }

  console.log(JSON.stringify({ sent, failed }));
}

main().catch((err) => {
  console.error(JSON.stringify({ error: err.message }));
  process.exit(1);
});
