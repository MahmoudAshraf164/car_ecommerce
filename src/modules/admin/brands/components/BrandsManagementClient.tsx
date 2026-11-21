"use client";

import { useState, useTransition } from "react";
import {
  Tags,
  Plus,
  Search,
  ChevronDown,
  ChevronUp,
  Trash2,
  Layers,
  Car,
  X,
  Sparkles,
} from "lucide-react";
import { AdminPagination } from "@/modules/admin/components/AdminPagination";
import { addBrand, deleteBrand, addModel, deleteModel } from "../actions/brands";

interface BrandsManagementClientProps {
  initialBrands: any[];
}

export function BrandsManagementClient({ initialBrands }: BrandsManagementClientProps) {
  const [brands, setBrands] = useState(initialBrands);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const [expandedBrandId, setExpandedBrandId] = useState<string | null>(
    initialBrands[0]?.id || null
  );

  const [isPending, startTransition] = useTransition();

  // Modal states
  const [isAddBrandOpen, setIsAddBrandOpen] = useState(false);
  const [isAddModelOpen, setIsAddModelOpen] = useState(false);
  const [targetBrandId, setTargetBrandId] = useState<string | null>(null);

  // Form states
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandLogo, setNewBrandLogo] = useState("🏎️");
  const [newModelName, setNewModelName] = useState("");

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
        setExpandedBrandId(res.brand.id);
      } else {
        alert(res.error || "Failed to add brand");
      }
    });
  };

  const handleAddModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModelName.trim() || !targetBrandId) return;

    startTransition(async () => {
      const res = await addModel(targetBrandId, newModelName.trim());
      if (res.success && res.model) {
        setBrands((prev) =>
          prev.map((b) => {
            if (b.id === targetBrandId) {
              return {
                ...b,
                car_models: [...b.car_models, res.model],
              };
            }
            return b;
          })
        );
        setNewModelName("");
        setIsAddModelOpen(false);
        setTargetBrandId(null);
      } else {
        alert(res.error || "Failed to add model");
      }
    });
  };

  const handleDeleteModel = (brandId: string, modelId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الموديل؟")) return;

    startTransition(async () => {
      const res = await deleteModel(modelId);
      if (res.success) {
        setBrands((prev) =>
          prev.map((b) => {
            if (b.id === brandId) {
              return {
                ...b,
                car_models: b.car_models.filter((m: any) => m.id !== modelId),
              };
            }
            return b;
          })
        );
      } else {
        alert(res.error || "Failed to delete model");
      }
    });
  };

  const handleDeleteBrand = (brandId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الماركة وجميع الموديلات التابعة لها؟")) return;

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
            إدارة الماركات والموديلات 🏷️
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            إدارة الماركات التجارية للسيارات والموديلات الفرعية بسهولة
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
          <div className="w-px h-4 bg-slate-200" />
          <div>
            إجمالي الموديلات:{" "}
            <span className="font-extrabold text-amber-600">
              {brands.reduce((acc, b) => acc + (b.car_models?.length || 0), 0)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Brands Accordions / Grid ──────────────────────────── */}
      <div className="space-y-4">
        {paginatedBrands.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400">
            <Tags className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">لا توجد ماركات تطابق البحث</p>
          </div>
        ) : (
          paginatedBrands.map((brand) => {
            const isExpanded = expandedBrandId === brand.id;
            return (
              <div
                key={brand.id}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${isExpanded
                    ? "border-amber-500/50 ring-2 ring-amber-500/10"
                    : "border-slate-200/80 hover:border-slate-300"
                  }`}
              >
                {/* Brand Header Item */}
                <div
                  onClick={() => setExpandedBrandId(isExpanded ? null : brand.id)}
                  className="flex items-center justify-between p-5 cursor-pointer select-none hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-2xl shadow-xs shrink-0">
                      {brand.logo_url || "🚗"}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">
                        {brand.name}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                          <Layers className="w-3 h-3" />
                          {brand.car_models?.length || 0} موديل
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={(e) => {
                        e.stopPropagation();
                        setTargetBrandId(brand.id);
                        setIsAddModelOpen(true);
                      }}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-700 font-bold text-xs transition-colors border border-slate-200/60"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة نوع فرعي</span>
                    </button>

                    <button
                      type="button"
                      disabled={isPending}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBrand(brand.id);
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                      title="حذف الماركة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="p-1.5 text-slate-400">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-amber-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Sub-models Expanded List */}
                {isExpanded && (
                  <div className="bg-slate-50/50 p-5 border-t border-slate-100 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        الموديلات الفرعية المسجلة ({(brand.car_models || []).length})
                      </h4>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => {
                          setTargetBrandId(brand.id);
                          setIsAddModelOpen(true);
                        }}
                        className="sm:hidden flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 text-white font-bold text-xs disabled:opacity-50"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        إضافة موديل
                      </button>
                    </div>

                    {(!brand.car_models || brand.car_models.length === 0) ? (
                      <div className="text-center py-8 text-xs text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                        لا توجد موديلات فرعية مسجلة لهذه الماركة بعد
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {brand.car_models.map((model: any) => (
                          <div
                            key={model.id}
                            className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200/80 hover:border-amber-300 shadow-2xs group transition-all"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-2 h-2 rounded-full bg-amber-500" />
                              <span className="font-bold text-slate-800 text-xs">
                                {model.name}
                              </span>
                            </div>
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() => handleDeleteModel(brand.id, model.id)}
                              className="text-slate-300 group-hover:text-rose-500 hover:bg-rose-50 p-1 rounded-md transition-colors disabled:opacity-50"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
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
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-all ${newBrandLogo === icon
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

      {/* ── Modal: Add New Model ──────────────────────────────── */}
      {isAddModelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-600" />
                إضافة نوع فرعي
              </h3>
              <button
                onClick={() => setIsAddModelOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddModel} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  اسم الموديل الفرعي *
                </label>
                <input
                  type="text"
                  placeholder="مثال: LX 600 AMG"
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-sm rounded-xl shadow-md hover:from-amber-600 hover:to-amber-700 transition-all disabled:opacity-70"
                >
                  {isPending ? "جاري الإضافة..." : "إضافة الموديل"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModelOpen(false)}
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
