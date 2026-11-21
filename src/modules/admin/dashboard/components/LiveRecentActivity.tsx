"use client";

import Link from "next/link";
import {
  Car,
  Shield,
  MessageSquare,
  Clock,
  ArrowUpRight,
  ExternalLink,
  Phone,
} from "lucide-react";
import { DashboardRecentActivityItem } from "@/modules/admin/dashboard/actions/executive-dashboard";

interface LiveRecentActivityProps {
  activities: DashboardRecentActivityItem[];
}

export function LiveRecentActivity({ activities }: LiveRecentActivityProps) {
  const getStatusBadge = (status: string, statusArabic: string) => {
    switch (status) {
      case "new":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
            {statusArabic}
          </span>
        );
      case "won":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {statusArabic}
          </span>
        );
      case "lost":
      case "cancelled":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
            {statusArabic}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
            {statusArabic}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-slate-900 text-base">
            آخر النشاطات والاستفسارات الواردة
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            تحديث فوري لطلبات العملاء عبر المنصة والواتساب
          </p>
        </div>
        <Link
          href="/admin/orders"
          className="text-xs font-bold text-[#c5a059] hover:text-[#99751a] flex items-center gap-1 transition-colors"
        >
          <span>عرض جميع الطلبات</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {activities.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-xs">
          لا توجد طلبات أو استفسارات مسجلة حديثاً.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {activities.map((item) => {
            const cleanPhone = item.customerPhone.replace(/[^0-9]/g, "");
            const whatsappUrl = cleanPhone
              ? `https://wa.me/${cleanPhone.startsWith("20") ? cleanPhone : `20${cleanPhone.replace(/^0+/, "")}`}`
              : null;

            return (
              <div
                key={item.id}
                className="p-4 sm:px-6 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      item.assetType === "car"
                        ? "bg-blue-50 text-blue-600 border border-blue-200"
                        : item.assetType === "film"
                        ? "bg-amber-50 text-amber-600 border border-amber-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {item.assetType === "car" ? (
                      <Car className="w-4 h-4" />
                    ) : item.assetType === "film" ? (
                      <Shield className="w-4 h-4" />
                    ) : (
                      <MessageSquare className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                        {item.customerName}
                      </span>
                      {getStatusBadge(item.status, item.statusArabic)}
                    </div>
                    <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                      بخصوص:{" "}
                      <span className="text-slate-800 font-bold">
                        {item.assetTitle}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {item.formattedTime}
                  </span>

                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white border border-emerald-200 transition-colors"
                      title="مراسلة العميل عبر واتساب"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {item.customerPhone && (
                    <a
                      href={`tel:${item.customerPhone}`}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      title="اتصال هاتفي بالعميل"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <Link
                    href={`/admin/orders`}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="فتح في شاشة الطلبات"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
