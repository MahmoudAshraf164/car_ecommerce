export const dynamic = 'force-dynamic';
import Link from "next/link";
import {
  Award,
  Car,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  Shield,
  Star,
  Users,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "من نحن | معرض ولاد العم للسيارات وأفلام الحماية",
  description:
    "تعرف على معرض ولاد العم للسيارات وأفلام الحماية — أجيال من الثقة والالتزام في منوف، المنوفية. خبرة عميقة في بيع السيارات وتركيب PPF والنانو سيراميك.",
};

// ─── Real testimonials ─────────────────────────────────────────────────────────
const testimonials = [
  {
    id: 1,
    name: "أحمد محمود",
    role: "عميل موثوق",
    text: "من افضل المعارض في مصر ومعاهم أنت في أمان تام. تعامل راقي واحترافية عالية من أول لحظة.",
    stars: 5,
  },
  {
    id: 2,
    name: "محمد عبدالله",
    role: "عميل راضٍ",
    text: "معرض ممتاز والقائمين علي المعرض منتهي الاحترام والالتزام. سيارتي اتسلمتها بحالة مثالية ومفيش أي مشاكل.",
    stars: 5,
  },
  {
    id: 3,
    name: "خالد إبراهيم",
    role: "عميل PPF",
    text: "خدمة PPF من الدرجة الأولى. الفيلم اتركب باحترافية شديدة وفيه ضمان موثق. أنصح الجميع بيهم بدون تردد.",
    stars: 5,
  },
  {
    id: 4,
    name: "يوسف السيد",
    role: "عميل متكرر",
    text: "الصراحة والشفافية في التعامل ميزتهم الأساسية. لا يوجد خداع ولا مفاجآت. ثقة تامة وسرعة في التسليم.",
    stars: 5,
  },
  {
    id: 5,
    name: "عمر رمضان",
    role: "عميل سيارات",
    text: "اشتريت سيارة منهم وكانت التجربة ممتازة. الأسعار منافسة والخدمة ممتازة. هيبقى المعرض الرئيسي بتاعي.",
    stars: 5,
  },
  {
    id: 6,
    name: "هشام عبدالعزيز",
    role: "عميل نانو سيراميك",
    text: "ركبت نانو سيراميك وحسيت بفرق كبير في مظهر السيارة. العمل دقيق جداً والنتيجة أكثر من ممتازة.",
    stars: 5,
  },
];

const values = [
  {
    icon: Shield,
    title: "الأمان والثقة",
    description:
      "ومعاهم أنت في أمان — شعارنا الذي يؤكده عملاؤنا الكرام يومياً. كل صفقة تتم بشفافية كاملة.",
  },
  {
    icon: Star,
    title: "الالتزام والاحترام",
    description:
      "القائمون على المعرض منتهى الاحترام والالتزام — فريقنا مدرب ومحترف يحترم وقتك وثقتك.",
  },
  {
    icon: Car,
    title: "جودة السيارات",
    description:
      "نختار كل سيارة بعناية فائقة لضمان حصولك على أفضل قيمة مقابل المال مع توثيق كامل.",
  },
  {
    icon: Award,
    title: "ضمان PPF الحصري",
    description:
      "أفلام حماية الطلاء والنانو سيراميك بضمانات تصل إلى 10 سنوات — الأفضل في المنوفية.",
  },
  {
    icon: Users,
    title: "خدمة شخصية",
    description:
      "مستشار متخصص يرافقك من أول استفسار حتى الاستلام وما بعده. رضاك هو أولويتنا القصوى.",
  },
  {
    icon: CheckCircle2,
    title: "شفافية كاملة",
    description:
      "لا مفاجآت، لا خداع — كل التفاصيل واضحة ومعلنة. قرارك مبني على معلومات كاملة وموثوقة.",
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`تقييم ${count} من 5`}>
      {Array.from({ length: count }).map((_, i) => (
        <Star
          key={i}
          className="w-3.5 h-3.5 text-[#c5a059] fill-[#c5a059]"
        />
      ))}
    </div>
  );
}

