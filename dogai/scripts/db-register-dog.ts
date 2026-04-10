/**
 * Register a new dog with photos and tags.
 * Input:  { name, description, breed?, estimatedAge?, gender?, size?, color?,
 *           weight?, personality?, healthNotes?, location?, registeredBy?,
 *           photos: { url, telegramFileId?, caption?, isMain? }[],
 *           tags?: string[] }
 * Output: { dog: Dog & { photos, tags } }
 */
import "dotenv/config";
import { readStdinJson } from "../lib/stdin";
import { z } from "zod";
import prisma from "../lib/prisma";

const PhotoInput = z.object({
  url: z.string().url(),
  telegramFileId: z.string().optional(),
  caption: z.string().optional(),
  isMain: z.boolean().optional().default(false),
});

const Input = z.object({
  name: z.string(),
  nameOrigin: z.string().optional(),
  description: z.string(),
  breed: z.string().optional(),
  estimatedAge: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "UNKNOWN"]).optional().default("UNKNOWN"),
  size: z.enum(["SMALL", "MEDIUM", "LARGE"]).optional().default("MEDIUM"),
  color: z.string().optional(),
  weight: z.number().optional(),
  personality: z.string().optional(),
  healthNotes: z.string().optional(),
  location: z.string().optional(),
  registeredBy: z.string().optional(),
  photos: z.array(PhotoInput).min(1),
  tags: z.array(z.string()).optional().default([]),
});

async function main() {
  const raw = await readStdinJson();
  const input = Input.parse(raw);

  const dog = await prisma.dog.create({
    data: {
      name: input.name,
      nameOrigin: input.nameOrigin,
      description: input.description,
      breed: input.breed,
      estimatedAge: input.estimatedAge,
      gender: input.gender,
      size: input.size,
      color: input.color,
      weight: input.weight,
      personality: input.personality,
      healthNotes: input.healthNotes,
      location: input.location,
      registeredBy: input.registeredBy,
      photos: {
        create: input.photos.map((p, i) => ({
          url: p.url,
          telegramFileId: p.telegramFileId,
          caption: p.caption,
          isMain: p.isMain ?? i === 0,
        })),
      },
      tags: {
        create: input.tags.map((tag) => ({ tag })),
      },
    },
    include: { photos: true, tags: true },
  });

  console.log(JSON.stringify({ dog }));
}

main().catch((err) => {
  console.error(JSON.stringify({ error: err.message }));
  process.exit(1);
});
