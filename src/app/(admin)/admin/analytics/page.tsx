"use client";

import { BarChart3, TrendingUp, Users, ShoppingCart, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Charts } from "@/modules/admin/dashboard/components/Charts";
import type { ChartDataPoint } from "@/modules/admin/dashboard/components/Charts";

const monthlyChartData: ChartDataPoint[] = [];

export default function AnalyticsPage() {
  const kpis = [
    { title: "إجمالي المبيعات والأرباح", value: "12,450,000 ج.م", change: "+18.4%", isUp: true },
    { title: "معدل التحويل (Conversion Rate)", value: "4.8%", change: "+1.2%", isUp: true },
    { title: "طلبات المعاينة والاختبار", value: "328 طلب", change: "+24%", isUp: true },
    { title: "معدل مغادرة الصفحة", value: "28.5%", change: "-3.1%", isUp: false },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto" dir="rtl">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60 shadow-xs">
            <BarChart3 className="w-5 h-5" />
          </div>
          التحليلات والمؤشرات المتقدمة 📊
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          متابعة معدلات التحويل، التفاعل، وأداء المعرض وسلوك الزوار
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
            <span className="text-xs font-bold text-slate-400 block">{kpi.title}</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-slate-900 font-mono">{kpi.value}</span>
              <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${kpi.isUp ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"}`}>
                {kpi.isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {kpi.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <Charts monthlyData={monthlyChartData} />
    </div>
  );
}
