import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-500">🐾 PawHome — ช่วยกันหาบ้านให้น้องหมาค่ะ</p>
        <nav className="flex gap-4 text-sm text-gray-400">
          <Link href="/dogs"    className="hover:text-amber-600 transition-colors">น้องหมา</Link>
          <Link href="/updates" className="hover:text-amber-600 transition-colors">อัพเดท</Link>
          <Link href="/status"  className="hover:text-amber-600 transition-colors">สถานะ</Link>
          <Link href="/about"   className="hover:text-amber-600 transition-colors">เกี่ยวกับ</Link>
        </nav>
      </div>
    </footer>
  );
}
