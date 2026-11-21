export const dynamic = 'force-dynamic';
import Link from "next/link";
import {
  Plus,
  Car,
  Users,
  Shield,
  UserCheck,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import {
  getExecutiveDashboardData,
  getDashboardRecentLeads,
  getDashboardLatestCars,
} from "@/modules/admin/dashboard/actions/executive-dashboard";
import { ExecutiveCharts } from "@/modules/admin/dashboard/components/ExecutiveCharts";
import { LiveRecentActivity } from "@/modules/admin/dashboard/components/LiveRecentActivity";
import { LatestVehiclesWidget } from "@/modules/admin/dashboard/components/LatestVehiclesWidget";
import { AutoInstallmentReminderTrigger } from "@/modules/admin/installments/components/AutoInstallmentReminderTrigger";

export const metadata = {
  title: "لوحة تحكم المالك التنفيذية | ولاد العم للسيارات وأفلام الحماية",
  description:
    "متابعة فورية ومباشرة لمؤشرات الأداء، مخزون السيارات، وباقات الحماية، ومسار الصفقات الحية",
};

export default async function AdminDashboardPage() {
  const [stats, recentActivities, latestCars] = await Promise.all([
    getExecutiveDashboardData(),
    getDashboardRecentLeads(),
    getDashboardLatestCars(),
  ]);

  const numberFormatter = new Intl.NumberFormat("en-US");

  // Top Live KPI Cards (100% Real Supabase Data)
  const statCards = [
    {
      id: "available-cars",
      label: "السيارات المتاحة للبيع",
      subLabel: `إجمالي الأسطول: ${numberFormatter.format(stats.fleetBreakdown.total)} سيارة`,
      value: numberFormatter.format(stats.availableCarsCount),
      unit: "سيارة",
      icon: Car,
      colorCls: "bg-blue-50 text-blue-600 border-blue-200",
      accentCls: "text-blue-600",
      href: "/admin/cars",
    },
    {
      id: "protection-films",
      label: "باقات الحماية والنانو",
      subLabel: "باقات PPF فعالة بالمعرض",
      value: numberFormatter.format(stats.protectionFilmsCount),
      unit: "باقة",
      icon: Shield,
      colorCls: "bg-amber-50 text-[#c5a059] border-amber-200",
      accentCls: "text-[#c5a059]",
      href: "/admin/protection-films",
    },
    {
      id: "new-leads",
      label: "الطلبات والاستفسارات الجديدة",
      subLabel: `نشط في المسار: ${numberFormatter.format(stats.activePipelineLeadsCount)} طلب`,
      value: numberFormatter.format(stats.newLeadsCount),
      unit: "طلب جديد",
      icon: Users,
      colorCls: "bg-emerald-50 text-emerald-600 border-emerald-200",
      accentCls: "text-emerald-600",
      href: "/admin/orders",
    },
    {
      id: "contracted-customers",
      label: "العملاء المتعاقدون (Won)",
      subLabel: "عملاء بصفقات ناجحة منتهية",
      value: numberFormatter.format(stats.contractedCustomersCount),
      unit: "عميل",
      icon: UserCheck,
      colorCls: "bg-purple-50 text-purple-600 border-purple-200",
      accentCls: "text-purple-600",
      href: "/admin/customers",
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto" dir="rtl">
      <AutoInstallmentReminderTrigger />
      {/* ── Page Title & Quick Actions Header ─────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              لوحة تحكم الإدارة التنفيذية 👑
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            معرض ولاد العم للسيارات وأفلام الحماية — مؤشرات حية ومحدثة من قاعدة البيانات
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/cars/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-l from-[#c5a059] to-[#e8c97a] hover:from-[#b08820] hover:to-[#d4af37] text-slate-950 font-black text-sm rounded-xl shadow-md shadow-[#c5a059]/20 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة سيارة جديدة</span>
          </Link>
        </div>
      </div>

      {/* ── 1. Live Top KPI Cards (Real Supabase Queries) ─────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.id}
              href={stat.href}
              className="bg-white rounded-2xl border border-slate-200/80 hover:border-[#c5a059]/50 hover:shadow-lg transition-all p-5 flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center border ${stat.colorCls} shrink-0 group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-[#c5a059] transition-colors">
                  عرض التفاصيل ←
                </span>
              </div>

              <div className="mt-4">
                <p className="text-xs font-bold text-slate-500 leading-tight">
                  {stat.label}
                </p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                    {stat.value}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {stat.unit}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium mt-1">
                  {stat.subLabel}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── 2. Real Fleet Status Breakdown & Deals Pipeline Chart ─ */}
      <ExecutiveCharts
        fleet={stats.fleetBreakdown}
        pipeline={stats.pipelineBreakdown}
      />

      {/* ── 3. Content Grid: Live Recent Activity & Latest Vehicles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Table (2 columns on lg) */}
        <div className="lg:col-span-2">
          <LiveRecentActivity activities={recentActivities} />
        </div>

        {/* Latest Vehicles Widget (1 column) */}
        <div>
          <LatestVehiclesWidget cars={latestCars} />
        </div>
      </div>
    </div>
  );
}
