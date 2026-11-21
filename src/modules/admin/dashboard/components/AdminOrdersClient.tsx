"use client";

import { useState, useTransition, useRef } from "react";
import {
  ClipboardList,
  Search,
  Phone,
  MessageSquare,
  Eye,
  X,
  Download,
  Kanban,
  Table as TableIcon,
  Send,
  Sparkles,
  Car,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Clock,
  Filter,
  ChevronDown,
  SortAsc,
  SortDesc,
  Calendar,
  Tag,
  FileText,
  ArrowRight,
  Zap,
} from "lucide-react";
import { AdminPagination } from "@/modules/admin/components/AdminPagination";
import { updateLeadStatus, addLeadNote } from "@/modules/admin/dashboard/actions/leads";
import type { AdminLead } from "@/modules/admin/dashboard/actions/leads";
import type { LeadStatus } from "@/modules/shared/types/database.types";

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmtDate(iso: string): string {
  const d = new Date(iso);
  const yr = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const dy = String(d.getDate()).padStart(2, "0");
  const hr = String(d.getHours()).padStart(2, "0");
  const mn = String(d.getMinutes()).padStart(2, "0");
  return `${yr}/${mo}/${dy} • ${hr}:${mn}`;
}

function ageBadge(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / 86_400_000);
  if (days === 0) return "جديد اليوم";
  if (days === 1) return "منذ يوم";
  if (days < 7) return `منذ ${days} أيام`;
  if (days < 30) return `منذ ${Math.floor(days / 7)} أسابيع`;
  return `منذ ${Math.floor(days / 30)} شهر`;
}

function fmtPrice(n: number | null | undefined): string {
  if (!n) return "—";
  return new Intl.NumberFormat("en-US").format(n) + " ج.م";
}

// ─── Status config ───────────────────────────────────────────────────────────

type StageKey = LeadStatus | string;

const STATUS_CFG: Record<StageKey, {
  title: string;
  short: string;
  badge: string;
  bar: string;
  dot: string;
  icon: string;
}> = {
  new: {
    title: "جديد (New Lead)",
    short: "جديد",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    bar: "bg-blue-500",
    dot: "bg-blue-500",
    icon: "🔵",
  },
  contacted: {
    title: "قيد التواصل / المعاينة",
    short: "تواصل",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    bar: "bg-amber-500",
    dot: "bg-amber-400",
    icon: "📞",
  },
  qualified: {
    title: "مؤهل للشراء",
    short: "مؤهل",
    badge: "bg-orange-50 text-orange-700 border-orange-200",
    bar: "bg-orange-500",
    dot: "bg-orange-400",
    icon: "✅",
  },
  following_up: {
    title: "جاري المتابعة",
    short: "متابعة",
    badge: "bg-purple-50 text-purple-700 border-purple-200",
    bar: "bg-purple-500",
    dot: "bg-purple-400",
    icon: "🔄",
  },
  negotiating: {
    title: "تفاوض / تقديم عرض",
    short: "تفاوض",
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
    bar: "bg-indigo-500",
    dot: "bg-indigo-400",
    icon: "🤝",
  },
  won: {
    title: "تم التعاقد ✓",
    short: "تعاقد",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    bar: "bg-emerald-500",
    dot: "bg-emerald-500",
    icon: "🏆",
  },
  lost: {
    title: "خسارة",
    short: "خسارة",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    bar: "bg-rose-500",
    dot: "bg-rose-400",
    icon: "❌",
  },
  cancelled: {
    title: "ملغي / غير مهتم",
    short: "ملغي",
    badge: "bg-slate-100 text-slate-500 border-slate-200",
    bar: "bg-slate-400",
    dot: "bg-slate-400",
    icon: "🚫",
  },
};

const LEAD_TYPE_LABELS: Record<string, string> = {
  car_inquiry: "🏎️ استفسار سيارة",
  protection_film: "🛡️ فيلم حماية",
  general: "💬 استفسار عام",
  scooter_inquiry: "🛵 سكوتر",
};

