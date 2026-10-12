"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ChevronLeft, Building2, PhoneCall, Mail, Trophy, CreditCard } from "lucide-react";

export default function CustomersClientPage({
  initialCustomers,
}: {
  initialCustomers: any[];
}) {
  const [search, setSearch] = useState("");

  const filtered = initialCustomers.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.toLowerCase().includes(search.toLowerCase())
  );

  if (initialCustomers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-xl">
          <Trophy className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-2">
          لا يوجد عملاء متعاقدين بعد
        </h3>
        <p className="text-slate-500 max-w-md mx-auto text-sm leading-relaxed">
          تظهر هنا قائمة العملاء الحصريين بمجرد تحويل صفقاتهم إلى "تم التعاقد" (Won). ابدأ بإدارة الصفقات الآن!
        </p>
        <Link
          href="/admin/orders"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[#121316] text-white rounded-xl font-bold hover:bg-[#c5a059] transition-colors"
        >
          الذهاب إلى إدارة الصفقات
          <ChevronLeft className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="البحث باسم العميل، البريد، أو الجوال..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-11 pl-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059]/20 transition-all"
          />
        </div>
        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-4 px-4 sm:px-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs text-slate-500 font-bold">
              إجمالي العملاء:{" "}
              <span className="text-slate-900 font-extrabold text-base">
                {filtered.length}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((c) => {
          const wonLeads = c.leads?.filter((l: any) => l.status === "won") || [];
          const totalInvestment = wonLeads.reduce((acc: number, lead: any) => {
            const price = lead.cars?.price || 0;
            return acc + price;
          }, 0);

          return (
            <div
              key={c.id}
              className="group bg-white rounded-2xl border border-slate-200/80 hover:border-[#c5a059]/40 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative"
            >
              {/* Gold gradient top border highlight */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-l from-[#c5a059] to-[#e8c97a] opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="p-6 pb-5 border-b border-slate-50 flex items-start gap-4">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#121316] to-[#1e1c18] flex items-center justify-center shrink-0 shadow-lg shadow-black/5">
                    <span className="text-xl font-black text-[#c5a059]">
                      {c.name?.[0] || "ع"}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -left-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
                    <Trophy className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>

                <div className="flex-1 min-w-0 pt-1">
                  <h3 className="font-extrabold text-slate-900 text-lg truncate group-hover:text-[#c5a059] transition-colors">
                    {c.name || "عميل بدون اسم"}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1 text-emerald-600 text-[11px] font-black">
                    <span>VIP Member</span>
                    <span>•</span>
                    <span>تم التعاقد</span>
                  </div>
                </div>
              </div>

              <div className="p-6 py-5 space-y-4 flex-1">
                {/* Contact Info */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                      <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <a
                      href={`tel:${c.phone}`}
                      className="font-mono font-bold text-slate-700 hover:text-[#c5a059] transition-colors"
                      dir="ltr"
                    >
                      {c.phone}
                    </a>
                  </div>
                  {c.email && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <span className="font-mono font-bold text-slate-600 truncate">
                        {c.email}
                      </span>
                    </div>
                  )}
                </div>

                {/* Investment Stats */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-bold">المركبات المتعاقد عليها</span>
                    <span className="font-black text-slate-900 bg-white px-2 py-0.5 rounded shadow-sm">
                      {wonLeads.length} سيارة
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-bold flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5" />
                      إجمالي الاستثمار
                    </span>
                    <div className="text-left">
                      <span className="font-mono font-black text-emerald-600 text-lg tracking-tight">
                        {totalInvestment > 0 ? totalInvestment.toLocaleString("ar-EG") : "—"}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1 font-bold">ج.م</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-4 bg-slate-50/50 border-t border-slate-100">
                <Link
                  href={`/admin/customers/${c.id}`}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-3 text-sm font-black text-[#121316] bg-white border border-slate-200 hover:border-[#c5a059] hover:bg-[#c5a059] hover:text-white rounded-xl transition-all shadow-sm"
                >
                  فتح ملف الـ VIP
                  <ChevronLeft className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
