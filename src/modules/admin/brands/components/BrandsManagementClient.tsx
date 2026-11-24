"use client";

import { useState, useTransition } from "react";
import {
  Tags,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { AdminPagination } from "@/modules/admin/components/AdminPagination";
import { addBrand, deleteBrand } from "../actions/brands";

interface BrandsManagementClientProps {
  initialBrands: any[];
}

export function BrandsManagementClient({ initialBrands }: BrandsManagementClientProps) {
  const [brands, setBrands] = useState(initialBrands);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const [isPending, startTransition] = useTransition();

  // Modal states
  const [isAddBrandOpen, setIsAddBrandOpen] = useState(false);

  // Form states
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandLogo, setNewBrandLogo] = useState("🏎️");

  const filteredBrands = brands.filter((brand: any) =>
    brand.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredBrands.length / pageSize));
  const paginatedBrands = filteredBrands.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleAddBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;

    startTransition(async () => {
      const res = await addBrand(newBrandName.trim(), newBrandLogo);
      if (res.success && res.brand) {
        setBrands([{ ...res.brand, car_models: [] }, ...brands]);
        setNewBrandName("");
        setIsAddBrandOpen(false);
      } else {
        alert(res.error || "Failed to add brand");
      }
    });
  };

  const handleDeleteBrand = (brandId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الماركة؟")) return;

    startTransition(async () => {
      const res = await deleteBrand(brandId);
      if (res.success) {
        setBrands((prev) => prev.filter((b) => b.id !== brandId));
      } else {
        alert(res.error || "Failed to delete brand");
      }
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto" dir="rtl">
      {/* ── Page Header ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60 shadow-xs">
              <Tags className="w-5 h-5" />
            </div>
            إدارة الماركات 🏷️
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            إدارة الماركات التجارية للسيارات بسهولة
          </p>
        </div>

        <button
          onClick={() => setIsAddBrandOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-500/25 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة ماركة جديدة</span>
        </button>
      </div>

      {/* ── Search & Summary Bar ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="بحث باسم الماركة..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-500 w-full sm:w-auto justify-between sm:justify-end">
          <div>
            إجمالي الماركات:{" "}
            <span className="font-extrabold text-slate-900">{brands.length}</span>
          </div>
        </div>
      </div>

      {/* ── Brands List / Grid ──────────────────────────── */}
      <div className="space-y-4">
        {paginatedBrands.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 space-y-3">
            <Tags className="w-12 h-12 mx-auto mb-2 opacity-30 text-amber-600" />
            <p className="text-base font-extrabold text-slate-800">لا توجد ماركات مضافة حالياً</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              لم يتم العثور على ماركات تجارية مسجلة، يمكنك إضافة أول ماركة بسهولة.
            </p>
            <button
              onClick={() => setIsAddBrandOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all mt-2"
            >
              <Plus className="w-4 h-4" />
              إضافة ماركة الآن
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {paginatedBrands.map((brand) => (
              <div
                key={brand.id}
                className="bg-white rounded-2xl border border-slate-200/80 hover:border-amber-400 p-5 shadow-xs flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-2xl shadow-xs shrink-0">
                    {brand.logo_url || "🚗"}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">
                      {brand.name}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleDeleteBrand(brand.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                  title="حذف الماركة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Brands Pagination */}
        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredBrands.length}
          pageSize={pageSize}
          onPageChange={(p) => {
            setCurrentPage(p);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          itemName="ماركة"
        />
      </div>

      {/* ── Modal: Add New Brand ──────────────────────────────── */}
      {isAddBrandOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Tags className="w-5 h-5 text-amber-600" />
                إضافة ماركة جديدة
              </h3>
              <button
                onClick={() => setIsAddBrandOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBrand} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  اسم الماركة التجارية *
                </label>
                <input
                  type="text"
                  placeholder="مثال: لكسز (Lexus)"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  رمز / أيقونة التميز
                </label>
                <div className="flex items-center gap-2">
                  {["🏎️", "🚗", "🏁", "🚙", "🔵", "🔴", "⭐"].map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setNewBrandLogo(icon)}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-all ${
                        newBrandLogo === icon
                          ? "bg-amber-50 border-amber-500 ring-2 ring-amber-500/20"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-sm rounded-xl shadow-md hover:from-amber-600 hover:to-amber-700 transition-all disabled:opacity-70"
                >
                  {isPending ? "جاري الحفظ..." : "حفظ الماركة"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddBrandOpen(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm rounded-xl"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
