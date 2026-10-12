"use client";

export interface ChartDataPoint {
  month: string;
  sales: number;
  views: number;
}

interface MiniChartProps {
  data: ChartDataPoint[];
  title: string;
  subtitle?: string;
}

export function SalesChart({ data, title, subtitle }: MiniChartProps) {
  const maxSales = Math.max(...data.map((d) => d.sales));
  const maxViews = Math.max(...data.map((d) => d.views));
  const totalSales = data.reduce((sum, d) => sum + d.sales, 0);
  const totalViews = data.reduce((sum, d) => sum + d.views, 0);
  const formattedViews = totalViews.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-extrabold text-slate-900 text-sm">{title}</h3>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-[10px] font-semibold text-slate-500">
              المبيعات ({totalSales})
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
            <span className="text-[10px] font-semibold text-slate-500" suppressHydrationWarning>
              الزيارات ({formattedViews})
            </span>
          </div>
        </div>
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-1.5 h-44">
        {data.map((point, idx) => (
          <div
            key={idx}
            className="flex-1 flex flex-col items-center gap-1 group"
          >
            {/* Tooltip */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg whitespace-nowrap">
              {point.sales} مبيعة
            </div>

            <div className="w-full flex flex-col items-center gap-0.5 flex-1 justify-end">
              {/* Views bar (background) */}
              <div
                className="w-full max-w-8 bg-blue-100 rounded-t-lg transition-all duration-500 hover:bg-blue-200"
                style={{
                  height: `${(point.views / maxViews) * 100}%`,
                  minHeight: "8px",
                }}
              />
              {/* Sales bar (foreground) */}
              <div
                className="w-full max-w-8 bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-lg transition-all duration-500 hover:from-amber-600 hover:to-amber-500 shadow-sm"
                style={{
                  height: `${(point.sales / maxSales) * 80}%`,
                  minHeight: "4px",
                }}
              />
            </div>

            {/* Label */}
            <span className="text-[9px] font-bold text-slate-400 mt-1 leading-none">
              {point.month.slice(0, 3)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatusDonut() {
  const segments = [
    { label: "متاحة", value: 78, color: "text-emerald-500" },
    { label: "مباعة", value: 42, color: "text-blue-500" },
    { label: "محجوزة", value: 18, color: "text-amber-500" },
    { label: "قيد المراجعة", value: 10, color: "text-slate-400" },
  ];
  const total = segments.reduce((s, v) => s + v.value, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
      <h3 className="font-extrabold text-slate-900 text-sm mb-6">
        حالة السيارات
      </h3>

      {/* Circular visual representation */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-36 h-36">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {(() => {
              let offset = 0;
              const colors = ["#10b981", "#3b82f6", "#f59e0b", "#94a3b8"];
              return segments.map((seg, i) => {
                const pct = (seg.value / total) * 100;
                const dashArray = `${pct * 2.51} ${251 - pct * 2.51}`;
                const el = (
                  <circle
                    key={i}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={colors[i]}
                    strokeWidth="12"
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
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-slate-900">{total}</span>
            <span className="text-[10px] font-bold text-slate-400">سيارة</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2">
        {segments.map((seg, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100"
          >
            <div
              className={`w-2.5 h-2.5 rounded-full ${seg.color.replace(
                "text-",
                "bg-"
              )}`}
            />
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-slate-500">
                {seg.label}
              </span>
              <span className="text-xs font-black text-slate-800">
                {seg.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Charts({ monthlyData }: { monthlyData: ChartDataPoint[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <SalesChart
          data={monthlyData}
          title="معدل نمو المبيعات والزيارات"
          subtitle="متابعة شهرية لأداء المعرض وحركات البيع"
        />
      </div>
      <div>
        <StatusDonut />
      </div>
    </div>
  );
}
