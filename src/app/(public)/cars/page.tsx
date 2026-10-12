import { Suspense } from "react";
import { getPublicCars } from "@/modules/public/actions/cars";
import { createServerClient } from "@/modules/shared/lib/supabase/server";
import { CarsClientCatalog } from "@/modules/public/cars/components/CarsClientCatalog";
import { Sparkles } from "lucide-react";

async function getBrandsForFilter() {
  try {
    const supabase = await createServerClient();
    const { data } = await supabase
      .from("brands")
      .select("id, name")
      .is("vehicle_type", "car")
      .order("name");
    return data || [];
  } catch {
    return [];
  }
}

export const metadata = {
  title: "أسطول السيارات الفاخرة | أولاد العم للسيارات",
  description:
    "تصفح أسطول سياراتنا الفاخرة من مرسيدس، بورش، بي إم دبليو، رنج روفر والمزيد. سيارات جديدة ومستعملة معتمدة بضمان وتسليم فوري.",
};

export default async function PublicCarsCatalogPage() {
  const [{ data: cars, total }, brands] = await Promise.all([
    getPublicCars({ limit: 50 }),
    getBrandsForFilter(),
  ]);

  return (
    <div className="space-y-8 pb-16 font-sans text-right" dir="rtl">
      {/* ── Dark Hero Section ─────────────────────────────────── */}
      <section className="relative bg-[#111215] text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-neutral-800 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1600&h=600&fit=crop"
            alt="Luxury Cars Fleet"
            className="w-full h-full object-cover opacity-25 filter brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111215] via-[#111215]/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto space-y-4 text-center">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#c5a059] text-xs font-bold">
            <Sparkles className="w-4 h-4" />
            <span>أسطول أولاد العم المعتمد VIP</span>
          </span>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            أسطول السيارات الفاخرة المتاحة للبيع والتسليم الفوري 🏎️
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-normal">
            اكتشف تشكيلة حصرية من أحدث طرازات مرسيدس-مايباخ، بورش، بي إم دبليو، ورنج روفر بتجهيزات ملكية وضمان الوكيل.
          </p>
        </div>
      </section>

      {/* Client component handles filtering, search, and display */}
      <Suspense fallback={<CarsCatalogSkeleton />}>
        <CarsClientCatalog initialCars={cars} totalCount={total} brands={brands} />
      </Suspense>
    </div>
  );
}

function CarsCatalogSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-md h-20 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
            <div className="h-56 bg-slate-200" />
            <div className="p-5 space-y-3">
              <div className="h-3 bg-slate-200 rounded w-1/2" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-full" />
              <div className="h-10 bg-slate-200 rounded-xl mt-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
