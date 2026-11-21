import Link from "next/link";
import { QuickSearch } from "@/modules/home/ui/QuickSearch";
import {
  PublicFooter,
  PublicHeader,
} from "@/modules/public/components/HeaderFooter";
import { FeaturedCarCard } from "@/modules/public/cars/components/FeaturedCarCard";
import { createServerClient } from "@/modules/shared/lib/supabase/server";
import { getCompanySettings } from "@/modules/shared/lib/settings.server";
import type { CarWithRelations } from "@/modules/admin/cars/types/car.types";
import type { ProtectionFilmWithImages } from "@/modules/public/actions/protection-films";

export const metadata = {
  title: "معرض ولاد العم للسيارات وأفلام الحماية | الصفحة الرئيسية",
  description:
    "وجهتك الأولى للسيارات المتميزة وأفلام الحماية الاحترافية PPF والنانو سيراميك. معرض ولاد العم في منوف، المنوفية، مصر — أجيال من الثقة والالتزام.",
};

// ── getFeaturedCars: returns featured cars, falls back to latest available ──
async function getFeaturedCars(): Promise<CarWithRelations[]> {
  try {
    const supabase = await createServerClient();

    // First try featured
    const { data: featured } = await supabase
      .from("cars")
      .select(`*, brand:brands(id, name, logo_url), car_images(*)`)
      .is("deleted_at", null)
      .eq("featured", true)
      .eq("status", "available")
      .order("created_at", { ascending: false })
      .limit(6);

    if (featured && featured.length > 0) {
      return featured as CarWithRelations[];
    }

    // Fallback: latest available cars
    const { data: latest } = await supabase
      .from("cars")
      .select(`*, brand:brands(id, name, logo_url), car_images(*)`)
      .is("deleted_at", null)
      .eq("status", "available")
      .order("created_at", { ascending: false })
      .limit(6);

    return (latest as CarWithRelations[]) || [];
  } catch {
    return [];
  }
}

async function getFeaturedProtectionFilms(): Promise<ProtectionFilmWithImages[]> {
  try {
    const supabase = await createServerClient();
    const { data } = await supabase
      .from("protection_films")
      .select(`*, protection_film_images(*)`)
      .eq("status", "available")
      .order("created_at", { ascending: false })
      .limit(3);
    return (data as ProtectionFilmWithImages[]) || [];
  } catch {
    return [];
  }
}

// ── Testimonials ─────────────────────────────────────────────────────────────
const testimonials = [
  {
    id: 1,
    name: "أحمد محمود",
    text: "من افضل المعارض في مصر ومعاهم أنت في أمان تام. تعامل راقي واحترافية عالية.",
    stars: 5,
  },
  {
    id: 2,
    name: "محمد عبدالله",
    text: "معرض ممتاز والقائمين على المعرض منتهى الاحترام والالتزام. سيارتي اتسلمتها بحالة مثالية.",
    stars: 5,
  },
  {
    id: 3,
    name: "خالد إبراهيم",
    text: "خدمة من الدرجة الأولى وأسعار منافسة. PPF بتاعهم عالي الجودة ومع ضمان موثق. أنصح الجميع.",
    stars: 5,
  },
  {
    id: 4,
    name: "يوسف السيد",
    text: "الصراحة والشفافية في التعامل ميزتهم الأساسية. لا يوجد خداع ولا مفاجآت. ثقة تامة.",
    stars: 5,
  },
];