const QUICK_NOTE_CHIPS = [
  "تم التواصل هاتفياً ✓",
  "تم تحديد موعد معاينة 📅",
  "العميل طلب عرض سعر 💰",
  "لا يرد - إعادة المحاولة 🔁",
  "العميل مهتم جداً 🔥",
  "يحتاج وقت للتفكير ⏳",
  "تمت المعاينة بنجاح ✅",
];

const KANBAN_COLS: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "following_up",
  "negotiating",
  "won",
  "cancelled",
];

// ─── Toast ────────────────────────────────────────────────────────────────────

interface Toast {
  id: number;
  msg: string;
  type: "success" | "error";
}

// ─── Component ────────────────────────────────────────────────────────────────

interface AdminOrdersClientProps {
  initialLeads: AdminLead[];
}

export function AdminOrdersClient({ initialLeads }: AdminOrdersClientProps) {
  const [leads, setLeads] = useState<AdminLead[]>(initialLeads);
  const [isPending, startTransition] = useTransition();
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  // Drawer state
  const [selectedLead, setSelectedLead] = useState<AdminLead | null>(null);
  const [newNoteInput, setNewNoteInput] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Status change state (inline in drawer)
  const [targetStatus, setTargetStatus] = useState<LeadStatus>("contacted");
  const [statusNote, setStatusNote] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // ── Toast helpers ──────────────────────────────────────────────────────────
  function pushToast(msg: string, type: "success" | "error" = "success") {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }

  // ── Derived / filtered leads ───────────────────────────────────────────────
  const filtered = leads
    .filter((l) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        l.customer?.name?.toLowerCase().includes(q) ||
        l.customer?.phone?.toLowerCase().includes(q) ||
        l.car?.title?.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q);
      const matchType = typeFilter === "all" || l.lead_type === typeFilter;
      const matchStatus = statusFilter === "all" || l.status === statusFilter;
      return matchSearch && matchType && matchStatus;
    })
    .sort((a, b) => {
      const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sortOrder === "desc" ? -diff : diff;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedLeads = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // ── KPI counts ────────────────────────────────────────────────────────────
  const kpiTotal = leads.length;
  const kpiNew = leads.filter((l) => l.status === "new").length;
  const kpiActive = leads.filter((l) =>
    ["contacted", "following_up", "negotiating", "qualified"].includes(l.status)
  ).length;
  const kpiWon = leads.filter((l) => l.status === "won");
  const kpiWonCount = kpiWon.length;
  const kpiWonValue = kpiWon.reduce((s, l) => s + (l.car?.price || 0), 0);

  // ── KPI filter click ──────────────────────────────────────────────────────
  function filterByStatus(s: string) {
    setStatusFilter((prev) => (prev === s ? "all" : s));
    setCurrentPage(1);
  }

  // ── Handlers ──────────────────────────────────────────────────────────────
  function openDrawer(lead: AdminLead) {
    setSelectedLead(lead);
    setTargetStatus(lead.status as LeadStatus);
    setStatusNote("");
    setNewNoteInput("");
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newNoteInput.trim() || !selectedLead) return;
    setIsAddingNote(true);

    const tempNote = {
      id: `temp-${Date.now()}`,
      note: newNoteInput.trim(),
      created_at: new Date().toISOString(),
      created_by: null,
    };

    // Optimistic update
    setSelectedLead((prev) =>
      prev ? { ...prev, lead_notes: [tempNote, ...prev.lead_notes] } : null
    );
    setLeads((prev) =>
      prev.map((l) =>
        l.id === selectedLead.id ? { ...l, lead_notes: [tempNote, ...l.lead_notes] } : l
      )
    );
    setNewNoteInput("");
    setIsAddingNote(false);

    startTransition(async () => {
      const res = await addLeadNote(selectedLead.id, tempNote.note);
      if (!res.success) {
        setSelectedLead((prev) =>
          prev ? { ...prev, lead_notes: prev.lead_notes.filter((n) => n.id !== tempNote.id) } : null
        );
        setLeads((prev) =>
          prev.map((l) =>
            l.id === selectedLead.id
              ? { ...l, lead_notes: l.lead_notes.filter((n) => n.id !== tempNote.id) }
              : l
          )
        );
        pushToast(`خطأ: ${res.error}`, "error");
      } else {
        pushToast("تم إضافة الملاحظة ✓");
      }
    });
  }

  async function handleStatusChange(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedLead) return;
    setIsUpdatingStatus(true);

    const oldStatus = selectedLead.status;

    // Optimistic update
    setLeads((prev) =>
      prev.map((l) => (l.id === selectedLead.id ? { ...l, status: targetStatus } : l))
    );
    setSelectedLead((prev) => (prev ? { ...prev, status: targetStatus } : null));

    setIsUpdatingStatus(false);

    startTransition(async () => {
      const res = await updateLeadStatus(selectedLead.id, targetStatus, statusNote || undefined);
      if (!res.success) {
        // Revert
        setLeads((prev) =>
          prev.map((l) => (l.id === selectedLead.id ? { ...l, status: oldStatus } : l))
        );
        setSelectedLead((prev) => (prev ? { ...prev, status: oldStatus } : null));
        pushToast(`خطأ: ${res.error}`, "error");
      } else {
        const histEntry = {
          id: `h-${Date.now()}`,
          old_status: oldStatus,
          new_status: targetStatus,
          notes: statusNote || null,
          created_at: new Date().toISOString(),
        };
        setSelectedLead((prev) =>
          prev
            ? {
                ...prev,
                lead_status_history: [...(prev.lead_status_history || []), histEntry],
              }
            : null
        );
        setStatusNote("");
        const wonMsg =
          targetStatus === "won" && selectedLead.car_id
            ? " 🚗 تم تحديث حالة السيارة إلى «مباعة» تلقائياً."
            : "";
        pushToast(
          `تم تحديث الحالة إلى «${STATUS_CFG[targetStatus]?.short}» ✓${wonMsg}`
        );
      }
    });
  }

  function handleExportCSV() {
    const headers = ["ID", "تاريخ الطلب", "اسم العميل", "الجوال", "السيارة", "النوع", "الحالة"];
    const rows = filtered.map((l) => [
      l.id.slice(0, 8).toUpperCase(),
      fmtDate(l.created_at),
      l.customer?.name || "",
      l.customer?.phone || "",
      l.car?.title || "",
      LEAD_TYPE_LABELS[l.lead_type] || l.lead_type,
      STATUS_CFG[l.status]?.short || l.status,
    ]);
    const csv =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", `Welad_El3am_Leads_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Toast Notifications ─────────────────────────────────────── */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-max max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-5 py-3 rounded-xl shadow-xl font-bold text-sm text-white animate-in fade-in slide-in-from-top-4 duration-300 ${
              t.type === "success" ? "bg-emerald-600" : "bg-rose-600"
            }`}
          >
            {t.msg}
          </div>
        ))}
      </div>

      {/* ── Page Header + View Toggle ────────────────────────────────── */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm"
        dir="rtl"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60">
              <ClipboardList className="w-5 h-5" />
            </div>
            إدارة الطلبات وخط الصفقات 📑
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {kpiTotal} طلب إجمالي • {kpiNew} جديد يحتاج تواصل • {kpiWonCount} صفقة مغلقة
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors"
          >
            <Download className="w-4 h-4 text-amber-600" />
            تصدير CSV
          </button>

          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <TableIcon className="w-3.5 h-3.5 text-amber-600" />
              جدول
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                viewMode === "kanban"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Kanban className="w-3.5 h-3.5 text-amber-600" />
              Kanban
            </button>
          </div>
        </div>
      </div>

      {/* ── Executive KPI Strip ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" dir="rtl">
        {/* Total */}
        <button
          onClick={() => { setStatusFilter("all"); setSearch(""); setTypeFilter("all"); }}
          className={`bg-white rounded-2xl border p-5 text-right transition-all hover:shadow-md hover:-translate-y-0.5 ${
            statusFilter === "all" && !search && typeFilter === "all"
              ? "border-slate-900 shadow-md"
              : "border-slate-200/80 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-slate-600" />
            </div>
            <span className="text-3xl font-black text-slate-900">{kpiTotal}</span>
          </div>
          <p className="text-xs font-bold text-slate-600">إجمالي الطلبات</p>
        </button>

        {/* New */}
        <button
          onClick={() => filterByStatus("new")}
          className={`bg-white rounded-2xl border p-5 text-right transition-all hover:shadow-md hover:-translate-y-0.5 ${
            statusFilter === "new"
              ? "border-blue-500 shadow-md bg-blue-50/40"
              : "border-slate-200/80 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-black text-blue-700">{kpiNew}</span>
              {kpiNew > 0 && (
                <span className="mb-1 text-[10px] font-black px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 animate-pulse">
                  جديد!
                </span>
              )}
            </div>
          </div>
          <p className="text-xs font-bold text-slate-600">طلبات جديدة بحاجة تواصل</p>
        </button>

        {/* Active */}
        <button
          onClick={() => filterByStatus("contacted")}
          className={`bg-white rounded-2xl border p-5 text-right transition-all hover:shadow-md hover:-translate-y-0.5 ${
            ["contacted", "qualified", "following_up", "negotiating"].includes(statusFilter)
              ? "border-amber-500 shadow-md bg-amber-50/40"
              : "border-slate-200/80 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-3xl font-black text-amber-700">{kpiActive}</span>
          </div>
          <p className="text-xs font-bold text-slate-600">قيد التواصل والتفاوض</p>
        </button>

        {/* Won */}
        <button
          onClick={() => filterByStatus("won")}
          className={`bg-white rounded-2xl border p-5 text-right transition-all hover:shadow-md hover:-translate-y-0.5 ${
            statusFilter === "won"
              ? "border-emerald-500 shadow-md bg-emerald-50/40"
              : "border-slate-200/80 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-3xl font-black text-emerald-700">{kpiWonCount}</span>
          </div>
          <p className="text-xs font-bold text-slate-600">صفقات مغلقة</p>
          {kpiWonValue > 0 && (
            <p className="text-[11px] font-mono text-emerald-600 mt-0.5">
              {fmtPrice(kpiWonValue)}
            </p>
          )}
        </button>
      </div>

      {/* ── Search + Filter Bar ─────────────────────────────────────── */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm"
        dir="rtl"
      >
        {/* Search */}
        <div className="relative sm:col-span-2 lg:col-span-2">
          <Search className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="بحث: اسم العميل، الجوال، السيارة، رقم الطلب..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-amber-500 transition-all"
          />
        </div>

        {/* Type filter */}
        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-amber-500 appearance-none"
          >
            <option value="all">جميع الأنواع</option>
            {Object.entries(LEAD_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <ChevronDown className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>

        {/* Status filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-amber-500 appearance-none"
          >
            <option value="all">جميع الحالات</option>
            {Object.entries(STATUS_CFG).map(([k, v]) => (
              <option key={k} value={k}>{v.icon} {v.short}</option>
            ))}
          </select>
          <ChevronDown className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>

        {/* Sort */}
        <div>
          <button
            onClick={() => {
              setSortOrder((o) => (o === "desc" ? "asc" : "desc"));
              setCurrentPage(1);
            }}
            className="w-full flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 font-bold hover:bg-slate-100 transition-all"
          >
            {sortOrder === "desc" ? (
              <><SortDesc className="w-4 h-4 text-amber-600" /> الأحدث أولاً</>
            ) : (
              <><SortAsc className="w-4 h-4 text-amber-600" /> الأقدم أولاً</>
            )}
          </button>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between px-1" dir="rtl">
        <p className="text-xs text-slate-500 font-medium">
          عرض <span className="font-black text-slate-800">{filtered.length}</span> من {leads.length} طلب
        </p>
        {(search || statusFilter !== "all" || typeFilter !== "all") && (
          <button
            onClick={() => { setSearch(""); setStatusFilter("all"); setTypeFilter("all"); }}
            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            إلغاء الفلترة
          </button>
        )}
      </div>

      {/* ── View: Table ──────────────────────────────────────────────── */}
      {viewMode === "table" ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm" dir="rtl">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">لا توجد طلبات تطابق بحثك</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm" dir="rtl">
                <thead className="bg-slate-50/80 border-b border-slate-200/80">
                  <tr>
                    <th className="px-4 py-4 text-xs font-black text-slate-500 uppercase whitespace-nowrap">رقم الطلب</th>
                    <th className="px-4 py-4 text-xs font-black text-slate-500 uppercase whitespace-nowrap">تاريخ الطلب</th>
                    <th className="px-4 py-4 text-xs font-black text-slate-500 uppercase whitespace-nowrap">المنتج</th>
                    <th className="px-4 py-4 text-xs font-black text-slate-500 uppercase whitespace-nowrap">العميل</th>
                    <th className="px-4 py-4 text-xs font-black text-slate-500 uppercase whitespace-nowrap">مرحلة الصفقة</th>
                    <th className="px-4 py-4 text-xs font-black text-slate-500 uppercase text-center whitespace-nowrap">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedLeads.map((lead) => {
                    const stage = STATUS_CFG[lead.status] || STATUS_CFG.new;
                    const img =
                      lead.car?.car_images?.find((i) => i.is_primary)?.image_url ||
                      lead.car?.car_images?.[0]?.image_url ||
                      null;
                    return (
                      <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors group">
                        <td className="px-4 py-4">
                          <div>
                            <span className="font-mono font-extrabold text-amber-700 text-xs block">
                              {lead.id.slice(0, 8).toUpperCase()}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5 block">
                              {ageBadge(lead.created_at)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono whitespace-nowrap">
                            <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                            {fmtDate(lead.created_at)}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            {img ? (
                              <img
                                src={img}
                                alt={lead.car?.title || ""}
                                className="w-12 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-10 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center shrink-0">
                                <Car className="w-5 h-5 text-slate-300" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <span className="font-extrabold text-slate-900 block text-xs truncate max-w-[180px]">
                                {lead.car?.title || "استفسار عام"}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {LEAD_TYPE_LABELS[lead.lead_type] || lead.lead_type}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <span className="font-extrabold text-slate-900 block text-xs">
                              {lead.customer?.name || "—"}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] text-slate-400 font-mono">
                                {lead.customer?.phone || "—"}
                              </span>
                              {lead.customer?.phone && (
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <a
                                    href={`https://wa.me/${lead.customer.phone.replace(/[^\d]/g, "").replace(/^0/, "20")}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                    title="واتساب"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MessageSquare className="w-3 h-3" />
                                  </a>
                                  <a
                                    href={`tel:${lead.customer.phone}`}
                                    className="p-1 rounded-md bg-amber-50 text-amber-600 hover:bg-amber-100"
                                    title="اتصال"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Phone className="w-3 h-3" />
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => openDrawer(lead)}
                            className={`px-3 py-1.5 rounded-full text-xs font-extrabold border transition-all hover:scale-105 ${stage.badge}`}
                          >
                            {stage.icon} {stage.short}
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {lead.customer?.phone && (
                              <a
                                href={`https://wa.me/${lead.customer.phone.replace(/[^\d]/g, "").replace(/^0/, "20")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                title="واتساب"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {lead.customer?.phone && (
                              <a
                                href={`tel:${lead.customer.phone}`}
                                className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                                title="اتصال"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              onClick={() => openDrawer(lead)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-700 text-white font-extrabold text-xs transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              فتح
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Pagination */}
          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={pageSize}
            onPageChange={(p) => setCurrentPage(p)}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[10, 20, 50]}
            itemName="طلب"
            className="border-t border-t-slate-100 rounded-t-none"
          />
        </div>
      ) : (
        /* ── View: Kanban Board ──────────────────────────────────────── */
        <div className="flex gap-4 overflow-x-auto pb-4" dir="rtl">
          {KANBAN_COLS.map((stageKey) => {
            const cfg = STATUS_CFG[stageKey];
            const colLeads = filtered.filter((l) => l.status === stageKey);
            return (
              <div
                key={stageKey}
                className="flex-shrink-0 w-64 bg-slate-100/70 p-3.5 rounded-2xl border border-slate-200 space-y-3"
              >
                {/* Column header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${cfg.bar}`} />
                    <h3 className="font-extrabold text-slate-800 text-xs">{cfg.short}</h3>
                  </div>
                  <span
                    className={`text-[11px] font-mono font-black px-2 py-0.5 rounded-md border ${
                      colLeads.length > 0 && stageKey === "new"
                        ? "bg-blue-100 text-blue-700 border-blue-200"
                        : "bg-white text-slate-600 border-slate-200"
                    }`}
                  >
                    {colLeads.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-3">
                  {colLeads.length === 0 && (
                    <p className="text-[11px] text-slate-400 text-center py-4">لا توجد طلبات</p>
                  )}
                  {colLeads.map((lead) => {
                    const img =
                      lead.car?.car_images?.find((i) => i.is_primary)?.image_url ||
                      lead.car?.car_images?.[0]?.image_url ||
                      null;
                    const latestNote = lead.lead_notes[0];
                    return (
                      <div
                        key={lead.id}
                        onClick={() => openDrawer(lead)}
                        className="bg-white p-4 rounded-xl border border-slate-200/80 hover:border-amber-400 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-2.5"
                      >
                        {/* ID + date */}
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-extrabold text-amber-700">
                            {lead.id.slice(0, 8).toUpperCase()}
                          </span>
                          <span className="text-[10px] text-slate-400">{ageBadge(lead.created_at)}</span>
                        </div>

                        {/* Car image + title */}
                        <div className="flex items-center gap-2.5">
                          {img ? (
                            <img
                              src={img}
                              alt={lead.car?.title || ""}
                              className="w-10 h-9 object-cover rounded-lg border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                              <Car className="w-4 h-4 text-slate-300" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-slate-900 text-xs truncate">
                              {lead.car?.title || "استفسار عام"}
                            </h4>
                            <span className="text-[10px] text-slate-500 font-bold block truncate">
                              {lead.customer?.name || "—"}
                            </span>
                          </div>
                        </div>

                        {/* Phone */}
                        {lead.customer?.phone && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-slate-400">
                              {lead.customer.phone}
                            </span>
                            <div className="flex gap-1">
                              <a
                                href={`https://wa.me/${lead.customer.phone.replace(/[^\d]/g, "").replace(/^0/, "20")}`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="p-1 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                              >
                                <MessageSquare className="w-2.5 h-2.5" />
                              </a>
                              <a
                                href={`tel:${lead.customer.phone}`}
                                onClick={(e) => e.stopPropagation()}
                                className="p-1 rounded bg-amber-50 text-amber-600 hover:bg-amber-100"
                              >
                                <Phone className="w-2.5 h-2.5" />
                              </a>
                            </div>
                          </div>
                        )}

                        {/* Latest note preview */}
                        {latestNote && (
                          <p className="text-[10px] text-slate-500 bg-slate-50 rounded-lg p-2 leading-relaxed line-clamp-2 border border-slate-100">
                            💬 {latestNote.note}
                          </p>
                        )}

                        {/* Quick advance arrow */}
                        <div className="flex justify-end">
                          <button
                            onClick={(e) => { e.stopPropagation(); openDrawer(lead); }}
                            className="flex items-center gap-1 text-[10px] font-black text-amber-600 hover:text-amber-700"
                          >
                            فتح <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Lead Drawer (Slide-over) ──────────────────────────────────── */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-start bg-black/40 backdrop-blur-sm" dir="rtl">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl border-l border-slate-200 overflow-y-auto flex flex-col text-right font-sans">
            {/* Drawer header */}
            <div className="p-6 bg-[#0d0d0d] text-white space-y-4 border-b border-neutral-800 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/30">
                    #{selectedLead.id.slice(0, 8).toUpperCase()}
                  </span>
                  <span
                    className={`text-xs font-black px-2.5 py-1 rounded-full border ${
                      STATUS_CFG[selectedLead.status]?.badge || ""
                    }`}
                  >
                    {STATUS_CFG[selectedLead.status]?.icon}{" "}
                    {STATUS_CFG[selectedLead.status]?.title || selectedLead.status}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {fmtDate(selectedLead.created_at)}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-neutral-800 transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-white">
                    {selectedLead.customer?.name || "عميل مجهول"}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">
                    {selectedLead.customer?.phone || "—"}
                  </p>
                  {selectedLead.customer?.email && (
                    <p className="text-xs text-slate-500 mt-0.5">{selectedLead.customer.email}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {selectedLead.customer?.phone && (
                    <>
                      <a
                        href={`https://wa.me/${selectedLead.customer.phone.replace(/[^\d]/g, "").replace(/^0/, "20")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
                      >
                        <MessageSquare className="w-4 h-4" />
                        واتساب
                      </a>
                      <a
                        href={`tel:${selectedLead.customer.phone}`}
                        className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Drawer body */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">

              {/* Car card */}
              {selectedLead.car && (
                <div className="bg-gradient-to-l from-slate-50 to-white p-4 rounded-2xl border border-slate-200 flex items-center gap-4">
                  {selectedLead.car.car_images?.[0]?.image_url ? (
                    <img
                      src={selectedLead.car.car_images.find((i) => i.is_primary)?.image_url || selectedLead.car.car_images[0].image_url}
                      alt={selectedLead.car.title}
                      className="w-20 h-16 object-cover rounded-xl border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-16 rounded-xl border border-slate-200 bg-slate-100 flex items-center justify-center shrink-0">
                      <Car className="w-7 h-7 text-slate-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 block mb-1">
                      {LEAD_TYPE_LABELS[selectedLead.lead_type] || selectedLead.lead_type}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-sm truncate">
                      {selectedLead.car.title}
                    </h3>
                    {selectedLead.car.price && (
                      <span className="text-xs font-black text-emerald-700 mt-1 block">
                        {fmtPrice(selectedLead.car.price)}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* ── Status Changer ─────────────────────────────────── */}
              <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4 space-y-3">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  تغيير مرحلة الصفقة
                </h3>

                <form onSubmit={handleStatusChange} className="space-y-3">
                  {/* Stage pills */}
                  <div className="flex flex-wrap gap-2">
                    {(Object.entries(STATUS_CFG) as [LeadStatus, typeof STATUS_CFG[string]][]).map(
                      ([k, v]) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => setTargetStatus(k)}
                          className={`px-3 py-1.5 rounded-full text-xs font-extrabold border transition-all ${
                            targetStatus === k
                              ? `${v.badge} ring-2 ring-offset-1 ring-amber-400 scale-105`
                              : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {v.icon} {v.short}
                        </button>
                      )
                    )}
                  </div>

                  {/* Optional note */}
                  <input
                    type="text"
                    placeholder="ملاحظة توثيقية (اختياري)..."
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                  />

                  <button
                    type="submit"
                    disabled={isUpdatingStatus || isPending || targetStatus === selectedLead.status}
                    className="w-full py-2.5 bg-gradient-to-l from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-slate-950 font-black text-sm rounded-xl shadow-md disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    {isUpdatingStatus ? "جاري التحديث..." : `تحديث إلى «${STATUS_CFG[targetStatus]?.short}»`}
                  </button>
                </form>
              </div>

              {/* ── Add Note + Quick Chips ────────────────────────── */}
              <div className="space-y-3">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                  <FileText className="w-4 h-4 text-slate-500" />
                  إضافة ملاحظة ({selectedLead.lead_notes.length})
                </h3>

                {/* Quick chips */}
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_NOTE_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setNewNoteInput(chip)}
                      className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-700 border border-slate-200 hover:border-amber-200 transition-all"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                {/* Note input */}
                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="اكتب ملاحظة أو اختر من القائمة أعلاه..."
                    value={newNoteInput}
                    onChange={(e) => setNewNoteInput(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    disabled={isAddingNote || !newNoteInput.trim()}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 disabled:opacity-60"
                  >
                    <Send className="w-3.5 h-3.5" />
                    إضافة
                  </button>
                </form>
              </div>

              {/* ── Unified Timeline (History + Notes) ───────────── */}
              <div className="space-y-3">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  السجل الكامل والجدول الزمني
                </h3>

                {/* Build merged timeline */}
                {(() => {
                  type TimelineItem =
                    | { kind: "note"; id: string; note: string; created_at: string; created_by: string | null }
                    | { kind: "status"; id: string; old_status: string | null; new_status: string; notes: string | null; created_at: string };

                  const items: TimelineItem[] = [
                    ...selectedLead.lead_notes.map((n) => ({ kind: "note" as const, ...n })),
                    ...(selectedLead.lead_status_history || []).map((h) => ({
                      kind: "status" as const,
                      ...h,
                    })),
                  ].sort(
                    (a, b) =>
                      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                  );

                  if (items.length === 0) {
                    return (
                      <p className="text-xs text-slate-400 text-center py-4">
                        لا توجد سجلات بعد
                      </p>
                    );
                  }

                  return (
                    <div className="space-y-2.5 relative before:absolute before:right-5 before:top-0 before:bottom-0 before:w-px before:bg-slate-100">
                      {items.map((item) => {
                        if (item.kind === "note") {
                          return (
                            <div key={item.id} className="flex gap-3 items-start pr-3">
                              <div className="w-4 h-4 rounded-full bg-slate-200 border-2 border-white shrink-0 mt-1 ring-1 ring-slate-200" />
                              <div className="flex-1 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] font-black text-amber-700">
                                    {item.created_by || "فريق أولاد العم"}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-400">
                                    {fmtDate(item.created_at)}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-800 font-medium leading-relaxed">
                                  💬 {item.note}
                                </p>
                              </div>
                            </div>
                          );
                        } else {
                          const toStage = STATUS_CFG[item.new_status];
                          const fromStage = item.old_status ? STATUS_CFG[item.old_status] : null;
                          return (
                            <div key={item.id} className="flex gap-3 items-start pr-3">
                              <div
                                className={`w-4 h-4 rounded-full ${toStage?.dot || "bg-slate-300"} shrink-0 mt-1 border-2 border-white ring-1 ring-slate-200`}
                              />
                              <div className="flex-1 p-3 rounded-xl bg-gradient-to-l from-slate-50/50 to-white border border-slate-100">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    {fromStage && (
                                      <>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${fromStage.badge}`}>
                                          {fromStage.icon} {fromStage.short}
                                        </span>
                                        <ArrowRight className="w-3 h-3 text-slate-400" />
                                      </>
                                    )}
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${toStage?.badge}`}>
                                      {toStage?.icon} {toStage?.short || item.new_status}
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-mono text-slate-400">
                                    {fmtDate(item.created_at)}
                                  </span>
                                </div>
                                {item.notes && (
                                  <p className="text-[11px] text-slate-600 mt-1 font-medium">
                                    {item.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        }
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Drawer footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0">
              <button
                onClick={() => setSelectedLead(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
