/**
 * Change user role (super admin only — role check is done by the agent).
 * Input:  { telegramId: string, role: "PUBLIC" | "ADMIN" | "SUPER_ADMIN" }
 * Output: { user: User }
 */
import "dotenv/config";
import { readStdinJson } from "../lib/stdin";
import { z } from "zod";
import prisma from "../lib/prisma";

const Input = z.object({
  telegramId: z.string(),
  role: z.enum(["PUBLIC", "ADMIN", "SUPER_ADMIN"]),
});

async function main() {
  const raw = await readStdinJson();
  const input = Input.parse(raw);

  const user = await prisma.user.update({
    where: { telegramId: input.telegramId },
    data: { role: input.role },
  });

  console.log(JSON.stringify({ user }));
}

main().catch((err) => {
  console.error(JSON.stringify({ error: err.message }));
  process.exit(1);
});
