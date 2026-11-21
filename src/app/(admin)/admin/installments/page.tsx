export const dynamic = 'force-dynamic';
import { Suspense } from "react";
import { getInstallments } from "@/modules/admin/installments/actions/installments";
import { InstallmentsClient } from "@/modules/admin/installments/components/InstallmentsClient";
import { AutoInstallmentReminderTrigger } from "@/modules/admin/installments/components/AutoInstallmentReminderTrigger";
import { createServerClient } from "@/modules/shared/lib/supabase/server";
import { CreditCard } from "lucide-react";

export const metadata = {
  title: "الأقساط والمتابعة المالية | لوحة التحكم",
};

export default async function AdminInstallmentsPage() {
  const supabase = await createServerClient();

  const [installmentsRes, customersRes, carsRes] = await Promise.all([
    getInstallments(),
    supabase
      .from("customers")
      .select("id, name, phone, email")
      .order("name", { ascending: true }),
    supabase
      .from("cars")
      .select("id, title, price")
      .is("deleted_at", null)
      .order("title", { ascending: true }),
  ]);

  const installments = installmentsRes.data || [];
  const customers = customersRes.data || [];
  const cars = carsRes.data || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans" dir="rtl">
      <AutoInstallmentReminderTrigger />
      {installmentsRes.error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
          ⚠️ تعذر تحميل عقود الأقساط: {installmentsRes.error}
        </div>
      )}

      <Suspense
        fallback={
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8 text-center">
            <CreditCard className="w-8 h-8 text-amber-500 mx-auto mb-3 animate-pulse" />
            <p className="text-sm text-slate-500">جاري تحميل الأقساط...</p>
          </div>
        }
      >
        <InstallmentsClient
          initialInstallments={installments}
          customers={customers}
          cars={cars}
        />
      </Suspense>
    </div>
  );
}
