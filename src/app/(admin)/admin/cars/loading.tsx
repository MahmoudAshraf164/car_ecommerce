import { Loader2 } from "lucide-react";

export default function AdminCarsLoading() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 md:p-8 space-y-6" dir="rtl">
      {/* Header Skeleton */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-slate-200 rounded-lg"></div>
          <div className="h-4 w-64 bg-slate-100 rounded-lg"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-32 bg-slate-200 rounded-xl"></div>
          <div className="h-10 w-36 bg-amber-200 rounded-xl"></div>
        </div>
      </div>

      {/* Table Skeleton Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden animate-pulse">
        {/* Table Filters Header Skeleton */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="h-10 w-64 bg-slate-100 rounded-xl"></div>
          <div className="h-10 w-40 bg-slate-100 rounded-xl"></div>
        </div>

        {/* Table Rows Skeleton */}
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 border-b border-slate-50 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-10 bg-slate-200 rounded-lg"></div>
                <div className="space-y-1.5">
                  <div className="h-4 w-40 bg-slate-200 rounded-lg"></div>
                  <div className="h-3 w-24 bg-slate-100 rounded-lg"></div>
                </div>
              </div>
              <div className="h-4 w-20 bg-slate-200 rounded-lg"></div>
              <div className="h-4 w-16 bg-slate-200 rounded-lg"></div>
              <div className="h-6 w-20 bg-emerald-100 rounded-full"></div>
              <div className="h-8 w-24 bg-slate-100 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
