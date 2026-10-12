"use client";

import { useState, useOptimistic, useTransition } from "react";
import {
  ClipboardList, Search, Phone, MessageSquare, ChevronDown, Eye,
  X, Download, UserCheck, Kanban, Table as TableIcon, Send,
  Sparkles, Car, Shield,
} from "lucide-react";
import { updateLeadStatus, addLeadNote } from "@/modules/admin/dashboard/actions/leads";
import type { AdminLead } from "@/modules/admin/dashboard/actions/leads";
import type { LeadStatus } from "@/modules/shared/types/database.types";

const statusPipelineConfig: Record<LeadStatus | string, { title: string; badgeClass: string; barColor: string }> = {
  new: { title: "جديد (New Lead)", badgeClass: "bg-blue-50 text-blue-700 border-blue-200", barColor: "bg-blue-500" },
  contacted: { title: "قيد التواصل / المعاينة", badgeClass: "bg-amber-50 text-amber-700 border-amber-200", barColor: "bg-amber-500" },
  qualified: { title: "مؤهل", badgeClass: "bg-orange-50 text-orange-700 border-orange-200", barColor: "bg-orange-500" },
  following_up: { title: "متابعة", badgeClass: "bg-purple-50 text-purple-700 border-purple-200", barColor: "bg-purple-500" },
  negotiating: { title: "تفاوض / تقديم عرض", badgeClass: "bg-orange-50 text-orange-700 border-orange-200", barColor: "bg-orange-500" },
  won: { title: "تم التعاقد (Won)", badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200", barColor: "bg-emerald-500" },
  lost: { title: "خسارة", badgeClass: "bg-rose-50 text-rose-700 border-rose-200", barColor: "bg-rose-500" },
  cancelled: { title: "ملغي / غير مهتم", badgeClass: "bg-rose-50 text-rose-700 border-rose-200", barColor: "bg-rose-500" },
};

const leadTypeLabels: Record<string, string> = {
  car_inquiry: "سيارات فاخرة",
  scooter_inquiry: "سكوتر",
  real_estate_inquiry: "عقارات",
  general: "استفسار عام",
};

interface AdminOrdersClientProps {
  initialLeads: AdminLead[];
}

export function AdminOrdersClient({ initialLeads }: AdminOrdersClientProps) {
  const [leads, setLeads] = useState<AdminLead[]>(initialLeads);
  const [isPending, startTransition] = useTransition();
  const [viewMode, setViewMode] = useState<"kanban" | "table">("table");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [selectedLead, setSelectedLead] = useState<AdminLead | null>(null);
  const [newNoteInput, setNewNoteInput] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  const [statusModalLead, setStatusModalLead] = useState<AdminLead | null>(null);
  const [targetStatus, setTargetStatus] = useState<LeadStatus>("contacted");
  const [statusNoteText, setStatusNoteText] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const filteredLeads = leads.filter((l) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      l.customer?.name?.toLowerCase().includes(searchLower) ||
      l.customer?.phone?.toLowerCase().includes(searchLower) ||
      l.car?.title?.toLowerCase().includes(searchLower) ||
      l.id.toLowerCase().includes(searchLower);

    const matchesType = typeFilter === "all" || l.lead_type === typeFilter;
    const matchesStatus = statusFilter === "all" || l.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteInput.trim() || !selectedLead) return;
    setIsAddingNote(true);

    const optimisticNote = {
      id: `temp-${Date.now()}`,
      note: newNoteInput.trim(),
      created_at: new Date().toISOString(),
      created_by: null,
    };

    // Optimistic update
    setSelectedLead((prev) => prev ? { ...prev, lead_notes: [optimisticNote, ...prev.lead_notes] } : null);
    setLeads((prev) =>
      prev.map((l) =>
        l.id === selectedLead.id
          ? { ...l, lead_notes: [optimisticNote, ...l.lead_notes] }
          : l
      )
    );
    setNewNoteInput("");

    startTransition(async () => {
      const result = await addLeadNote(selectedLead.id, optimisticNote.note);
      if (!result.success) {
        // Revert on failure
        setSelectedLead((prev) =>
          prev ? { ...prev, lead_notes: prev.lead_notes.filter((n) => n.id !== optimisticNote.id) } : null
        );
        alert(`خطأ: ${result.error}`);
      }
    });

    setIsAddingNote(false);
  };

  const handleConfirmStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusModalLead) return;
    setIsUpdatingStatus(true);

    // Optimistic update
    setLeads((prev) =>
      prev.map((l) => (l.id === statusModalLead.id ? { ...l, status: targetStatus } : l))
    );
    if (selectedLead?.id === statusModalLead.id) {
      setSelectedLead((prev) => prev ? { ...prev, status: targetStatus } : null);
    }
    setStatusModalLead(null);

    startTransition(async () => {
      const result = await updateLeadStatus(statusModalLead.id, targetStatus, statusNoteText);
      if (!result.success) {
        // Revert
        setLeads((prev) =>
          prev.map((l) => (l.id === statusModalLead.id ? { ...l, status: statusModalLead.status } : l))
        );
        alert(`خطأ في تحديث الحالة: ${result.error}`);
      }
    });

    setStatusNoteText("");
    setIsUpdatingStatus(false);
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Customer Name", "Phone", "Car/Asset", "Type", "Status", "Created At"];
    const rows = filteredLeads.map((l) => [
      l.id,
      l.customer?.name || "",
      l.customer?.phone || "",
      l.car?.title || "",
      l.lead_type,
      l.status,
      l.created_at,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `El_Omda_Leads_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const kanbanStatuses: LeadStatus[] = ["new", "contacted", "qualified", "negotiating", "won", "cancelled"];

  return (
    <>
      {/* ── Header & View Mode Switcher ────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm text-right">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60">
              <ClipboardList className="w-5 h-5" />
            </div>
            إدارة الطلبات وخط الصفقات 📑
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            تجميع بيانات العملاء، إدارة الملاحظات، ومتابعة pipeline الصفقات
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors"
          >
            <Download className="w-4 h-4 text-amber-600" />
            <span>تصدير CSV</span>
          </button>

          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                viewMode === "table" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <TableIcon className="w-3.5 h-3.5 text-amber-600" />
              <span>جدول مفصل</span>
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                viewMode === "kanban" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Kanban className="w-3.5 h-3.5 text-amber-600" />
              <span>Kanban</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Search & Multi-Filters Toolbar ─────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm" dir="rtl">
        <div className="relative sm:col-span-2">
          <Search className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="بحث باسم العميل، الجوال، السيارة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-amber-500 transition-all"
          />
        </div>

        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-amber-500"
          >
            <option value="all">جميع الأنواع</option>
            <option value="car_inquiry">سيارات فاخرة 🏎️</option>
            <option value="general">استفسار عام</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-amber-500"
          >
            <option value="all">جميع الحالات</option>
            {Object.entries(statusPipelineConfig).map(([k, v]) => (
              <option key={k} value={k}>{v.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── View 1: Detailed Table View ───────────────────────── */}
      {viewMode === "table" ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          {filteredLeads.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">لا توجد طلبات تطابق بحثك</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm" dir="rtl">
                <thead className="bg-slate-50/80 border-b border-slate-200/80">
                  <tr>
                    <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase">رقم الطلب</th>
                    <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase">المنتج / الأصل</th>
                    <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase">العميل</th>
                    <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase">النوع</th>
                    <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase">مرحلة الصفقة</th>
                    <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeads.map((lead) => {
                    const stageInfo = statusPipelineConfig[lead.status] || statusPipelineConfig.new;
                    const carImage =
                      lead.car?.car_images?.find((img) => img.is_primary)?.image_url ||
                      lead.car?.car_images?.[0]?.image_url ||
                      null;

                    return (
                      <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-4 font-mono font-extrabold text-amber-700 text-xs">
                          {lead.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {carImage ? (
                              <img
                                src={carImage}
                                alt={lead.car?.title || ""}
                                className="w-12 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-10 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center shrink-0">
                                <Car className="w-5 h-5 text-slate-300" />
                              </div>
                            )}
                            <div>
                              <span className="font-extrabold text-slate-900 block text-xs">
                                {lead.car?.title || "استفسار عام"}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {leadTypeLabels[lead.lead_type] || lead.lead_type}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div>
                            <span className="font-extrabold text-slate-900 block text-xs">
                              {lead.customer?.name || "—"}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {lead.customer?.phone || "—"}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-[11px] font-bold text-slate-500">
                            {leadTypeLabels[lead.lead_type] || lead.lead_type}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => {
                              setStatusModalLead(lead);
                              setTargetStatus(lead.status as LeadStatus);
                            }}
                            className={`px-3 py-1 rounded-full text-xs font-extrabold border transition-all hover:scale-105 ${stageInfo.badgeClass}`}
                          >
                            {stageInfo.title}
                          </button>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-extrabold text-xs transition-colors border border-amber-200/60"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>فتح بروفايل العميل</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* ── View 2: Kanban Board View ───────────────────────── */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {kanbanStatuses.map((stageKey) => {
            const config = statusPipelineConfig[stageKey];
            const stageLeads = filteredLeads.filter((l) => l.status === stageKey);

            return (
              <div key={stageKey} className="bg-slate-100/70 p-3.5 rounded-2xl border border-slate-200 space-y-3 min-w-[240px]">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${config.barColor}`} />
                    <h3 className="font-extrabold text-slate-800 text-xs">{config.title}</h3>
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-white text-slate-600 border border-slate-200">
                    {stageLeads.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className="bg-white p-4 rounded-xl border border-slate-200/80 hover:border-amber-400 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-extrabold text-amber-700">
                          {lead.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {leadTypeLabels[lead.lead_type] || lead.lead_type}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-slate-900 text-xs truncate">
                          {lead.car?.title || "استفسار عام"}
                        </h4>
                        <span className="font-bold text-slate-700 text-xs block mt-1 truncate">
                          {lead.customer?.name || "—"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Slide-over Panel: Full Customer 360° Data Sheet Drawer ── */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm" dir="rtl">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl border-r border-slate-200 overflow-y-auto flex flex-col justify-between text-right font-sans">
            <div>
              <div className="p-6 bg-[#111111] text-white space-y-4 border-b border-neutral-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/30">
                      {selectedLead.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className={`text-xs font-black px-2 py-0.5 rounded border ${statusPipelineConfig[selectedLead.status]?.badgeClass}`}>
                      {statusPipelineConfig[selectedLead.status]?.title || selectedLead.status}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedLead(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-neutral-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-extrabold text-white">{selectedLead.customer?.name || "عميل مجهول"}</h2>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">{selectedLead.customer?.phone || "—"}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedLead.customer?.phone && (
                      <>
                        <a
                          href={`https://wa.me/${selectedLead.customer.phone.replace(/[^\d]/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
                        >
                          <MessageSquare className="w-4 h-4" />
                          واتساب
                        </a>
                        <a
                          href={`tel:${selectedLead.customer.phone}`}
                          className="p-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Car / Asset Card */}
                {selectedLead.car && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-4">
                    {selectedLead.car.car_images?.[0]?.image_url ? (
                      <img
                        src={selectedLead.car.car_images[0].image_url}
                        alt={selectedLead.car.title}
                        className="w-16 h-14 object-cover rounded-xl border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-14 rounded-xl border border-slate-200 bg-slate-100 flex items-center justify-center shrink-0">
                        <Car className="w-6 h-6 text-slate-300" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 block">
                        {leadTypeLabels[selectedLead.lead_type] || selectedLead.lead_type}
                      </span>
                      <h3 className="font-extrabold text-slate-900 text-sm truncate">{selectedLead.car.title}</h3>
                    </div>
                  </div>
                )}

                {/* Lead Notes Log */}
                <div className="space-y-4">
                  <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
                    سجل الملاحظات ({selectedLead.lead_notes.length})
                  </h3>

                  <form onSubmit={handleAddNote} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="إضافة ملاحظة جديدة أو تسجيل نتيجة مكالمة..."
                      value={newNoteInput}
                      onChange={(e) => setNewNoteInput(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="submit"
                      disabled={isAddingNote}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 disabled:opacity-60"
                    >
                      <Send className="w-3.5 h-3.5" />
                      إضافة
                    </button>
                  </form>

                  <div className="space-y-3 pt-2">
                    {selectedLead.lead_notes.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">لا توجد ملاحظات بعد</p>
                    ) : (
                      selectedLead.lead_notes.map((note) => (
                        <div key={note.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-amber-700">{note.created_by || "فريق أولاد العم"}</span>
                            <span className="font-mono text-slate-400">
                              {new Date(note.created_at).toLocaleString("ar-EG", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-800 font-medium leading-relaxed">{note.note}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  setStatusModalLead(selectedLead);
                  setTargetStatus(selectedLead.status as LeadStatus);
                }}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs"
              >
                تغيير الحالة
              </button>
              <button
                onClick={() => setSelectedLead(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Status Switcher Modal ── */}
      {statusModalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" dir="rtl">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                تغيير حالة الصفقة
              </h3>
              <button onClick={() => setStatusModalLead(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmStatusChange} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">المرحلة الجديدة *</label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as LeadStatus)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                >
                  {Object.entries(statusPipelineConfig).map(([k, v]) => (
                    <option key={k} value={k}>{v.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">ملاحظة توثيقية (اختياري)</label>
                <textarea
                  rows={3}
                  placeholder="مثال: تم التواصل مع العميل وحددنا موعد معاينة..."
                  value={statusNoteText}
                  onChange={(e) => setStatusNoteText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingStatus}
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm rounded-xl shadow-md disabled:opacity-60"
                >
                  {isUpdatingStatus ? "جاري التحديث..." : "تحديث الحالة"}
                </button>
                <button
                  type="button"
                  onClick={() => setStatusModalLead(null)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 font-bold text-sm rounded-xl"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
