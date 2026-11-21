"use client";

import { useState, useCallback, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, RotateCcw, Lock, Heart, ChevronLeft, X } from "lucide-react";
import { AdminPagination } from "@/modules/admin/components/AdminPagination";
import type { CarWithRelations } from "@/modules/admin/cars/types/car.types";

interface BrandOption {
  id: string;
  name: string;
  car_models?: { id: string; name: string }[];
}

interface CarsClientCatalogProps {
  initialCars: CarWithRelations[];
  totalCount: number;
  brands: BrandOption[];
  currentPage?: number;
  pageSize?: number;
}

const BODY_TYPE_OPTIONS = [
  { value: "", label: "جميع الأنواع" },
  { value: "sedan", label: "سيدان" },
  { value: "suv", label: "SUV" },
  { value: "hatchback", label: "هاتشباك" },
  { value: "coupe", label: "كوبيه" },
  { value: "convertible", label: "مكشوفة" },
  { value: "van", label: "فان" },
  { value: "truck", label: "بيك أب / شاحنة" },
  { value: "crossover", label: "كروس أوفر" },
  { value: "other", label: "أخرى" },
];

const TRANSMISSION_OPTIONS = [
  { value: "", label: "جميع ناقلات الحركة" },
  { value: "automatic", label: "أوتوماتيك" },
  { value: "manual", label: "يدوي (مانيوال)" },
  { value: "cvt", label: "CVT" },
  { value: "dual_clutch", label: "دبل كلتش" },
];

const FUEL_OPTIONS = [
  { value: "", label: "جميع أنواع الوقود" },
  { value: "petrol", label: "بنزين" },
  { value: "diesel", label: "ديزل" },
  { value: "electric", label: "كهربائي" },
  { value: "hybrid", label: "هايبرد" },
  { value: "plugin_hybrid", label: "هايبرد مدمج (Plug-in)" },
  { value: "gas", label: "غاز" },
];

