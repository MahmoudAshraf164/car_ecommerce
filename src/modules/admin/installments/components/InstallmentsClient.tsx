"use client";

import { useState, useTransition } from "react";
import {
  CreditCard,
  Plus,
  Search,
  AlertCircle,
  Clock,
  CheckCircle2,
  Calendar,
  Phone,
  Car,
  ChevronDown,
  X,
  Send,
  Sparkles,
  DollarSign,
  TrendingUp,
  FileText,
  User,
  History,
  AlertTriangle,
} from "lucide-react";
import { AdminPagination } from "@/modules/admin/components/AdminPagination";
import {
  saveInstallmentContract,
  recordInstallmentPayment,
  checkAndSendInstallmentReminders,
} from "../actions/installments";
import type {
  InstallmentWithRelations,
  InstallmentStatus,
} from "../types/installment.types";

interface CustomerOption {
  id: string;
  name: string;
  phone: string;
  email: string | null;
}

interface CarOption {
  id: string;
  title: string;
  price: number | null;
}

interface InstallmentsClientProps {
  initialInstallments: InstallmentWithRelations[];
  customers: CustomerOption[];
  cars: CarOption[];
}

export function InstallmentsClient({
  initialInstallments,
  customers,
  cars,
}: InstallmentsClientProps) {
  const [installments, setInstallments] =
    useState<InstallmentWithRelations[]>(initialInstallments);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dueFilter, setDueFilter] = useState<string>("all"); // 'all' | 'due_soon' | 'overdue'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isPending, startTransition] = useTransition();

  // Modals & Panels
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [editingContract, setEditingContract] =
    useState<InstallmentWithRelations | null>(null);

  const [paymentModalContract, setPaymentModalContract] =
    useState<InstallmentWithRelations | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentNotes, setPaymentNotes] = useState("");

  const [historyModalContract, setHistoryModalContract] =
    useState<InstallmentWithRelations | null>(null);

  // Contract Form State
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [newCustEmail, setNewCustEmail] = useState("");
  const [selectedCarId, setSelectedCarId] = useState("");
  const [contractTitle, setContractTitle] = useState("");
  const [totalAmount, setTotalAmount] = useState<number | "">("");
  const [downPayment, setDownPayment] = useState<number | "">("");
  const [paidAmount, setPaidAmount] = useState<number | "">("");
  const [monthlyAmount, setMonthlyAmount] = useState<number | "">("");
  const [totalInstallments, setTotalInstallments] = useState<number | "">("");
  const [paidInstallments, setPaidInstallments] = useState<number | "">("");
  const [dueDayOfMonth, setDueDayOfMonth] = useState<number>(1);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [contractNotes, setContractNotes] = useState("");

  const [toastMsg, setToastMsg] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Helper calculation for due days
  const getDueDaysDiff = (nextDueStr: string) => {
    const due = new Date(nextDueStr);
    due.setHours(0, 0, 0, 0);
    return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  // KPIs
  const activeContracts = installments.filter(
    (i) => i.status === "active" || i.status === "overdue"
  );
  const activeCount = activeContracts.length;

  const dueSoonCount = activeContracts.filter((i) => {
    const diff = getDueDaysDiff(i.next_due_date);
    return diff <= 2;
  }).length;

  const totalCollected = installments.reduce(
    (acc, i) => acc + Number(i.paid_amount || 0),
    0
  );
  const totalRemaining = installments.reduce(
    (acc, i) =>
      acc + Math.max(Number(i.total_amount) - Number(i.paid_amount || 0), 0),
    0
  );

  // Filtering
  const filtered = installments.filter((item) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      item.customer?.name?.toLowerCase().includes(q) ||
      item.customer?.phone?.toLowerCase().includes(q) ||
      item.car?.title?.toLowerCase().includes(q) ||
      item.contract_title.toLowerCase().includes(q);

    const matchStatus = statusFilter === "all" || item.status === statusFilter;

    let matchDue = true;
    const diff = getDueDaysDiff(item.next_due_date);
    if (dueFilter === "due_soon") {
      matchDue =
        (item.status === "active" || item.status === "overdue") &&
        diff >= 0 &&
        diff <= 2;
    } else if (dueFilter === "overdue") {
      matchDue =
        (item.status === "active" || item.status === "overdue") && diff < 0;
    }

    return matchSearch && matchStatus && matchDue;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Reset or initialize contract modal
  const openNewContractModal = () => {
    setEditingContract(null);
    setIsNewCustomer(false);
    setSelectedCustomerId(customers[0]?.id || "");
    setNewCustName("");
    setNewCustPhone("");
    setNewCustEmail("");
    setSelectedCarId("");
    setContractTitle("");
    setTotalAmount("");
    setDownPayment("");
    setPaidAmount("");
    setMonthlyAmount("");
    setTotalInstallments("");
    setPaidInstallments("");
    setDueDayOfMonth(1);
    setStartDate(new Date().toISOString().split("T")[0]);
    setContractNotes("");
    setIsContractModalOpen(true);
  };

  const openEditContractModal = (c: InstallmentWithRelations) => {
    setEditingContract(c);
    setIsNewCustomer(false);
    setSelectedCustomerId(c.customer_id);
    setSelectedCarId(c.car_id || "");
    setContractTitle(c.contract_title);
    setTotalAmount(c.total_amount);
    setDownPayment(c.down_payment);
    setPaidAmount(c.paid_amount);
    setMonthlyAmount(c.monthly_amount);
    setTotalInstallments(c.total_installments);
    setPaidInstallments(c.paid_installments);
    setDueDayOfMonth(c.due_day_of_month);
    setStartDate(c.start_date);
    setContractNotes(c.notes || "");
    setIsContractModalOpen(true);
  };

  const handleSaveContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractTitle.trim()) {
      showToast("يرجى إدخال مسمى العقد", "error");
      return;
    }
    if (!totalAmount || !monthlyAmount || !totalInstallments) {
      showToast("يرجى ملء جميع الحقول المالية المطلوبة", "error");
      return;
    }

    startTransition(async () => {
      const res = await saveInstallmentContract({
        id: editingContract?.id,
        isNewCustomer,
        customerId: isNewCustomer ? undefined : selectedCustomerId,
        newCustomerName: newCustName,
        newCustomerPhone: newCustPhone,
        newCustomerEmail: newCustEmail,
        carId: selectedCarId || null,
        contractTitle,
        totalAmount: Number(totalAmount),
        downPayment: Number(downPayment || 0),
        paidAmount: Number(paidAmount || 0),
        monthlyAmount: Number(monthlyAmount),
        totalInstallments: Number(totalInstallments),
        paidInstallments: Number(paidInstallments || 0),
        dueDayOfMonth: Number(dueDayOfMonth),
        startDate,
        notes: contractNotes,
      });

      if (res.success) {
        showToast(
          editingContract
            ? "تم تحديث عقد القسط بنجاح ✓"
            : "تم تسجيل عقد القسط بنجاح ✓"
        );
        setIsContractModalOpen(false);
        window.location.reload();
      } else {
        showToast(res.error || "تعذر حفظ العقد", "error");
      }
    });
  };

  const openPaymentModal = (c: InstallmentWithRelations) => {
    setPaymentModalContract(c);
    setPaymentAmount(c.monthly_amount);
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setPaymentMethod("cash");
    setPaymentNotes("");
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalContract || paymentAmount <= 0) return;

    startTransition(async () => {
      const res = await recordInstallmentPayment({
        installmentId: paymentModalContract.id,
        amount: Number(paymentAmount),
        paymentDate,
        paymentMethod,
        notes: paymentNotes,
      });

      if (res.success) {
        showToast("تم تسجيل الدفعة وتحديث الرصيد والقسط القادم بنجاح ✓");
        setPaymentModalContract(null);
        window.location.reload();
      } else {
        showToast(res.error || "تعذر تسجيل الدفعة", "error");
      }
    });
  };

  const handleCheckRemindersNow = () => {
    startTransition(async () => {
      const res = await checkAndSendInstallmentReminders();
      if (res.success) {
        if (res.sentEmailCount > 0) {
          showToast(
            `تم بنجاح: إرسال تنبيه (${res.sentInAppCount}) داخل النظام وتم تسليم الإيميل إلى ${res.recipientEmail} بنجاح ✓`,
            "success"
          );
        } else if (res.emailError) {
          showToast(
            `تم تسجيل التنبيهات بالنظام (${res.sentInAppCount})، لكن تعذر الإيميل: ${res.emailError}`,
            "error"
          );
        } else {
          showToast(
            `تم فحص الأقساط (${res.checkedCount}): تم تحديث التنبيهات بنجاح ✓`,
            "success"
          );
        }
      } else {
        showToast(res.emailError || "حدث خطأ أثناء فحص التنبيهات", "error");
      }
    });
  };

  const numberFmt = new Intl.NumberFormat("en-US");

  return (
    <div className="space-y-6 font-sans text-right" dir="rtl">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100]">
          <div
            className={`px-5 py-3 rounded-2xl shadow-xl font-bold text-sm text-white ${
              toastMsg.type === "success" ? "bg-emerald-600" : "bg-rose-600"
            }`}
          >
            {toastMsg.text}
          </div>
        </div>
      )}

      {/* ── Page Header ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60 shadow-xs">
              <CreditCard className="w-5 h-5" />
            </div>
            الأقساط والمتابعة المالية 💳
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            إدارة عقود الأقساط الشهرية، تسجيل الدفعات، والتنبيهات المسبقة قبل
            الاستحقاق بيومين
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleCheckRemindersNow}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs transition-colors disabled:opacity-60"
            title="فحص تواريخ الأقساط وإرسال الإشعارات والإيميلات المستحقة"
          >
            <Clock className="w-4 h-4 text-amber-600" />
            <span>فحص وإرسال التنبيهات الآن</span>
          </button>

          <button
            onClick={openNewContractModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة عقد قسط جديد</span>
          </button>
        </div>
      </div>

      {/* ── Executive KPI Cards ───────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Contracts */}
        <div
          onClick={() => {
            setStatusFilter("active");
            setDueFilter("all");
            setCurrentPage(1);
          }}
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm cursor-pointer hover:border-amber-400 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-3xl font-black text-slate-900 font-mono">
              {numberFmt.format(activeCount)}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-600">عقود الأقساط النشطة</p>
        </div>

        {/* Due in <= 2 Days */}
        <div
          onClick={() => {
            setDueFilter(dueFilter === "due_soon" ? "all" : "due_soon");
            setStatusFilter("all");
            setCurrentPage(1);
          }}
          className={`rounded-2xl border p-5 shadow-sm cursor-pointer transition-all ${
            dueSoonCount > 0
              ? "bg-rose-50/50 border-rose-300 ring-2 ring-rose-500/10"
              : "bg-white border-slate-200/80"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="flex items-end gap-1.5">
              <span className="text-3xl font-black text-rose-700 font-mono">
                {numberFmt.format(dueSoonCount)}
              </span>
              {dueSoonCount > 0 && (
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-rose-200 text-rose-800 animate-pulse">
                  تنبيه!
                </span>
              )}
            </div>
          </div>
          <p className="text-xs font-bold text-slate-700">مستحق خلال يومين أو اليوم</p>
        </div>

        {/* Total Collected */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-2xl font-black text-emerald-700 font-mono">
              {numberFmt.format(totalCollected)}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-600">المبالغ المحصلة (ج.م)</p>
        </div>

        {/* Total Remaining */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-2xl font-black text-amber-700 font-mono">
              {numberFmt.format(totalRemaining)}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-600">إجمالي المتبقي (ج.م)</p>
        </div>
      </div>

      {/* ── Search & Filters Toolbar ──────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative sm:col-span-2">
          <Search className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="بحث باسم العميل، الهاتف، السيارة، أو عنوان العقد..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-amber-500 transition-all"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-amber-500"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشط (Active)</option>
            <option value="overdue">متأخر (Overdue)</option>
            <option value="completed">مكتمل ومسدد بالكامل (Completed)</option>
            <option value="paused">موقوف مؤقتاً (Paused)</option>
          </select>
        </div>

        <div>
          <select
            value={dueFilter}
            onChange={(e) => {
              setDueFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-amber-500"
          >
            <option value="all">جميع مواعيد الاستحقاق</option>
            <option value="due_soon">🚨 مستحق قريباً (خلال 48 ساعة)</option>
            <option value="overdue">⚠️ متأخر عن الموعد</option>
          </select>
        </div>
      </div>

      {/* ── Installments Table ─────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
        {paginated.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">لا توجد عقود أقساط مطابقة للبحث</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200/80">
                <tr>
                  <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase">
                    العميل والعقد
                  </th>
                  <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase">
                    السيارة المرتبطة
                  </th>
                  <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase">
                    القسط الشهري
                  </th>
                  <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase">
                    حالة السداد
                  </th>
                  <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase">
                    الاستحقاق القادم
                  </th>
                  <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase text-center">
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((item) => {
                  const remainingCount = Math.max(
                    item.total_installments - item.paid_installments,
                    0
                  );
                  const remainingBalance = Math.max(
                    item.total_amount - item.paid_amount,
                    0
                  );
                  const diff = getDueDaysDiff(item.next_due_date);

                  let dueBadge = null;
                  if (item.status === "completed") {
                    dueBadge = (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        خالص بالكامل ✓
                      </span>
                    );
                  } else if (diff < 0) {
                    dueBadge = (
                      <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                        متأخر منذ {Math.abs(diff)} يوم
                      </span>
                    );
                  } else if (diff <= 2) {
                    dueBadge = (
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 animate-pulse">
                        {diff === 0 ? "مستحق اليوم!" : `مستحق خلال ${diff} يوم`}
                      </span>
                    );
                  } else {
                    dueBadge = (
                      <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        يوم {item.due_day_of_month} بالشهر
                      </span>
                    );
                  }

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <span className="font-extrabold text-slate-900 block text-sm">
                            {item.customer?.name || "عميل غير معروف"}
                          </span>
                          <span className="text-xs font-mono text-slate-400 block mt-0.5">
                            {item.customer?.phone || "—"}
                          </span>
                          <span className="text-[11px] text-amber-700 font-bold block mt-1">
                            📄 {item.contract_title}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {item.car ? (
                          <div className="flex items-center gap-2">
                            <Car className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="font-bold text-xs text-slate-800 line-clamp-1">
                              {item.car.title}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div>
                          <span className="font-black text-slate-900 text-sm font-mono">
                            {numberFmt.format(item.monthly_amount)} ج.م
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            شهرياً (إجمالي: {numberFmt.format(item.total_amount)} ج.م)
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-bold">
                            <span className="text-emerald-700 font-mono">
                              {item.paid_installments}
                            </span>
                            <span className="text-slate-400">/</span>
                            <span className="text-slate-700 font-mono">
                              {item.total_installments} قسط
                            </span>
                          </div>
                          <span className="text-[11px] font-bold text-slate-500 block mt-1">
                            متبقي:{" "}
                            <span className="font-mono text-amber-600">
                              {numberFmt.format(remainingBalance)} ج.م
                            </span>{" "}
                            ({remainingCount} قسط)
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div>
                          <span className="font-mono text-xs font-bold text-slate-900 block">
                            {item.next_due_date}
                          </span>
                          <div className="mt-1">{dueBadge}</div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {item.status !== "completed" && (
                            <button
                              onClick={() => openPaymentModal(item)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1"
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                              تسجيل دفعة
                            </button>
                          )}

                          <button
                            onClick={() => setHistoryModalContract(item)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors"
                            title="سجل دفعات القسط"
                          >
                            <History className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => openEditContractModal(item)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors"
                            title="تعديل العقد"
                          >
                            <FileText className="w-4 h-4" />
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
          itemName="عقد قسط"
          className="border-t border-t-slate-100 rounded-t-none"
        />
      </div>

      {/* ── Modal: Add / Edit Contract ─────────────────────────── */}
      {isContractModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-600" />
                {editingContract ? "تعديل عقد قسط" : "إضافة عقد قسط جديد"}
              </h3>
              <button
                onClick={() => setIsContractModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContract} className="space-y-4">
              {/* Customer Selector / Creator */}
              {!editingContract && (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-4 text-xs font-bold">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="customerMode"
                        checked={!isNewCustomer}
                        onChange={() => setIsNewCustomer(false)}
                      />
                      عميل موجود مسبقاً
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="customerMode"
                        checked={isNewCustomer}
                        onChange={() => setIsNewCustomer(true)}
                      />
                      عميل جديد بالكامل
                    </label>
                  </div>

                  {!isNewCustomer ? (
                    <div>
                      <select
                        value={selectedCustomerId}
                        onChange={(e) => setSelectedCustomerId(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm"
                        required
                      >
                        <option value="">اختر العميل...</option>
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.phone})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          اسم العميل *
                        </label>
                        <input
                          type="text"
                          value={newCustName}
                          onChange={(e) => setNewCustName(e.target.value)}
                          placeholder="مثال: أحمد خالد"
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          رقم الهاتف *
                        </label>
                        <input
                          type="text"
                          value={newCustPhone}
                          onChange={(e) => setNewCustPhone(e.target.value)}
                          placeholder="مثال: 010xxxxxxxx"
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono"
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Contract Title & Linked Car */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    مسمى العقد *
                  </label>
                  <input
                    type="text"
                    value={contractTitle}
                    onChange={(e) => setContractTitle(e.target.value)}
                    placeholder="مثال: قسط سيارة ريس - عقد العميل"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    السيارة المرتبطة (اختياري)
                  </label>
                  <select
                    value={selectedCarId}
                    onChange={(e) => setSelectedCarId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm"
                  >
                    <option value="">بدون سيارة محددة</option>
                    {cars.map((car) => (
                      <option key={car.id} value={car.id}>
                        {car.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Financial Numbers */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    إجمالي المبلغ (ج.م) *
                  </label>
                  <input
                    type="number"
                    value={totalAmount}
                    onChange={(e) =>
                      setTotalAmount(e.target.value ? Number(e.target.value) : "")
                    }
                    placeholder="مثال: 500000"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    المقدم / المدفوع مبدئياً
                  </label>
                  <input
                    type="number"
                    value={downPayment}
                    onChange={(e) =>
                      setDownPayment(e.target.value ? Number(e.target.value) : "")
                    }
                    placeholder="0"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    المدفوع حتى الآن (ج.م)
                  </label>
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={(e) =>
                      setPaidAmount(e.target.value ? Number(e.target.value) : "")
                    }
                    placeholder="للعملاء الحاليين"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono"
                  />
                </div>
              </div>

              {/* Installment breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    القسط الشهري (ج.م) *
                  </label>
                  <input
                    type="number"
                    value={monthlyAmount}
                    onChange={(e) =>
                      setMonthlyAmount(e.target.value ? Number(e.target.value) : "")
                    }
                    placeholder="مثال: 15000"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    إجمالي الأقساط *
                  </label>
                  <input
                    type="number"
                    value={totalInstallments}
                    onChange={(e) =>
                      setTotalInstallments(
                        e.target.value ? Number(e.target.value) : ""
                      )
                    }
                    placeholder="مثال: 24"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    الأقساط المسددة
                  </label>
                  <input
                    type="number"
                    value={paidInstallments}
                    onChange={(e) =>
                      setPaidInstallments(
                        e.target.value ? Number(e.target.value) : ""
                      )
                    }
                    placeholder="0"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    يوم الدفع بالشهر *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={dueDayOfMonth}
                    onChange={(e) => setDueDayOfMonth(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono"
                    required
                  />
                </div>
              </div>

              {/* Start Date & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    تاريخ بداية العقد
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ملاحظات العقد
                  </label>
                  <input
                    type="text"
                    value={contractNotes}
                    onChange={(e) => setContractNotes(e.target.value)}
                    placeholder="شروط خاصة أو تفاصيل الضامن..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-sm rounded-xl shadow-md hover:from-amber-600 hover:to-amber-700 disabled:opacity-60"
                >
                  {isPending ? "جاري الحفظ..." : "حفظ العقد"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsContractModalOpen(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 font-bold text-sm rounded-xl"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Record Payment ──────────────────────────────── */}
      {paymentModalContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                تسجيل دفعة قسط
              </h3>
              <button
                onClick={() => setPaymentModalContract(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <p>
                <strong>العميل:</strong> {paymentModalContract.customer?.name}
              </p>
              <p>
                <strong>العقد:</strong> {paymentModalContract.contract_title}
              </p>
              <p>
                <strong>الأقساط المسددة:</strong>{" "}
                {paymentModalContract.paid_installments} من{" "}
                {paymentModalContract.total_installments}
              </p>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  المبلغ المدفوع (ج.م) *
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  تاريخ الدفع
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  طريقة الدفع
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm"
                >
                  <option value="cash">نقداً (كاش)</option>
                  <option value="instapay">إنستاباي (InstaPay)</option>
                  <option value="bank_transfer">تحويل بنكي</option>
                  <option value="vodafone_cash">فودافون كاش / محفظة</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ملاحظات الدفعة (اختياري)
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="رقم الإيصال أو تفاصيل التحويل..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md disabled:opacity-60"
                >
                  {isPending ? "جاري التسجيل..." : "تأكيد واستلام الدفعة"}
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentModalContract(null)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 font-bold text-sm rounded-xl"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Payment History Log ─────────────────────────── */}
      {historyModalContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-amber-600" />
                سجل دفعات {historyModalContract.customer?.name}
              </h3>
              <button
                onClick={() => setHistoryModalContract(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {(!historyModalContract.installment_payments ||
                historyModalContract.installment_payments.length === 0) ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  لا توجد دفعات مسجلة في النظام لهذا العقد بعد
                </p>
              ) : (
                historyModalContract.installment_payments.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800 block">
                        القسط رقم {p.installment_number || "—"} • {p.payment_method}
                      </span>
                      {p.notes && (
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          {p.notes}
                        </span>
                      )}
                    </div>
                    <div className="text-left font-mono">
                      <span className="font-black text-emerald-700 block">
                        +{numberFmt.format(p.amount)} ج.م
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {p.payment_date}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setHistoryModalContract(null)}
                className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
