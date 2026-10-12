"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { seedCarsData } from "../actions/cars";
import { Sparkles, Loader2, CheckCircle2 } from "lucide-react";

export function SeedDataButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSeed = async () => {
    setLoading(true);
    setMessage(null);
    const res = await seedCarsData();
    setLoading(false);

    if (res.success) {
      setMessage("تم توليد البيانات بنجاح!");
      router.refresh();
      setTimeout(() => setMessage(null), 4000);
    } else {
      alert("تعذر إضافة البيانات: " + res.error);
    }
  };

  return (
    <div className="inline-flex items-center gap-3">
      {message && (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
          <CheckCircle2 className="w-4 h-4" />
          {message}
        </span>
      )}
      <button
        onClick={handleSeed}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F8F9FA] hover:bg-[#F3F4F5] text-[#121316] font-bold text-xs border border-[#E5E7EB] hover:border-[#c5a059] transition-all disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-[#c5a059]" />
            جاري التوليد...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-[#c5a059]" />
            بيانات تجريبية
          </>
        )}
      </button>
    </div>
  );
}
