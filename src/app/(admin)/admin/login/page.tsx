"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/modules/shared/lib/supabase/client";
import {
  Car,
  Lock,
  Mail,
  Loader2,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  Building2,
  Zap,
  ArrowRight,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const supabase = createBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMsg("تعذر تسجيل الدخول. تأكد من البريد الإلكتروني وكلمة المرور ثم حاول مرة أخرى.");
        setIsLoading(false);
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setErrorMsg("حدث خطأ غير متوقع أثناء تسجيل الدخول");
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#0E0F12] flex flex-col lg:flex-row font-sans text-right select-none"
      dir="rtl"
    >
      {/* ── Left Hero Side Panel (Desktop Split Screen with Luxury Imagery) ── */}
      <div className="relative hidden lg:flex lg:w-7/12 bg-neutral-900 overflow-hidden flex-col justify-between p-12 text-white">
        {/* Luxury Car Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1600&h=1200&fit=crop"
            alt="Mercedes-Benz S-Class"
            className="w-full h-full object-cover opacity-40 scale-105 filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E0F12] via-[#0E0F12]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0E0F12]/90 via-transparent to-transparent" />
        </div>

        {/* Top Branding Badge */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#c5a059] to-[#99751a] flex items-center justify-center text-slate-950 font-black text-2xl shadow-xl shadow-[#c5a059]/20">
            ع
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-xl text-white tracking-tight">
                أولاد العم
              </h2>
              <span className="text-[10px] font-black text-[#c5a059] bg-[#c5a059]/20 px-2 py-0.5 rounded border border-[#c5a059]/40">
                VIP
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              منظومة إدارة الأصول والسيارات والعقارات v2.5
            </p>
          </div>
        </div>

        {/* Middle Value Proposition Card */}
        <div className="relative z-10 max-w-xl space-y-6 my-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#c5a059] text-xs font-bold">
            <Sparkles className="w-4 h-4" />
            <span>بوابة الإدارة الملكية الخاصة بكبار المسؤولين</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
            إدارة متكاملة لأسطول السيارات والمشروعات العقارية الفاخرة 🏎️🏢
          </h1>

          <p className="text-slate-300 text-sm leading-relaxed font-normal">
            منصة أولاد العم توفر أدوات تحكم وتدقيق عالية الدقة لمتابعة حركات البيع، الطلبات، دليل العملاء الـ VIP 360° ومصفوفة الأمان الشاملة.
          </p>

          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-1">
              <Car className="w-5 h-5 text-[#c5a059]" />
              <span className="text-xs font-bold text-white block">245+ سيارة</span>
              <span className="text-[10px] text-slate-400">سوبركار وسيدان</span>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-1">
              <Building2 className="w-5 h-5 text-[#c5a059]" />
              <span className="text-xs font-bold text-white block">32 مشروع</span>
              <span className="text-[10px] text-slate-400">أبراج ومجمعات VIP</span>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-1">
              <Zap className="w-5 h-5 text-[#c5a059]" />
              <span className="text-xs font-bold text-white block">سكوترات ذكية</span>
              <span className="text-[10px] text-slate-400">أسطول الدراجات</span>
            </div>
          </div>
        </div>

        {/* Bottom Footer Note */}
        <div className="relative z-10 text-xs text-slate-500 font-mono">
          © 2026 El Omda Brothers Executive Admin Suite. All rights reserved.
        </div>
      </div>

      {/* ── Right Form Container ────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-16 bg-[#F8F9FA] min-h-screen lg:min-h-0">
        <div className="max-w-md w-full space-y-8">
          {/* Mobile Header Branding (Visible on mobile/tablet) */}
          <div className="lg:hidden text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#c5a059] to-[#99751a] flex items-center justify-center text-slate-950 font-black text-2xl shadow-xl shadow-[#c5a059]/20 mx-auto">
              ع
            </div>
            <div>
              <div className="flex items-center justify-center gap-2">
                <h1 className="text-2xl font-black text-slate-900">
                  أولاد العم
                </h1>
                <span className="text-[10px] font-black text-[#c5a059] bg-[#c5a059]/15 px-2 py-0.5 rounded border border-[#c5a059]/30">
                  VIP
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                تسجيل الدخول لبوابة الإدارة والتحكم
              </p>
            </div>
          </div>

          {/* Form Box Header */}
          <div className="hidden lg:block space-y-1">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              تسجيل الدخول 🔐
            </h2>
            <p className="text-sm text-slate-500">
              أدخل بيانات الاعتماد الخاصة بك للوصول للوحة التحكم
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xl space-y-6">
            {/* Error Alert */}
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-3 animate-in fade-in">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-slate-800">
                  البريد الإلكتروني للـ Admin *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="admin@elomda.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl pr-11 pl-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c5a059]/20 focus:border-[#c5a059] transition-all dir-ltr text-right"
                  />
                  <Mail className="w-5 h-5 text-slate-400 absolute right-3.5 top-4" />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-slate-800">
                  كلمة المرور *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl pr-11 pl-11 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c5a059]/20 focus:border-[#c5a059] transition-all dir-ltr text-right"
                  />
                  <Lock className="w-5 h-5 text-slate-400 absolute right-3.5 top-4" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3.5 top-4 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 accent-[#c5a059] rounded"
                  />
                  <span>تذكر جلسة العمل</span>
                </label>
                <span className="text-slate-400 font-mono text-[11px]">
                  SSL Encrypted
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-gradient-to-r from-[#c5a059] to-[#99751a] hover:from-[#b08820] hover:to-[#856515] active:bg-[#99751a] text-slate-950 font-black text-sm transition-all shadow-lg shadow-[#c5a059]/25 disabled:opacity-50 mt-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>جاري التحقق والتوجيه...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>تسجيل الدخول لبوابة الإدارة الملكية 🚀</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer Back Link */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-slate-900 font-bold transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة للواجهة الرئيسية للزوار</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
