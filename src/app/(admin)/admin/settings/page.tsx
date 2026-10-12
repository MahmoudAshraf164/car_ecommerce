"use client";

import { useState } from "react";
import {
  Settings,
  User,
  Lock,
  Globe,
  Bell,
  Save,
  CheckCircle2,
  ShieldCheck,
  Building,
  CreditCard,
  Moon,
  Sun,
  Loader2,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "general">("profile");

  // Profile State
  const [profile, setProfile] = useState({
    name: "المدير العام",
    email: "",
    phone: "+966 50 123 4567",
    role: "أدمن رئيسي (Super Admin)",
  });

  // Security State
  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirmPass: "",
  });

  // General Settings State
  const [general, setGeneral] = useState({
    siteName: "معرض أولاد العم للسيارات",
    phone: "+966 9200 0000",
    email: "info@elomda-cars.com",
    currency: "SAR",
    maintenanceMode: false,
    autoApproveOrders: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);

    setTimeout(() => {
      setIsSaving(false);
      setSuccessMsg("تم حفظ الإعدادات بنجاح!");
      setTimeout(() => setSuccessMsg(null), 3000);
    }, 600);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto" dir="rtl">
      {/* ── Page Header ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60 shadow-xs">
              <Settings className="w-5 h-5" />
            </div>
            إعدادات النظام والحساب ⚙️
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            إدارة بيانات الأدمن، الأمان، وإعدادات المعرض العامة
          </p>
        </div>

        {successMsg && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* ── Settings Tabs ──────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-px">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-3 rounded-t-xl font-bold text-sm transition-all ${activeTab === "profile"
              ? "bg-white border-x border-t border-slate-200/80 text-amber-600 border-b-2 border-b-white -mb-px shadow-2xs"
              : "text-slate-500 hover:text-slate-800"
            }`}
        >
          <User className="w-4 h-4" />
          <span>الملف الشخصي</span>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-4 py-3 rounded-t-xl font-bold text-sm transition-all ${activeTab === "security"
              ? "bg-white border-x border-t border-slate-200/80 text-amber-600 border-b-2 border-b-white -mb-px shadow-2xs"
              : "text-slate-500 hover:text-slate-800"
            }`}
        >
          <Lock className="w-4 h-4" />
          <span>الأمان وكلمة المرور</span>
        </button>

        <button
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 px-4 py-3 rounded-t-xl font-bold text-sm transition-all ${activeTab === "general"
              ? "bg-white border-x border-t border-slate-200/80 text-amber-600 border-b-2 border-b-white -mb-px shadow-2xs"
              : "text-slate-500 hover:text-slate-800"
            }`}
        >
          <Globe className="w-4 h-4" />
          <span>إعدادات المعرض</span>
        </button>
      </div>

      {/* ── Tab Content ────────────────────────────────────────── */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <form onSubmit={handleSave} className="space-y-6">
          {/* 1. Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6 max-w-2xl">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white text-xl font-black shadow-md shadow-amber-500/20">
                  أ.ع
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {profile.name}
                  </h3>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 inline-block mt-1">
                    {profile.role}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    الاسم الكامل *
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    البريد الإلكتروني *
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700">
                    رقم الجوال
                  </label>
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500 transition-all font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-6 max-w-2xl">
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs text-amber-800 space-y-1">
                <span className="font-bold block">💡 تلميح أمني:</span>
                <p>
                  احرص على استخدام كلمة مرور قوية تحتوي على أرقام ورموز خاصة للحفاظ على أمان اللوحة.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    كلمة المرور الحالية *
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={passwords.current}
                    onChange={(e) =>
                      setPasswords({ ...passwords, current: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      كلمة المرور الجديدة *
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={passwords.newPass}
                      onChange={(e) =>
                        setPasswords({ ...passwords, newPass: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      تأكيد كلمة المرور الجديدة *
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={passwords.confirmPass}
                      onChange={(e) =>
                        setPasswords({
                          ...passwords,
                          confirmPass: e.target.value,
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. General Site Settings Tab */}
          {activeTab === "general" && (
            <div className="space-y-6 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    اسم المعرض / منصة العرض *
                  </label>
                  <input
                    type="text"
                    value={general.siteName}
                    onChange={(e) =>
                      setGeneral({ ...general, siteName: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    العملة الافتراضية
                  </label>
                  <select
                    value={general.currency}
                    onChange={(e) =>
                      setGeneral({ ...general, currency: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500 transition-all"
                  >
                    <option value="SAR">ريال سعودي (SAR)</option>
                    <option value="EGP">جنيه مصري (EGP)</option>
                    <option value="USD">دولار أمريكي (USD)</option>
                    <option value="AED">درهم إماراتي (AED)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    هاتف الدعم المباشر
                  </label>
                  <input
                    type="text"
                    value={general.phone}
                    onChange={(e) =>
                      setGeneral({ ...general, phone: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500 transition-all font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    بريد الاستفسارات
                  </label>
                  <input
                    type="email"
                    value={general.email}
                    onChange={(e) =>
                      setGeneral({ ...general, email: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:border-slate-300 transition-all">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      وضع الصيانة (Maintenance Mode)
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      إغلاق الواجهة العامة مؤقتاً لأعمال الصيانة والتحديث
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={general.maintenanceMode}
                    onChange={(e) =>
                      setGeneral({
                        ...general,
                        maintenanceMode: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:border-slate-300 transition-all">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      تفعيل الإشعارات بالبريد فور ورود طلب جديد
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      إرسال رسالة تنبيه بريدية لأدمن المعرض فور تسجيل العميل لطلب معاينة
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={general.autoApproveOrders}
                    onChange={(e) =>
                      setGeneral({
                        ...general,
                        autoApproveOrders: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Submit Button Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-500/25 transition-all duration-200 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>حفظ الإعدادات</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
