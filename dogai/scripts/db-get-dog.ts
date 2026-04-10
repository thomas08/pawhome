/**
 * Get a dog by ID or name (case-insensitive).
 * Input:  { id?: string, name?: string }
 * Output: { dog: Dog & { photos, tags, updates } } | { error }
 */
import "dotenv/config";
import { readStdinJson } from "../lib/stdin";
import { z } from "zod";
import prisma from "../lib/prisma";

const Input = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
}).refine((d) => d.id || d.name, { message: "id or name required" });

async function main() {
  const raw = await readStdinJson();
  const input = Input.parse(raw);

  const dog = await prisma.dog.findFirst({
    where: input.id
      ? { id: input.id }
      : { name: { equals: input.name, mode: "insensitive" } },
    include: {
      photos: { orderBy: { isMain: "desc" } },
      tags: true,
      updates: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!dog) {
    console.error(JSON.stringify({ error: "Dog not found" }));
    process.exit(1);
  }

  console.log(JSON.stringify({ dog }));
}

main().catch((err) => {
  console.error(JSON.stringify({ error: err.message }));
  process.exit(1);
});
