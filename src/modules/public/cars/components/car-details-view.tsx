"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { CarWithRelations } from "@/modules/admin/cars/types/car.types";
import { submitVehicleLead } from "@/modules/public/actions/leads";
import {
  Car,
  Calendar,
  Gauge,
  Fuel,
  GaugeCircle,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
  MessageSquare,
  Star,
  ArrowRight,
  Info,
  Loader2,
  Send,
  Palette,
  Settings2,
  Zap,
  Layers,
  User,
  Phone,
  Lock,
  Unlock,
  BadgeDollarSign,
  ExternalLink,
} from "lucide-react";

interface CarDetailsViewProps {
  car: CarWithRelations;
}

const transmissionLabels: Record<string, string> = {
  automatic: "أوتوماتيك",
  manual: "مانيوال",
  cvt: "CVT",
  dual_clutch: "دبل كلتش",
};

const fuelLabels: Record<string, string> = {
  petrol: "بنزين",
  diesel: "ديزل",
  electric: "كهربائي",
  hybrid: "هايبرد",
  plugin_hybrid: "هايبرد قابل للشحن",
  gas: "غاز طبيعي",
};

const driveLabels: Record<string, string> = {
  fwd: "دفع أمامي (FWD)",
  rwd: "دفع خلفي (RWD)",
  awd: "دفع رباعي (AWD)",
  "4wd": "دفع رباعي (4WD)",
};

const bodyLabels: Record<string, string> = {
  sedan: "سيدان",
  suv: "SUV",
  hatchback: "هاتشباك",
  coupe: "كوبيه",
  convertible: "كشف",
  van: "فان",
  truck: "شاحنة",
  crossover: "كروس أوفر",
  other: "أخرى",
};

const conditionLabels: Record<string, string> = {
  new: "جديدة (زيرو)",
  used: "مستعملة معتمدة",
};

