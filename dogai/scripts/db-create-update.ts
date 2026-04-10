/**
 * Create a dog update (narrative) and notify followers via Telegram.
 * Input:  { dogId?: string, dogName?: string, narrative: string,
 *           photoUrl?: string, mood?: string, source?: string }
 * Output: { update: DogUpdate, notified: number }
 */
import "dotenv/config";
import { readStdinJson } from "../lib/stdin";
import { z } from "zod";
import prisma from "../lib/prisma";
import { sendPhoto, sendMessage } from "../lib/telegram";

const Input = z.object({
  dogId: z.string().optional(),
  dogName: z.string().optional(),
  narrative: z.string(),
  photoUrl: z.string().url().optional(),
  mood: z.string().optional(),
  source: z.string().optional().default("ai_camera"),
});

async function main() {
  const raw = await readStdinJson();
  const input = Input.parse(raw);

  if (!input.dogId && !input.dogName) {
    console.error(JSON.stringify({ error: "dogId or dogName required" }));
    process.exit(1);
  }

  const dog = await prisma.dog.findFirst({
    where: input.dogId
      ? { id: input.dogId }
      : { name: { equals: input.dogName, mode: "insensitive" } },
  });

  if (!dog) {
    console.error(JSON.stringify({ error: "Dog not found" }));
    process.exit(1);
  }

  const update = await prisma.dogUpdate.create({
    data: {
      dogId: dog.id,
      narrative: input.narrative,
      photoUrl: input.photoUrl,
      mood: input.mood,
      source: input.source,
    },
  });

  // Notify followers
  const follows = await prisma.follow.findMany({
    where: { dogId: dog.id, notifyTelegram: true },
    include: { user: true },
  });

  let notified = 0;
  for (const follow of follows) {
    try {
      const text = `🐾 <b>${dog.name}</b>\n\n${input.narrative}`;
      if (input.photoUrl) {
        await sendPhoto(follow.user.telegramId, input.photoUrl, text);
      } else {
        await sendMessage(follow.user.telegramId, text);
      }
      notified++;
    } catch {
      // Continue notifying others even if one fails
    }
  }

  console.log(JSON.stringify({ update, notified }));
}

main().catch((err) => {
  console.error(JSON.stringify({ error: err.message }));
  process.exit(1);
});
