"use client";

import { Receipt, Download, DollarSign, Calendar, TrendingUp } from "lucide-react";

const mockFinancials = [
  { id: "INV-9081", title: "مبيعة مرسيدس S500 4MATIC", amount: "6,850,000 ج.م", date: "2026-09-14", status: "مكتملة", type: "سيارات" },
  { id: "INV-9082", title: "حجز وحدة ذا ريفيرا ريزيدنسز", amount: "14,500,000 ج.م", date: "2026-09-12", status: "مكتملة", type: "عقارات" },
  { id: "INV-9083", title: "مبيعة سكوتر Yamaha TMAX 560", amount: "890,000 ج.م", date: "2026-09-10", status: "مكتملة", type: "سكوترات" },
];

export default function FinancialReportsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60 shadow-xs">
              <Receipt className="w-5 h-5" />
            </div>
            التقارير المالية والفواتير 💳
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            سجل التدفقات المالية والمبيعات والفواتير الصادرة بالمعرض
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-slate-800 transition-colors">
          <Download className="w-4 h-4" />
          <span>تصدير التقرير المالي (CSV/PDF)</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase">رقم الفاتورة</th>
              <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase">البيان / المعاملة</th>
              <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase">القيمة المالية</th>
              <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase">القسم</th>
              <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase">التاريخ</th>
              <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mockFinancials.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/70">
                <td className="px-5 py-4 font-mono font-bold text-amber-700">{item.id}</td>
                <td className="px-5 py-4 font-bold text-slate-800">{item.title}</td>
                <td className="px-5 py-4 font-mono font-black text-slate-900">{item.amount}</td>
                <td className="px-5 py-4"><span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{item.type}</span></td>
                <td className="px-5 py-4 font-mono text-xs text-slate-500">{item.date}</td>
                <td className="px-5 py-4"><span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">{item.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
