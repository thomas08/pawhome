/**
 * Update adoption status (approve/reject).
 * Input:  { adoptionId: string, status: "approved" | "rejected", adminNotes?: string }
 * Output: { adoption: Adoption }
 */
import "dotenv/config";
import { readStdinJson } from "../lib/stdin";
import { z } from "zod";
import prisma from "../lib/prisma";
import { sendMessage } from "../lib/telegram";

const Input = z.object({
  adoptionId: z.string(),
  status: z.enum(["approved", "rejected"]),
  adminNotes: z.string().optional(),
});

async function main() {
  const raw = await readStdinJson();
  const input = Input.parse(raw);

  const adoption = await prisma.adoption.update({
    where: { id: input.adoptionId },
    data: {
      status: input.status,
      adminNotes: input.adminNotes,
      resolvedAt: new Date(),
    },
    include: { dog: true, user: true },
  });

  // Update dog status
  const dogStatus = input.status === "approved" ? "ADOPTED" : "AVAILABLE";
  await prisma.dog.update({
    where: { id: adoption.dogId },
    data: { status: dogStatus },
  });

  // Notify user via Telegram
  const msg =
    input.status === "approved"
      ? `🎉 ยินดีด้วยค่ะ! คำขอรับเลี้ยงน้อง<b>${adoption.dog.name}</b>ของคุณได้รับการอนุมัติแล้วค่ะ 🐾\n\nทีมงานจะติดต่อกลับเพื่อนัดรับน้องเร็วๆ นี้นะคะ`
      : `😢 ขออภัยค่ะ คำขอรับเลี้ยงน้อง<b>${adoption.dog.name}</b>ไม่ผ่านในรอบนี้ค่ะ${
          input.adminNotes ? `\n\n<i>${input.adminNotes}</i>` : ""
        }\n\nยังมีน้องหมาน่ารักๆ รออยู่อีกมากนะคะ /dogs`;

  await sendMessage(adoption.user.telegramId, msg);

  console.log(JSON.stringify({ adoption }));
}

main().catch((err) => {
  console.error(JSON.stringify({ error: err.message }));
  process.exit(1);
});
