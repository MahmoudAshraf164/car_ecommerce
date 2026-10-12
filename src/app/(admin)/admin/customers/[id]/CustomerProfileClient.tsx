"use client";

import { useState } from "react";
import {
  Phone,
  Mail,
  Briefcase,
  Calendar,
  FileText,
  ChevronLeft,
  MessageSquare,
  Car,
  Shield,
  CreditCard,
  MapPin,
} from "lucide-react";
import Link from "next/link";

export default function CustomerProfileClient({ customer }: { customer: any }) {
  const [activeTab, setActiveTab] = useState<"deals" | "notes">("deals");

  // Format leads for display
  const deals = (customer.leads || []).map((lead: any) => {
    const isCar = !!lead.cars;
    const isPPF = !!lead.protection_films;
    const assetTitle = isCar
      ? lead.cars.title
      : isPPF
      ? lead.protection_films.title
      : "استفسار عام";
    const category = isCar ? "سيارة" : isPPF ? "حماية PPF" : "عام";
    const price = isCar
      ? lead.cars.price
      : isPPF
      ? lead.protection_films.price
      : 0;

    const formattedDate = new Intl.DateTimeFormat("ar-EG", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(new Date(lead.created_at));

    return {
      id: lead.id,
      asset: assetTitle,
      category,
      amount: price,
      status: lead.status,
      date: formattedDate,
      notes: lead.notes,
    };
  });

  const totalInvestment = deals
    .filter((d: any) => d.status === "won")
    .reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "won":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            تم التعاقد (Won)
          </span>
        );
      case "new":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            جديد
          </span>
        );
      case "contacted":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            تم التواصل
          </span>
        );
      case "lost":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            مرفوض (Lost)
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans text-right" dir="rtl">
      {/* Header Card (Clean & Professional) */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 border-2 border-slate-200 flex items-center justify-center shrink-0">
              <span className="text-2xl font-black">{customer.name?.[0] || "ع"}</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900">{customer.name}</h1>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 pt-1">
                <span className="flex items-center gap-1.5 font-mono">
                  <Phone className="w-4 h-4 text-slate-400" /> {customer.phone}
                </span>
                {customer.email && (
                  <span className="flex items-center gap-1.5 font-mono">
                    <Mail className="w-4 h-4 text-slate-400" /> {customer.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <a
              href={`https://wa.me/${customer.phone?.replace(/[^\d]/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
              مراسلة عبر واتساب
            </a>
          </div>
        </div>

        {/* Real Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 block">إجمالي التعاقدات (المبالغ)</span>
              <span className="text-xl font-black text-slate-900 font-mono">
                {totalInvestment > 0 ? totalInvestment.toLocaleString("ar-EG") : "0"} ج.م
              </span>
            </div>
            <CreditCard className="w-8 h-8 text-slate-300" />
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 block">عدد الطلبات المسجلة</span>
              <span className="text-xl font-black text-slate-900 font-mono">{deals.length}</span>
            </div>
            <Car className="w-8 h-8 text-slate-300" />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-px">
        <button
          onClick={() => setActiveTab("deals")}
          className={`flex items-center gap-2 px-4 py-3 rounded-t-xl font-bold text-sm transition-all ${
            activeTab === "deals"
              ? "bg-white border-x border-t border-slate-200/80 text-amber-600 border-b-2 border-b-white -mb-px shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>سجل الطلبات ({deals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("notes")}
          className={`flex items-center gap-2 px-4 py-3 rounded-t-xl font-bold text-sm transition-all ${
            activeTab === "notes"
              ? "bg-white border-x border-t border-slate-200/80 text-amber-600 border-b-2 border-b-white -mb-px shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>الملاحظات والاستفسارات</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        {activeTab === "deals" && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3">جدول الصفقات</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5 text-xs font-black text-slate-500 uppercase">المنتج / السيارة</th>
                    <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase">الفئة</th>
                    <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase">القيمة</th>
                    <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase">الحالة</th>
                    <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase">التاريخ</th>
                    <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deals.length > 0 ? (
                    deals.map((d: any) => (
                      <tr key={d.id} className="hover:bg-slate-50">
                        <td className="px-5 py-4 font-bold text-slate-900">{d.asset}</td>
                        <td className="px-5 py-4 text-xs text-slate-500">{d.category}</td>
                        <td className="px-5 py-4 font-mono font-black text-slate-900">
                          {d.amount > 0 ? `${d.amount.toLocaleString("ar-EG")} ج.م` : "—"}
                        </td>
                        <td className="px-5 py-4">{getStatusBadge(d.status)}</td>
                        <td className="px-5 py-4 font-mono text-xs text-slate-500">{d.date}</td>
                        <td className="px-5 py-4">
                          <Link href="/admin/orders" className="text-amber-600 font-bold text-xs hover:underline">
                            إدارة الطلب
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-slate-500 text-sm">
                        لا يوجد طلبات حالياً
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "notes" && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3">ملاحظات العميل</h3>
            <div className="space-y-3">
              {deals.map((d: any, idx: number) => (
                d.notes ? (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                    <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-slate-900 text-sm">استفسار بخصوص: {d.asset}</h4>
                        <span className="font-mono text-[11px] text-slate-400">{d.date}</span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-100 mt-2">
                        {d.notes}
                      </p>
                    </div>
                  </div>
                ) : null
              ))}
              {deals.every((d: any) => !d.notes) && (
                <div className="text-center py-8 text-slate-500 text-sm">
                  لا يوجد ملاحظات مسجلة
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
