"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CarWithRelations, BrandRow } from "../types/car.types";
import { softDeleteCar, toggleFeatured } from "../actions/cars";
import { SeedDataButton } from "./seed-data-button";
import { AdminPagination } from "@/modules/admin/components/AdminPagination";
import {
  Search, Plus, Star, Edit, Trash2, Eye, Filter,
  ChevronLeft, ChevronRight, Car as CarIcon, AlertTriangle
} from "lucide-react";

interface CarsTableProps {
  cars: CarWithRelations[];
  brands: BrandRow[];
  total: number;
  page: number;
  pageSize?: number;
  totalPages: number;
  currentFilters: { search?: string; brand_id?: string; status?: string; limit?: string; };
}

export function CarsTable({ cars, brands, total, page, pageSize = 10, totalPages, currentFilters }: CarsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(currentFilters.search || "");
  const [selectedBrand, setSelectedBrand] = useState(currentFilters.brand_id || "");
  const [selectedStatus, setSelectedStatus] = useState(currentFilters.status || "");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const applyFilters = (newParams: Record<string, string>) => {
    const params = new URLSearchParams();
    const updated = {
      search,
      brand_id: selectedBrand,
      status: selectedStatus,
      limit: currentFilters.limit || String(pageSize),
      ...newParams,
    };
    Object.entries(updated).forEach(([k, v]) => { if (v) params.set(k, v); });
    startTransition(() => router.push(`/admin/cars?${params.toString()}`));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ page: "1" });
  };

  const handleToggleFeatured = async (car: CarWithRelations) => {
    startTransition(async () => {
      await toggleFeatured(car.id, !!car.featured);
      router.refresh();
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    const res = await softDeleteCar(deleteId);
    setIsDeleting(false);
    setDeleteId(null);
    if (res.success) router.refresh();
    else alert("خطأ أثناء الحذف: " + res.error);
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      available: "bg-emerald-50 text-emerald-700 border-emerald-200",
      reserved: "bg-amber-50 text-amber-700 border-amber-200",
      sold: "bg-blue-50 text-blue-700 border-blue-200",
      draft: "bg-gray-100 text-gray-600 border-gray-200",
      archived: "bg-red-50 text-red-700 border-red-200",
    };
    const labels: Record<string, string> = {
      available: "متاحة", reserved: "محجوزة", sold: "مباعة", draft: "مسودة", archived: "أرشيف",
    };
    return (
      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold border ${map[status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-5" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#121316] flex items-center gap-2">
            <CarIcon className="w-6 h-6 text-[#c5a059]" />
            إدارة السيارات
          </h1>
          <p className="text-sm text-[#46464b] mt-0.5">
            إجمالي السيارات: <span className="font-bold text-[#121316]">{total}</span> سيارة
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SeedDataButton />
          <Link
            href="/admin/cars/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#121316] hover:bg-[#1b1b1f] text-white font-bold text-sm transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            سيارة جديدة
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute right-3.5 top-3 w-4 h-4 text-[#76777b]" />
            <input
              type="text"
              placeholder="بحث باسم السيارة أو الوصف..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl pr-10 pl-3 py-2.5 text-sm text-[#121316] placeholder:text-[#76777b] focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059]/30"
            />
          </div>
          <select
            value={selectedBrand}
            onChange={(e) => { setSelectedBrand(e.target.value); applyFilters({ brand_id: e.target.value, page: "1" }); }}
            className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-3 py-2.5 text-sm text-[#121316] focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059]/30"
          >
            <option value="">جميع الماركات</option>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => { setSelectedStatus(e.target.value); applyFilters({ status: e.target.value, page: "1" }); }}
            className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-3 py-2.5 text-sm text-[#121316] focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059]/30"
          >
            <option value="">جميع الحالات</option>
            <option value="available">متاحة</option>
            <option value="reserved">محجوزة</option>
            <option value="sold">مباعة</option>
            <option value="draft">مسودة</option>
          </select>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm" dir="rtl">
            <thead className="bg-[#F8F9FA] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-5 py-3.5 text-xs font-black text-[#46464b] uppercase tracking-wider">السيارة</th>
                <th className="px-5 py-3.5 text-xs font-black text-[#46464b] uppercase tracking-wider">الماركة / الموديل</th>
                <th className="px-5 py-3.5 text-xs font-black text-[#46464b] uppercase tracking-wider">السنة</th>
                <th className="px-5 py-3.5 text-xs font-black text-[#46464b] uppercase tracking-wider">السعر</th>
                <th className="px-5 py-3.5 text-xs font-black text-[#46464b] uppercase tracking-wider">الحالة</th>
                <th className="px-5 py-3.5 text-xs font-black text-[#46464b] uppercase tracking-wider text-center">مميزة</th>
                <th className="px-5 py-3.5 text-xs font-black text-[#46464b] uppercase tracking-wider text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F5]">
              {cars.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-[#76777b]">
                    <CarIcon className="w-10 h-10 mx-auto mb-3 text-[#E1E3E4]" />
                    لا توجد سيارات مطابقة للبحث
                  </td>
                </tr>
              ) : (
                cars.map((car) => {
                  const primaryImage =
                    car.car_images?.find((img) => img.is_primary)?.image_url ||
                    car.car_images?.[0]?.image_url;

                  return (
                    <tr key={car.id} className="hover:bg-[#F8F9FA] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative w-14 h-10 rounded-xl overflow-hidden bg-[#F3F4F5] border border-[#E5E7EB] flex-shrink-0">
                            {primaryImage ? (
                              <Image src={primaryImage} alt={car.title} fill className="object-cover" unoptimized />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <CarIcon className="w-5 h-5 text-[#C7C6CB]" />
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-[#121316] block line-clamp-1">{car.title}</span>
                            <span className="text-xs text-[#76777b]">
                              {car.condition === "new" ? "زيرو" : "مستعمل"} • {car.color || "—"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-[#46464b]">
                        {car.brand?.name || "—"}<br />
                        <span className="text-xs text-[#76777b]">{car.car_models?.name || "—"}</span>
                      </td>
                      <td className="px-5 py-3.5 text-sm font-mono font-bold text-[#121316]">{car.year}</td>
                      <td className="px-5 py-3.5 font-mono font-black text-[#121316]">
                        {car.price.toLocaleString("ar-EG")}
                        <span className="text-xs font-normal text-[#76777b] mr-0.5">ج.م</span>
                      </td>
                      <td className="px-5 py-3.5">{statusBadge(car.status)}</td>
                      <td className="px-5 py-3.5 text-center">
                        <button
                          onClick={() => handleToggleFeatured(car)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            car.featured
                              ? "text-[#c5a059] bg-[#c5a059]/10 hover:bg-[#c5a059]/20"
                              : "text-[#C7C6CB] hover:text-[#c5a059] hover:bg-[#F3F4F5]"
                          }`}
                        >
                          <Star className={`w-4 h-4 ${car.featured ? "fill-[#c5a059]" : ""}`} />
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-left">
                        <div className="inline-flex items-center gap-1">
                          <Link
                            href={`/cars/${car.id}`}
                            target="_blank"
                            className="p-1.5 text-[#76777b] hover:text-[#121316] hover:bg-[#F3F4F5] rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/cars/${car.id}/edit`}
                            className="p-1.5 text-[#76777b] hover:text-[#c5a059] hover:bg-[#F3F4F5] rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteId(car.id)}
                            className="p-1.5 text-[#76777b] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <AdminPagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          pageSize={pageSize}
          pageSizeOptions={[10, 20, 50]}
          onPageChange={(p) => applyFilters({ page: String(p) })}
          onPageSizeChange={(newSize) => applyFilters({ limit: String(newSize), page: "1" })}
          itemName="سيارة"
          className="border-t border-t-[#E5E7EB] rounded-t-none"
        />
      </div>

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-right" dir="rtl">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="text-base font-black text-[#121316]">تأكيد حذف السيارة</h3>
            </div>
            <p className="text-sm text-[#46464b] leading-relaxed">
              هل أنت متأكد من رغبتك في حذف هذه السيارة؟ ستُنقل إلى الأرشيف ويمكن استعادتها لاحقاً.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition-colors"
              >
                {isDeleting ? "جاري الحذف..." : "حذف الآن"}
              </button>
              <button
                onClick={() => setDeleteId(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 border border-[#E5E7EB] text-[#46464b] hover:bg-[#F3F4F5] font-semibold text-sm rounded-xl transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
