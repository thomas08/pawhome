import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "เกี่ยวกับเรา" };

export default function AboutPage() {
  const botUrl = process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL ?? "https://t.me/PawHomeBot";
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">เกี่ยวกับ PawHome 🐾</h1>
      <div className="space-y-4 text-gray-600 leading-relaxed text-sm">
        <p>
          PawHome คือ platform ที่ช่วยให้สุนัขจรจัดได้พบกับบ้านอบอุ่นค่ะ เราใช้ AI ช่วยบันทึกข้อมูลน้องหมาจากรูปภาพ
          สร้างชื่อไทยน่ารัก และส่งอัพเดทประจำวันให้กับผู้ที่ติดตาม
        </p>
        <p>
          ติดตามและรับเลี้ยงได้ทั้งผ่านเว็บนี้ หรือผ่าน Telegram Bot — สะดวกทั้งสองช่องทางค่ะ
        </p>
      </div>
      <div className="mt-8 flex gap-3 flex-wrap">
        <Link href="/dogs" className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors">
          ดูน้องหมา
        </Link>
        <a href={botUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-white border border-gray-200 hover:border-amber-300 text-gray-700 font-semibold px-5 py-2.5 rounded-full text-sm transition-colors">
          💬 Telegram Bot
        </a>
      </div>
    </div>
  );
}
