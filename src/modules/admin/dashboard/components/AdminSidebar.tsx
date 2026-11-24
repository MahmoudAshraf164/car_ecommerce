"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "@/modules/shared/lib/supabase/client";
import {
  LayoutDashboard,
  Car,
  Tags,
  Users,
  UserCheck,
  ShieldAlert,
  Settings,
  LogOut,
  X,
  CreditCard,
} from "lucide-react";

export interface AdminSidebarCounts {
  cars?: number;
  brands?: number;
  films?: number;
  orders?: number;
  customers?: number;
  installments?: number;
}

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
  counts?: AdminSidebarCounts;
}

export function AdminSidebar({
  mobileOpen,
  onClose,
  counts,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") return null;

  const numberFormatter = new Intl.NumberFormat("en-US");

  const formatCount = (val?: number) => {
    if (val === undefined || val === null) return undefined;
    return numberFormatter.format(val);
  };

  const mainMenuItems = [
    {
      href: "/admin",
      label: "لوحة التحكم",
      icon: LayoutDashboard,
      badge: undefined,
    },
    {
      href: "/admin/cars",
      label: "إدارة أسطول السيارات",
      icon: Car,
      badge: formatCount(counts?.cars),
    },
    {
      href: "/admin/brands",
      label: "الماركات",
      icon: Tags,
      badge: formatCount(counts?.brands),
    },
    {
      href: "/admin/protection-films",
      label: "أفلام الحماية والنانو سيراميك",
      icon: ShieldAlert,
      badge: formatCount(counts?.films),
    },
    {
      href: "/admin/orders",
      label: "إدارة الطلبات والاستفسارات",
      icon: Users,
      badge: formatCount(counts?.orders),
      badgeHighlight: (counts?.orders ?? 0) > 0,
    },
    {
      href: "/admin/customers",
      label: "العملاء والسجل CRM",
      icon: UserCheck,
      badge: formatCount(counts?.customers),
    },
    {
      href: "/admin/installments",
      label: "الأقساط والمتابعة",
      icon: CreditCard,
      badge: formatCount(counts?.installments),
      badgeHighlight: (counts?.installments ?? 0) > 0,
    },
  ];

  const adminMenuItems = [
    { href: "/admin/settings", label: "إعدادات المنظومة", icon: Settings },
  ];

  const handleLogout = async () => {
    const supabase = createBrowserClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return;
    }

    onClose?.();
    router.replace("/admin/login");
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const navContent = (
    <div className="flex flex-col h-full bg-[#111215] text-white">
      {/* ── Brand Logo & Showroom Title ──────────────────────── */}
      <div className="p-6 border-b border-neutral-800">
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            className="flex items-center gap-3 group"
            onClick={onClose}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#c5a059] to-[#99751a] flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-[#c5a059]/20 group-hover:scale-105 transition-transform">
              و
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-white text-base tracking-tight">
                  ولاد العم
                </span>
                <span className="text-[9px] font-black text-[#c5a059] bg-[#c5a059]/20 px-2 py-0.5 rounded border border-[#c5a059]/40">
                  لوحة الإدارة
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium block">
                للسيارات وأفلام الحماية
              </span>
            </div>
          </Link>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Nav Links Container ───────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider px-3 block mb-2">
            القائمة التشغيلية
          </span>
          <nav className="space-y-1">
            {mainMenuItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                    active
                      ? "bg-[#1C1D22] text-[#c5a059] border border-[#c5a059]/40 shadow-xs"
                      : "text-slate-300 hover:text-white hover:bg-neutral-800/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        active ? "text-[#c5a059]" : "text-slate-400"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                        item.badgeHighlight
                          ? "bg-amber-500 text-slate-950 font-black animate-pulse"
                          : active
                          ? "bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/30"
                          : "bg-neutral-800 text-slate-400"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider px-3 block mb-2">
            إعدادات المنظومة
          </span>
          <nav className="space-y-1">
            {adminMenuItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                    active
                      ? "bg-[#1C1D22] text-[#c5a059] border border-[#c5a059]/40 shadow-xs"
                      : "text-slate-300 hover:text-white hover:bg-neutral-800/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        active ? "text-[#c5a059]" : "text-slate-400"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ── Footer / Logout ───────────────────────────────────── */}
      <div className="p-4 border-t border-neutral-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-l border-neutral-800 h-screen sticky top-0 z-30">
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onClose}
          />
          <div className="fixed inset-y-0 right-0 w-72 z-50">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
