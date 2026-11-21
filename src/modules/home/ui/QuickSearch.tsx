"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

interface Brand {
  id: string;
  name: string;
  car_models: { id: string; name: string }[];
}

const BODY_TYPE_OPTIONS = [
  { value: "", label: "جميع الأنواع" },
  { value: "sedan", label: "سيدان" },
  { value: "suv", label: "SUV — دفع رباعي" },
  { value: "hatchback", label: "هاتشباك" },
  { value: "coupe", label: "كوبيه" },
  { value: "convertible", label: "مكشوفة" },
  { value: "van", label: "فان" },
  { value: "truck", label: "بيك أب / شاحنة" },
  { value: "crossover", label: "كروس أوفر" },
  { value: "other", label: "أخرى" },
];

const CONDITION_OPTIONS = [
  { value: "", label: "جميع الحالات" },
  { value: "new", label: "زيرو / جديدة" },
  { value: "used", label: "مستعملة" },
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS: { value: string; label: string }[] = [{ value: "", label: "جميع السنوات" }];
for (let y = currentYear + 1; y >= 2010; y--) {
  YEAR_OPTIONS.push({ value: String(y), label: String(y) });
}

export function QuickSearch() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedBodyType, setSelectedBodyType] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("");

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase
      .from("brands")
      .select("id, name, car_models(id, name)")
      .eq("vehicle_type", "car")
      .order("name")
      .then(({ data }) => {
        if (data) setBrands(data as Brand[]);
      });
  }, []);

  const availableModels =
    brands.find((b) => b.id === selectedBrand)?.car_models ?? [];

  const handleBrandChange = (val: string) => {
    setSelectedBrand(val);
    setSelectedModel("");
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedBrand) params.set("brand_id", selectedBrand);
    if (selectedModel) params.set("model_id", selectedModel);
    if (selectedBodyType) params.set("body_type", selectedBodyType);
    if (selectedYear) params.set("year", selectedYear);
    if (selectedCondition) params.set("condition", selectedCondition);
    startTransition(() => {
      router.push(`/cars${params.toString() ? "?" + params.toString() : ""}`);
    });
  };

  const selectClass =
    "w-full h-12 pr-4 pl-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#c5a059]/50 focus:border-[#c5a059] cursor-pointer transition-all";

  return (
    <section className="relative z-20 max-w-[1440px] w-full mx-auto px-4 md:px-12 -mt-14">
      <div className="bg-white rounded-2xl shadow-[0_20px_48px_-12px_rgba(0,0,0,0.14)] p-6 md:p-8 border border-slate-100">
        {/* Header Row */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#c5a059] text-[22px]">
              directions_car
            </span>
            <span className="font-black text-slate-900 text-base">
              بحث سريع في الأسطول
            </span>
          </div>
          <span className="text-xs text-slate-400 hidden md:block">
            السعر يظهر عند طلب المعاينة — تواصل معنا لأي استفسار
          </span>
          {/* Price Gated Badge */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold md:flex hidden">
            <span className="material-symbols-outlined text-[14px]">lock</span>
            السعر يظهر عند طلب المعاينة
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Brand */}
          <div className="flex flex-col gap-1 lg:col-span-1">
            <label className="text-xs text-slate-500 font-bold">الماركة</label>
            <div className="relative">
              <select
                value={selectedBrand}
                onChange={(e) => handleBrandChange(e.target.value)}
                className={selectClass}
              >
                <option value="">جميع الماركات</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400 text-[20px] pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* Model */}
          <div className="flex flex-col gap-1 lg:col-span-1">
            <label className="text-xs text-slate-500 font-bold">الموديل</label>
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className={selectClass}
                disabled={!selectedBrand || availableModels.length === 0}
              >
                <option value="">جميع الموديلات</option>
                {availableModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400 text-[20px] pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* Body Type */}
          <div className="flex flex-col gap-1 lg:col-span-1">
            <label className="text-xs text-slate-500 font-bold">نوع الهيكل</label>
            <div className="relative">
              <select
                value={selectedBodyType}
                onChange={(e) => setSelectedBodyType(e.target.value)}
                className={selectClass}
              >
                {BODY_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400 text-[20px] pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* Year */}
          <div className="flex flex-col gap-1 lg:col-span-1">
            <label className="text-xs text-slate-500 font-bold">سنة الصنع</label>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className={selectClass}
              >
                {YEAR_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400 text-[20px] pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* Condition */}
          <div className="flex flex-col gap-1 lg:col-span-1">
            <label className="text-xs text-slate-500 font-bold">الحالة</label>
            <div className="relative">
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className={selectClass}
              >
                {CONDITION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400 text-[20px] pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* Search Button */}
          <div className="flex flex-col justify-end lg:col-span-1">
            <button
              type="button"
              onClick={handleSearch}
              disabled={isPending}
              className="w-full h-12 rounded-xl bg-gradient-to-l from-[#c5a059] to-[#e8c97a] hover:from-[#b08820] hover:to-[#d4af37] text-[#121316] font-black text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-md cursor-pointer disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
              <span>{isPending ? "جاري البحث..." : "بحث فوري"}</span>
            </button>
          </div>
        </div>

        {/* Mobile price badge */}
        <div className="mt-4 md:hidden">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
            <span className="material-symbols-outlined text-[14px]">lock</span>
            السعر يظهر عند طلب المعاينة
          </span>
        </div>
      </div>
    </section>
  );
}
