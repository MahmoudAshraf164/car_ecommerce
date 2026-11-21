"use client";

import Link from "next/link";
import Image from "next/image";
import { Car, ArrowUpRight, Plus, Tag } from "lucide-react";
import { DashboardLatestCarItem } from "@/modules/admin/dashboard/actions/executive-dashboard";

interface LatestVehiclesWidgetProps {
  cars: DashboardLatestCarItem[];
}

export function LatestVehiclesWidget({ cars }: LatestVehiclesWidgetProps) {
  const numberFormatter = new Intl.NumberFormat("en-US");

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#c5a059] flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base">
                أحدث السيارات المضافة
              </h3>
              <p className="text-[11px] text-slate-400">
                آخر الإضافات لأسطول المعرض
              </p>
            </div>
          </div>
          <Link
            href="/admin/cars"
            className="text-xs font-bold text-[#c5a059] hover:text-[#99751a] flex items-center gap-1 transition-colors"
          >
            <span>عرض الكل</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3.5">
          {cars.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">
              لا توجد سيارات مضافة حالياً
            </p>
          ) : (
            cars.map((car) => {
              const statusBadge =
                car.status === "available"
                  ? { label: "متاحة", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" }
                  : car.status === "sold"
                  ? { label: "مباعة", cls: "bg-blue-50 text-blue-700 border-blue-200" }
                  : car.status === "reserved"
                  ? { label: "محجوزة", cls: "bg-amber-50 text-amber-700 border-amber-200" }
                  : { label: "مسودة", cls: "bg-slate-50 text-slate-600 border-slate-200" };

              return (
                <Link
                  key={car.id}
                  href={`/admin/cars/${car.id}/edit`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-slate-100 hover:border-[#c5a059]/40 transition-all group"
                >
                  {/* Thumbnail */}
                  <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    {car.primaryImageUrl ? (
                      <Image
                        src={car.primaryImageUrl}
                        alt={car.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Car className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-0.5">
                      <span>{car.brandName}</span>
                      <span>•</span>
                      <span>{car.year}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-xs truncate group-hover:text-[#c5a059] transition-colors">
                      {car.title}
                    </h4>
                    <p className="text-xs font-black text-amber-600 font-mono mt-0.5">
                      {numberFormatter.format(car.price)}{" "}
                      <span className="text-[10px] font-normal text-slate-500">
                        ج.م
                      </span>
                    </p>
                  </div>

                  {/* Status */}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${statusBadge.cls}`}
                  >
                    {statusBadge.label}
                  </span>
                </Link>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100">
        <Link
          href="/admin/cars/new"
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-slate-200 hover:border-[#c5a059] text-slate-600 hover:text-[#c5a059] font-bold text-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة سيارة جديدة للمخزون</span>
        </Link>
      </div>
    </div>
  );
}