export default async function HomePage() {
  const [featuredCars, protectionFilms, settings] = await Promise.all([
    getFeaturedCars(),
    getFeaturedProtectionFilms(),
    getCompanySettings(),
  ]);

  const { showroom, contacts, hero } = settings;
  const primaryPhone = contacts.primaryPhone || "01007946824";
  const whatsappNumber = contacts.whatsappNumber || "201007946824";

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col"
      dir="rtl"
    >
      <PublicHeader showroom={showroom} contacts={contacts} />
      <main className="flex-1">
        <div className="flex flex-col w-full pb-16">
          {/* ==================== HERO SECTION ==================== */}
          <section
            className="relative w-full min-h-[680px] flex items-center overflow-hidden -mt-20 pt-20"
            id="hero"
          >
            {/* Hero background — live banner image from settings */}
            <div className="absolute inset-0 z-0">
              <img
                src={hero.bannerUrl || "/welad-el3am-hero.png"}
                alt={hero.title || showroom.name || "معرض ولاد العم للسيارات وأفلام الحماية"}
                className="w-full h-full object-cover"
              />
              {/* Luxury gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-l from-[#0d0d0f]/85 via-[#0d0d0f]/65 to-[#0d0d0f]/30" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0f]/90 via-transparent to-transparent" />
            </div>

            <div className="relative z-10 max-w-[1440px] w-full mx-auto px-4 md:px-12 py-24">
              <div className="max-w-2xl flex flex-col gap-5">
                {/* Sovereign tag */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md w-fit border border-white/15">
                  <span className="w-2 h-2 rounded-full bg-[#c5a059] shadow-[0_0_8px_rgba(197,160,89,0.8)] animate-pulse" />
                  <span className="text-xs text-[#c5a059] tracking-widest font-bold uppercase">
                    Welad El 3am Motors & PPF
                  </span>
                </div>

                {/* Headline */}
                <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight text-white">
                  معرض{" "}
                  <span className="text-[#c5a059]">ولاد العم</span>
                  <br />
                  <span className="font-light text-3xl md:text-4xl text-slate-200">
                    للسيارات وأفلام الحماية
                  </span>
                </h1>

                {/* Sub-headline */}
                <p className="text-base md:text-lg text-slate-300 max-w-xl leading-relaxed">
                  {hero.subtitle ||
                    "أجيال من الثقة والالتزام — وجهتك الأولى للسيارات المتميزة وباقات PPF والنانو سيراميك في منوف، المنوفية."}
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href="/cars"
                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-l from-[#c5a059] to-[#e8c97a] text-[#121316] font-black text-sm hover:from-[#b08820] hover:to-[#d4af37] transition-all duration-300 shadow-[0_4px_24px_rgba(197,160,89,0.4)]"
                  >
                    <span>تصفح أسطول السيارات</span>
                    <span className="material-symbols-outlined text-[18px]">
                      arrow_back
                    </span>
                  </Link>
                  <Link
                    href="/protection-films"
                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white/10 backdrop-blur-md text-white font-bold text-sm hover:bg-white/20 transition-all duration-300 border border-white/20"
                  >
                    <span>استكشف باقات الحماية</span>
                    <span className="material-symbols-outlined text-[18px]">
                      shield
                    </span>
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap gap-3 pt-2">
                  {[
                    { icon: "verified", label: "أجيال من الثقة والالتزام" },
                    { icon: "workspace_premium", label: "ضمان يصل لـ 10 سنوات" },
                    { icon: "location_on", label: "منوف، المنوفية" },
                    { icon: "support_agent", label: "دعم ما بعد البيع" },
                  ].map((badge) => (
                    <div
                      key={badge.label}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.08] backdrop-blur-sm border border-white/10 text-white text-[11px] font-bold"
                    >
                      <span className="material-symbols-outlined text-[14px] text-[#c5a059]">
                        {badge.icon}
                      </span>
                      {badge.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ==================== FLOATING QUICK SEARCH ==================== */}
          <QuickSearch />

          {/* ==================== STATS STRIP ==================== */}
          <section className="w-full bg-white border-b border-slate-100 py-8">
            <div className="max-w-[1440px] mx-auto px-4 md:px-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { number: "+10", label: "سنوات من الخبرة", icon: "history_edu" },
                  { number: "+500", label: "عميل راضٍ يثق بنا", icon: "groups" },
                  { number: "100%", label: "شفافية وأمان", icon: "verified_user" },
                  { number: "10", label: "سنوات ضمان PPF", icon: "shield" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="flex flex-col items-center text-center gap-1 p-4"
                  >
                    <span className="material-symbols-outlined text-[#c5a059] text-3xl">
                      {stat.icon}
                    </span>
                    <span className="text-2xl md:text-3xl font-black text-slate-900">
                      {stat.number}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ==================== FEATURED VEHICLES ==================== */}
          <section
            className="w-full max-w-[1440px] mx-auto px-4 md:px-12 pt-16 pb-10"
            id="vehicles"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8">
              <div className="flex flex-col gap-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c5a059]/10 w-fit">
                  <span className="material-symbols-outlined text-[#c5a059] text-[16px]">
                    stars
                  </span>
                  <span className="text-xs text-[#c5a059] font-bold">
                    أسطولنا المتميز
                  </span>
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900">
                  {featuredCars.length > 0
                    ? "السيارات المميزة"
                    : "أحدث السيارات المتاحة"}
                </h2>
                <p className="text-sm text-slate-500">
                  مجموعة منتقاة من أفضل السيارات المتاحة للتسليم المباشر.
                </p>
              </div>
              <Link
                href="/cars"
                className="inline-flex items-center gap-1.5 text-sm text-slate-900 hover:text-[#c5a059] transition-colors font-bold group"
              >
                <span>عرض كافة السيارات المتاحة</span>
                <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">
                  arrow_back
                </span>
              </Link>
            </div>

            {featuredCars.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredCars.map((car) => (
                  <FeaturedCarCard key={car.id} car={car} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 space-y-3">
                <p className="text-slate-500 text-sm">
                  لا توجد سيارات متاحة حالياً — تواصل معنا لأحدث الوارد.
                </p>
                <Link
                  href="/cars"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#c5a059] text-white font-bold text-sm hover:bg-[#b08d48] transition-colors"
                >
                  تصفح جميع السيارات
                </Link>
              </div>
            )}
          </section>

          {/* ==================== PROTECTION FILMS / PPF SECTION ==================== */}
          <section className="w-full bg-slate-100 py-16 my-8" id="protection">
            <div className="max-w-[1440px] mx-auto px-4 md:px-12">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8">
                <div className="flex flex-col gap-1.5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c5a059]/10 w-fit">
                    <span className="material-symbols-outlined text-[#c5a059] text-[16px]">
                      shield
                    </span>
                    <span className="text-xs text-[#c5a059] font-bold">
                      أفلام حماية الطلاء الاحترافية
                    </span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-slate-900">
                    باقات PPF والنانو سيراميك
                  </h2>
                  <p className="text-sm text-slate-500">
                    احمِ سيارتك بأفضل تقنيات الحماية العالمية مع ضمانات تصل
                    إلى 10 سنوات.
                  </p>
                </div>
                <Link
                  href="/protection-films"
                  className="inline-flex items-center gap-1.5 text-sm text-slate-900 hover:text-[#c5a059] transition-colors font-bold group"
                >
                  <span>تصفح كافة الباقات</span>
                  <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">
                    arrow_back
                  </span>
                </Link>
              </div>

              {protectionFilms.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {protectionFilms.map((film) => {
                    const primaryImage =
                      film.protection_film_images?.find(
                        (img) => img.is_primary
                      )?.image_url ||
                      film.protection_film_images?.[0]?.image_url ||
                      null;

                    const priceVal = (film as any).price || film.price_starting_from;
                    const priceFormatted = priceVal ? Number(priceVal).toLocaleString("en-US") : "—";
                    const warrantyText = film.warranty_years ? `${film.warranty_years} سنوات` : "ضمان معتمد";
                    const filmTypeArabic = film.film_type === "ppf" ? "PPF أفلام حماية" : film.film_type === "ceramic" ? "نانو سيراميك" : film.film_type === "tinting" ? "عزل حراري وتفييم" : film.film_type === "package" ? "باقة شاملة" : (film.film_type || "أفلام حماية");
                    const filmWhatsappMsg = `مرحباً معرض ولاد العم، أرغب في حجز والاستفسار عن باقة: ${film.title} (${filmTypeArabic}) - الضمان: ${warrantyText} - السعر: ${priceFormatted} ج.م`;
                    const filmWhatsappUrl = `https://wa.me/201007946824?text=${encodeURIComponent(filmWhatsappMsg)}`;

                    return (
                      <article
                        key={film.id}
                        className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col border border-slate-100"
                      >
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
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
                            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#c5a059] text-white text-xs font-bold shadow-md">
                              {film.badge}
                            </div>
                          )}
                          {film.warranty_years && (
                            <div className="absolute bottom-4 left-4 px-3 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-slate-900 text-xs font-bold">
                              ضمان {film.warranty_years} سنوات
                            </div>
                          )}
                        </div>
                        <div className="p-6 flex flex-col flex-1 justify-between gap-4">
                          <div>
                            <span className="text-xs text-[#c5a059] font-bold uppercase tracking-wider block">
                              {film.brand || film.film_type}
                            </span>
                            <h3 className="text-xl font-bold text-slate-900 mt-1 group-hover:text-[#c5a059] transition-colors">
                              {film.title}
                            </h3>
                            {film.description && (
                              <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                                {film.description}
                              </p>
                            )}
                          </div>

                          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                            <div>
                              <span className="text-[11px] text-slate-400 block">
                                السعر يبدأ من
                              </span>
                              <span className="text-lg font-black text-[#c5a059]">
                                {priceFormatted}{" "}
                                <span className="text-xs text-slate-500 font-normal">
                                  ج.م
                                </span>
                              </span>
                            </div>
                            <a
                              href={filmWhatsappUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-5 py-2.5 rounded-xl bg-gradient-to-l from-[#c5a059] to-[#e8c97a] hover:from-[#b08820] hover:to-[#d4af37] text-[#121316] text-xs font-black transition-all shadow-sm flex items-center gap-1.5"
                            >
                              <span>التفاصيل والحجز</span>
                            </a>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-500 text-sm">
                    لا توجد باقات حماية متاحة حالياً.
                  </p>
                  <Link
                    href="/protection-films"
                    className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 rounded-lg bg-[#c5a059] text-white font-bold text-sm hover:bg-[#b08d48] transition-colors"
                  >
                    تصفح الباقات
                  </Link>
                </div>
              )}
            </div>
          </section>

          {/* ==================== ABOUT US ==================== */}
          <section
            className="w-full max-w-[1440px] mx-auto px-4 md:px-12 py-16"
            id="about"
          >
            {/* Section header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#c5a059]/10 border border-[#c5a059]/20 mb-4">
                <span className="material-symbols-outlined text-[#c5a059] text-[16px]">
                  storefront
                </span>
                <span className="text-xs text-[#c5a059] font-bold">
                  من نحن
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
                معرض ولاد العم — أجيال من الثقة
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto text-sm leading-relaxed">
                منذ سنوات طويلة ونحن نقدم أفضل الخدمات في مجال السيارات
                وأفلام الحماية الاحترافية بمنوف، المنوفية، مصر. ثقتكم هي
                أغلى ما نملك.
              </p>
            </div>

            {/* Two columns: story + features */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-16">
              {/* Story */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-[#121316] to-[#1e1c18] rounded-3xl p-8 text-white space-y-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#c5a059] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#121316] text-2xl">
                      history_edu
                    </span>
                  </div>
                  <h3 className="text-2xl font-black">
                    إرثنا في خدمتكم
                  </h3>
                  <p className="text-slate-300 leading-loose text-sm">
                    معرض ولاد العم للسيارات وأفلام الحماية هو مؤسسة عريقة
                    في منوف، المنوفية، قائمة على الثقة والشفافية منذ سنوات.
                    نتخصص في بيع السيارات المتميزة وتركيب أفلام حماية
                    الطلاء (PPF) والنانو سيراميك بأحدث التقنيات العالمية.
                  </p>
                  <div className="space-y-3 text-sm text-slate-200">
                    {[
                      "شفافية كاملة في كل صفقة",
                      "ضمانات موثقة تصل إلى 10 سنوات على PPF",
                      "فريق محترف ومدرب بأعلى المعايير",
                      "خدمة ما بعد البيع الاستثنائية",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-[#c5a059] text-[18px]">
                          check_circle
                        </span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Feature cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    icon: "verified_user",
                    title: "أمان تام",
                    desc: "ومعاهم أنت في أمان — كما يقول عملاؤنا الكرام.",
                  },
                  {
                    icon: "workspace_premium",
                    title: "جودة استثنائية",
                    desc: "أفلام PPF ونانو سيراميك بأعلى مستويات الجودة العالمية.",
                  },
                  {
                    icon: "support_agent",
                    title: "دعم متواصل",
                    desc: "فريقنا جاهز لخدمتك قبل وبعد إتمام الصفقة.",
                  },
                  {
                    icon: "location_on",
                    title: "موقع استراتيجي",
                    desc: "منوف، سكة سرس، بجوار شركة الدخان، المنوفية، مصر.",
                  },
                ].map((card) => (
                  <div
                    key={card.title}
                    className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-[#c5a059] text-xl">
                        {card.icon}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">
                      {card.title}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonials */}
            <div>
              <div className="text-center mb-8">
                <span className="text-xs text-[#c5a059] font-bold uppercase tracking-widest">
                  آراء عملائنا
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  ماذا يقول عملاؤنا؟
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {testimonials.map((t) => (
                  <div
                    key={t.id}
                    className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all"
                  >
                    {/* Stars */}
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.stars }).map((_, i) => (
                        <span
                          key={i}
                          className="material-symbols-outlined text-[#c5a059] text-[16px]"
                        >
                          star
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed flex-1">
                      &ldquo;{t.text}&rdquo;
                    </p>
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-50">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c5a059] to-[#99751a] flex items-center justify-center text-white font-black text-sm">
                        {t.name[0]}
                      </div>
                      <span className="text-xs font-bold text-slate-700">
                        {t.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Banner */}
            <div className="mt-12 rounded-3xl bg-gradient-to-l from-[#121316] to-[#2a2208] border border-[#c5a059]/20 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-start gap-4 text-white">
                <span className="material-symbols-outlined text-[#c5a059] text-4xl shrink-0 mt-1">
                  phone_in_talk
                </span>
                <div>
                  <h3 className="text-xl font-black">
                    تواصل معنا الآن
                  </h3>
                  <p className="text-sm text-slate-300 mt-1">
                    فريقنا جاهز لمساعدتك في اختيار السيارة المثالية أو
                    باقة الحماية المناسبة.
                  </p>
                  <a
                    href={`tel:${primaryPhone}`}
                    className="mt-2 inline-block text-[#c5a059] font-mono font-black text-lg hover:text-amber-300 transition-colors"
                    dir="ltr"
                  >
                    {primaryPhone}
                  </a>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 shrink-0">
                <a
                  href={`tel:${primaryPhone}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#c5a059] text-[#121316] font-black text-sm hover:bg-amber-400 transition-all shadow-lg shadow-[#c5a059]/30"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    call
                  </span>
                  اتصل الآن
                </a>
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-all border border-white/20"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    chat
                  </span>
                  واتساب
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>
      <PublicFooter showroom={showroom} contacts={contacts} />
    </div>
  );
}
