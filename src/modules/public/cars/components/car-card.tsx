"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CarWithRelations } from "@/modules/admin/cars/types/car.types";
import { Gauge, Fuel, GaugeCircle, Star, ArrowLeft, Calendar, Lock, Unlock } from "lucide-react";

interface CarCardProps {
  car: CarWithRelations;
}

export function CarCard({ car }: CarCardProps) {
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
    "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=1200&auto=format&fit=crop";

  const transmissionLabel =
    car.transmission === "automatic"
      ? "أوتوماتيك"
      : car.transmission === "manual"
      ? "مانيوال"
      : car.transmission === "dual_clutch"
      ? "دبل كلتش"
      : car.transmission.toUpperCase();

  return (
    <div className="group bg-white border border-[#E5E7EB] hover:border-[#c5a059]/60 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] flex flex-col">
      {/* Image */}
      <div className="relative w-full aspect-[16/10] bg-[#F3F4F5] overflow-hidden">
        <Image
          src={primaryImage}
          alt={car.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          unoptimized
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

        {/* Top badges */}
        <div className="absolute top-3 right-3 left-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {car.featured && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#c5a059] text-white text-[11px] font-black shadow-md">
                <Star className="w-3 h-3 fill-white" />
                مميزة
              </span>
            )}
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-black shadow-sm ${
                car.condition === "new"
                  ? "bg-emerald-500 text-white"
                  : "bg-white/90 text-[#121316]"
              }`}
            >
              {car.condition === "new" ? "زيرو" : "مستعمل"}
            </span>
          </div>

          {/* Price Lock badge — top left */}
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

        {/* Bottom year badge */}
        <div className="absolute bottom-3 right-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-white text-xs font-bold font-mono">
            <Calendar className="w-3 h-3" />
            {car.year}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col gap-4">
        {/* Brand & Title */}
        <div>
          <span className="text-[11px] font-extrabold text-[#c5a059] uppercase tracking-widest">
            {car.brand?.name}
          </span>
          <h3 className="text-base font-black text-[#121316] mt-0.5 line-clamp-1 group-hover:text-[#c5a059] transition-colors">
            {car.title}
          </h3>
          {car.car_models?.name && (
            <span className="text-xs text-[#76777b] font-medium">
              {car.car_models.name}
            </span>
          )}
        </div>

        {/* Specs Row */}
        <div className="grid grid-cols-3 gap-2 border-y border-[#F3F4F5] py-3">
          <div className="text-center space-y-0.5">
            <Gauge className="w-4 h-4 text-[#c5a059] mx-auto" />
            <div className="text-[10px] text-[#76777b] font-medium">الممشى</div>
            <div className="text-xs font-black text-[#121316] font-mono">
              {car.mileage > 0 ? `${(car.mileage / 1000).toFixed(0)}k` : "0"}
            </div>
          </div>
          <div className="text-center space-y-0.5 border-x border-[#F3F4F5]">
            <GaugeCircle className="w-4 h-4 text-[#c5a059] mx-auto" />
            <div className="text-[10px] text-[#76777b] font-medium">الناقل</div>
            <div className="text-xs font-black text-[#121316] truncate">
              {transmissionLabel}
            </div>
          </div>
          <div className="text-center space-y-0.5">
            <Fuel className="w-4 h-4 text-[#c5a059] mx-auto" />
            <div className="text-[10px] text-[#76777b] font-medium">المحرك</div>
            <div className="text-xs font-black text-[#121316] font-mono">
              {car.engine_capacity ? `${car.engine_capacity}cc` : "—"}
            </div>
          </div>
        </div>

        {/* Price Lock CTA */}
        <div className="flex items-center justify-between">
          {/* Price Area */}
          {isUnlocked ? (
            <div className="flex flex-col">
              <span className="text-[10px] text-emerald-600 font-semibold mb-0.5">
                السعر الحالي
              </span>
              <div className="text-xl font-black text-[#121316] font-mono tracking-tight">
                {car.price.toLocaleString("en-US")}
                <span className="text-xs font-bold text-[#46464b] mr-1">ج.م</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-500" />
              <div>
                <div className="text-[10px] text-[#76777b] font-semibold">
                  السعر
                </div>
                <div className="text-xs font-black text-amber-600">
                  اضغط لمعرفة السعر
                </div>
              </div>
            </div>
          )}

          <Link
            href={`/cars/${car.id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#121316] hover:bg-[#c5a059] text-white font-bold text-xs transition-all shadow-sm group/btn"
          >
            {isUnlocked ? "التفاصيل" : "التفاصيل والسعر"}
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover/btn:-translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
