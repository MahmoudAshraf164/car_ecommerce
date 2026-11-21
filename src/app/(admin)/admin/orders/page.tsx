export const dynamic = 'force-dynamic';
import { Suspense } from "react";
import { getAdminLeads } from "@/modules/admin/dashboard/actions/leads";
import { AdminOrdersClient } from "@/modules/admin/dashboard/components/AdminOrdersClient";
import { ClipboardList } from "lucide-react";

export const metadata = {
  title: "إدارة الطلبات والصفقات | لوحة التحكم",
};

export default async function AdminOrdersPage() {
  const { data: leads, error } = await getAdminLeads();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto font-sans" dir="rtl">
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
          ⚠️ تعذر تحميل الطلبات: {error}
        </div>
      )}

      <Suspense
        fallback={
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8 text-center">
            <ClipboardList className="w-8 h-8 text-amber-500 mx-auto mb-3 animate-pulse" />
            <p className="text-sm text-slate-500">جاري تحميل الطلبات...</p>
          </div>
        }
      >
        <AdminOrdersClient initialLeads={leads} />
      </Suspense>
    </div>
  );
}
