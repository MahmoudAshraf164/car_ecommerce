"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, RotateCcw, ChevronDown, X } from "lucide-react";

interface SidebarFiltersProps {
  brands: any[];
  currentFilters: {
    search?: string;
    brand_id?: string;
    condition?: string;
    transmission?: string;
    body_type?: string;
    min_price?: string;
    max_price?: string;
    min_year?: string;
  };
  mobile?: boolean;
}

export function SidebarFilters({ brands, currentFilters, mobile }: SidebarFiltersProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [search, setSearch] = useState(currentFilters.search || "");
  const [selectedBrand, setSelectedBrand] = useState(currentFilters.brand_id || "");
  const [selectedCondition, setSelectedCondition] = useState(currentFilters.condition || "");
  const [selectedTransmission, setSelectedTransmission] = useState(currentFilters.transmission || "");
  const [selectedBodyType, setSelectedBodyType] = useState(currentFilters.body_type || "");
  const [minPrice, setMinPrice] = useState(currentFilters.min_price || "");
  const [maxPrice, setMaxPrice] = useState(currentFilters.max_price || "");
  const [minYear, setMinYear] = useState(currentFilters.min_year || "");

  const hasActiveFilters = !!(
    search || selectedBrand || selectedCondition ||
    selectedTransmission || selectedBodyType || minPrice || maxPrice || minYear
  );

  const applyFilters = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedBrand) params.set("brand_id", selectedBrand);
    if (selectedCondition) params.set("condition", selectedCondition);
    if (selectedTransmission) params.set("transmission", selectedTransmission);
    if (selectedBodyType) params.set("body_type", selectedBodyType);
    if (minPrice) params.set("min_price", minPrice);
    if (maxPrice) params.set("max_price", maxPrice);
    if (minYear) params.set("min_year", minYear);
    startTransition(() => {
      router.push(`/cars?${params.toString()}`);
      setMobileOpen(false);
    });
  };

  const resetFilters = () => {
    setSearch(""); setSelectedBrand(""); setSelectedCondition("");
    setSelectedTransmission(""); setSelectedBodyType(""); setMinPrice(""); setMaxPrice(""); setMinYear("");
    startTransition(() => router.push("/cars"));
  };

  const FilterContent = (
    <form onSubmit={applyFilters} className="space-y-5">
      {/* Search */}
      <div className="space-y-2">
        <label className="block text-xs font-black text-[#121316] uppercase tracking-wider">البحث</label>
        <div className="relative">
          <Search className="absolute right-3 top-3 w-4 h-4 text-[#76777b]" />
          <input
            type="text"
            placeholder="اسم السيارة، الماركة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[#E5E7EB] rounded-xl pr-9 pl-3 py-2.5 text-sm text-[#121316] placeholder:text-[#76777b] focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059]/30 transition-all"
          />
        </div>
      </div>

      {/* Brand */}
      <div className="space-y-2">
        <label className="block text-xs font-black text-[#121316] uppercase tracking-wider">الماركة</label>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="radio"
              name="brand"
              value=""
              checked={selectedBrand === ""}
              onChange={() => setSelectedBrand("")}
              className="w-4 h-4 accent-[#121316]"
            />
            <span className={`text-sm transition-colors ${selectedBrand === "" ? "font-bold text-[#121316]" : "text-[#46464b] group-hover:text-[#121316]"}`}>
              جميع الماركات
            </span>
          </label>
          {brands.map((b) => (
            <label key={b.id} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="brand"
                value={b.id}
                checked={selectedBrand === b.id}
                onChange={() => setSelectedBrand(b.id)}
                className="w-4 h-4 accent-[#121316]"
              />
              <span className={`text-sm transition-colors ${selectedBrand === b.id ? "font-bold text-[#121316]" : "text-[#46464b] group-hover:text-[#121316]"}`}>
                {b.name}
              </span>
              {b.car_models?.length > 0 && (
                <span className="mr-auto text-xs text-[#76777b] bg-[#F3F4F5] px-1.5 py-0.5 rounded-md">
                  {b.car_models.length}
                </span>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Divider */}
      <hr className="border-[#E5E7EB]" />

      {/* Condition */}
      <div className="space-y-2">
        <label className="block text-xs font-black text-[#121316] uppercase tracking-wider">حالة السيارة</label>
        <div className="flex gap-2">
          {[
            { value: "", label: "الكل" },
            { value: "new", label: "زيرو" },
            { value: "used", label: "مستعمل" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSelectedCondition(opt.value)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                selectedCondition === opt.value
                  ? "bg-[#121316] text-white border-[#121316]"
                  : "bg-white text-[#46464b] border-[#E5E7EB] hover:border-[#121316]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transmission */}
      <div className="space-y-2">
        <label className="block text-xs font-black text-[#121316] uppercase tracking-wider">ناقل الحركة</label>
        <select
          value={selectedTransmission}
          onChange={(e) => setSelectedTransmission(e.target.value)}
          className="w-full bg-white border border-[#E5E7EB] rounded-xl px-3 py-2.5 text-sm text-[#121316] focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059]/30 transition-all"
        >
          <option value="">الجميع</option>
          <option value="automatic">أوتوماتيك</option>
          <option value="manual">مانيوال</option>
          <option value="cvt">CVT</option>
          <option value="dual_clutch">دبل كلتش</option>
        </select>
      </div>

      {/* Body Type */}
      <div className="space-y-2">
        <label className="block text-xs font-black text-[#121316] uppercase tracking-wider">نمط الهيكل</label>
        <select
          value={selectedBodyType}
          onChange={(e) => setSelectedBodyType(e.target.value)}
          className="w-full bg-white border border-[#E5E7EB] rounded-xl px-3 py-2.5 text-sm text-[#121316] focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059]/30 transition-all"
        >
          <option value="">الجميع</option>
          <option value="sedan">سيدان</option>
          <option value="suv">SUV</option>
          <option value="coupe">كوبيه</option>
          <option value="hatchback">هاتشباك</option>
          <option value="convertible">كابريوليه</option>
          <option value="truck">بيك أب</option>
        </select>
      </div>

      <hr className="border-[#E5E7EB]" />

      {/* Price Range */}
      <div className="space-y-2">
        <label className="block text-xs font-black text-[#121316] uppercase tracking-wider">نطاق السعر (ج.م)</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="من"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full bg-white border border-[#E5E7EB] rounded-xl px-3 py-2.5 text-sm text-[#121316] focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059]/30 transition-all"
          />
          <input
            type="number"
            placeholder="إلى"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full bg-white border border-[#E5E7EB] rounded-xl px-3 py-2.5 text-sm text-[#121316] focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059]/30 transition-all"
          />
        </div>
      </div>

      {/* Year */}
      <div className="space-y-2">
        <label className="block text-xs font-black text-[#121316] uppercase tracking-wider">سنة الصنع (من)</label>
        <input
          type="number"
          placeholder="2020"
          value={minYear}
          onChange={(e) => setMinYear(e.target.value)}
          className="w-full bg-white border border-[#E5E7EB] rounded-xl px-3 py-2.5 text-sm text-[#121316] focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059]/30 transition-all"
        />
      </div>

      {/* Apply Button */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 bg-[#121316] hover:bg-[#1b1b1f] text-white font-black text-sm rounded-xl transition-all shadow-sm"
      >
        {isPending ? "جاري البحث..." : "تطبيق الفلترة"}
      </button>

      {/* Reset */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={resetFilters}
          className="w-full py-2 border border-[#E5E7EB] text-[#46464b] hover:text-[#121316] hover:border-[#121316] font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          إعادة ضبط الفلاتر
        </button>
      )}
    </form>
  );

  // Mobile version
  if (mobile) {
    return (
      <>
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm font-bold text-[#121316] shadow-sm"
        >
          <Filter className="w-4 h-4 text-[#c5a059]" />
          الفلترة والبحث
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-[#c5a059] rounded-full" />
          )}
        </button>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
            <div
              className="absolute inset-y-0 right-0 w-80 bg-white shadow-2xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB]">
                <h2 className="font-black text-[#121316] flex items-center gap-2">
                  <Filter className="w-5 h-5 text-[#c5a059]" />
                  الفلترة والبحث
                </h2>
                <button onClick={() => setMobileOpen(false)} className="p-2 hover:bg-[#F3F4F5] rounded-lg">
                  <X className="w-5 h-5 text-[#46464b]" />
                </button>
              </div>
              <div className="p-5">{FilterContent}</div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop Sidebar
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
      <h2 className="font-black text-[#121316] text-base flex items-center gap-2 mb-5 pb-4 border-b border-[#E5E7EB]">
        <Filter className="w-5 h-5 text-[#c5a059]" />
        الفلترة والبحث
      </h2>
      {FilterContent}
    </div>
  );
}
