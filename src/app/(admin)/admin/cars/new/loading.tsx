import { Loader2 } from "lucide-react";

export default function NewCarLoading() {
  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-[1200px] w-full mx-auto space-y-6">
        {/* Top Header Skeleton */}
        <div className="bg-[#111111] p-6 rounded-2xl border border-neutral-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-neutral-800"></div>
            <div className="space-y-2">
              <div className="h-6 w-40 bg-neutral-800 rounded-lg"></div>
              <div className="h-4 w-60 bg-neutral-800/50 rounded-lg"></div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-24 bg-neutral-800 rounded-xl"></div>
            <div className="h-10 w-32 bg-[#C59B27]/30 rounded-xl"></div>
          </div>
        </div>

        {/* Main Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 h-96"></div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 h-80"></div>
          </div>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 h-48"></div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 h-96"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
