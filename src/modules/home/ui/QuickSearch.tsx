"use client";

import { useState } from "react";

export function QuickSearch() {
  const [activeTab, setActiveTab] = useState<"cars" | "realestate">("cars");

  return (
    <section className="relative z-20 max-w-[1440px] w-full mx-auto px-4 md:px-12 -mt-14">
      <div className="bg-white rounded-2xl shadow-[0_20px_48px_-12px_rgba(0,0,0,0.12)] p-6 md:p-8 border border-outline-variant/40">
        {/* Selector Tabs */}
        <div className="flex items-center gap-3 pb-6 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab("cars")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm cursor-pointer ${
              activeTab === "cars"
                ? "bg-[#121316] text-white"
                : "bg-surface-container text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">directions_car</span>
            <span>السيارات الفارهة</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("realestate")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all cursor-pointer ${
              activeTab === "realestate"
                ? "bg-[#121316] text-white shadow-sm"
                : "bg-surface-container text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">apartment</span>
            <span>العقارات والقصور</span>
          </button>
          <span className="text-outline-variant text-xs pr-4 hidden md:inline-block">
            فهرس حصري للوحدات والسيارات المتاحة فوراً
          </span>
        </div>

        {/* Cars Controls */}
        {activeTab === "cars" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-on-surface-variant font-semibold">الماركة العالمية</label>
              <div className="relative">
                <select className="w-full h-12 pr-4 pl-10 rounded-lg bg-surface-container-low text-on-surface text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#c5a059] cursor-pointer border border-outline-variant/30">
                  <option value="">جميع الماركات الفاخرة</option>
                  <option>مرسيدس-بنز (Mercedes-Maybach)</option>
                  <option>رولز رويس (Rolls-Royce)</option>
                  <option>بورش (Porsche)</option>
                  <option>لاند روفر (Range Rover)</option>
                  <option>بي إم دبليو (BMW M)</option>
                </select>
                <span className="material-symbols-outlined absolute left-3 top-3 text-outline text-[20px] pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-on-surface-variant font-semibold">الفئة والهيكل</label>
              <div className="relative">
                <select className="w-full h-12 pr-4 pl-10 rounded-lg bg-surface-container-low text-on-surface text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#c5a059] cursor-pointer border border-outline-variant/30">
                  <option value="">كافة الفئات</option>
                  <option>سيدان ليموزين فاخرة</option>
                  <option>دفع رباعي فاره (SUV)</option>
                  <option>سوبر سبورت / كوبيه</option>
                </select>
                <span className="material-symbols-outlined absolute left-3 top-3 text-outline text-[20px] pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-on-surface-variant font-semibold">سنة الصنع</label>
              <div className="relative">
                <select className="w-full h-12 pr-4 pl-10 rounded-lg bg-surface-container-low text-on-surface text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#c5a059] cursor-pointer border border-outline-variant/30">
                  <option value="">2022 - 2025</option>
                  <option>2025 متاح للطلب الحصري</option>
                  <option>2024 زيرو (0 كم)</option>
                  <option>2023 معتمدة</option>
                </select>
                <span className="material-symbols-outlined absolute left-3 top-3 text-outline text-[20px] pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-on-surface-variant font-semibold">نطاق القيمة التقديرية</label>
              <div className="relative">
                <select className="w-full h-12 pr-4 pl-10 rounded-lg bg-surface-container-low text-on-surface text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#c5a059] cursor-pointer border border-outline-variant/30">
                  <option value="">كافة النطاقات</option>
                  <option>5,000,000 - 10,000,000 ج.م</option>
                  <option>10,000,000 - 20,000,000 ج.م</option>
                  <option>أكثر من 20,000,000 ج.م</option>
                </select>
                <span className="material-symbols-outlined absolute left-3 top-3 text-outline text-[20px] pointer-events-none">
                  payments
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-end">
              <button
                type="button"
                className="w-full h-12 rounded-lg bg-[#121316] hover:bg-[#1b1b1f] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-md cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">search</span>
                <span>بحث فوري</span>
              </button>
            </div>
          </div>
        )}

        {/* Real Estate Controls */}
        {activeTab === "realestate" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-on-surface-variant font-semibold">الموقع الاستراتيجي</label>
              <div className="relative">
                <select className="w-full h-12 pr-4 pl-10 rounded-lg bg-surface-container-low text-on-surface text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#c5a059] cursor-pointer border border-outline-variant/30">
                  <option value="">جميع المواقع</option>
                  <option>الساحل الشمالي (رأس الحكمة / سيدي عبد الرحمن)</option>
                  <option>القاهرة الجديدة (التجمع الخامس)</option>
                  <option>الشيخ زايد وغرب القاهرة</option>
                  <option>العاصمة الإدارية الجديدة</option>
                </select>
                <span className="material-symbols-outlined absolute left-3 top-3 text-outline text-[20px] pointer-events-none">
                  pin_drop
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-on-surface-variant font-semibold">نوع الأصل العقاري</label>
              <div className="relative">
                <select className="w-full h-12 pr-4 pl-10 rounded-lg bg-surface-container-low text-on-surface text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#c5a059] cursor-pointer border border-outline-variant/30">
                  <option value="">الكل</option>
                  <option>فيلات وقصور مستقلة</option>
                  <option>بنتهاوس مع مسبح خاص</option>
                  <option>أبراج تجارية وإدارية</option>
                </select>
                <span className="material-symbols-outlined absolute left-3 top-3 text-outline text-[20px] pointer-events-none">
                  villa
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-on-surface-variant font-semibold">حالة التسليم</label>
              <div className="relative">
                <select className="w-full h-12 pr-4 pl-10 rounded-lg bg-surface-container-low text-on-surface text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#c5a059] cursor-pointer border border-outline-variant/30">
                  <option value="">جاهز للتسليم الفوري</option>
                  <option>تسليم خلال عام</option>
                  <option>مشروعات تحت الإنشاء (Off-Plan)</option>
                </select>
                <span className="material-symbols-outlined absolute left-3 top-3 text-outline text-[20px] pointer-events-none">
                  key
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-on-surface-variant font-semibold">ميزانية الاستثمار</label>
              <div className="relative">
                <select className="w-full h-12 pr-4 pl-10 rounded-lg bg-surface-container-low text-on-surface text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#c5a059] cursor-pointer border border-outline-variant/30">
                  <option value="">أي ميزانية</option>
                  <option>20M - 40M ج.م</option>
                  <option>40M - 80M ج.م</option>
                  <option>100M+ ج.م</option>
                </select>
                <span className="material-symbols-outlined absolute left-3 top-3 text-outline text-[20px] pointer-events-none">
                  domain_verification
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-end">
              <button
                type="button"
                className="w-full h-12 rounded-lg bg-[#c5a059] hover:bg-[#b08d48] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-md cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">manage_search</span>
                <span>ابحث عن عقارك</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
