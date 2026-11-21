"use client";

import { useState } from "react";
import { AdminSidebar, AdminSidebarCounts } from "./AdminSidebar";
import { Topbar } from "./Topbar";
import type { AdminNotificationItem } from "../actions/notifications";

interface AdminShellClientProps {
  children: React.ReactNode;
  counts: AdminSidebarCounts;
  initialNotifications?: AdminNotificationItem[];
  initialUnreadCount?: number;
}

export function AdminShellClient({
  children,
  counts,
  initialNotifications,
  initialUnreadCount,
}: AdminShellClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] text-slate-900 font-sans" dir="rtl">
      <AdminSidebar
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        counts={counts}
      />
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          initialNotifications={initialNotifications}
          initialUnreadCount={initialUnreadCount}
        />
        <main className="flex-1 min-h-0">{children}</main>
      </div>
    </div>
  );
}