const DRIVE_OPTIONS = [
  { value: "", label: "جميع أنواع الدفع" },
  { value: "fwd", label: "دفع أمامي (FWD)" },
  { value: "rwd", label: "دفع خلفي (RWD)" },
  { value: "awd", label: "دفع رباعي (AWD)" },
  { value: "4wd", label: "دفع 4×4 (4WD)" },
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS: { value: string; label: string }[] = [{ value: "", label: "جميع السنوات" }];
for (let y = currentYear + 1; y >= 2010; y--) {
  YEAR_OPTIONS.push({ value: String(y), label: String(y) });
}

const TRANSMISSION_LABELS: Record<string, string> = {
  automatic: "أوتوماتيك",
  manual: "يدوي",
  cvt: "CVT",
  dual_clutch: "دبل كلتش",
};

const FUEL_LABELS: Record<string, string> = {
  petrol: "بنزين",
  diesel: "ديزل",
  electric: "كهربائي",
  hybrid: "هايبرد",
  plugin_hybrid: "هايبرد مدمج",
  gas: "غاز",
};

const BODY_LABELS: Record<string, string> = {
  sedan: "سيدان",
  suv: "SUV",
  hatchback: "هاتشباك",
  coupe: "كوبيه",
  convertible: "مكشوفة",
  van: "فان",
  truck: "بيك أب",
  crossover: "كروس أوفر",
  other: "أخرى",
};

function useUrlFilters() {
  const searchParams = useSearchParams();
  return {
    search: searchParams.get("search") ?? "",
    brand_id: searchParams.get("brand_id") ?? "",
    model_id: searchParams.get("model_id") ?? "",
    body_type: searchParams.get("body_type") ?? "",
    year: searchParams.get("year") ?? "",
    condition: searchParams.get("condition") ?? "",
    transmission: searchParams.get("transmission") ?? "",
    fuel_type: searchParams.get("fuel_type") ?? "",
    drive_type: searchParams.get("drive_type") ?? "",
  };
}

function getCarImage(car: CarWithRelations): string {
  const imgs = (car as any).car_images;
  if (imgs && imgs.length > 0) {
    const primary = imgs.find((i: any) => i.is_primary) || imgs[0];
    return primary.image_url || primary.url || "";
  }
  return "";
}

export function CarsClientCatalog({
  initialCars,
  totalCount,
  brands,
  currentPage = 1,
  pageSize = 12,
}: CarsClientCatalogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const urlFilters = useUrlFilters();

  const [search, setSearch] = useState(urlFilters.search);
  const [selectedBrand, setSelectedBrand] = useState(urlFilters.brand_id);
  const [selectedModel, setSelectedModel] = useState(urlFilters.model_id);
  const [selectedBodyType, setSelectedBodyType] = useState(urlFilters.body_type);
  const [selectedYear, setSelectedYear] = useState(urlFilters.year);
  const [selectedCondition, setSelectedCondition] = useState(urlFilters.condition);
  const [selectedTransmission, setSelectedTransmission] = useState(urlFilters.transmission);
  const [selectedFuelType, setSelectedFuelType] = useState(urlFilters.fuel_type);
  const [selectedDriveType, setSelectedDriveType] = useState(urlFilters.drive_type);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [unlockedCars, setUnlockedCars] = useState<string[]>([]);

  useEffect(() => {
    try {
      const ids = JSON.parse(localStorage.getItem("unlocked_cars") || "[]");
      setUnlockedCars(ids);
    } catch {}
  }, []);

  const availableModels =
    brands.find((b) => b.id === selectedBrand)?.car_models ?? [];

  const hasActiveFilters = !!(
    search || selectedBrand || selectedModel || selectedBodyType ||
    selectedYear || selectedCondition || selectedTransmission ||
    selectedFuelType || selectedDriveType
  );

  const applyFilters = useCallback((overrideParams?: Record<string, string>) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedBrand) params.set("brand_id", selectedBrand);
    if (selectedModel) params.set("model_id", selectedModel);
    if (selectedBodyType) params.set("body_type", selectedBodyType);
    if (selectedYear) params.set("year", selectedYear);
    if (selectedCondition) params.set("condition", selectedCondition);
    if (selectedTransmission) params.set("transmission", selectedTransmission);
    if (selectedFuelType) params.set("fuel_type", selectedFuelType);
    if (selectedDriveType) params.set("drive_type", selectedDriveType);

    if (overrideParams) {
      Object.entries(overrideParams).forEach(([k, v]) => {
        if (v) params.set(k, v);
        else params.delete(k);
      });
    }

    startTransition(() => {
      router.push(`/cars${params.toString() ? "?" + params.toString() : ""}`);
      setMobileFiltersOpen(false);
    });
  }, [
    search, selectedBrand, selectedModel, selectedBodyType, selectedYear,
    selectedCondition, selectedTransmission, selectedFuelType, selectedDriveType, router,
  ]);

  const resetFilters = () => {
    setSearch(""); setSelectedBrand(""); setSelectedModel(""); setSelectedBodyType("");
    setSelectedYear(""); setSelectedCondition(""); setSelectedTransmission("");
    setSelectedFuelType(""); setSelectedDriveType("");
    startTransition(() => router.push("/cars"));
  };

  const handleBrandChange = (val: string) => {
    setSelectedBrand(val);
    setSelectedModel("");
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const selectClass = "w-full bg-white border border-[#E5E7EB] rounded-xl px-3 py-2.5 text-sm text-[#121316] focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059]/30 transition-all";

  const FilterContent = (
    <form
      onSubmit={(e) => { e.preventDefault(); applyFilters(); }}
      className="space-y-4"
    >
      {/* Search */}
      <div className="space-y-1.5">
        <label className="block text-xs font-black text-[#121316] uppercase tracking-wider">البحث النصي</label>
        <div className="relative">
          <Search className="absolute right-3 top-3 w-4 h-4 text-[#76777b]" />
          <input
            type="text"
            placeholder="اسم السيارة، الماركة، الموديل..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[#E5E7EB] rounded-xl pr-9 pl-3 py-2.5 text-sm text-[#121316] placeholder:text-[#76777b] focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059]/30 transition-all"
          />
        </div>
      </div>

      {/* Brand */}
      <div className="space-y-1.5">
        <label className="block text-xs font-black text-[#121316] uppercase tracking-wider">الماركة</label>
        <select value={selectedBrand} onChange={(e) => handleBrandChange(e.target.value)} className={selectClass}>
          <option value="">جميع الماركات</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      {/* Model — only shown when brand selected */}
      {selectedBrand && availableModels.length > 0 && (
        <div className="space-y-1.5">
          <label className="block text-xs font-black text-[#121316] uppercase tracking-wider">الموديل</label>
          <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className={selectClass}>
            <option value="">جميع الموديلات</option>
            {availableModels.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
      )}

      <hr className="border-[#E5E7EB]" />

      {/* Condition */}
      <div className="space-y-1.5">
        <label className="block text-xs font-black text-[#121316] uppercase tracking-wider">حالة السيارة</label>
        <div className="flex gap-2">
          {[{ value: "", label: "الكل" }, { value: "new", label: "زيرو" }, { value: "used", label: "مستعمل" }].map((opt) => (
            <button key={opt.value} type="button" onClick={() => setSelectedCondition(opt.value)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                selectedCondition === opt.value
                  ? "bg-[#121316] text-white border-[#121316]"
                  : "bg-white text-[#46464b] border-[#E5E7EB] hover:border-[#121316]"
              }`}
            >{opt.label}</button>
          ))}
        </div>
      </div>

      {/* Body Type */}
      <div className="space-y-1.5">
        <label className="block text-xs font-black text-[#121316] uppercase tracking-wider">نوع الهيكل</label>
        <select value={selectedBodyType} onChange={(e) => setSelectedBodyType(e.target.value)} className={selectClass}>
          {BODY_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Year */}
      <div className="space-y-1.5">
        <label className="block text-xs font-black text-[#121316] uppercase tracking-wider">سنة الصنع</label>
        <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className={selectClass}>
          {YEAR_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <hr className="border-[#E5E7EB]" />

      {/* Transmission */}
      <div className="space-y-1.5">
        <label className="block text-xs font-black text-[#121316] uppercase tracking-wider">ناقل الحركة</label>
        <select value={selectedTransmission} onChange={(e) => setSelectedTransmission(e.target.value)} className={selectClass}>
          {TRANSMISSION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Fuel Type */}
      <div className="space-y-1.5">
        <label className="block text-xs font-black text-[#121316] uppercase tracking-wider">نوع الوقود</label>
        <select value={selectedFuelType} onChange={(e) => setSelectedFuelType(e.target.value)} className={selectClass}>
          {FUEL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Drive Type */}
      <div className="space-y-1.5">
        <label className="block text-xs font-black text-[#121316] uppercase tracking-wider">نوع الدفع</label>
        <select value={selectedDriveType} onChange={(e) => setSelectedDriveType(e.target.value)} className={selectClass}>
          {DRIVE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <hr className="border-[#E5E7EB]" />

      {/* Actions */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 rounded-xl bg-[#121316] hover:bg-[#1e1f23] text-white font-black text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
      >
        <Search className="w-4 h-4" />
        {isPending ? "جاري التصفية..." : "تطبيق الفلاتر"}
      </button>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={resetFilters}
          className="w-full py-2.5 rounded-xl border border-[#E5E7EB] text-[#76777b] hover:text-[#121316] hover:border-[#121316] font-bold text-sm transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          إعادة ضبط الفلاتر
        </button>
      )}
    </form>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16" dir="rtl">
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4 flex items-center justify-between">
        <span className="text-sm text-[#46464b] font-bold">
          {totalCount} سيارة متاحة
        </span>
        <button
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#E5E7EB] text-sm font-bold text-[#121316] shadow-sm"
        >
          <Filter className="w-4 h-4" />
          الفلاتر
          {hasActiveFilters && (
            <span className="w-5 h-5 rounded-full bg-[#121316] text-white text-[10px] font-black flex items-center justify-center">
              !
            </span>
          )}
        </button>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFiltersOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileFiltersOpen(false)}>
          <div
            className="absolute right-0 top-0 h-full w-80 bg-white overflow-y-auto p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <span className="font-black text-[#121316] text-base">فلترة السيارات</span>
              <button onClick={() => setMobileFiltersOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-[#46464b]" />
              </button>
            </div>
            {FilterContent}
          </div>
        </div>
      )}

      <div className="flex gap-6">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm sticky top-28">
            <div className="flex items-center justify-between mb-5">
              <span className="font-black text-[#121316] text-sm flex items-center gap-2">
                <Filter className="w-4 h-4" />
                فلترة النتائج
              </span>
              {hasActiveFilters && (
                <button onClick={resetFilters} className="text-[10px] text-[#76777b] hover:text-[#121316] flex items-center gap-1 font-bold">
                  <RotateCcw className="w-3 h-3" />
                  مسح
                </button>
              )}
            </div>
            {FilterContent}
          </div>
        </aside>

        {/* Cars Grid */}
        <main className="flex-1 min-w-0">
          {/* Results header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="text-sm font-black text-[#121316]">{totalCount} سيارة</span>
              <span className="text-xs text-[#76777b] mr-1.5">متاحة في الأسطول</span>
            </div>
            {isPending && (
              <span className="text-xs text-[#c5a059] font-bold animate-pulse">جاري التحديث...</span>
            )}
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedCondition && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#121316] text-white text-xs font-bold">
                  {selectedCondition === "new" ? "زيرو" : "مستعمل"}
                  <button onClick={() => setSelectedCondition("")} className="hover:opacity-70">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedBodyType && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-[#121316] text-xs font-bold">
                  {BODY_LABELS[selectedBodyType] || selectedBodyType}
                  <button onClick={() => setSelectedBodyType("")} className="hover:opacity-70">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedYear && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-[#121316] text-xs font-bold">
                  {selectedYear}
                  <button onClick={() => setSelectedYear("")} className="hover:opacity-70">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedTransmission && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-[#121316] text-xs font-bold">
                  {TRANSMISSION_LABELS[selectedTransmission] || selectedTransmission}
                  <button onClick={() => setSelectedTransmission("")} className="hover:opacity-70">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedFuelType && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-[#121316] text-xs font-bold">
                  {FUEL_LABELS[selectedFuelType] || selectedFuelType}
                  <button onClick={() => setSelectedFuelType("")} className="hover:opacity-70">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          {initialCars.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-[#E5E7EB]">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="font-black text-[#121316] text-lg mb-2">لا توجد سيارات مطابقة</h3>
              <p className="text-sm text-[#76777b] mb-6">جرب تعديل الفلاتر للحصول على نتائج أوسع</p>
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 rounded-xl bg-[#121316] text-white font-bold text-sm flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                إعادة ضبط الفلاتر
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {initialCars.map((car) => {
                const imageUrl = getCarImage(car);
                const isFav = favorites.includes(car.id);
                const isUnlocked = unlockedCars.includes(car.id);
                const brandName = (car as any).brand?.name || "";
                const modelName = (car as any).car_models?.name || "";

                return (
                  <div
                    key={car.id}
                    className="group bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm hover:shadow-lg hover:border-[#c5a059]/30 transition-all duration-200"
                  >
                    {/* Image */}
                    <div className="relative h-52 bg-slate-100 overflow-hidden">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={car.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl opacity-20">🚗</span>
                        </div>
                      )}

                      {/* Badges */}
                      <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                        {car.condition === "new" && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black">
                            زيرو
                          </span>
                        )}
                        {(car as any).featured && (
                          <span className="px-2.5 py-1 rounded-full bg-[#c5a059] text-slate-950 text-[10px] font-black">
                            مميز ⭐
                          </span>
                        )}
                        {car.status === "reserved" && (
                          <span className="px-2.5 py-1 rounded-full bg-orange-500 text-white text-[10px] font-black">
                            محجوزة
                          </span>
                        )}
                      </div>

                      {/* Favorite */}
                      <button
                        onClick={() => toggleFavorite(car.id)}
                        className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                      >
                        <Heart
                          className={`w-4 h-4 ${isFav ? "fill-red-500 text-red-500" : "text-slate-400"}`}
                        />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      {/* Brand / Model row */}
                      <div className="flex items-center gap-2 mb-1">
                        {brandName && (
                          <span className="text-[10px] font-black text-[#c5a059] bg-[#c5a059]/10 px-2 py-0.5 rounded border border-[#c5a059]/20">
                            {brandName}
                          </span>
                        )}
                        {modelName && (
                          <span className="text-[10px] text-[#76777b] font-bold">{modelName}</span>
                        )}
                      </div>

                      <h3 className="font-black text-[#121316] text-sm leading-snug mb-2 line-clamp-2">
                        {car.title}
                      </h3>

                      {/* Specs */}
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
                        {car.year && (
                          <span className="text-[11px] text-[#46464b] flex items-center gap-1">
                            <span className="text-[#c5a059]">📅</span> {car.year}
                          </span>
                        )}
                        {(car as any).transmission && (
                          <span className="text-[11px] text-[#46464b] flex items-center gap-1">
                            <span className="text-[#c5a059]">⚙️</span>
                            {TRANSMISSION_LABELS[(car as any).transmission] || (car as any).transmission}
                          </span>
                        )}
                        {(car as any).fuel_type && (
                          <span className="text-[11px] text-[#46464b] flex items-center gap-1">
                            <span className="text-[#c5a059]">⛽</span>
                            {FUEL_LABELS[(car as any).fuel_type] || (car as any).fuel_type}
                          </span>
                        )}
                        {(car as any).mileage != null && (
                          <span className="text-[11px] text-[#46464b] flex items-center gap-1">
                            <span className="text-[#c5a059]">🛣️</span>
                            {Number((car as any).mileage).toLocaleString("en-US")} كم
                          </span>
                        )}
                      </div>

                      {/* Price / CTA */}
                      <div className="pt-3 border-t border-[#F3F4F6] flex items-center justify-between gap-2">
                        <div>
                          {isUnlocked && (car as any).price ? (
                            <div>
                              <p className="text-[10px] text-[#76777b]">السعر</p>
                              <p className="font-black text-[#121316] text-base">
                                {Number((car as any).price).toLocaleString("en-US")}
                                <span className="text-xs font-bold text-[#76777b] mr-1">ج.م</span>
                              </p>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <Lock className="w-3.5 h-3.5 text-[#c5a059]" />
                              <span className="text-xs text-[#76777b] font-bold">السعر عند المعاينة</span>
                            </div>
                          )}
                        </div>

                        <Link
                          href={`/cars/${car.slug || car.id}`}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#121316] hover:bg-[#1e1f23] text-white text-xs font-black transition-all shrink-0"
                        >
                          <span>التفاصيل</span>
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          <div className="mt-8">
            <AdminPagination
              currentPage={currentPage}
              totalPages={Math.max(1, Math.ceil(totalCount / pageSize))}
              totalItems={totalCount}
              pageSize={pageSize}
              onPageChange={(p) => {
                applyFilters({ page: String(p) });
                window.scrollTo({ top: 400, behavior: "smooth" });
              }}
              itemName="سيارة فاخرة"
              className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm"
            />
          </div>
        </main>
      </div>
    </div>
  );
}
