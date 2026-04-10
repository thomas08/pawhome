"use server";

import { prisma } from "@/lib/prisma";
import { normalizePhone, validateName, validatePhone, validateReason } from "@/lib/validations";

async function getOrCreateWebUser(name: string, phone: string) {
  const normalized = normalizePhone(phone)!;
  const telegramId = `web_${normalized}`;
  return prisma.user.upsert({
    where:  { telegramId },
    update: { name: name.trim(), phone: normalized },
    create: { telegramId, name: name.trim(), phone: normalized },
  });
}

// ─── Follow ──────────────────────────────────────────────────────────────────

export type FollowResult =
  | { success: true; alreadyFollowing: boolean }
  | { success: false; error: string };

export async function followDog(
  dogId: string,
  name: string,
  phone: string
): Promise<FollowResult> {
  if (!validateName(name)) return { success: false, error: "กรุณากรอกชื่อ (2-100 ตัวอักษร)" };
  if (!validatePhone(phone)) return { success: false, error: "เบอร์โทรไม่ถูกต้อง (10 หลัก เช่น 081xxxxxxx)" };

  try {
    const user = await getOrCreateWebUser(name, phone);
    const existing = await prisma.follow.findUnique({
      where: { userId_dogId: { userId: user.id, dogId } },
    });
    if (existing) return { success: true, alreadyFollowing: true };
    await prisma.follow.create({
      data: { userId: user.id, dogId, notifyTelegram: false },
    });
    return { success: true, alreadyFollowing: false };
  } catch {
    return { success: false, error: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้งค่ะ" };
  }
}

export async function unfollowDog(dogId: string, phone: string): Promise<FollowResult> {
  if (!validatePhone(phone)) return { success: false, error: "เบอร์โทรไม่ถูกต้อง" };
  try {
    const telegramId = `web_${normalizePhone(phone)!}`;
    const user = await prisma.user.findUnique({ where: { telegramId } });
    if (!user) return { success: false, error: "ไม่พบข้อมูลผู้ใช้" };
    await prisma.follow.deleteMany({ where: { userId: user.id, dogId } });
    return { success: true, alreadyFollowing: false };
  } catch {
    return { success: false, error: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้งค่ะ" };
  }
}

// ─── Adoption ────────────────────────────────────────────────────────────────

export type AdoptResult =
  | { success: true }
  | { success: false; error: string; alreadyApplied?: boolean };

export async function applyAdoption(
  dogId: string,
  name: string,
  phone: string,
  reason: string
): Promise<AdoptResult> {
  if (!validateName(name))   return { success: false, error: "กรุณากรอกชื่อ (2-100 ตัวอักษร)" };
  if (!validatePhone(phone)) return { success: false, error: "เบอร์โทรไม่ถูกต้อง (10 หลัก เช่น 081xxxxxxx)" };
  if (!validateReason(reason)) return { success: false, error: "กรุณาเขียนเหตุผล (10-1000 ตัวอักษร)" };

  try {
    const user = await getOrCreateWebUser(name, phone);
    const existing = await prisma.adoption.findFirst({
      where: { dogId, userId: user.id, status: "pending" },
    });
    if (existing) return { success: false, error: "คุณมีคำขอรับเลี้ยงที่รอดำเนินการอยู่แล้วค่ะ", alreadyApplied: true };
    await prisma.adoption.create({
      data: { dogId, userId: user.id, reason: reason.trim(), status: "pending" },
    });
    return { success: true };
  } catch {
    return { success: false, error: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้งค่ะ" };
  }
}

// ─── Status check ─────────────────────────────────────────────────────────────

export type StatusResult = {
  follows: { dogId: string; dogName: string; dogPhoto: string | null; createdAt: string }[];
  adoptions: { dogId: string; dogName: string; status: string; appliedAt: string }[];
} | null;

export async function checkStatus(phone: string): Promise<StatusResult> {
  if (!validatePhone(phone)) return null;
  const telegramId = `web_${normalizePhone(phone)!}`;
  const user = await prisma.user.findUnique({
    where: { telegramId },
    include: {
      follows: {
        include: { dog: { include: { photos: { where: { isMain: true }, take: 1 } } } },
        orderBy: { createdAt: "desc" },
      },
      adoptions: {
        include: { dog: true },
        orderBy: { appliedAt: "desc" },
      },
    },
  });
  if (!user) return null;
  return {
    follows: user.follows.map((f) => ({
      dogId:    f.dog.id,
      dogName:  f.dog.name,
      dogPhoto: f.dog.photos[0]?.url ?? null,
      createdAt: f.createdAt.toISOString(),
    })),
    adoptions: user.adoptions.map((a) => ({
      dogId:    a.dog.id,
      dogName:  a.dog.name,
      status:   a.status,
      appliedAt: a.appliedAt.toISOString(),
    })),
  };
}
