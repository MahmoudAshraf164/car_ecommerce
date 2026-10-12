"use client";

import { useState } from "react";
import {
  Shield,
  Zap,
  CheckCircle2,
  Sliders,
  Sparkles,
  Info,
  Car,
  Save,
  Check,
} from "lucide-react";

export default function SafetyAndPerformanceMatrixPage() {
  const [airbagsCount, setAirbagsCount] = useState(8);
  const [hasTurbo, setHasTurbo] = useState(true);
  const [turboType, setTurboType] = useState("Twin-Turbo");

  // Safety features matrix
  const [safetyMatrix, setSafetyMatrix] = useState<Record<string, boolean>>({
    "نظام فرامل ABS المانع للانغلاق": true,
    "برنامج الثبات الإلكتروني ESP / ESC": true,
    "مساعد الحفاظ على المسار (Lane Keeping Assist)": true,
    "نظام مراقبة النقطة الكوراء (Blind Spot Monitoring)": true,
    "نظام الفرملة الذكية التلقائية للطوارئ (AEB)": true,
    "مثبت السرعة التكيفي والرادار (Adaptive Cruise Control)": true,
    "كاميرات رؤية محيطية 360 درجة عالية الدقة": true,
    "حساسات ركن أمامية وخلفية وتنبيه حركة المرور": true,
  });

  const toggleSafety = (key: string) => {
    setSafetyMatrix((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto font-sans text-right" dir="rtl">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-[#c5a059]" />
            مصفوفة أمان وأداء المركبات الفاخرة 🛡️
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            إعداد معايير السلامة، التوربو، وأنظمة الأمان الذكية لأسطول المعرض
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-all shadow-md">
          <Save className="w-4 h-4" />
          <span>حفظ المعايير</span>
        </button>
      </div>

      {/* Airbags & Turbo Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Airbags Matrix */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
            <Shield className="w-5 h-5 text-[#c5a059]" />
            تكوين الوسائد الهوائية (Airbags Matrix)
          </h2>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700">عدد وسائد الأمان الهوائية *</label>
            <div className="flex items-center gap-3">
              {[4, 6, 8, 10, 12].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setAirbagsCount(num)}
                  className={`flex-1 py-2.5 rounded-xl font-mono font-bold text-sm border transition-all ${
                    airbagsCount === num
                      ? "bg-[#c5a059] text-slate-950 border-[#c5a059] shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {num} وسائد
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400">توزيع شامل: وسائد أمامية، جانبية، ستائرية، ووسائد لحماية ركبة السائق.</p>
          </div>
        </div>

        {/* Turbo Engine Matrix */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
            <Zap className="w-5 h-5 text-[#c5a059]" />
            نظام التوربو والأداء الفائق (Turbocharger)
          </h2>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-900 block">نظام الشحن التوربيني (Turbo)</span>
                <span className="text-[11px] text-slate-500">تعزيز قوة وتسارع المحرك</span>
              </div>
              <input
                type="checkbox"
                checked={hasTurbo}
                onChange={(e) => setHasTurbo(e.target.checked)}
                className="w-4 h-4 accent-[#c5a059] rounded"
              />
            </label>

            {hasTurbo && (
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold text-slate-700">نوع الشاحن التوربيني</label>
                <select
                  value={turboType}
                  onChange={(e) => setTurboType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900"
                >
                  <option value="Single-Turbo">تيربو أحادي (Single Turbo)</option>
                  <option value="Twin-Turbo">تيربو مزدوج (Twin-Turbo / Bi-Turbo)</option>
                  <option value="Supercharged">سوپر تشارجر (Supercharged)</option>
                  <option value="Electric-Boost">معزز كهربائي هجين (Mild Hybrid Boost)</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Safety Matrix Checklist */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
          <CheckCircle2 className="w-5 h-5 text-[#c5a059]" />
          أنظمة مساعدة السائق والسلامة النشطة (Active Safety Systems)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(safetyMatrix).map(([label, active]) => (
            <div
              key={label}
              onClick={() => toggleSafety(label)}
              className={`flex items-center justify-between p-3.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                active
                  ? "bg-amber-50/50 border-[#c5a059]/60 text-slate-900"
                  : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300"
              }`}
            >
              <span>{label}</span>
              <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${active ? "bg-[#c5a059] text-slate-950" : "bg-slate-200 text-transparent"}`}>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
