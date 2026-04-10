/**
 * Minimal Telegram Bot API helper for sending notifications.
 * Used by notify-followers.ts script.
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function call(method: string, body: object): Promise<unknown> {
  const res = await fetch(`${API_BASE}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Telegram API error [${method}]: ${err}`);
  }
  return res.json();
}

export async function sendMessage(
  chatId: string,
  text: string,
  options: {
    parseMode?: "HTML" | "Markdown" | "MarkdownV2";
    replyMarkup?: object;
  } = {}
): Promise<void> {
  await call("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: options.parseMode ?? "HTML",
    reply_markup: options.replyMarkup,
  });
}

export async function sendPhoto(
  chatId: string,
  photoUrl: string,
  caption?: string
): Promise<void> {
  await call("sendPhoto", {
    chat_id: chatId,
    photo: photoUrl,
    caption,
    parse_mode: "HTML",
  });
}

export async function sendMediaGroup(
  chatId: string,
  photos: { url: string; caption?: string }[]
): Promise<void> {
  const media = photos.map((p, i) => ({
    type: "photo",
    media: p.url,
    caption: i === 0 ? p.caption : undefined,
    parse_mode: i === 0 ? "HTML" : undefined,
  }));
  await call("sendMediaGroup", { chat_id: chatId, media });
}