export default function PublicAboutPage() {
  return (
    <div className="space-y-0 pb-16 font-sans text-right bg-slate-50" dir="rtl">
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-[#111215] text-white py-20 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
        {/* Decorative gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#c5a059]/8 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(197,160,89,0.06)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative max-w-3xl mx-auto space-y-5">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#c5a059] text-xs font-bold">
            <span className="material-symbols-outlined text-[14px]">
              storefront
            </span>
            أجيال من الثقة والالتزام
          </span>

          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            معرض ولاد العم
            <br />
            <span className="text-[#c5a059]">للسيارات وأفلام الحماية</span>
          </h1>

          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            المعرض الأول في منوف، المنوفية، المتخصص في بيع السيارات المتميزة
            وتركيب أفلام حماية الطلاء (PPF) والنانو سيراميك بأعلى معايير
            الجودة والأمان.
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {[
              "أجيال من الثقة",
              "ضمان حتى 10 سنوات",
              "منوف، المنوفية",
            ].map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/8 border border-white/10 text-slate-200 text-xs font-medium"
              >
                <span className="material-symbols-outlined text-[#c5a059] text-[13px]">
                  verified
                </span>
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-slate-100 py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { number: "+10", label: "سنوات من الخبرة", icon: "history_edu" },
            { number: "+500", label: "عميل يثق بنا", icon: "groups" },
            { number: "100%", label: "شفافية وأمان", icon: "verified_user" },
            { number: "10", label: "سنوات ضمان PPF", icon: "shield" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center text-center gap-2 p-4 rounded-2xl bg-slate-50 border border-slate-100"
            >
              <span className="material-symbols-outlined text-[#c5a059] text-3xl">
                {stat.icon}
              </span>
              <p className="text-2xl sm:text-3xl font-black text-slate-900">
                {stat.number}
              </p>
              <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── STORY & VALUES ───────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        {/* Story */}
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="rounded-3xl bg-gradient-to-br from-[#121316] to-[#1e1c18] p-8 text-white space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-[#c5a059] flex items-center justify-center">
              <Award className="w-6 h-6 text-[#121316]" />
            </div>
            <h2 className="text-2xl font-black">قصتنا معكم</h2>
            <p className="text-slate-300 text-sm leading-loose">
              معرض ولاد العم للسيارات وأفلام الحماية هو مؤسسة عريقة نابعة من
              منوف، المنوفية، مصر. نحن نؤمن بأن كل عميل يستحق الحصول على أفضل
              سيارة بأفضل حماية وبكل شفافية واحترافية. رسالتنا بسيطة: نريدك
              أن تكون في أمان تام معنا.
            </p>
            <div className="space-y-3 text-sm text-slate-200">
              {[
                "تخصص عميق في بيع السيارات المتميزة",
                "تركيب احترافي لأفلام PPF والنانو سيراميك",
                "ضمانات موثقة تصل إلى 10 سنوات",
                "فريق محترف منتهى الاحترام والالتزام",
                "خدمة ما بعد البيع الاستثنائية",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#c5a059] shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {values.slice(0, 4).map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-[#c5a059]" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">
                  {title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>

        {/* Remaining values */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {values.slice(4).map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex gap-4"
            >
              <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-[#c5a059]" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">
                  {title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section className="bg-slate-100 py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 space-y-2">
            <span className="text-xs text-[#c5a059] font-bold uppercase tracking-widest">
              آراء عملائنا الكرام
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              ماذا يقول عملاؤنا عنّا؟
            </h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto">
              ثقة عملائنا هي أكبر جائزة نتطلع إليها — إليك بعض تجاربهم
              الحقيقية معنا.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-white hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col gap-4"
              >
                <StarRating count={t.stars} />
                <p className="text-sm text-slate-600 leading-relaxed flex-1">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-3 border-t border-slate-50">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#c5a059] to-[#99751a] flex items-center justify-center text-white font-black text-sm shrink-0">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{t.name}</p>
                    <p className="text-[11px] text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT & LOCATION ───────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
            <h2 className="text-xl font-black text-slate-900">
              تواصل معنا مباشرةً
            </h2>

            <div className="space-y-4">
              <a
                href="tel:01007946824"
                className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-[#c5a059]/40 hover:bg-amber-50/30 transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-[#c5a059]/10 border border-[#c5a059]/20 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-[#c5a059]" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-medium">
                    اتصل بنا
                  </p>
                  <p
                    className="text-base font-black text-slate-900 group-hover:text-[#c5a059] transition-colors font-mono"
                    dir="ltr"
                  >
                    010 0794 6824
                  </p>
                </div>
              </a>

              <a
                href="https://wa.me/201007946824"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-[#c5a059]/40 hover:bg-amber-50/30 transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-[#c5a059]/10 border border-[#c5a059]/20 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#c5a059] text-xl">
                    chat
                  </span>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-medium">
                    واتساب
                  </p>
                  <p className="text-sm font-bold text-slate-900 group-hover:text-[#c5a059] transition-colors">
                    محادثة مباشرة على واتساب
                  </p>
                </div>
              </a>

              <a
                href="mailto:weladelam40@gmail.com"
                className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-[#c5a059]/40 hover:bg-amber-50/30 transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-[#c5a059]/10 border border-[#c5a059]/20 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-[#c5a059]" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-medium">
                    البريد الإلكتروني
                  </p>
                  <p className="text-sm font-bold text-slate-900 group-hover:text-[#c5a059] transition-colors break-all">
                    weladelam40@gmail.com
                  </p>
                </div>
              </a>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
            <h2 className="text-xl font-black text-slate-900">موقع المعرض</h2>

            <div className="flex items-start gap-3 text-sm">
              <div className="w-11 h-11 rounded-xl bg-[#c5a059]/10 border border-[#c5a059]/20 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-[#c5a059]" />
              </div>
              <div>
                <p className="font-bold text-slate-900 leading-relaxed">
                  منوف، سكة سرس، بجوار شركة الدخان
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  منوف، المنوفية، مصر
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <a
                href="https://maps.app.goo.gl/HdCTJzJBapembYXm8"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#c5a059] text-[#121316] font-black text-sm hover:bg-amber-400 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">
                  map
                </span>
                الاتجاهات عبر Google Maps
              </a>
              <a
                href="https://www.bing.com/maps/default.aspx?v=2&pc=FACEBK&mid=8100&where1=30.456558107138%2C%2030.943344"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-all border border-slate-200"
              >
                <span className="material-symbols-outlined text-[18px]">
                  explore
                </span>
                الاتجاهات عبر Bing Maps
              </a>
            </div>

            {/* Social links */}
            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400 font-medium mb-3">
                تابعنا على وسائل التواصل
              </p>
              <div className="flex gap-3">
                <a
                  href="https://www.facebook.com/profile.php?id=100064037820487"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1877f2]/10 text-[#1877f2] border border-[#1877f2]/20 text-xs font-bold hover:bg-[#1877f2]/15 transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    thumb_up
                  </span>
                  فيسبوك
                </a>
                <a
                  href="https://tiktok.com/@..welad.el3am"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/8 text-slate-700 border border-slate-200 text-xs font-bold hover:bg-slate-100 transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    play_circle
                  </span>
                  تيك توك
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="rounded-3xl bg-gradient-to-l from-[#121316] to-[#2a2208] border border-[#c5a059]/25 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4 text-white">
            <span className="material-symbols-outlined text-[#c5a059] text-4xl shrink-0 mt-1">
              emoji_events
            </span>
            <div>
              <h2 className="text-xl font-black">جاهز لخطوتك التالية؟</h2>
              <p className="mt-1 text-sm text-slate-300">
                تصفح أسطول السيارات أو استكشف باقات الحماية المتميزة لدينا.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              href="/cars"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#c5a059] text-[#121316] font-black text-sm hover:bg-amber-400 transition-all shadow-lg shadow-[#c5a059]/25"
            >
              <span className="material-symbols-outlined text-[18px]">
                directions_car
              </span>
              تصفح السيارات
            </Link>
            <Link
              href="/protection-films"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-all border border-white/20"
            >
              <span className="material-symbols-outlined text-[18px]">
                shield
              </span>
              باقات الحماية
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
