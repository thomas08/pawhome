import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "วิธีรับเลี้ยง" };

const steps = [
  { title: "เลือกน้องหมา",         desc: "เข้าหน้า \"น้องหมาทั้งหมด\" แล้วเลือกตัวที่ใช่ค่ะ" },
  { title: "กดขอรับเลี้ยง",        desc: "กรอกชื่อ เบอร์โทร และเหตุผลที่อยากรับน้อง ผ่านเว็บหรือ Telegram Bot ก็ได้ค่ะ" },
  { title: "รอการพิจารณา",          desc: "ทีม admin จะตรวจสอบและติดต่อกลับภายใน 1-3 วันทำการค่ะ" },
  { title: "ตรวจสอบสถานะ",          desc: "ติดตามสถานะคำขอได้ที่หน้า \"ตรวจสอบสถานะ\" ด้วยเบอร์โทรที่กรอกไว้ค่ะ" },
  { title: "นัดรับน้องหมา",          desc: "เมื่ออนุมัติ ทีมงานจะนัดให้มารับน้องและดูแลต่อค่ะ" },
];

export default function AdoptPage() {
  const botUrl = process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL ?? "https://t.me/PawHomeBot";

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">วิธีรับเลี้ยงน้องหมา 🏠</h1>
      <p className="text-gray-500 mb-10">ขั้นตอนง่ายๆ ผ่านเว็บหรือ Telegram Bot</p>

      <div className="space-y-5 mb-12">
        {steps.map((item, i) => (
          <div key={i} className="flex gap-4">
            <div className="shrink-0 w-9 h-9 bg-amber-500 text-white font-bold rounded-full flex items-center justify-center text-sm">
              {i + 1}
            </div>
            <div className="pt-1">
              <h3 className="font-semibold text-gray-800">{item.title}</h3>
              <p className="text-gray-500 text-sm mt-0.5">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 text-center">
          <p className="text-2xl mb-2">🌐</p>
          <h3 className="font-bold text-gray-800 mb-1">ผ่านเว็บ</h3>
          <p className="text-sm text-gray-500 mb-4">เลือกน้องหมาและกรอกข้อมูลได้เลยค่ะ</p>
          <Link
            href="/dogs"
            className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-colors"
          >
            เลือกน้องหมา
          </Link>
        </div>
        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-6 text-center">
          <p className="text-2xl mb-2">💬</p>
          <h3 className="font-bold text-gray-800 mb-1">ผ่าน Telegram Bot</h3>
          <p className="text-sm text-gray-500 mb-4">คุยกับ Bot ได้ตลอด 24 ชั่วโมงค่ะ</p>
          <a
            href={botUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-teal-500 hover:bg-teal-600 text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-colors"
          >
            เปิด Bot 🐾
          </a>
        </div>
      </div>
    </div>
  );
}