const statusLabels: Record<string, { label: string; color: string }> = {
  available: {
    label: "متاحة - تسليم فوري",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  reserved: {
    label: "محجوزة",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  sold: {
    label: "تم البيع",
    color: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

export function CarDetailsView({ car }: CarDetailsViewProps) {
  const images = car.car_images || [];
  let sortedImages = [...images].sort(
    (a, b) => a.display_order - b.display_order
  );

  if (sortedImages.length === 0) {
    sortedImages = [{ id: "mock0", image_url: "/placeholder-car.jpg" } as any];
  }

  const primaryImage = sortedImages[0]?.image_url || "/placeholder-car.jpg";
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const displayImage = activeImage || primaryImage;

  // ── Price Lock Gateway State ───────────────────────────────────────────────
  const [priceUnlocked, setPriceUnlocked] = useState(false);
  const [revealedPrice, setRevealedPrice] = useState<number | null>(null);
  const [showPriceLockModal, setShowPriceLockModal] = useState(false);

  // ── Persistent Unlock Check ──
  useEffect(() => {
    try {
      const unlockedIds = JSON.parse(localStorage.getItem("unlocked_cars") || "[]");
      if (unlockedIds.includes(car.id)) {
        setPriceUnlocked(true);
        setRevealedPrice(car.price);
      }
    } catch (err) {
      console.error("Error reading localStorage", err);
    }
  }, [car.id, car.price]);

  // ── Lead Form State ───────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [contactMethod, setContactMethod] = useState<"whatsapp" | "phone">(
    "whatsapp"
  );
  const [inquiryNotes, setInquiryNotes] = useState("");

  const statusInfo = statusLabels[car.status] || statusLabels.available;

  const whatsappPhone = "201007946824";
  const whatsappMessage = revealedPrice
    ? `مرحباً معرض ولاد العم، أريد الاستفسار عن السيارة: ${car.title} موديل ${car.year} — السعر المعروض: ${revealedPrice.toLocaleString("en-US")} ج.م`
    : `مرحباً معرض ولاد العم، أريد الاستفسار عن السيارة: ${car.title} موديل ${car.year}`;
  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      setSubmitError("يرجى كتابة الاسم ورقم الهاتف على الأقل");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const res = await submitVehicleLead({
      name: customerName.trim(),
      phone: customerPhone.trim(),
      preferred_contact_method: contactMethod,
      car_id: car.id,
      lead_type: "car_inquiry",
      notes:
        inquiryNotes.trim() ||
        `طلب معاينة وطلب معرفة السعر: ${car.title} - ${car.year}`,
    });

    setIsSubmitting(false);

    if (res.success) {
      setSubmitSuccess(true);
      setPriceUnlocked(true);
      const newRevealedPrice = res.carPrice ?? car.price ?? null;
      setRevealedPrice(newRevealedPrice);
      setShowPriceLockModal(false);

      // Save to localStorage
      try {
        const unlockedIds = JSON.parse(localStorage.getItem("unlocked_cars") || "[]");
        if (!unlockedIds.includes(car.id)) {
          unlockedIds.push(car.id);
          localStorage.setItem("unlocked_cars", JSON.stringify(unlockedIds));
        }
      } catch (err) {
        console.error("Error writing localStorage", err);
      }
    } else {
      setSubmitError(
        res.error || "حدث خطأ أثناء إرسال طلبك. يرجى المحاولة لاحقاً."
      );
    }
  };

  return (
    <div className="space-y-8 font-sans text-right text-slate-900" dir="rtl">
      {/* ── Price Lock Modal ────────────────────────────────────────────── */}
      {showPriceLockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowPriceLockModal(false)}
          />

          {/* Modal Card */}
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-7 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Close */}
            <button
              onClick={() => setShowPriceLockModal(false)}
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors text-lg leading-none"
              aria-label="إغلاق"
            >
              ×
            </button>

            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7 text-amber-600" />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                طلب معاينة واستفسار عن السعر
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                أدخل بياناتك وسيظهر لك سعر السيارة فوراً — وسيتواصل معك
                مستشارنا في أقرب وقت.
              </p>
            </div>

            {/* Car Summary */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                <img
                  src={primaryImage}
                  alt={car.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="font-black text-slate-900 text-sm truncate">
                  {car.title}
                </p>
                <p className="text-xs text-slate-400">
                  {car.brand?.name} • موديل {car.year}
                </p>
              </div>
              <div className="mr-auto shrink-0">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black border border-amber-200">
                  <Lock className="w-3 h-3" />
                  السعر مقفول
                </span>
              </div>
            </div>

            {submitSuccess ? (
              /* ── Success State ── */
              <div className="py-4 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                  <Unlock className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900 mb-1">
                    تم تسجيل طلبك بنجاح! 🎉
                  </h4>
                  {revealedPrice !== null ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mt-3">
                      <p className="text-xs text-amber-700 font-bold mb-1">
                        سعر السيارة الحالي
                      </p>
                      <p className="text-3xl font-black text-amber-600 font-mono">
                        {revealedPrice.toLocaleString("en-US")}
                        <span className="text-sm font-normal text-slate-600 mr-2">
                          ج.م
                        </span>
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600">
                      سيتواصل معك فريقنا قريباً لإعلامك بالسعر.
                    </p>
                  )}
                </div>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  تواصل على الواتساب الآن
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
              </div>
            ) : (
              /* ── Form ── */
              <form onSubmit={handleLeadSubmit} className="space-y-4">
                {submitError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
                    {submitError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <User className="w-3.5 h-3.5 text-amber-600" />
                    الاسم بالكامل *
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
                    <Phone className="w-3.5 h-3.5 text-amber-600" />
                    رقم الهاتف *
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

                {/* Contact method */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    طريقة التواصل المفضلة
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setContactMethod("whatsapp")}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        contactMethod === "whatsapp"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-500 ring-1 ring-emerald-500"
                          : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      واتساب
                    </button>
                    <button
                      type="button"
                      onClick={() => setContactMethod("phone")}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        contactMethod === "phone"
                          ? "bg-blue-50 text-blue-700 border-blue-500 ring-1 ring-blue-500"
                          : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      اتصال
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    ملاحظات (اختياري)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="استفسارات إضافية أو موعد مقترح..."
                    value={inquiryNotes}
                    onChange={(e) => setInquiryNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-l from-[#c5a059] to-[#e8c97a] text-[#121316] font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 disabled:opacity-70 hover:from-[#b08820] hover:to-[#d4af37]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري التحقق...
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4" />
                      اكشف السعر وأرسل الطلب
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Main Grid ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Right Column: Details & Gallery */}
        <div className="lg:col-span-2 space-y-6">
          {/* Breadcrumbs & Header */}
          <div className="bg-white border border-slate-200/80 shadow-sm p-6 rounded-2xl space-y-5">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Link href="/" className="hover:text-amber-600 transition-colors">
                  الرئيسية
                </Link>
                <span>/</span>
                <Link
                  href="/cars"
                  className="hover:text-amber-600 transition-colors"
                >
                  السيارات
                </Link>
                <span>/</span>
                <span className="text-slate-800 truncate max-w-xs">
                  {car.title}
                </span>
              </div>
              <Link
                href="/cars"
                className="inline-flex items-center gap-1.5 hover:text-amber-600 transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                العودة
              </Link>
            </div>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                    {car.brand?.name || "—"}
                  </span>
                  {(car as any).origin && (
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                      الصناعة: {(car as any).origin}
                    </span>
                  )}
                  {(car as any).trim_level && (
                    <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-black border border-amber-200/60">
                      {(car as any).trim_level}
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                    {conditionLabels[car.condition] || car.condition}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.color}`}
                  >
                    {statusInfo.label}
                  </span>
                  {car.featured && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200 text-xs font-black">
                      <Star className="w-3 h-3 fill-amber-700" />
                      مميزة VIP
                    </span>
                  )}
                </div>
                <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 leading-tight">
                  {car.title}
                </h1>
                <p className="text-sm text-slate-500 font-medium">
                  موديل {car.year} •{" "}
                  {car.mileage > 0
                    ? `${car.mileage.toLocaleString("en-US")} كم`
                    : "زيرو كيلومتر"}
                </p>
              </div>

              {/* ── PRICE LOCK BOX ── */}
              <div
                className="text-right md:text-left min-w-[200px] cursor-pointer"
                onClick={() => !priceUnlocked && setShowPriceLockModal(true)}
              >
                {priceUnlocked && revealedPrice !== null ? (
                  /* Unlocked */
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-xs text-emerald-700 font-bold">
                        السعر المكشوف
                      </span>
                    </div>
                    <span className="text-3xl md:text-4xl font-black text-amber-600 font-mono">
                      {revealedPrice.toLocaleString("en-US")}
                    </span>
                    <span className="text-sm font-bold text-slate-600 mr-2">
                      ج.م
                    </span>
                  </div>
                ) : (
                  /* Locked */
                  <div className="bg-amber-50 border-2 border-amber-200 border-dashed p-4 rounded-xl group hover:border-amber-400 hover:bg-amber-100/60 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="w-4 h-4 text-amber-600" />
                      <span className="text-xs text-amber-700 font-black">
                        السعر عند طلب المعاينة
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <BadgeDollarSign className="w-8 h-8 text-amber-400" />
                      <span className="text-sm font-bold text-amber-700 group-hover:text-amber-800 transition-colors">
                        اضغط لمعرفة السعر
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Image Gallery ── */}
          <div className="bg-white border border-slate-200/80 shadow-sm p-4 rounded-2xl space-y-4">
            <div className="relative w-full aspect-[16/10] bg-slate-100 rounded-xl overflow-hidden shadow-inner border border-slate-200">
              <Image
                src={displayImage || "/placeholder-car.jpg"}
                alt={car.title}
                fill
                className="object-cover transition-opacity duration-500"
                unoptimized
              />
            </div>

            {sortedImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {sortedImages.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    onClick={() => setActiveImage(img.image_url)}
                    className={`relative w-28 aspect-[16/10] rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                      displayImage === img.image_url
                        ? "border-amber-500 ring-2 ring-amber-500/30 scale-105 shadow-md z-10"
                        : "border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-300"
                    }`}
                  >
                    <Image
                      src={img.image_url}
                      alt={`صورة ${idx + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Specifications ── */}
          <div className="bg-white border border-slate-200/80 shadow-sm p-6 rounded-2xl space-y-6">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Settings2 className="w-5 h-5 text-amber-600" />
              المواصفات الفنية
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <SpecCard
                icon={<Calendar />}
                label="سنة الصنع"
                value={String(car.year)}
              />
              {(car as any).origin && (
                <SpecCard
                  icon={<Car />}
                  label="الصناعة"
                  value={(car as any).origin}
                />
              )}
              {(car as any).trim_level && (
                <SpecCard
                  icon={<Layers />}
                  label="الفئة"
                  value={(car as any).trim_level}
                />
              )}
              <SpecCard
                icon={<Gauge />}
                label="المسافة المقطوعة"
                value={
                  car.mileage > 0
                    ? `${car.mileage.toLocaleString("en-US")} كم`
                    : "زيرو"
                }
              />
              <SpecCard
                icon={<GaugeCircle />}
                label="ناقل الحركة"
                value={transmissionLabels[car.transmission] || car.transmission}
              />
              <SpecCard
                icon={<Fuel />}
                label="نوع الوقود"
                value={fuelLabels[car.fuel_type] || car.fuel_type}
              />
              <SpecCard
                icon={<Zap />}
                label="سعة المحرك"
                value={
                  car.engine_capacity
                    ? `${car.engine_capacity} سي سي`
                    : "غير محدد"
                }
              />
              <SpecCard
                icon={<ShieldCheck />}
                label="نمط الهيكل"
                value={bodyLabels[car.body_type] || car.body_type}
              />
              {car.color && (
                <SpecCard
                  icon={<Palette />}
                  label="اللون الخارجي"
                  value={car.color}
                />
              )}
            </div>
          </div>

          {/* ── Features ── */}
          {car.features && car.features.length > 0 && (
            <div className="bg-white border border-slate-200/80 shadow-sm p-6 rounded-2xl space-y-5">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                التجهيزات والمميزات الإضافية
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {car.features.map((feat) => (
                  <div
                    key={feat.id}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>{feat.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Description ── */}
          {car.description && (
            <div className="bg-white border border-slate-200/80 shadow-sm p-6 rounded-2xl space-y-4">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Info className="w-5 h-5 text-amber-600" />
                ملاحظات وتفاصيل إضافية
              </h2>
              <p className="text-sm text-slate-600 leading-loose whitespace-pre-line font-medium">
                {car.description}
              </p>
            </div>
          )}
        </div>

        {/* ── Right Sidebar: CTA & WhatsApp ── */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 shadow-md rounded-2xl p-6 space-y-5 sticky top-24">
            <div className="text-center space-y-2 border-b border-slate-100 pb-5">
              <span className="inline-block text-[10px] font-black text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                معرض ولاد العم للسيارات وأفلام الحماية
              </span>
              <h3 className="text-xl font-black text-slate-900">
                {priceUnlocked ? "تم فتح السعر بنجاح 🎉" : "اكشف السعر وسجّل طلبك"}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {priceUnlocked
                  ? "سيتواصل معك مستشارنا قريباً"
                  : "أدخل بياناتك لمعرفة السعر وطلب المعاينة"}
              </p>
            </div>

            {priceUnlocked && revealedPrice !== null ? (
              /* ── Post-unlock success panel ── */
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
                  <p className="text-xs text-amber-700 font-bold mb-1">
                    سعر السيارة الحالي
                  </p>
                  <p className="text-4xl font-black text-amber-600 font-mono">
                    {revealedPrice.toLocaleString("en-US")}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">جنيه مصري</p>
                </div>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md"
                >
                  <MessageSquare className="w-5 h-5" />
                  تواصل على الواتساب
                </a>
                <a
                  href="tel:01007946824"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-all border border-slate-200"
                >
                  <Phone className="w-4 h-4 text-amber-600" />
                  <span dir="ltr">010 0794 6824</span>
                </a>
              </div>
            ) : (
              /* ── Price Lock CTA ── */
              <div className="space-y-4">
                {/* Locked Price Teaser */}
                <div
                  onClick={() => setShowPriceLockModal(true)}
                  className="cursor-pointer group bg-gradient-to-br from-amber-50 to-amber-100/60 border-2 border-dashed border-amber-300 rounded-2xl p-5 text-center hover:border-amber-500 hover:from-amber-100 transition-all"
                >
                  <Lock className="w-8 h-8 text-amber-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-black text-amber-800">
                    السعر عند طلب المعاينة
                  </p>
                  <p className="text-[11px] text-amber-600 mt-1 font-medium">
                    اضغط لمعرفة السعر فوراً
                  </p>
                </div>

                {/* Open Modal Button */}
                <button
                  onClick={() => setShowPriceLockModal(true)}
                  className="w-full py-4 rounded-xl bg-gradient-to-l from-[#c5a059] to-[#e8c97a] text-[#121316] font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-600/25 hover:from-[#b08820] hover:to-[#d4af37]"
                >
                  <Send className="w-5 h-5" />
                  طلب معاينة ومعرفة السعر
                </button>

                {/* WhatsApp Direct */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md shadow-emerald-600/20"
                >
                  <MessageSquare className="w-5 h-5" />
                  استفسار مباشر على الواتساب
                </a>

                {/* Direct call */}
                <a
                  href="tel:01007946824"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-all border border-slate-200"
                >
                  <PhoneCall className="w-4 h-4 text-amber-600" />
                  <span dir="ltr">010 0794 6824</span>
                </a>
              </div>
            )}

            {/* Trust note */}
            <p className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
              🔒 بياناتك محمية وسرية بالكامل
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpecCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
      <span className="text-slate-500 flex items-center gap-1.5 text-xs font-bold">
        <span className="text-amber-600 opacity-80">{icon}</span>
        {label}
      </span>
      <span className="font-black text-slate-900 text-sm mt-1">{value}</span>
    </div>
  );
}
