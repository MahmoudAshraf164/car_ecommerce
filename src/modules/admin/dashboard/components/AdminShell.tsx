"use client";

import { useState } from "react";
import { AdminSidebar } from "@/modules/admin/dashboard/components/AdminSidebar";
import { Topbar } from "@/modules/admin/dashboard/components/Topbar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] text-slate-900 font-sans" dir="rtl">
      <AdminSidebar
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 min-h-0">{children}</main>
      </div>
    </div>
  );
}
