"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, CheckCircle2, MessageSquare, Filter, Sparkles, Zap, Award } from "lucide-react";
import type { ProtectionFilmWithImages } from "@/modules/public/actions/protection-films";

interface ProtectionFilmsClientGridProps {
  films: ProtectionFilmWithImages[];
}

const filmTypeLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  all: { label: "الكل", icon: <Filter className="w-4 h-4" /> },
  ppf: { label: "PPF أفلام الحماية", icon: <Shield className="w-4 h-4" /> },
  ceramic: { label: "نانو سيراميك", icon: <Sparkles className="w-4 h-4" /> },
  tinting: { label: "تدميج النوافذ", icon: <Zap className="w-4 h-4" /> },
  package: { label: "الباقات الشاملة", icon: <Award className="w-4 h-4" /> },
};

export function ProtectionFilmsClientGrid({ films }: ProtectionFilmsClientGridProps) {
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered =
    activeFilter === "all"
      ? films
      : films.filter((f) => f.film_type === activeFilter);

  const buildWhatsappUrl = (film: ProtectionFilmWithImages) => {
    const priceVal = (film as any).price || film.price_starting_from;
    const priceFormatted = priceVal ? Number(priceVal).toLocaleString("en-US") : "—";
    const warrantyText = film.warranty_years ? `${film.warranty_years} سنوات` : "ضمان معتمد";
    const filmTypeArabic = film.film_type === "ppf" ? "PPF أفلام حماية" : film.film_type === "ceramic" ? "نانو سيراميك" : film.film_type === "tinting" ? "عزل حراري وتفييم" : film.film_type === "package" ? "باقة شاملة" : (film.film_type || "أفلام حماية");
    const msg = `مرحباً معرض ولاد العم، أرغب في حجز والاستفسار عن باقة: ${film.title} (${filmTypeArabic}) - الضمان: ${warrantyText} - السعر: ${priceFormatted} ج.م`;
    return `https://wa.me/201007946824?text=${encodeURIComponent(msg)}`;
  };

  if (films.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="text-5xl mb-4">🛡️</div>
        <h3 className="text-lg font-bold text-slate-700">لا توجد باقات حماية متاحة حالياً</h3>
        <p className="text-sm text-slate-500 mt-2">يرجى التواصل معنا مباشرة للاستفسار عن باقات الحماية المتاحة.</p>
      </section>
    );
  }

  return (
    <>
      {/* Filter Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {Object.entries(filmTypeLabels).map(([key, { label, icon }]) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border whitespace-nowrap flex-shrink-0 transition-all ${
                activeFilter === key
                  ? "bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/20"
                  : "bg-white text-slate-600 border-slate-200 hover:border-amber-400 hover:text-amber-600"
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-sm text-slate-500 font-medium mb-6">
          تم العثور على <strong className="text-slate-800">{filtered.length}</strong> باقة حماية
        </p>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 text-sm">لا توجد باقات في هذه الفئة.</p>
            <button
              onClick={() => setActiveFilter("all")}
              className="mt-4 px-6 py-2.5 bg-amber-600 text-white font-bold text-sm rounded-xl hover:bg-amber-700 transition-colors"
            >
              عرض الكل
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((film) => {
              const primaryImage =
                film.protection_film_images?.find((img) => img.is_primary)?.image_url ||
                film.protection_film_images?.[0]?.image_url ||
                null;

              // Parse features if stored as JSON array or text
              const features: string[] = Array.isArray(film.features)
                ? (film.features as string[])
                : [];

              return (
                <div
                  key={film.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-amber-200 transition-all duration-300 flex flex-col overflow-hidden group"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    {primaryImage ? (
                      <img
                        src={primaryImage}
                        alt={film.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <img
                        src="/placeholder-car.jpg"
                        alt={film.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    {film.badge && (
                      <span className="absolute top-3 right-3 text-[10px] font-black px-2.5 py-1 rounded-full bg-amber-500 text-white">
                        {film.badge}
                      </span>
                    )}
                    {film.warranty_years && (
                      <span className="absolute top-3 left-3 text-[10px] font-black px-2.5 py-1 rounded-full bg-white/90 text-slate-700 border border-slate-200">
                        ضمان {film.warranty_years} سنوات
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-5 flex flex-col gap-4 flex-1">
                    <div>
                      <span className="text-[10px] font-black text-amber-600 uppercase tracking-wide">
                        {film.brand || film.film_type}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 mt-0.5 leading-snug">
                        {film.title}
                      </h3>
                      {film.description && (
                        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                          {film.description}
                        </p>
                      )}
                    </div>

                    {features.length > 0 && (
                      <div className="grid grid-cols-2 gap-1.5">
                        {features.slice(0, 4).map((f, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-[10px] text-slate-600 font-medium">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                            {f}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">السعر يبدأ من</span>
                        <span className="text-xl font-black text-amber-600 font-mono">
                          {((film as any).price || film.price_starting_from)
                            ? Number((film as any).price || film.price_starting_from).toLocaleString("en-US")
                            : "—"}
                        </span>
                        <span className="text-xs font-bold text-slate-500 mr-1">ج.م</span>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={buildWhatsappUrl(film)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-l from-[#c5a059] to-[#e8c97a] hover:from-[#b08820] hover:to-[#d4af37] text-[#121316] font-black text-xs transition-all shadow-sm flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>التفاصيل والحجز</span>
                        </a>
                      </div>
                    </div>
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
