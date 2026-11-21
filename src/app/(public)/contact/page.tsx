"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, MessageSquare, Clock, Send, CheckCircle2, Headphones, CalendarCheck } from "lucide-react";

export default function PublicContactPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [interest, setInterest] = useState("cars");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    alert("تم إرسال رسالتك بنجاح! سيتواصل معك مستشار كبار العملاء في أقرب وقت.");
  };

  return (
    <div className="space-y-12 pb-16 font-sans text-right" dir="rtl">
      {/* Dark Hero */}
      <section className="relative bg-[#111215] text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-neutral-800 text-center space-y-4">
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#c5a059] text-xs font-bold">
          <MessageSquare className="w-4 h-4" />
          <span>خدمة كبار العملاء والكونسيرج 24/7</span>
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white">اتصل بنا وحجز معاينة حصرية 📞</h1>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">فريق مستشارينا جاهز للرد على استفساراتك وتنسيق المعاينات الخاصة بروتوكول الـ VIP.</p>
      </section>

      {/* Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info Card */}
          <div className="bg-[#111215] text-white p-8 rounded-3xl border border-neutral-800 space-y-6">
            <h3 className="text-xl font-black border-b border-neutral-800 pb-3">مكاتبنا وصالات العرض</h3>
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#c5a059] shrink-0" />
                <div>
                  <span className="font-bold block text-white">المعرض الرئيسي:</span>
                  <span className="text-slate-400">القاهرة الجديدة - التجمع الخامس / شارع التسعين الجنوبي</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#c5a059] shrink-0" />
                <div>
                  <span className="font-bold block text-white">الهاتف المباشر:</span>
                  <span className="text-slate-300 font-mono">+201007946824</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#c5a059] shrink-0" />
                <div>
                  <span className="font-bold block text-white">البريد الإلكتروني:</span>
                  <a href="mailto:info@elomda-brothers.com" className="text-slate-400 hover:text-[#c5a059] transition-colors">info@elomda-brothers.com</a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#c5a059] shrink-0" />
                <div>
                  <span className="font-bold block text-white">مواعيد العمل:</span>
                  <span className="text-slate-400">يومياً من 10:00 صباحاً حتى 10:00 مساءً</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-3">إرسال استفسار مباشر</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">الاسم الكامل *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: د. خالد المنصوري"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">رقم الجوال *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+201007946824"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">مجال الاهتمام</label>
                <select
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900"
                >
                  <option value="cars">السيارات الفاخرة والسوبركار</option>
                  <option value="real-estate">المشروعات العقارية والأبراج</option>
                  <option value="scooters">السكوترات والدراجات الذكية</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">تفاصيل الرسالة أو طلب المعاينة</label>
                <textarea
                  rows={4}
                  placeholder="اكتب استفسارك هنا..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-4 text-sm text-slate-900"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#99751a] text-slate-950 font-black text-sm shadow-md"
              >
                <Send className="w-4 h-4" />
                <span>إرسال الرسالة للمستشار</span>
              </button>
              {submitted && (
                <div role="status" className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                  <p><span className="font-black">تم استلام طلبك بنجاح.</span> سيتواصل معك أحد مستشارينا في أقرب وقت.</p>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <a href="tel:+201007946824" className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-[#c5a059]"><Phone className="h-5 w-5" /></div>
            <h2 className="font-black text-slate-900">اتصل مباشرة</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">للاستفسارات العاجلة أو ترتيب معاينة خاصة.</p>
            <span className="mt-4 inline-block text-sm font-bold text-[#a27d27] group-hover:text-slate-900">+20 100 794 6824</span>
          </a>
          <a href="https://wa.me/201007946824" target="_blank" rel="noreferrer" className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-[#c5a059]"><MessageSquare className="h-5 w-5" /></div>
            <h2 className="font-black text-slate-900">راسلنا على واتساب</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">تواصل سريع مع فريق خدمة العملاء والكونسيرج.</p>
            <span className="mt-4 inline-block text-sm font-bold text-[#a27d27] group-hover:text-slate-900">ابدأ المحادثة</span>
          </a>
          <div className="rounded-2xl border border-[#c5a059]/30 bg-[#151619] p-6 text-white shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#c5a059] text-[#151619]"><CalendarCheck className="h-5 w-5" /></div>
            <h2 className="font-black">معاينة بموعد مسبق</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">ننسق زيارة خاصة في الوقت والمكان الأنسب لك.</p>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#d8b86e]"><Headphones className="h-4 w-4" /> خدمة شخصية من البداية للنهاية</div>
          </div>
        </div>
      </section>
    </div>
  );
}
