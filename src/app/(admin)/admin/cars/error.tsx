"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function AdminCarsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Admin Cars Error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] bg-[#F8F9FA] flex flex-col items-center justify-center p-6 text-center" dir="rtl">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-md max-w-md w-full space-y-6">
        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8 text-rose-600" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900">عذراً، حدث خطأ غير متوقع</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            حدثت مشكلة أثناء محاولة جلب أو عرض بيانات السيارات. قد يكون السبب مشكلة في الاتصال أو في الخادم.
          </p>
          {error.message && (
            <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-left text-xs text-slate-700 font-mono overflow-auto max-h-32" dir="ltr">
              {error.message}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-100">
          <button
            onClick={() => reset()}
            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>المحاولة مرة أخرى</span>
          </button>
        </div>
      </div>
    </div>
  );
}
