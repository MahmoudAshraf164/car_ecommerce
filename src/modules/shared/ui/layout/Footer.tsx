import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-[#121316] text-[#e3e2e6] border-t border-white/10 pt-16 pb-8">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#c5a059] text-[#121316] flex items-center justify-center font-extrabold text-xl shadow-md">
                عمدا
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-white tracking-wide">أولاد العم</span>
                <span className="text-[10px] text-[#c5a059] tracking-widest uppercase font-semibold">
                  EL OMDA BROTHERS
                </span>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-[#c7c6cb]">
              بوابة النخبة الاستثمارية في مصر والشرق الأوسط لاقتناء أفخم السيارات العالمية والاستثمار في أرقى المشروعات العقارية بمعايير استثنائية.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-white mb-4 text-base">أقسام المنصة</h3>
            <ul className="space-y-2.5 text-sm text-[#c7c6cb]">
              <li><Link href="/cars" className="hover:text-[#c5a059] transition-colors">السيارات الفاخرة</Link></li>
              <li><Link href="/properties" className="hover:text-[#c5a059] transition-colors">المشاريع العقارية</Link></li>
              <li><Link href="/scooters" className="hover:text-[#c5a059] transition-colors">السكوترات الفارهة</Link></li>
              <li><Link href="/contact" className="hover:text-[#c5a059] transition-colors">طلب استشارة خاصة</Link></li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-bold text-white mb-4 text-base">عن المجموعة</h3>
            <ul className="space-y-2.5 text-sm text-[#c7c6cb]">
              <li><Link href="/about" className="hover:text-[#c5a059] transition-colors">من نحن</Link></li>
              <li><Link href="/privacy" className="hover:text-[#c5a059] transition-colors">سياسة الخصوصية</Link></li>
              <li><Link href="/terms" className="hover:text-[#c5a059] transition-colors">الشروط والأحكام</Link></li>
              <li><Link href="/admin" className="hover:text-[#c5a059] transition-colors text-[#c5a059] font-semibold">لوحة التحكم الإدارية</Link></li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <h3 className="font-bold text-white mb-4 text-base">التواصل المباشر</h3>
            <div className="flex items-center gap-3 text-sm text-[#c7c6cb]">
              <span className="material-symbols-outlined text-[#c5a059] text-[20px]">call</span>
              <span dir="ltr">19000 (الخط الساخن)</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-[#c7c6cb]">
              <span className="material-symbols-outlined text-[#c5a059] text-[20px]">mail</span>
              <span>info@elomdabrothers.com</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-[#c7c6cb]">
              <span className="material-symbols-outlined text-[#c5a059] text-[20px]">location_on</span>
              <span>القاهرة الجديدة — التجمع الخامس، مصر</span>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-[#848387] gap-4">
          <p>© {new Date().getFullYear()} منصة أولاد العم للسيارات الفاخرة والاستثمار العقاري. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-6">
            <span>تصميم ومواصفات Prestige Sovereign</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
