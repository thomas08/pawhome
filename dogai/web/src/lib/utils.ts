import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function dogStatusLabel(status: string): string {
  const map: Record<string, string> = {
    AVAILABLE:        "หาบ้านอยู่",
    ADOPTED:          "มีบ้านแล้ว",
    IN_CARE:          "อยู่ระหว่างดูแล",
    PENDING_ADOPTION: "รอรับเลี้ยง",
  };
  return map[status] ?? status;
}

export function dogSizeLabel(size: string): string {
  const map: Record<string, string> = {
    SMALL:  "เล็ก",
    MEDIUM: "กลาง",
    LARGE:  "ใหญ่",
  };
  return map[size] ?? size;
}

export function dogGenderLabel(gender: string): string {
  const map: Record<string, string> = {
    MALE:    "ตัวผู้",
    FEMALE:  "ตัวเมีย",
    UNKNOWN: "ไม่ทราบ",
  };
  return map[gender] ?? gender;
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours   = Math.floor(diff / 3_600_000);
  const days    = Math.floor(diff / 86_400_000);

  if (minutes < 1)  return "เมื่อกี้";
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  if (hours < 24)   return `${hours} ชั่วโมงที่แล้ว`;
  if (days < 7)     return `${days} วันที่แล้ว`;
  return date.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
}

export function telegramLink(action: string, id?: string): string {
  const base = process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL ?? "https://t.me/PawHomeBot";
  const param = id ? `${action}_${id}` : action;
  return `${base}?start=${param}`;
}
