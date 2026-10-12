import { Suspense } from "react";
import { Shield, Phone, MessageSquare, Star, Filter, Sparkles, Zap, Award } from "lucide-react";
import { getProtectionFilms } from "@/modules/public/actions/protection-films";
import { ProtectionFilmsClientGrid } from "@/modules/public/cars/components/ProtectionFilmsClientGrid";

export const metadata = {
  title: "أفلام الحماية والنانو سيراميك | أولاد العم",
  description:
    "تصفح أفضل باقات PPF وطلاء السيراميك النانوي مع ضمانات حتى 10 سنوات. باقات شاملة لحماية طلاء سيارتك الفاخرة.",
};

export default async function ProtectionFilmsPage() {
  const { data: films } = await getProtectionFilms();

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Hero Section */}
      <section className="bg-[#121316] text-white py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10 text-right space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
            <Shield className="w-4 h-4" />
            تقنيات حماية الطلاء المتقدمة
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
            أفلام الحماية والنانو سيراميك
            <span className="text-[#c5a059] block mt-1">احمِ سيارتك لسنوات</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-xl leading-relaxed">
            نوفر أفضل ماركات PPF العالمية وطلاء السيراميك النانوي مع ضمانات وصفحات تفصيلية للحماية الشاملة لسيارتك الفاخرة.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <a
              href="tel:+201000000000"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-slate-900 font-bold text-sm hover:bg-slate-100 transition-all"
            >
              <Phone className="w-4 h-4 text-amber-600" />
              اتصل الآن للاستشارة
            </a>
            <a
              href="https://wa.me/201000000000"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              واتساب مباشر
            </a>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="bg-white border-b border-slate-200 py-6 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: "عملاء سعداء", value: "+500" },
            { label: "سنوات ضمان قصوى", value: "10" },
            { label: "ماركات معتمدة", value: "4+" },
            { label: "خبرة في السوق", value: "8 سنوات" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-black text-amber-600">{s.value}</div>
              <div className="text-xs text-slate-500 font-medium mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Client component handles filter tabs + cards grid */}
      <Suspense fallback={<ProtectionFilmsSkeleton />}>
        <ProtectionFilmsClientGrid films={films} />
      </Suspense>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-r from-[#121316] via-[#1C1D22] to-[#121316] rounded-3xl p-8 md:p-12 text-center space-y-5 border border-neutral-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
            <Star className="w-4 h-4 fill-amber-400" />
            خدمة كبار العملاء - VIP
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">
            هل تريد حماية سيارتك الفاخرة؟
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            تواصل مع فريق متخصصين أولاد العم وسنقدم لك استشارة مجانية لاختيار أفضل باقة حماية تناسب سيارتك وميزانيتك.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="https://wa.me/201000000000"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm transition-all shadow-md"
            >
              <MessageSquare className="w-5 h-5" />
              استشارة مجانية عبر الواتساب
            </a>
            <a
              href="tel:+201000000000"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#c5a059] hover:bg-[#b08820] text-slate-950 font-black text-sm transition-all"
            >
              <Phone className="w-5 h-5" />
              اتصل بنا مباشرة
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProtectionFilmsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-3 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 w-28 bg-slate-200 rounded-xl animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
            <div className="h-48 bg-slate-200" />
            <div className="p-5 space-y-3">
              <div className="h-3 bg-slate-200 rounded w-1/3" />
              <div className="h-4 bg-slate-200 rounded w-2/3" />
              <div className="h-3 bg-slate-200 rounded w-full" />
              <div className="h-10 bg-slate-200 rounded-xl mt-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
