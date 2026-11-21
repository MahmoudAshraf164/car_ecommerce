"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Car,
  Shield,
  Phone,
  Menu,
  X,
  Mail,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import {
  ShowroomInfo,
  ContactNumbersSettings,
  DEFAULT_SHOWROOM_INFO,
  DEFAULT_CONTACT_NUMBERS,
} from "@/modules/shared/lib/settings";

interface PublicHeaderFooterProps {
  showroom?: ShowroomInfo;
  contacts?: ContactNumbersSettings;
}

// ─── TikTok SVG icon ─────────────────────────────────────────────────────────
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.28 6.28 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.94a8.17 8.17 0 004.78 1.52V7.01a4.85 4.85 0 01-1.01-.32z" />
    </svg>
  );
}

// ─── Facebook SVG icon ───────────────────────────────────────────────────────
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  );
}

// ─── WhatsApp SVG icon ───────────────────────────────────────────────────────
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function PublicHeader({
  showroom = DEFAULT_SHOWROOM_INFO,
  contacts = DEFAULT_CONTACT_NUMBERS,
}: PublicHeaderFooterProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "الرئيسية" },
    { href: "/cars", label: "أسطول السيارات" },
    { href: "/protection-films", label: "أفلام الحماية والنانو سيراميك" },
    { href: "/about", label: "من نحن" },
    { href: "/contact", label: "اتصل بنا" },
  ];

  const primaryPhone = contacts.primaryPhone || DEFAULT_CONTACT_NUMBERS.primaryPhone;
  const whatsappNumber = contacts.whatsappNumber || DEFAULT_CONTACT_NUMBERS.whatsappNumber;
  const email = showroom.email || DEFAULT_SHOWROOM_INFO.email;
  const address = showroom.address || DEFAULT_SHOWROOM_INFO.address;
  const facebook = showroom.facebook || DEFAULT_SHOWROOM_INFO.facebook;
  const tiktok = showroom.tiktok || DEFAULT_SHOWROOM_INFO.tiktok;

  return (
    <header
      className="sticky top-0 z-40 bg-[#121316]/98 backdrop-blur-md text-white border-b border-neutral-800 shadow-xl"
      dir="rtl"
    >
      {/* ── Top Utility Bar ─────────────────────────────────────── */}
      <div className="hidden md:block bg-[#0A0B0D] border-b border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-4 text-[11px]">
          {/* Contact info */}
          <div className="flex items-center gap-4 text-slate-400">
            <a
              href={`tel:${primaryPhone}`}
              className="flex items-center gap-1.5 hover:text-[#c5a059] transition-colors font-mono"
            >
              <Phone className="w-3 h-3 text-[#c5a059] shrink-0" />
              <span dir="ltr">{primaryPhone}</span>
            </a>
            <span className="text-neutral-700">|</span>
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-1.5 hover:text-[#c5a059] transition-colors"
            >
              <Mail className="w-3 h-3 text-[#c5a059] shrink-0" />
              <span>{email}</span>
            </a>
            <span className="text-neutral-700 hidden lg:inline">|</span>
            <span className="items-center gap-1.5 text-slate-500 hidden lg:flex">
              <MapPin className="w-3 h-3 text-[#c5a059] shrink-0" />
              <span>{address}</span>
            </span>
          </div>

          {/* Social Badges */}
          <div className="flex items-center gap-2">
            <a
              href={facebook}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1877F2]/15 border border-[#1877F2]/30 text-[#1877F2] hover:bg-[#1877F2]/25 hover:border-[#1877F2]/50 transition-all font-bold text-[11px]"
              title="تابعنا على فيسبوك"
            >
              <FacebookIcon className="w-3 h-3 shrink-0" />
              <span>فيسبوك</span>
            </a>
            <a
              href={tiktok}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/8 border border-white/15 text-white hover:bg-white/15 hover:border-white/30 transition-all font-bold text-[11px]"
              title="تابعنا على تيك توك"
            >
              <TikTokIcon className="w-3 h-3 shrink-0" />
              <span>تيك توك</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── Main Nav Row ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#c5a059] to-[#99751a] flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-[#c5a059]/20 group-hover:scale-105 transition-transform">
            و
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-white text-lg tracking-tight">
                {showroom.name ? "ولاد العم" : "ولاد العم"}
              </span>
              <span className="text-[9px] font-black text-[#c5a059] bg-[#c5a059]/20 px-2 py-0.5 rounded border border-[#c5a059]/40">
                PPF
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium block">
              للسيارات وأفلام الحماية
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  isActive
                    ? "bg-[#1C1D22] text-[#c5a059] border border-[#c5a059]/40"
                    : "text-slate-300 hover:text-white hover:bg-neutral-800/60"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* CTA Buttons */}
        <div className="hidden sm:flex items-center gap-2.5">
          <a
            href={`tel:${primaryPhone}`}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-slate-300 hover:text-[#c5a059] hover:border-[#c5a059]/40 text-xs font-mono font-bold transition-all"
          >
            <Phone className="w-3.5 h-3.5 text-[#c5a059]" />
            <span dir="ltr">{primaryPhone}</span>
          </a>

          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("مرحباً، أريد الاستفسار عن سياراتكم وخدماتكم")}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#99751a] hover:from-[#b08820] hover:to-[#856515] text-slate-950 font-black text-xs transition-all shadow-md shadow-[#c5a059]/20"
          >
            <WhatsAppIcon className="w-4 h-4" />
            <span>واتساب</span>
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl bg-neutral-900 text-slate-300 hover:text-white"
          aria-label="القائمة"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0F1012] border-b border-neutral-800 p-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-bold text-slate-200 hover:bg-neutral-800 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-neutral-800 flex flex-col gap-2">
            <div className="flex items-center gap-2 pb-1">
              <a
                href={facebook}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1877F2]/15 border border-[#1877F2]/30 text-[#1877F2] font-bold text-xs flex-1 justify-center"
              >
                <FacebookIcon className="w-4 h-4" />
                فيسبوك
              </a>
              <a
                href={tiktok}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/8 border border-white/15 text-white font-bold text-xs flex-1 justify-center"
              >
                <TikTokIcon className="w-4 h-4" />
                تيك توك
              </a>
            </div>
            <a
              href={`tel:${primaryPhone}`}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-neutral-800 text-sm font-mono text-slate-300"
            >
              <Phone className="w-4 h-4 text-[#c5a059]" />
              <span dir="ltr">{primaryPhone}</span>
            </a>
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#99751a] text-slate-950 font-black text-sm"
            >
              <WhatsAppIcon className="w-4 h-4" />
              تواصل عبر واتساب
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

export function PublicFooter({
  showroom = DEFAULT_SHOWROOM_INFO,
  contacts = DEFAULT_CONTACT_NUMBERS,
}: PublicHeaderFooterProps) {
  const primaryPhone = contacts.primaryPhone || DEFAULT_CONTACT_NUMBERS.primaryPhone;
  const whatsappNumber = contacts.whatsappNumber || DEFAULT_CONTACT_NUMBERS.whatsappNumber;
  const email = showroom.email || DEFAULT_SHOWROOM_INFO.email;
  const address = showroom.address || DEFAULT_SHOWROOM_INFO.address;
  const facebook = showroom.facebook || DEFAULT_SHOWROOM_INFO.facebook;
  const tiktok = showroom.tiktok || DEFAULT_SHOWROOM_INFO.tiktok;
  const mapsGoogle = showroom.mapsGoogle || DEFAULT_SHOWROOM_INFO.mapsGoogle;
  const mapsBing = showroom.mapsBing || DEFAULT_SHOWROOM_INFO.mapsBing;

  return (
    <footer
      className="bg-[#0A0B0D] text-slate-400 pt-16 pb-8 border-t border-neutral-800 font-sans"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="space-y-5 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c5a059] to-[#99751a] text-slate-950 font-black flex items-center justify-center text-lg shadow-md">
                و
              </div>
              <div>
                <span className="font-black text-white text-base block leading-tight">
                  {showroom.name || "معرض ولاد العم"}
                </span>
                <span className="text-[11px] text-slate-500">
                  للسيارات وأفلام الحماية
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              المجموعة الأولى الرائدة في تجارة السيارات وخدمات حماية الطلاء
              المتخصصة (PPF والنانو سيراميك) في منوف، المنوفية، مصر.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href={facebook}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1877F2]/10 border border-[#1877F2]/20 text-[#1877F2] hover:bg-[#1877F2]/20 transition-all text-xs font-bold"
              >
                <FacebookIcon className="w-3.5 h-3.5" />
                فيسبوك
              </a>
              <a
                href={tiktok}
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-slate-400 hover:text-white hover:border-white/30 transition-all text-xs font-bold"
              >
                <TikTokIcon className="w-3.5 h-3.5" />
                تيك توك
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-extrabold text-white text-sm">روابط سريعة</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/cars" className="flex items-center gap-2 hover:text-[#c5a059] transition-colors">
                  <Car className="w-3.5 h-3.5 text-[#c5a059]/60" />
                  أسطول السيارات
                </Link>
              </li>
              <li>
                <Link href="/protection-films" className="flex items-center gap-2 hover:text-[#c5a059] transition-colors">
                  <Shield className="w-3.5 h-3.5 text-[#c5a059]/60" />
                  أفلام الحماية والنانو سيراميك
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#c5a059] transition-colors block">من نحن</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#c5a059] transition-colors block">تواصل معنا</Link>
              </li>
              <li>
                <a href={facebook} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#c5a059] transition-colors">
                  <FacebookIcon className="w-3.5 h-3.5 text-[#c5a059]/60" />
                  صفحتنا على فيسبوك
                </a>
              </li>
              <li>
                <a href={tiktok} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#c5a059] transition-colors">
                  <TikTokIcon className="w-3.5 h-3.5 text-[#c5a059]/60" />
                  حسابنا على تيك توك
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Hub */}
          <div className="space-y-4">
            <h4 className="font-extrabold text-white text-sm">التواصل المباشر</h4>
            <div className="space-y-3 text-xs">
              <a href={`tel:${primaryPhone}`} className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-[#c5a059]/10 border border-[#c5a059]/20 flex items-center justify-center shrink-0">
                  <Phone className="w-3.5 h-3.5 text-[#c5a059]" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">اتصل بنا</p>
                  <p className="text-slate-300 font-mono group-hover:text-[#c5a059] transition-colors" dir="ltr">{primaryPhone}</p>
                </div>
              </a>

              <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-[#c5a059]/10 border border-[#c5a059]/20 flex items-center justify-center shrink-0">
                  <WhatsAppIcon className="w-3.5 h-3.5 text-[#c5a059]" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">واتساب</p>
                  <p className="text-slate-300 group-hover:text-[#c5a059] transition-colors">محادثة مباشرة</p>
                </div>
              </a>

              <a href={`mailto:${email}`} className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-[#c5a059]/10 border border-[#c5a059]/20 flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5 text-[#c5a059]" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">البريد الإلكتروني</p>
                  <p className="text-slate-300 group-hover:text-[#c5a059] transition-colors break-all">{email}</p>
                </div>
              </a>
            </div>
          </div>

          {/* Location & Map */}
          <div className="space-y-4">
            <h4 className="font-extrabold text-white text-sm">موقعنا</h4>
            <div className="flex items-start gap-2.5 text-xs">
              <div className="w-8 h-8 rounded-lg bg-[#c5a059]/10 border border-[#c5a059]/20 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#c5a059]" />
              </div>
              <p className="text-slate-300 leading-relaxed">{address}</p>
            </div>
            <div className="flex flex-col gap-2 text-xs">
              <a href={mapsGoogle} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-[#c5a059]/40 hover:text-[#c5a059] transition-all">
                <ExternalLink className="w-3.5 h-3.5 text-[#c5a059] shrink-0" />
                <span>الاتجاهات عبر Google Maps</span>
              </a>
              <a href={mapsBing} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-[#c5a059]/40 hover:text-[#c5a059] transition-all">
                <ExternalLink className="w-3.5 h-3.5 text-[#c5a059] shrink-0" />
                <span>الاتجاهات عبر Bing Maps</span>
              </a>
            </div>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 font-mono">
          <span>
            © {new Date().getFullYear()} {showroom.name || "معرض ولاد العم للسيارات وأفلام الحماية"}. All rights reserved.
          </span>
          <div className="flex items-center gap-4">
            <Link href="/admin/login" className="hover:text-slate-400 transition-colors">
              بوابة الإدارة
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
