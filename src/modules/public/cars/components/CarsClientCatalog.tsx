"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Search, Heart, ChevronLeft, Lock, Unlock } from "lucide-react";
import type { CarWithRelations } from "@/modules/admin/cars/types/car.types";

interface BrandOption {
  id: string;
  name: string;
}

interface CarsClientCatalogProps {
  initialCars: CarWithRelations[];
  totalCount: number;
  brands: BrandOption[];
}

export function CarsClientCatalog({ initialCars, totalCount, brands }: CarsClientCatalogProps) {
  const [search, setSearch] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState("all");
  const [selectedCondition, setSelectedCondition] = useState("all");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [unlockedCars, setUnlockedCars] = useState<string[]>([]);

  useEffect(() => {
    try {
      const ids = JSON.parse(localStorage.getItem("unlocked_cars") || "[]");
      setUnlockedCars(ids);
    } catch (err) {}
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredCars = useMemo(() => {
    return initialCars.filter((car) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        !search ||
        car.title.toLowerCase().includes(searchLower) ||
        car.brand?.name?.toLowerCase().includes(searchLower) ||
        car.car_models?.name?.toLowerCase().includes(searchLower);

      const matchesBrand =
        selectedBrandId === "all" || car.brand_id === selectedBrandId;
      const matchesCondition =
        selectedCondition === "all" || car.condition === selectedCondition;

      return matchesSearch && matchesBrand && matchesCondition;
    });
  }, [initialCars, search, selectedBrandId, selectedCondition]);

  return (
    <>
      {/* ── Advanced Search & Filter Bar ──────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-md space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative sm:col-span-2">
              <Search className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="ابحث بالماركة، الموديل، أو عنوان السيارة..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            {/* Brand Filter */}
            <div>
              <select
                value={selectedBrandId}
                onChange={(e) => setSelectedBrandId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-[#c5a059]"
              >
                <option value="all">جميع الماركات العالمية</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Condition Filter */}
            <div>
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-[#c5a059]"
              >
                <option value="all">جميع الحالات</option>
                <option value="new">جديدة تماماً (زيرو)</option>
                <option value="used">مستعملة معتمدة</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* ── Cars Grid Section ─────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <span className="text-xs font-bold text-slate-500">
            تم العثور على{" "}
            <span className="font-extrabold text-slate-900 text-sm">
              {filteredCars.length}
            </span>{" "}
            سيارة فاخرة
          </span>
        </div>

        {filteredCars.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="text-5xl">🏎️</div>
            <h3 className="text-lg font-bold text-slate-700">
              لا توجد سيارات تطابق بحثك
            </h3>
            <p className="text-sm text-slate-500">
              جرب تعديل معايير البحث أو تصفح جميع السيارات
            </p>
            <button
              onClick={() => {
                setSearch("");
                setSelectedBrandId("all");
                setSelectedCondition("all");
              }}
              className="px-6 py-2.5 bg-[#c5a059] text-white font-bold text-sm rounded-xl hover:bg-[#b08d48] transition-colors"
            >
              مسح الفلاتر
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
            {filteredCars.map((car) => {
              const isFav = favorites.includes(car.id);
              const primaryImage =
                car.car_images?.find((img) => img.is_primary)?.image_url ||
                car.car_images?.[0]?.image_url ||
                null;

              return (
                <div
                  key={car.id}
                  className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between"
                >
                  <div>
                    {/* Image Container */}
                    <div className="relative h-56 w-full bg-slate-100 overflow-hidden">
                      {primaryImage ? (
                        <img
                          src={primaryImage}
                          alt={car.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100">
                          <span className="text-4xl opacity-30">🚗</span>
                        </div>
                      )}

                      {/* Status Badges */}
                      <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                        <span className="text-[10px] font-black text-[#c5a059] bg-slate-950/90 backdrop-blur-md px-2.5 py-1 rounded-md border border-[#c5a059]/40">
                          {car.status === "available" ? "متاح ⚡" : car.status === "reserved" ? "محجوز" : "مباع"}
                        </span>
                        {car.featured && (
                          <span className="text-[10px] font-black text-emerald-400 bg-slate-950/90 backdrop-blur-md px-2.5 py-1 rounded-md border border-emerald-500/40">
                            إصدار خاص VIP
                          </span>
                        )}
                      </div>

                      {/* Favorite Heart Button */}
                      <button
                        onClick={() => toggleFavorite(car.id)}
                        className={`absolute top-3 left-3 p-2 rounded-full backdrop-blur-md transition-colors ${
                          isFav
                            ? "bg-rose-500 text-white"
                            : "bg-slate-950/50 text-white hover:bg-slate-950/80"
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isFav ? "fill-white" : ""}`} />
                      </button>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-bold text-amber-700">
                          {car.brand?.name || "—"}
                        </span>
                        <span className="font-mono">{car.year}</span>
                      </div>

                      <h3 className="font-extrabold text-slate-900 text-base leading-snug line-clamp-1">
                        {car.title}
                      </h3>

                      {/* Key Specs Pills */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          {car.condition === "new" ? "زيرو" : "مستعمل معتمد"}
                        </span>
                        {car.transmission && (
                          <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                            {car.transmission === "automatic" ? "أوتوماتيك" : "يدوي"}
                          </span>
                        )}
                        {car.fuel_type && (
                          <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                            {car.fuel_type === "petrol" ? "بنزين" : car.fuel_type === "electric" ? "كهربائي" : car.fuel_type === "hybrid" ? "هايبرد" : car.fuel_type}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer Price & CTA */}
                  <div className="p-5 pt-0 space-y-3">
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      {unlockedCars.includes(car.id) ? (
                        <div>
                          <span className="text-[10px] font-bold text-emerald-600 block flex items-center gap-1">
                            <Unlock className="w-3 h-3" />
                            السعر الحالي:
                          </span>
                          <span className="font-mono font-black text-slate-900 text-lg">
                            {car.price.toLocaleString("ar-EG")}
                          </span>
                          <span className="mr-1 text-xs font-bold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded">
                            ج.م
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block mb-0.5">
                            السعر:
                          </span>
                          <span className="inline-flex items-center gap-1 font-bold text-amber-600 text-sm bg-amber-50 px-2 py-1 rounded border border-amber-100">
                            <Lock className="w-3.5 h-3.5" />
                            عند الاستفسار
                          </span>
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/cars/${car.id}`}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#111215] hover:bg-[#1C1D22] text-white font-extrabold text-xs transition-all shadow-md"
                    >
                      <span>{unlockedCars.includes(car.id) ? "عرض التفاصيل الكاملة" : "عرض التفاصيل ومعرفة السعر"}</span>
                      <ChevronLeft className="w-4 h-4 text-[#c5a059]" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
