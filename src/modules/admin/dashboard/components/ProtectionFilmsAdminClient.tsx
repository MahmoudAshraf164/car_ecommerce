"use client";

import { useState, useTransition } from "react";
import { Plus, Search, Shield, ShieldCheck, Edit, Trash2, Filter, Loader2 } from "lucide-react";
import { deleteProtectionFilm } from "../actions/protection-films-admin";
import type { ProtectionFilmWithImages } from "@/modules/public/actions/protection-films";
import { ProtectionFilmModal } from "./ProtectionFilmModal";
import { useRouter } from "next/navigation";

interface ProtectionFilmsAdminClientProps {
  initialFilms: ProtectionFilmWithImages[];
}

export function ProtectionFilmsAdminClient({ initialFilms }: ProtectionFilmsAdminClientProps) {
  const [films, setFilms] = useState(initialFilms);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filmToEdit, setFilmToEdit] = useState<any>(null);
  const router = useRouter();

  const filteredFilms = films.filter((f) => 
    f.title.toLowerCase().includes(search.toLowerCase()) || 
    (f.brand && String(f.brand).toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الباقة؟")) return;

    startTransition(async () => {
      const res = await deleteProtectionFilm(id);
      if (res.success) {
        setFilms((prev) => prev.filter((f) => f.id !== id));
      } else {
        alert(res.error || "Failed to delete film");
      }
    });
  };

  const handleSuccess = () => {
    window.location.reload();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto text-right" dir="rtl">
      {/* ── Page Title & Quick Actions ───────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Shield className="w-8 h-8 text-amber-500" />
            أفلام الحماية والنانو سيراميك
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            إدارة باقات الـ PPF، وتعديل الأسعار والضمانات المعروضة بالموقع
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setFilmToEdit(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-500/25 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة باقة جديدة</span>
          </button>
        </div>
      </div>

      {/* ── Filters & Search ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="ابحث عن باقة أو ماركة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-11 pl-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4" />
            <span>فلترة الأنواع</span>
          </button>
        </div>
      </div>

      {/* ── Protection Films Table ───────────────────────────── */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-bold">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">الباقة / الفيلم</th>
                <th className="px-6 py-4 whitespace-nowrap">الماركة</th>
                <th className="px-6 py-4 whitespace-nowrap">النوع</th>
                <th className="px-6 py-4 whitespace-nowrap">الضمان</th>
                <th className="px-6 py-4 whitespace-nowrap">السعر (ج.م)</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFilms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    لا توجد باقات متاحة
                  </td>
                </tr>
              ) : (
                filteredFilms.map((film) => (
                  <tr key={film.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      {film.title}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      <span className="bg-slate-100 px-2.5 py-1 rounded-md text-xs border border-slate-200">
                        {String(film.brand || "—")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {film.film_type === "ppf" && <span className="text-amber-600 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded border border-amber-200">PPF</span>}
                      {film.film_type === "ceramic" && <span className="text-blue-600 font-bold text-xs bg-blue-50 px-2 py-0.5 rounded border border-blue-200">نانو سيراميك</span>}
                      {film.film_type === "package" && <span className="text-purple-600 font-bold text-xs bg-purple-50 px-2 py-0.5 rounded border border-purple-200">باقة شاملة</span>}
                      {!["ppf", "ceramic", "package"].includes(film.film_type || "") && (
                        <span className="text-slate-600 font-bold text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {film.film_type || "غير محدد"}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-700 font-bold">
                      {film.warranty_years || 0} سنوات
                    </td>
                    <td className="px-6 py-4 font-mono text-amber-600 font-bold">
                      {((film as any).price || film.price_starting_from || 0).toLocaleString("ar-EG")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => { setFilmToEdit(film); setIsModalOpen(true); }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          disabled={isPending}
                          onClick={() => handleDelete(film.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                        >
                          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {isModalOpen && (
        <ProtectionFilmModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          filmToEdit={filmToEdit}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
