"use client";

import Link from "next/link";
import {
  Car,
  TrendingUp,
  DollarSign,
  PieChart,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import {
  FleetStatusBreakdown,
  PipelineBreakdown,
} from "@/modules/admin/dashboard/actions/executive-dashboard";

interface ExecutiveChartsProps {
  fleet: FleetStatusBreakdown;
  pipeline: PipelineBreakdown;
}

export function ExecutiveCharts({ fleet, pipeline }: ExecutiveChartsProps) {
  const numberFormatter = new Intl.NumberFormat("en-US");

  // Segments for Fleet Donut
  const fleetSegments = [
    {
      label: "متاحة بالمعرض",
      value: fleet.available,
      color: "bg-emerald-500",
      textColor: "text-emerald-700",
      borderColor: "border-emerald-200",
      svgStroke: "#10b981",
    },
    {
      label: "محجوزة",
      value: fleet.reserved,
      color: "bg-amber-500",
      textColor: "text-amber-700",
      borderColor: "border-amber-200",
      svgStroke: "#f59e0b",
    },
    {
      label: "مباعة بنجاح",
      value: fleet.sold,
      color: "bg-blue-600",
      textColor: "text-blue-700",
      borderColor: "border-blue-200",
      svgStroke: "#2563eb",
    },
    ...(fleet.draftOrArchived > 0
      ? [
          {
            label: "مسودة / أرشيف",
            value: fleet.draftOrArchived,
            color: "bg-slate-400",
            textColor: "text-slate-600",
            borderColor: "border-slate-200",
            svgStroke: "#94a3b8",
          },
        ]
      : []),
  ];

  const totalCars = Math.max(fleet.total, 1);

  // Pipeline stages with conversion visualization
  const pipelineStages = [
    {
      label: "استفسارات وطلبات جديدة",
      sub: "طلبات تنتظر المعاينة الأولى",
      count: pipeline.newCount,
      color: "from-amber-400 to-amber-500",
      textColor: "text-amber-700",
      badgeBg: "bg-amber-50 border-amber-200",
    },
    {
      label: "قيد التواصل والمعاينة",
      sub: "تم الاتصال بالعميل وتحديد موعد",
      count: pipeline.contactedCount,
      color: "from-blue-400 to-blue-500",
      textColor: "text-blue-700",
      badgeBg: "bg-blue-50 border-blue-200",
    },
    {
      label: "مرحلة التفاوض والتجهيز",
      sub: "عملاء مؤهلين لتوقيع العقود",
      count: pipeline.negotiatingCount,
      color: "from-purple-400 to-purple-600",
      textColor: "text-purple-700",
      badgeBg: "bg-purple-50 border-purple-200",
    },
    {
      label: "تم التعاقد والتسليم",
      sub: "صفقات ناجحة منتهية",
      count: pipeline.wonCount,
      color: "from-emerald-400 to-emerald-600",
      textColor: "text-emerald-700",
      badgeBg: "bg-emerald-50 border-emerald-200",
    },
    {
      label: "ملغاة / غير مناسبة",
      sub: "طلبات ملغاة أو لم تتطابق",
      count: pipeline.lostOrCancelledCount,
      color: "from-slate-300 to-slate-400",
      textColor: "text-slate-600",
      badgeBg: "bg-slate-50 border-slate-200",
    },
  ];

  const maxStageCount = Math.max(
    ...pipelineStages.map((s) => s.count),
    1
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ── 1. Pipeline & Conversions Breakdown (2 cols) ──────────────── */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#c5a059] flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  مسار الصفقات ومراحل التحويل (Deals Pipeline)
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                توزيع فوري لحركة طلبات العملاء من أول استفسار حتى التعاقد الفعلي
              </p>
            </div>

            {/* Total Deals Valuation Badge */}
            <div className="bg-gradient-to-l from-slate-900 to-slate-800 text-white px-4 py-2.5 rounded-xl border border-slate-700 flex items-center gap-3 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-[#c5a059]/20 text-[#c5a059] flex items-center justify-center font-bold">
                ج.م
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">
                  إجمالي قيمة الصفقات المتعاقدة
                </span>
                <span className="text-sm sm:text-base font-black text-amber-300 font-mono">
                  {numberFormatter.format(pipeline.totalWonDealsValue)}{" "}
                  <span className="text-[11px] font-normal text-slate-300">
                    ج.م
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Pipeline Stages Bars */}
          <div className="space-y-4 pt-6">
            {pipelineStages.map((stage, idx) => {
              const pct = (stage.count / maxStageCount) * 100;
              const totalPct =
                pipeline.totalLeads > 0
                  ? Math.round((stage.count / pipeline.totalLeads) * 100)
                  : 0;

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">
                        {stage.label}
                      </span>
                      <span className="text-[10px] text-slate-400 hidden sm:inline">
                        — {stage.sub}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md border ${stage.badgeBg} ${stage.textColor} font-mono`}
                      >
                        {numberFormatter.format(stage.count)} طلب
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono w-9 text-left">
                        ({totalPct}%)
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full bg-gradient-to-l ${stage.color} rounded-full transition-all duration-700`}
                      style={{ width: `${Math.max(pct, stage.count > 0 ? 4 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Link */}
        <div className="pt-5 mt-6 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            إجمالي استفسارات المنظومة:{" "}
            <strong className="text-slate-900 font-mono">
              {numberFormatter.format(pipeline.totalLeads)}
            </strong>
          </span>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-[#c5a059] hover:text-[#99751a] flex items-center gap-1 transition-colors"
          >
            <span>فتح شاشة متابعة الطلبات</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ── 2. Real Fleet Status Breakdown (1 col) ───────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                حالة أسطول السيارات
              </h3>
              <p className="text-[11px] text-slate-400">
                حصر دقيق لمخزون المعرض بالكامل
              </p>
            </div>
          </div>

          {/* Dynamic SVG Donut Chart */}
          <div className="flex items-center justify-center my-4">
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {(() => {
                  let offset = 0;
                  return fleetSegments.map((seg, i) => {
                    const pct = (seg.value / totalCars) * 100;
                    const dashArray = `${pct * 2.51} ${251 - pct * 2.51}`;
                    const el = (
                      <circle
                        key={i}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={seg.svgStroke}
                        strokeWidth="11"
                        strokeDasharray={dashArray}
                        strokeDashoffset={-offset * 2.51}
                        strokeLinecap="round"
                        className="transition-all duration-700"
                      />
                    );
                    offset += pct;
                    return el;
                  });
                })()}
              </svg>

              {/* Center Total Count (Real, no 148 mock) */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                  {numberFormatter.format(fleet.total)}
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  إجمالي الأسطول
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown Pills */}
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            {fleetSegments.map((seg, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100"
              >
                <div className={`w-3 h-3 rounded-full ${seg.color} shrink-0`} />
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-500 font-medium block truncate">
                    {seg.label}
                  </span>
                  <span className="text-sm font-black text-slate-900 font-mono block">
                    {numberFormatter.format(seg.value)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-slate-100">
          <Link
            href="/admin/cars"
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-50 hover:bg-[#c5a059]/10 text-slate-700 hover:text-[#c5a059] border border-slate-200 text-xs font-bold transition-all"
          >
            <span>إدارة أسطول السيارات بالكامل</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
