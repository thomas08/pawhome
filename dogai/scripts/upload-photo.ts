/**
 * Download a photo from Telegram and upload to R2.
 * Input:  { fileId: string } | { url: string }
 * Output: { url: string }
 */
import "dotenv/config";
import { readStdinJson } from "../lib/stdin";
import { z } from "zod";
import { uploadBufferToR2 } from "../lib/r2";

const Input = z.union([
  z.object({ fileId: z.string() }),
  z.object({ url: z.string().url() }),
]);

async function downloadTelegramFile(fileId: string): Promise<Buffer> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN!;
  const fileRes = await fetch(
    `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`
  );
  const fileData = (await fileRes.json()) as { ok: boolean; result: { file_path: string } };
  if (!fileData.ok) throw new Error("Failed to get file path from Telegram");

  const filePath = fileData.result.file_path;
  const downloadUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
  const imgRes = await fetch(downloadUrl);
  return Buffer.from(await imgRes.arrayBuffer());
}

async function main() {
  const raw = await readStdinJson();
  const input = Input.parse(raw);

  let buffer: Buffer;
  let ext = "jpg";
  let contentType = "image/jpeg";

  if ("fileId" in input) {
    buffer = await downloadTelegramFile(input.fileId);
  } else {
    const res = await fetch(input.url);
    buffer = Buffer.from(await res.arrayBuffer());
    const ct = res.headers.get("content-type") ?? "";
    if (ct.includes("png")) { ext = "png"; contentType = "image/png"; }
    else if (ct.includes("webp")) { ext = "webp"; contentType = "image/webp"; }
  }

  const url = await uploadBufferToR2(buffer, ext, contentType);
  console.log(JSON.stringify({ url }));
}

main().catch((err) => {
  console.error(JSON.stringify({ error: err.message }));
  process.exit(1);
});
