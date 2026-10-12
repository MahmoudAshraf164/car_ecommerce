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
  BarChart3,
  Receipt,
  Settings,
  LogOut,
  X,
} from "lucide-react";

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

const mainMenuItems = [
  { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard, badge: "88" },
  { href: "/admin/cars", label: "إدارة أسطول السيارات", icon: Car, badge: "245" },
  { href: "/admin/brands", label: "الماركات والموديلات", icon: Tags, badge: "14" },
  { href: "/admin/protection-films", label: "أفلام الحماية والنانو سيراميك", icon: ShieldAlert, badge: "6" },
  { href: "/admin/orders", label: "إدارة الطلبات والاستفسارات", icon: Users, badge: "+9" },
  { href: "/admin/customers", label: "العملاء والسجل CRM", icon: UserCheck, badge: "VIP" },
];

const adminMenuItems = [
  { href: "/admin/team", label: "فريق العمل والصلاحيات", icon: ShieldAlert },
  { href: "/admin/analytics", label: "التحليلات والمؤشرات", icon: BarChart3 },
  { href: "/admin/financials", label: "التقارير المالية", icon: Receipt },
  { href: "/admin/settings", label: "إعدادات المنظومة", icon: Settings },
];

export function AdminSidebar({ mobileOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") return null;

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

  const isActive = (href: string) =>
    href === "/admin"
      ? pathname === "/admin"
      : pathname?.startsWith(href) ?? false;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#121316] text-slate-300 font-sans border-l border-neutral-800">
      {/* ── Header Branding ──────────────────────────────────── */}
      <div className="px-5 pt-6 pb-5 border-b border-neutral-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c5a059] to-[#99751a] flex items-center justify-center font-black text-slate-950 text-base shadow-lg shadow-[#c5a059]/20 shrink-0">
              ع
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-black text-white text-base tracking-tight">
                  أولاد العم
                </h2>
                <span className="text-[9px] font-black text-[#c5a059] bg-[#c5a059]/15 px-1.5 py-0.5 rounded border border-[#c5a059]/30">
                  VIP
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                لوحة الإدارة المركزية v2.5
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg hover:bg-neutral-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Navigation List ─────────────────────────────────── */}
      <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto custom-scrollbar">
        {/* Category 1: الإدارة العامة */}
        <div className="space-y-1">
          <p className="px-3 pb-2 text-[11px] font-bold text-slate-500 tracking-wider">
            الإدارة العامة
          </p>
          {mainMenuItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-200 ${
                  active
                    ? "bg-[#1C1D22] text-white border border-[#c5a059]/50 shadow-md shadow-[#c5a059]/5"
                    : "text-slate-400 hover:text-white hover:bg-neutral-900/60"
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    active ? "text-[#c5a059]" : "text-slate-400 group-hover:text-white"
                  }`}
                />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${
                      active
                        ? "bg-[#c5a059]/20 text-[#c5a059]"
                        : "bg-[#1E1F24] text-slate-400 group-hover:text-slate-200"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Category 2: الإدارة والتقارير */}
        <div className="space-y-1">
          <p className="px-3 pb-2 text-[11px] font-bold text-slate-500 tracking-wider">
            الإدارة والتقارير
          </p>
          {adminMenuItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-200 ${
                  active
                    ? "bg-[#1C1D22] text-white border border-[#c5a059]/50 shadow-md shadow-[#c5a059]/5"
                    : "text-slate-400 hover:text-white hover:bg-neutral-900/60"
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    active ? "text-[#c5a059]" : "text-slate-400 group-hover:text-white"
                  }`}
                />
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Sidebar Footer User Info ─────────────────────────── */}
      <div className="p-4 border-t border-neutral-800/80 space-y-3 bg-[#0F1012]">
        <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-[#1A1B20] border border-neutral-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#c5a059] text-slate-950 font-black flex items-center justify-center text-xs shadow-sm">
              أ
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-white text-xs truncate">
                بوابة الإدارة الملكية
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                إدارة أصول أولاد العم
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition-all duration-200 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-[270px] h-screen sticky top-0 flex-col shrink-0 z-30 shadow-2xl">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
          <aside className="fixed top-0 right-0 w-[280px] h-full z-50 lg:hidden shadow-2xl animate-in slide-in-from-right duration-300">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
