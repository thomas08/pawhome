/**
 * Update dog fields by ID or name.
 * Input:  { id?: string, name?: string, fields: Partial<Dog> }
 * Output: { dog: Dog }
 */
import "dotenv/config";
import { readStdinJson } from "../lib/stdin";
import { z } from "zod";
import prisma from "../lib/prisma";

const Input = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  fields: z.object({
    name: z.string().optional(),
    nameOrigin: z.string().optional(),
    description: z.string().optional(),
    breed: z.string().optional(),
    estimatedAge: z.string().optional(),
    gender: z.enum(["MALE", "FEMALE", "UNKNOWN"]).optional(),
    size: z.enum(["SMALL", "MEDIUM", "LARGE"]).optional(),
    color: z.string().optional(),
    weight: z.number().optional(),
    status: z.enum(["AVAILABLE", "ADOPTED", "IN_CARE", "PENDING_ADOPTION"]).optional(),
    personality: z.string().optional(),
    healthNotes: z.string().optional(),
    location: z.string().optional(),
  }),
}).refine((d) => d.id || d.name, { message: "id or name required" });

async function main() {
  const raw = await readStdinJson();
  const input = Input.parse(raw);

  const existing = await prisma.dog.findFirst({
    where: input.id
      ? { id: input.id }
      : { name: { equals: input.name, mode: "insensitive" } },
  });

  if (!existing) {
    console.error(JSON.stringify({ error: "Dog not found" }));
    process.exit(1);
  }

  const dog = await prisma.dog.update({
    where: { id: existing.id },
    data: input.fields,
    include: { photos: true, tags: true },
  });

  console.log(JSON.stringify({ dog }));
}

main().catch((err) => {
  console.error(JSON.stringify({ error: err.message }));
  process.exit(1);
});
