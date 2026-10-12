"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CarWithRelations } from "@/modules/admin/cars/types/car.types";
import { Gauge, Fuel, GaugeCircle, MessageSquare, Lock, Unlock, ArrowLeft } from "lucide-react";

interface FeaturedCarCardProps {
  car: CarWithRelations;
}

export function FeaturedCarCard({ car }: FeaturedCarCardProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    try {
      const unlockedIds = JSON.parse(localStorage.getItem("unlocked_cars") || "[]");
      if (unlockedIds.includes(car.id)) {
        setIsUnlocked(true);
      }
    } catch (err) {
      console.error("Error reading localStorage", err);
    }
  }, [car.id]);

  const primaryImage =
    car.car_images?.find((img) => img.is_primary)?.image_url ||
    car.car_images?.[0]?.image_url ||
    "/placeholder-car.jpg";

  const transmissionLabels: Record<string, string> = {
    automatic: "أوتوماتيك",
    manual: "يدوي",
    cvt: "CVT",
    dual_clutch: "دوبل كلاتش",
  };
  
  const fuelLabels: Record<string, string> = {
    petrol: "بنزين",
    diesel: "ديزل",
    electric: "كهربائي",
    hybrid: "هايبرد",
    plugin_hybrid: "هايبرد مدمج",
    gas: "غاز",
  };

  const whatsappMessage = `مرحباً معرض ولاد العم، أريد الاستفسار عن السيارة: ${car.title} موديل ${car.year}`;
  const whatsappUrl = `https://wa.me/201007946824?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <article className="group relative bg-[#121316] rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col border border-white/5">
      {/* Dark/Gold tinted gradient border effect on hover */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#c5a059]/40 rounded-2xl pointer-events-none transition-colors duration-500 z-10" />

      {/* Image Container with subtle zoom */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0d0d0f]">
        <Image
          src={primaryImage}
          alt={car.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
          unoptimized
        />
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121316] via-transparent to-transparent opacity-80" />
        
        {/* Badges */}
        <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-gradient-to-r from-[#c5a059] to-[#e8c97a] text-[#121316] text-xs font-black shadow-lg">
          مميز وحصري
        </div>

        {/* Lock / Unlock Badge */}
        <div className="absolute top-3 left-3">
          {isUnlocked ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-black shadow-sm">
              <Unlock className="w-2.5 h-2.5" />
              السعر مكشوف
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/90 backdrop-blur-sm text-white text-[10px] font-black shadow-sm">
              <Lock className="w-2.5 h-2.5" />
              السعر عند الطلب
            </span>
          )}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1 justify-between gap-4 z-20">
        <div>
          <div className="flex items-center justify-between text-xs text-[#c5a059] font-bold mb-1">
            <span>{car.brand?.name || "—"}</span>
            <span className="bg-white/5 px-2 py-0.5 rounded">موديل {car.year}</span>
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-[#e8c97a] transition-colors line-clamp-1">
            {car.title}
          </h3>
        </div>

        {/* Spec chips */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/5">
          <div className="flex flex-col items-center justify-center text-center gap-1">
            <Gauge className="w-4 h-4 text-[#c5a059]" />
            <span className="text-[10px] text-slate-400">العداد</span>
            <span className="text-xs text-white font-bold font-mono">
              {car.mileage === 0 ? "0 كم (جديد)" : `${car.mileage.toLocaleString()} كم`}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center text-center gap-1 border-x border-white/5">
            <Fuel className="w-4 h-4 text-[#c5a059]" />
            <span className="text-[10px] text-slate-400">الوقود</span>
            <span className="text-xs text-white font-bold">
              {fuelLabels[car.fuel_type] || car.fuel_type}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center text-center gap-1">
            <GaugeCircle className="w-4 h-4 text-[#c5a059]" />
            <span className="text-[10px] text-slate-400">ناقل الحركة</span>
            <span className="text-xs text-white font-bold">
              {transmissionLabels[car.transmission] || car.transmission}
            </span>
          </div>
        </div>

        {/* Price & Actions */}
        <div className="pt-1 flex flex-col gap-3">
          {isUnlocked ? (
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] text-emerald-400 font-bold">السعر الحالي</span>
              <div className="text-xl font-black text-white font-mono tracking-tight">
                {car.price.toLocaleString("ar-EG")}
                <span className="text-xs font-bold text-slate-400 mr-1">ج.م</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-bold">السعر</span>
              <div className="flex items-center gap-1.5 text-[#c5a059]">
                <Lock className="w-3.5 h-3.5" />
                <span className="text-sm font-black">عند الاستفسار</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 mt-1">
            <Link
              href={`/cars/${car.id}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-l from-[#c5a059] to-[#e8c97a] hover:from-[#b08820] hover:to-[#d4af37] text-[#121316] font-black text-xs transition-all shadow-md group/btn"
            >
              تفاصيل المركبة
              <ArrowLeft className="w-3.5 h-3.5 group-hover/btn:-translate-x-0.5 transition-transform" />
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center p-2.5 rounded-xl bg-white/10 hover:bg-emerald-600 text-white transition-colors"
              title="تواصل عبر الواتساب"
            >
              <MessageSquare className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
