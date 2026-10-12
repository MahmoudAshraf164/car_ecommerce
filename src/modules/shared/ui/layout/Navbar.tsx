"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "الرئيسية" },
    { href: "/cars", label: "السيارات" },
    { href: "/scooters", label: "السكوترات" },
    { href: "/properties", label: "العقارات" },
    { href: "/about", label: "من نحن" },
    { href: "/contact", label: "اتصل بنا" },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-outline-variant/30">
      <div className="h-20 max-w-[1440px] mx-auto px-4 md:px-12 flex items-center justify-between gap-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-[#c5a059] font-black text-xl shadow-md border border-[#c5a059]/30 group-hover:scale-105 transition-transform">
            عمدا
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-on-surface tracking-tight leading-tight">
              أولاد العم
            </span>
            <span className="text-[10px] text-[#c5a059] tracking-widest uppercase font-semibold">
              EL OMDA BROTHERS
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-on-primary font-bold shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <a
            href="tel:19000"
            className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
            title="الخط الساخن"
          >
            <span className="material-symbols-outlined text-[20px]">call</span>
          </a>
          <a
            href="https://wa.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
            title="واتساب"
          >
            <span className="material-symbols-outlined text-[20px]">chat</span>
          </a>
          <Link
            href="/contact"
            className="hidden sm:inline-flex items-center justify-center px-5 py-2 rounded-lg bg-primary text-on-primary font-semibold text-sm hover:bg-tertiary transition-all shadow-sm"
          >
            تواصل معنا
          </Link>
          <Link
            href="/admin"
            className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary hover:bg-[#c5a059] transition-colors"
            title="لوحة التحكم"
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
