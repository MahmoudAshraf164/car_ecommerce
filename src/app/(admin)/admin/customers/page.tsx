import { Suspense } from "react";
import { createServerClient } from "@/modules/shared/lib/supabase/server";
import CustomersClientPage from "./CustomersClientPage";
import { UserCheck } from "lucide-react";

export const metadata = {
  title: "دليل العملاء | لوحة التحكم",
};

export default async function CustomersDirectoryPage() {
  const supabase = await createServerClient();
  const { data: customers, error } = await supabase
    .from("customers")
    .select("*, leads!inner(*, cars(price))")
    .eq("leads.status", "won")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching customers:", error);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60 shadow-xs">
              <UserCheck className="w-5 h-5" />
            </div>
            دليل العملاء وحسابات الـ VIP 360° 👥
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            متابعة حسابات العملاء والطلبات الخاصة بهم
          </p>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="text-center text-slate-500 py-10">
            جاري تحميل العملاء...
          </div>
        }
      >
        <CustomersClientPage initialCustomers={customers || []} />
      </Suspense>
    </div>
  );
}
