import Link from "next/link";
import { Plus, Car, Users, ShieldAlert, UserCheck, ArrowUpRight, TrendingUp, Clock } from "lucide-react";
import { Charts } from "@/modules/admin/dashboard/components/Charts";
import { RecentActivityTable } from "@/modules/admin/dashboard/components/RecentActivityTable";
import {
  getDashboardStats,
  getRecentActivity,
  getDashboardTopCars,
} from "@/modules/admin/dashboard/actions/dashboard";
import type { ChartDataPoint } from "@/modules/admin/dashboard/components/Charts";
import type { RecentActivity } from "@/modules/admin/dashboard/components/RecentActivityTable";

const monthlyChartData: ChartDataPoint[] = [];

// Skeleton placeholders for loading states (used client-side — here for SSR we await)
export default async function AdminDashboardPage() {
  const [stats, recentLeads, topCars] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(),
    getDashboardTopCars(),
  ]);

  const statCards = [
    {
      id: "total-cars",
      label: "إجمالي السيارات المتاحة",
      value: stats.totalAvailableCars.toString(),
      icon: Car,
      color: "blue",
    },
    {
      id: "total-ppf",
      label: "باقات الحماية والـ PPF",
      value: stats.totalProtectionFilms.toString(),
      icon: ShieldAlert,
      color: "amber",
    },
    {
      id: "total-orders",
      label: "الطلبات الجديدة",
      value: stats.totalNewLeads.toString(),
      icon: Users,
      color: "green",
    },
    {
      id: "total-customers",
      label: "إجمالي العملاء",
      value: stats.totalCustomers.toString(),
      icon: UserCheck,
      color: "purple",
    },
  ];

  // Map live lead activity to the RecentActivity shape
  const activities: RecentActivity[] = recentLeads.map((lead) => ({
    id: lead.id,
    action: lead.action,
    subject: lead.subject,
    time: new Date(lead.created_at).toLocaleString("ar-EG", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    type: lead.type,
  }));

  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    amber: "bg-amber-50 text-amber-600 border-amber-200",
    green: "bg-emerald-50 text-emerald-600 border-emerald-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* ── Page Title & Quick Actions Header ─────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            لوحة التحكم الرئيسية 🚀
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            مرحباً بك مجدداً، إليك نظرة عامة على أداء منصة المعرض والسيارات والطلبات
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/cars/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-500/25 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة سيارة جديدة</span>
          </Link>
        </div>
      </div>

      {/* ── KPI Stats Cards Grid ───────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const colorClass = colorMap[stat.color] || colorMap.blue;
          return (
            <div
              key={stat.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex items-center gap-4"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colorClass} shrink-0`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 leading-tight">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900 mt-0.5">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Charts & Visualizations Section ────────────────────── */}
      <Charts monthlyData={monthlyChartData} />

      {/* ── Content Grid: Recent Activity & Top Listings ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Table (2 columns on lg) */}
        <div className="lg:col-span-2">
          <RecentActivityTable activities={activities} />
        </div>

        {/* Featured Cars List Sidebar Widget */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Car className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-slate-800 text-base">أحدث السيارات المضافة</h3>
              </div>
              <Link
                href="/admin/cars"
                className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 hover:underline"
              >
                عرض الكل
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {topCars.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">لا توجد سيارات مضافة بعد</p>
              ) : (
                topCars.map((car) => (
                  <div
                    key={car.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors"
                  >
                    {car.image ? (
                      <img
                        src={car.image}
                        alt={car.title}
                        className="w-14 h-12 object-cover rounded-lg shrink-0 border border-slate-200"
                      />
                    ) : (
                      <div className="w-14 h-12 rounded-lg shrink-0 border border-slate-200 bg-slate-100 flex items-center justify-center">
                        <Car className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 text-xs truncate">{car.title}</h4>
                      <p className="text-[11px] text-amber-600 font-extrabold mt-0.5">
                        {car.price.toLocaleString("ar-EG")} ج.م
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        car.status === "available"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : car.status === "sold"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {car.status === "available"
                        ? "متاحة"
                        : car.status === "sold"
                        ? "مباعة"
                        : car.status === "reserved"
                        ? "محجوزة"
                        : "قيد المراجعة"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link
              href="/admin/cars/new"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-slate-200 hover:border-amber-500 text-slate-500 hover:text-amber-600 font-bold text-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة سيارة لمعرض المنتجات</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
