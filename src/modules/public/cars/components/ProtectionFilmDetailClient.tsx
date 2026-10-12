"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Shield, CheckCircle2, Star, Phone, MessageSquare, ArrowRight,
  Award, Sparkles, User, StickyNote, Send, Loader2, PhoneCall,
} from "lucide-react";
import { submitVehicleLead } from "@/modules/public/actions/leads";
import type { ProtectionFilmWithImages } from "@/modules/public/actions/protection-films";

interface ProtectionFilmDetailClientProps {
  film: ProtectionFilmWithImages;
}

export function ProtectionFilmDetailClient({ film }: ProtectionFilmDetailClientProps) {
  let images = (film.protection_film_images || []).sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
  );

  if (images.length === 0) {
    images = [{ id: "mock0", image_url: "/placeholder-car.jpg", film_id: film.id, display_order: 1, is_primary: true, created_at: "" }];
  }

  const features: string[] = Array.isArray(film.features)
    ? (film.features as unknown as string[])
    : [];

  const [activeImage, setActiveImage] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [contactMethod, setContactMethod] = useState<"whatsapp" | "phone">("whatsapp");
  const [notes, setNotes] = useState("");

  const whatsappMessage = `مرحباً أولاد العم، أرغب في الاستفسار عن باقة: ${film.title}${film.price || film.price_starting_from ? ` - السعر: ${((film as any).price || film.price_starting_from).toLocaleString("ar-EG")} ج.م` : ""}`;
  const whatsappUrl = `https://wa.me/201000000000?text=${encodeURIComponent(whatsappMessage)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      setSubmitError("يرجى كتابة الاسم ورقم الهاتف");
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await submitVehicleLead({
        name: customerName.trim(),
        phone: customerPhone.trim(),
        lead_type: "general",
        preferred_contact_method: contactMethod,
        notes: `استفسار عن فيلم حماية: ${film.title}\n${notes.trim()}`.trim(),
      });

      if (result.success) {
        setSubmitSuccess(true);
      } else {
        setSubmitError(result.error || "حدث خطأ أثناء الإرسال");
      }
    } catch {
      setSubmitError("حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 text-slate-900" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Right Column: Details + Gallery */}
          <div className="lg:col-span-2 space-y-6">

            {/* Breadcrumb + Header */}
            <div className="bg-white border border-slate-200/80 shadow-sm p-6 rounded-2xl space-y-5">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Link href="/" className="hover:text-amber-600">الرئيسية</Link>
                  <span>/</span>
                  <Link href="/protection-films" className="hover:text-amber-600">أفلام الحماية</Link>
                  <span>/</span>
                  <span className="text-slate-800 truncate max-w-xs">{film.title}</span>
                </div>
                <Link href="/protection-films" className="inline-flex items-center gap-1.5 hover:text-amber-600">
                  <ArrowRight className="w-4 h-4" />
                  العودة
                </Link>
              </div>

              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {film.brand && (
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                        {film.brand}
                      </span>
                    )}
                    {film.badge && (
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200 text-xs font-black">
                        <Star className="w-3 h-3 inline fill-amber-700 ml-1" />
                        {film.badge}
                      </span>
                    )}
                    {film.warranty_years && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                        <Award className="w-3 h-3" />
                        ضمان {film.warranty_years} سنوات
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 leading-tight">
                    {film.title}
                  </h1>
                  {film.coverage && (
                    <p className="text-xs text-slate-500 font-medium">{film.coverage}</p>
                  )}
                </div>

                {(film.price || film.price_starting_from) && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 min-w-[200px] text-right">
                    <span className="text-xs text-slate-500 font-bold block mb-1">السعر يبدأ من</span>
                    <span className="text-3xl md:text-4xl font-black text-amber-600 font-mono">
                      {((film as any).price || film.price_starting_from).toLocaleString("ar-EG")}
                    </span>
                    <span className="text-sm font-bold text-slate-600 mr-2">ج.م</span>
                  </div>
                )}
              </div>
            </div>

            {/* Multi-Angle Gallery */}
            {images.length > 0 && (
              <div className="bg-white border border-slate-200/80 shadow-sm p-4 rounded-2xl space-y-4">
                <div className="relative w-full aspect-[16/10] bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                  <img
                    src={images[activeImage]?.image_url}
                    alt={film.title}
                    className="w-full h-full object-cover transition-opacity duration-500"
                  />
                </div>
                {images.length > 1 && (
                  <div className="flex items-center gap-3 overflow-x-auto pb-2">
                    {images.map((img, idx) => (
                      <button
                        key={img.id}
                        onClick={() => setActiveImage(idx)}
                        className={`relative w-28 aspect-[16/10] rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                          activeImage === idx
                            ? "border-amber-500 ring-2 ring-amber-500/30 scale-105 shadow-md"
                            : "border-slate-200 opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Features */}
            {features.length > 0 && (
              <div className="bg-white border border-slate-200/80 shadow-sm p-6 rounded-2xl space-y-5">
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Shield className="w-5 h-5 text-amber-600" />
                  مزايا الباقة والمواصفات
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {features.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-sm font-semibold text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {film.description && (
              <div className="bg-white border border-slate-200/80 shadow-sm p-6 rounded-2xl space-y-3">
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  تفاصيل الباقة
                </h2>
                <p className="text-sm text-slate-600 leading-loose font-medium">{film.description}</p>
              </div>
            )}
          </div>

          {/* Left Column: Lead Form */}
          <div>
            <div className="bg-white border border-slate-200/80 shadow-md rounded-2xl p-6 space-y-6 sticky top-24">
              <div className="text-center space-y-2 border-b border-slate-100 pb-5">
                <span className="inline-block text-[10px] font-black text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                  استشارة مجانية
                </span>
                <h3 className="text-xl font-black text-slate-900">احجز موعد التركيب</h3>
                <p className="text-xs text-slate-500 font-medium">
                  سيتواصل معك فريقنا خلال دقائق
                </p>
              </div>

              {submitSuccess ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900">تم استلام طلبك!</h4>
                  <p className="text-sm text-slate-600">
                    سيتواصل معك فريقنا قريباً بخصوص{" "}
                    <span className="font-bold text-amber-600">{film.title}</span>
                  </p>
                  <button
                    onClick={() => {
                      setSubmitSuccess(false);
                      setCustomerName("");
                      setCustomerPhone("");
                      setNotes("");
                    }}
                    className="px-6 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    إرسال طلب جديد
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {submitError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
                      {submitError}
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <User className="w-3.5 h-3.5 text-amber-600" />الاسم بالكامل *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: أحمد محمود"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <Phone className="w-3.5 h-3.5 text-amber-600" />رقم الهاتف *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="010XXXXXXXX"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">طريقة التواصل</label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setContactMethod("whatsapp")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                          contactMethod === "whatsapp"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-500 ring-1 ring-emerald-500"
                            : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <MessageSquare className="w-4 h-4" />واتساب
                      </button>
                      <button
                        type="button"
                        onClick={() => setContactMethod("phone")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                          contactMethod === "phone"
                            ? "bg-blue-50 text-blue-700 border-blue-500 ring-1 ring-blue-500"
                            : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <PhoneCall className="w-4 h-4" />اتصال
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <StickyNote className="w-3.5 h-3.5 text-amber-600" />ملاحظات (اختياري)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="نوع سيارتك وموعد مقترح للتركيب..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-600/20 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-5 h-5 animate-spin" />جاري الإرسال...</>
                    ) : (
                      <><Send className="w-5 h-5" />احجز الآن</>
                    )}
                  </button>
                </form>
              )}

              <div className="pt-4 border-t border-slate-100">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md shadow-emerald-600/20"
                >
                  <MessageSquare className="w-5 h-5" />
                  تواصل مباشر عبر الواتساب
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
