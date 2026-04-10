"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/dogs",   label: "น้องหมาทั้งหมด" },
  { href: "/updates", label: "อัพเดท" },
  { href: "/status",  label: "ตรวจสอบสถานะ" },
  { href: "/adopt",   label: "วิธีรับเลี้ยง" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const botUrl = process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL ?? "https://t.me/PawHomeBot";

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-amber-100">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 font-bold text-amber-600 text-lg shrink-0">
          🐾 PawHome
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Bot CTA + hamburger */}
        <div className="flex items-center gap-2">
          <a
            href={botUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors"
          >
            💬 คุยกับ Bot
          </a>
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-4 pt-2 flex flex-col gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="px-3 py-2.5 text-sm text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <a
            href={botUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center justify-center gap-1.5 bg-amber-500 text-white text-sm font-semibold px-4 py-2.5 rounded-full"
          >
            💬 คุยกับ Bot
          </a>
        </div>
      )}
    </header>
  );
}
