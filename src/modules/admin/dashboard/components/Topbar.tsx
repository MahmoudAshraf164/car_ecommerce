"use client";

import {
  Bell,
  Menu,
  CheckCheck,
  Calendar,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { useState, useTransition } from "react";
import Link from "next/link";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../actions/notifications";
import type { AdminNotificationItem } from "../actions/notifications";

interface TopbarProps {
  onMenuClick: () => void;
  title?: string;
  subtitle?: string;
  initialNotifications?: AdminNotificationItem[];
  initialUnreadCount?: number;
}

export function Topbar({
  onMenuClick,
  title,
  subtitle,
  initialNotifications = [],
  initialUnreadCount = 0,
}: TopbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>(
    initialNotifications
  );
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [isPending, startTransition] = useTransition();

  const handleMarkOne = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    startTransition(async () => {
      await markNotificationAsRead(id);
    });
  };

  const handleMarkAll = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    startTransition(async () => {
      await markAllNotificationsAsRead();
    });
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-slate-200/60 font-sans shadow-xs">
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 h-16">
        {/* Right in RTL (first in flow): Mobile menu + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:block">
            {title && (
              <h1 className="text-lg font-extrabold text-slate-900 leading-tight">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-xs text-slate-400 font-medium">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Left in RTL (end in flow): Notifications */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors border border-slate-200/60 bg-white"
              title="الإشعارات والتنبيهات"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown - positioned left-0 / responsive to fit nicely on screen */}
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/10"
                  onClick={() => setShowNotifications(false)}
                />
                <div
                  className="absolute left-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-sm sm:max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 text-right animate-in fade-in zoom-in-95 duration-150"
                  dir="rtl"
                  style={{
                    maxHeight: "85vh",
                  }}
                >
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm text-slate-900">
                        الإشعارات والتنبيهات
                      </h3>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                          {unreadCount} جديد
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAll}
                        disabled={isPending}
                        className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        تحديد الكل كمقروء
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="py-10 text-center text-slate-400">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="text-xs font-medium">لا توجد إشعارات حالياً</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (!n.is_read) handleMarkOne(n.id);
                          }}
                          className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer ${
                            !n.is_read ? "bg-amber-50/40" : ""
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            {!n.is_read ? (
                              <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-black text-slate-900 leading-snug">
                                {n.title}
                              </p>
                              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                                {n.message}
                              </p>
                              <div className="flex items-center justify-between mt-2 pt-1">
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {new Date(n.created_at).toLocaleDateString("en-US")}
                                </span>
                                {n.data?.installment_id && (
                                  <Link
                                    href="/admin/installments"
                                    onClick={() => setShowNotifications(false)}
                                    className="text-[10px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                                  >
                                    عرض القسط <ExternalLink className="w-3 h-3" />
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                    <Link
                      href="/admin/installments"
                      onClick={() => setShowNotifications(false)}
                      className="text-xs font-bold text-slate-700 hover:text-amber-600"
                    >
                      الانتقال إلى جدول متابعة الأقساط ←
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
