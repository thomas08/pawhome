import type { Metadata } from "next";
import { StatusChecker } from "@/components/StatusChecker";

export const metadata: Metadata = { title: "ตรวจสอบสถานะ" };

export default function StatusPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">ตรวจสอบสถานะ</h1>
      <p className="text-gray-500 mb-8">กรอกเบอร์โทรที่ใช้ติดตาม/ขอรับเลี้ยงเพื่อดูสถานะค่ะ</p>
      <StatusChecker />
    </div>
  );
}
