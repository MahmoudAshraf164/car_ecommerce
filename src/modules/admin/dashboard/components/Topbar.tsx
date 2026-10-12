"use client";

import {
  Bell,
  Menu,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";

interface TopbarProps {
  onMenuClick: () => void;
  title?: string;
  subtitle?: string;
}

export function Topbar({ onMenuClick, title, subtitle }: TopbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, text: "طلب شراء جديد — بورش كايين", time: "منذ 5 دقائق", unread: true },
    { id: 2, text: "تم تأكيد طلب #1042", time: "منذ 30 دقيقة", unread: true },
    { id: 3, text: "مستخدم جديد سجّل في الموقع", time: "منذ ساعة", unread: false },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 h-16">
        {/* Left: Mobile menu + Title */}
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

        {/* Right: Notifications + Profile */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 left-1.5 w-4.5 h-4.5 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden z-40">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-800">
                      الإشعارات
                    </h3>
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      {unreadCount} جديد
                    </span>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 border-b border-slate-50 last:border-b-0 hover:bg-slate-50 transition-colors cursor-pointer ${
                          n.unread ? "bg-amber-50/30" : ""
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {n.unread && (
                            <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-700 truncate">
                              {n.text}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {n.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2.5 border-t border-slate-100">
                    <button className="w-full text-center text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors">
                      عرض كل الإشعارات
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Profile (desktop) */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-700">المدير العام</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>
    </header>
  );
}
