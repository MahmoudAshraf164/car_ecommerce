"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { createBrowserClient } from "@/modules/shared/lib/supabase/client";
import {
  Settings,
  User,
  Lock,
  Phone,
  Image as ImageIcon,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  UploadCloud,
  ExternalLink,
  ShieldCheck,
  Building,
  Mail,
  MapPin,
  MessageSquare,
} from "lucide-react";
import {
  updateAdminProfile,
  saveCompanySetting,
} from "@/modules/admin/dashboard/actions/settings";
import {
  ShowroomInfo,
  ContactNumbersSettings,
  HeroSettings,
  AdditionalContactNumber,
} from "@/modules/shared/lib/settings";

interface AdminSettingsClientProps {
  initialProfile: {
    id: string;
    email: string;
    full_name: string;
    phone: string;
    avatar_url: string;
  };
  initialShowroom: ShowroomInfo;
  initialContacts: ContactNumbersSettings;
  initialHero: HeroSettings;
}

export function AdminSettingsClient({
  initialProfile,
  initialShowroom,
  initialContacts,
  initialHero,
}: AdminSettingsClientProps) {
  const [activeTab, setActiveTab] = useState<
    "profile" | "security" | "showroom" | "hero"
  >("profile");

  const supabase = createBrowserClient();

  // Profile Form State
  const [profile, setProfile] = useState(initialProfile);

  // Security Form State
  const [security, setSecurity] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  // Showroom & Contacts Form State
  const [showroom, setShowroom] = useState<ShowroomInfo>(initialShowroom);
  const [contacts, setContacts] =
    useState<ContactNumbersSettings>(initialContacts);

  // Hero Form State
  const [hero, setHero] = useState<HeroSettings>(initialHero);
  const [heroUploading, setHeroUploading] = useState(false);
  const heroFileRef = useRef<HTMLInputElement>(null);

  // Global Feedback States
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // ── 1. Profile Save Handler ──────────────────────────────────────────────
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.full_name.trim()) {
      setFeedback({ type: "error", message: "يرجى كتابة الاسم الكامل" });
      return;
    }

    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await updateAdminProfile({
        full_name: profile.full_name,
        phone: profile.phone,
        avatar_url: profile.avatar_url,
      });

      if (res.success) {
        setFeedback({
          type: "success",
          message: "تم حفظ بيانات الملف الشخصي بنجاح!",
        });
      } else {
        setFeedback({
          type: "error",
          message: res.error || "فشل تحديث الملف الشخصي",
        });
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err?.message || "حدث خطأ غير متوقع",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ── 2. Security / Password Update Handler ─────────────────────────────────
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (security.newPassword.length < 6) {
      setFeedback({
        type: "error",
        message: "كلمة المرور يجب أن لا تقل عن 6 أحرف أو أرقام",
      });
      return;
    }
    if (security.newPassword !== security.confirmPassword) {
      setFeedback({ type: "error", message: "كلمتا المرور غير متطابقتين" });
      return;
    }

    setIsSaving(true);
    setFeedback(null);
    try {
      const { error } = await supabase.auth.updateUser({
        password: security.newPassword,
      });

      if (error) {
        setFeedback({
          type: "error",
          message: error.message || "فشل تغيير كلمة المرور",
        });
      } else {
        setFeedback({
          type: "success",
          message: "تم تحديث كلمة المرور بنجاح!",
        });
        setSecurity({ newPassword: "", confirmPassword: "" });
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err?.message || "حدث خطأ أثناء تحديث كلمة المرور",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ── 3. Showroom & Contacts Save Handler ──────────────────────────────────
  const handleSaveShowroomAndContacts = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      const [resShowroom, resContacts] = await Promise.all([
        saveCompanySetting(
          "showroom_info",
          showroom,
          "Showroom details, currency and address"
        ),
        saveCompanySetting(
          "contact_numbers",
          contacts,
          "Primary and secondary contact phone numbers"
        ),
      ]);

      if (resShowroom.success && resContacts.success) {
        setFeedback({
          type: "success",
          message: "تم حفظ إعدادات المعرض وأرقام التواصل وتحديث الواجهة مباشرة!",
        });
      } else {
        setFeedback({
          type: "error",
          message:
            resShowroom.error ||
            resContacts.error ||
            "حدث خطأ أثناء حفظ الإعدادات",
        });
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err?.message || "فشل حفظ البيانات",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Contacts Helpers
  const addAdditionalNumber = () => {
    const newItem: AdditionalContactNumber = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      label: "خدمة العملاء",
      phone: "",
      isWhatsapp: true,
    };
    setContacts((prev) => ({
      ...prev,
      additionalNumbers: [...prev.additionalNumbers, newItem],
    }));
  };

  const removeAdditionalNumber = (id: string) => {
    setContacts((prev) => ({
      ...prev,
      additionalNumbers: prev.additionalNumbers.filter((n) => n.id !== id),
    }));
  };

  const updateAdditionalNumber = (
    id: string,
    field: keyof AdditionalContactNumber,
    value: any
  ) => {
    setContacts((prev) => ({
      ...prev,
      additionalNumbers: prev.additionalNumbers.map((n) =>
        n.id === id ? { ...n, [field]: value } : n
      ),
    }));
  };

  // ── 4. Hero Banner Upload & Save Handler ──────────────────────────────────
  const handleUploadHeroImage = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setHeroUploading(true);
    setFeedback(null);

    try {
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "png";
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const filePath = `hero/${Date.now()}-${sanitizedName}`;

      const { error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(filePath, file, { upsert: false });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from("uploads")
        .getPublicUrl(filePath);

      setHero((prev) => ({ ...prev, bannerUrl: publicUrlData.publicUrl }));
      setFeedback({
        type: "success",
        message: "تم رفع صورة البانر بنجاح! اضغط 'حفظ إعدادات الواجهة' لاعتمادها.",
      });
    } catch (err: any) {
      console.error("Error uploading hero banner:", err);
      setFeedback({
        type: "error",
        message: err?.message || "فشل رفع الصورة إلى التخزين",
      });
    } finally {
      setHeroUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleSaveHeroSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await saveCompanySetting(
        "hero_settings",
        hero,
        "Storefront Hero section banner and headings"
      );

      if (res.success) {
        setFeedback({
          type: "success",
          message: "تم تحديث وحفظ بانر الواجهة الرئيسية بنجاح!",
        });
      } else {
        setFeedback({
          type: "error",
          message: res.error || "فشل حفظ إعدادات الواجهة",
        });
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err?.message || "حدث خطأ غير متوقع",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto" dir="rtl">
      {/* ── Page Header ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#C59B27]/10 text-[#C59B27] flex items-center justify-center border border-[#C59B27]/30 shadow-xs">
              <Settings className="w-5 h-5" />
            </div>
            <span>إعدادات منظومة ولاد العم</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            إدارة بيانات الأدمن، الأمان، أرقام التواصل الحية، وبانر الواجهة الرئيسية
          </p>
        </div>

        {feedback && (
          <div
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs animate-in fade-in ${
              feedback.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-rose-50 border border-rose-200 text-rose-800"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}
      </div>

      {/* ── Settings Tabs ──────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px scrollbar-hide">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-3 rounded-t-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
            activeTab === "profile"
              ? "bg-white border-x border-t border-slate-200 text-[#C59B27] border-b-2 border-b-white -mb-px shadow-2xs"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <User className="w-4 h-4" />
          <span>الملف الشخصي للأدمن</span>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-4 py-3 rounded-t-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
            activeTab === "security"
              ? "bg-white border-x border-t border-slate-200 text-[#C59B27] border-b-2 border-b-white -mb-px shadow-2xs"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>الأمان وكلمة المرور</span>
        </button>

        <button
          onClick={() => setActiveTab("showroom")}
          className={`flex items-center gap-2 px-4 py-3 rounded-t-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
            activeTab === "showroom"
              ? "bg-white border-x border-t border-slate-200 text-[#C59B27] border-b-2 border-b-white -mb-px shadow-2xs"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>بيانات المعرض وأرقام التواصل</span>
        </button>

        <button
          onClick={() => setActiveTab("hero")}
          className={`flex items-center gap-2 px-4 py-3 rounded-t-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
            activeTab === "hero"
              ? "bg-white border-x border-t border-slate-200 text-[#C59B27] border-b-2 border-b-white -mb-px shadow-2xs"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>صورة الواجهة الرئيسية (Hero)</span>
        </button>
      </div>

      {/* ── Tab Content ────────────────────────────────────────── */}

      {/* 1. Profile Tab */}
      {activeTab === "profile" && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="w-5 h-5 text-[#C59B27]" />
              <span>معلومات الأدمن الشخصية</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  الاسم الكامل <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={profile.full_name}
                  onChange={(e) =>
                    setProfile({ ...profile, full_name: e.target.value })
                  }
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]/20 focus:border-[#C59B27] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  البريد الإلكتروني المسجل (للدخول)
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  رقم الهاتف الخاص بالأدمن
                </label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                  placeholder="01007946824"
                  dir="ltr"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]/20 focus:border-[#C59B27] transition-all text-right font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  رابط الصورة الشخصية (Avatar URL)
                </label>
                <input
                  type="url"
                  value={profile.avatar_url}
                  onChange={(e) =>
                    setProfile({ ...profile, avatar_url: e.target.value })
                  }
                  placeholder="https://..."
                  dir="ltr"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]/20 focus:border-[#C59B27] transition-all text-left"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#C59B27] hover:bg-[#b08820] text-slate-950 font-bold text-sm transition-all shadow-md shadow-[#C59B27]/20 disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>حفظ بيانات الملف الشخصي</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* 2. Security Tab */}
      {activeTab === "security" && (
        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Lock className="w-5 h-5 text-[#C59B27]" />
              <span>تغيير كلمة المرور وتأمين الحساب</span>
            </h2>

            <div className="max-w-xl space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  كلمة المرور الجديدة <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  value={security.newPassword}
                  onChange={(e) =>
                    setSecurity({ ...security, newPassword: e.target.value })
                  }
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]/20 focus:border-[#C59B27] transition-all font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  تأكيد كلمة المرور الجديدة{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  value={security.confirmPassword}
                  onChange={(e) =>
                    setSecurity({
                      ...security,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]/20 focus:border-[#C59B27] transition-all font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#C59B27] hover:bg-[#b08820] text-slate-950 font-bold text-sm transition-all shadow-md shadow-[#C59B27]/20 disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                <span>تحديث كلمة المرور</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* 3. Showroom & Contacts Tab */}
      {activeTab === "showroom" && (
        <form onSubmit={handleSaveShowroomAndContacts} className="space-y-6">
          {/* Showroom Details */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building className="w-5 h-5 text-[#C59B27]" />
              <span>معلومات وهوية المعرض</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700">
                  اسم المعرض (بالعربية)
                </label>
                <input
                  type="text"
                  value={showroom.name}
                  onChange={(e) =>
                    setShowroom({ ...showroom, name: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]/20 focus:border-[#C59B27] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  العملة الرسمية بالمعرض
                </label>
                <select
                  value={showroom.currency}
                  onChange={(e) =>
                    setShowroom({ ...showroom, currency: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]/20 focus:border-[#C59B27] transition-all"
                >
                  <option value="EGP">جنيه مصري (EGP - ج.م)</option>
                  <option value="USD">دولار أمريكي (USD - $)</option>
                  <option value="EUR">يورو (EUR - €)</option>
                  <option value="SAR">ريال سعودي (SAR - ر.س)</option>
                  <option value="AED">درهم إماراتي (AED - د.إ)</option>
                </select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700">
                  عنوان المعرض الفعلي
                </label>
                <input
                  type="text"
                  value={showroom.address}
                  onChange={(e) =>
                    setShowroom({ ...showroom, address: e.target.value })
                  }
                  placeholder="منوف، سكة سرس، بجوار شركة الدخان، المنوفية"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]/20 focus:border-[#C59B27] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  البريد الإلكتروني الرسمي للمعرض
                </label>
                <input
                  type="email"
                  value={showroom.email}
                  onChange={(e) =>
                    setShowroom({ ...showroom, email: e.target.value })
                  }
                  placeholder="weladelam40@gmail.com"
                  dir="ltr"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]/20 focus:border-[#C59B27] transition-all text-right font-mono"
                />
              </div>
            </div>

            {/* Social Links */}
            <h3 className="text-sm font-bold text-slate-800 pt-2 border-t border-slate-100">
              روابط التواصل الاجتماعي والخرائط
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  رابط صفحة فيسبوك
                </label>
                <input
                  type="url"
                  value={showroom.facebook}
                  onChange={(e) =>
                    setShowroom({ ...showroom, facebook: e.target.value })
                  }
                  dir="ltr"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]/20 focus:border-[#C59B27] transition-all text-left"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  رابط حساب تيك توك
                </label>
                <input
                  type="url"
                  value={showroom.tiktok}
                  onChange={(e) =>
                    setShowroom({ ...showroom, tiktok: e.target.value })
                  }
                  dir="ltr"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]/20 focus:border-[#C59B27] transition-all text-left"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  رابط موقع المعرض على Google Maps
                </label>
                <input
                  type="url"
                  value={showroom.mapsGoogle}
                  onChange={(e) =>
                    setShowroom({ ...showroom, mapsGoogle: e.target.value })
                  }
                  dir="ltr"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]/20 focus:border-[#C59B27] transition-all text-left"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  رابط موقع المعرض على Bing Maps
                </label>
                <input
                  type="url"
                  value={showroom.mapsBing}
                  onChange={(e) =>
                    setShowroom({ ...showroom, mapsBing: e.target.value })
                  }
                  dir="ltr"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]/20 focus:border-[#C59B27] transition-all text-left"
                />
              </div>
            </div>
          </div>

          {/* Contact Numbers Management */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Phone className="w-5 h-5 text-[#C59B27]" />
                <span>إدارة أرقام الهواتف والواتساب الحية</span>
              </h2>
              <button
                type="button"
                onClick={addAdditionalNumber}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C59B27]/10 hover:bg-[#C59B27]/20 text-[#C59B27] font-bold text-xs transition-all border border-[#C59B27]/30"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة رقم إضافي</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  رقم الهاتف الأساسي للاتصال <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={contacts.primaryPhone}
                  onChange={(e) =>
                    setContacts({ ...contacts, primaryPhone: e.target.value })
                  }
                  placeholder="01007946824"
                  dir="ltr"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]/20 focus:border-[#C59B27] transition-all text-right font-mono"
                />
                <span className="text-[11px] text-slate-400 block">
                  يظهر في شريط الهيدر العلوي، والفوتر، وأزرار الاتصال
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  رقم الواتساب الأساسي (مع كود الدولة) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={contacts.whatsappNumber}
                  onChange={(e) =>
                    setContacts({
                      ...contacts,
                      whatsappNumber: e.target.value,
                    })
                  }
                  placeholder="201007946824"
                  dir="ltr"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]/20 focus:border-[#C59B27] transition-all text-right font-mono"
                />
                <span className="text-[11px] text-slate-400 block">
                  تُفتح من خلاله محادثات الواتساب لحجز السيارات وباقات الـ PPF
                </span>
              </div>
            </div>

            {/* Additional Numbers List */}
            {contacts.additionalNumbers.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-800 block">
                  أرقام التواصل الإضافية
                </span>
                <div className="space-y-3">
                  {contacts.additionalNumbers.map((num) => (
                    <div
                      key={num.id}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-3"
                    >
                      <div className="flex-1 w-full sm:w-auto">
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">
                          التسمية (مثال: مبيعات، استفسارات PPF)
                        </label>
                        <input
                          type="text"
                          value={num.label}
                          onChange={(e) =>
                            updateAdditionalNumber(
                              num.id,
                              "label",
                              e.target.value
                            )
                          }
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900"
                        />
                      </div>

                      <div className="flex-1 w-full sm:w-auto">
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">
                          رقم الهاتف
                        </label>
                        <input
                          type="text"
                          value={num.phone}
                          onChange={(e) =>
                            updateAdditionalNumber(
                              num.id,
                              "phone",
                              e.target.value
                            )
                          }
                          placeholder="010xxxxxxxx"
                          dir="ltr"
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 text-right font-mono"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-4 sm:pt-0">
                        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={num.isWhatsapp}
                            onChange={(e) =>
                              updateAdditionalNumber(
                                num.id,
                                "isWhatsapp",
                                e.target.checked
                              )
                            }
                            className="w-4 h-4 accent-[#C59B27] rounded"
                          />
                          <span>متاح واتساب</span>
                        </label>

                        <button
                          type="button"
                          onClick={() => removeAdditionalNumber(num.id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="حذف الرقم"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#C59B27] hover:bg-[#b08820] text-slate-950 font-bold text-sm transition-all shadow-md shadow-[#C59B27]/20 disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>حفظ بيانات المعرض وأرقام التواصل</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* 4. Hero Banner Tab */}
      {activeTab === "hero" && (
        <form onSubmit={handleSaveHeroSettings} className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <ImageIcon className="w-5 h-5 text-[#C59B27]" />
              <span>بانر الواجهة الرئيسية (Hero Banner Image)</span>
            </h2>

            {/* Current Preview */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                المعاينة الحية للبانر
              </label>
              <div className="relative w-full aspect-[21/9] max-h-[360px] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200">
                {hero.bannerUrl ? (
                  <Image
                    src={hero.bannerUrl}
                    alt="Hero Banner Preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
                    لا توجد صورة محددة
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/40 to-transparent p-6 flex flex-col justify-end text-white">
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    {hero.title || "معرض ولاد العم للسيارات وأفلام الحماية"}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-200 max-w-lg mt-1 line-clamp-2">
                    {hero.subtitle ||
                      "أجيال من الثقة والالتزام — وجهتك الأولى للسيارات المتميزة"}
                  </p>
                </div>
              </div>
            </div>

            {/* Upload Zone */}
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  رفع صورة جديدة من جهازك
                </label>
                <input
                  ref={heroFileRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleUploadHeroImage}
                  disabled={heroUploading}
                  className="hidden"
                  id="hero-file-input"
                />
                <label
                  htmlFor="hero-file-input"
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 hover:border-[#C59B27] bg-slate-50 hover:bg-[#C59B27]/5 rounded-2xl cursor-pointer transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#C59B27]/10 flex items-center justify-center text-[#C59B27] mb-2 group-hover:scale-110 transition-transform">
                    {heroUploading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <UploadCloud className="w-6 h-6" />
                    )}
                  </div>
                  <span className="text-sm font-bold text-slate-800">
                    {heroUploading
                      ? "جاري رفع الصورة إلى Supabase Storage..."
                      : "اضغط لاختيار صورة بانر جديدة"}
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    أفضل دقة مقترحة: 1920×800 أو نسبة عرض 21:9
                  </span>
                </label>
              </div>

              {/* Direct URL input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  أو رابط الصورة المباشر (Image URL)
                </label>
                <input
                  type="text"
                  value={hero.bannerUrl}
                  onChange={(e) =>
                    setHero({ ...hero, bannerUrl: e.target.value })
                  }
                  placeholder="/welad-el3am-hero.png أو https://..."
                  dir="ltr"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]/20 focus:border-[#C59B27] transition-all text-left font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    العنوان الرئيسي فوق البانر
                  </label>
                  <input
                    type="text"
                    value={hero.title || ""}
                    onChange={(e) =>
                      setHero({ ...hero, title: e.target.value })
                    }
                    placeholder="معرض ولاد العم للسيارات وأفلام الحماية"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]/20 focus:border-[#C59B27] transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    النص التوضيحي للبانر
                  </label>
                  <input
                    type="text"
                    value={hero.subtitle || ""}
                    onChange={(e) =>
                      setHero({ ...hero, subtitle: e.target.value })
                    }
                    placeholder="أجيال من الثقة والالتزام — وجهتك الأولى للسيارات..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]/20 focus:border-[#C59B27] transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSaving || heroUploading}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#C59B27] hover:bg-[#b08820] text-slate-950 font-bold text-sm transition-all shadow-md shadow-[#C59B27]/20 disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>حفظ إعدادات وبانر الواجهة</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
