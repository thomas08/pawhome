import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <p className="text-6xl mb-4">🐾</p>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">ไม่พบหน้าที่ต้องการค่ะ</h1>
      <p className="text-gray-500 mb-6">อาจถูกลบหรือย้ายที่ไปแล้วค่ะ</p>
      <Link
        href="/"
        className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-2.5 rounded-full transition-colors"
      >
        กลับหน้าหลัก
      </Link>
    </div>
  );
}
