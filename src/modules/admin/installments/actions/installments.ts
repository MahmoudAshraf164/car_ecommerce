"use server";

import { createServerClient } from "@/modules/shared/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendAdminEmail } from "@/modules/shared/lib/email.server";
import type {
  InstallmentWithRelations,
  InstallmentPaymentRow,
  InstallmentStatus,
} from "../types/installment.types";

/**
 * Helper to compute next due date safely (accounting for month lengths)
 */
export async function calculateNextDueDate(
  dueDay: number,
  referenceDateStr?: string
): Promise<string> {
  const ref = referenceDateStr ? new Date(referenceDateStr) : new Date();
  let year = ref.getFullYear();
  let month = ref.getMonth(); // 0-indexed

  // Helper to get safe day in a specific year and month
  const getSafeDate = (y: number, m: number, d: number) => {
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const safeDay = Math.min(Math.max(d, 1), daysInMonth);
    const mo = String(m + 1).padStart(2, "0");
    const da = String(safeDay).padStart(2, "0");
    return { str: `${y}-${mo}-${da}` };
  };

  const todayStr = new Date().toISOString().split("T")[0];
  let candidate = getSafeDate(year, month, dueDay);

  // If candidate is before reference date, advance to next month
  if (candidate.str < todayStr) {
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
    candidate = getSafeDate(year, month, dueDay);
  }

  return candidate.str;
}

/**
 * Helper to advance date by exactly 1 month safely
 */
function advanceOneMonth(currentDueDateStr: string, dueDay: number): string {
  const d = new Date(currentDueDateStr);
  let year = d.getFullYear();
  let month = d.getMonth() + 1; // move to next month
  if (month > 11) {
    month = 0;
    year += 1;
  }
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const safeDay = Math.min(Math.max(dueDay, 1), daysInMonth);
  const mo = String(month + 1).padStart(2, "0");
  const da = String(safeDay).padStart(2, "0");
  return `${year}-${mo}-${da}`;
}

/**
 * Fetch all installments with customer, car, and payments relations
 */
export async function getInstallments(filters: {
  status?: string;
  search?: string;
} = {}): Promise<{ data: InstallmentWithRelations[]; error: string | null }> {
  try {
    const supabase = await createServerClient();

    let query = supabase
      .from("installments")
      .select(
        `
        *,
        customer:customers(id, name, phone, email),
        car:cars(id, title, price, car_images(image_url, is_primary)),
        installment_payments(*)
      `
      )
      .order("next_due_date", { ascending: true });

    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching installments:", error.message);
      return { data: [], error: error.message };
    }

    const todayStr = new Date().toISOString().split("T")[0];

    // Map and auto-flag overdue if active and next_due_date < today
    const items = (data || []).map((row: any) => {
      let currentStatus: InstallmentStatus = row.status;
      if (currentStatus === "active" && row.next_due_date < todayStr) {
        currentStatus = "overdue";
      }

      const payments = (row.installment_payments || []).sort(
        (a: any, b: any) =>
          new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
      );

      return {
        ...row,
        status: currentStatus,
        installment_payments: payments,
      } as InstallmentWithRelations;
    });

    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase();
      return {
        data: items.filter(
          (i) =>
            i.customer?.name?.toLowerCase().includes(q) ||
            i.customer?.phone?.toLowerCase().includes(q) ||
            i.car?.title?.toLowerCase().includes(q) ||
            i.contract_title.toLowerCase().includes(q)
        ),
        error: null,
      };
    }

    return { data: items, error: null };
  } catch (err: any) {
    console.error("Exception in getInstallments:", err);
    return { data: [], error: err?.message || "Failed to fetch installments" };
  }
}

/**
 * Save or update an installment contract
 */
export async function saveInstallmentContract(payload: {
  id?: string;
  isNewCustomer: boolean;
  customerId?: string;
  newCustomerName?: string;
  newCustomerPhone?: string;
  newCustomerEmail?: string;
  carId?: string | null;
  leadId?: string | null;
  contractTitle: string;
  totalAmount: number;
  downPayment: number;
  paidAmount: number;
  monthlyAmount: number;
  totalInstallments: number;
  paidInstallments: number;
  dueDayOfMonth: number;
  startDate?: string;
  nextDueDate?: string;
  status?: InstallmentStatus;
  notes?: string;
}): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const supabase = await createServerClient();

    let targetCustomerId = payload.customerId;

    // Handle new customer creation / phone upsert
    if (payload.isNewCustomer) {
      if (!payload.newCustomerName?.trim() || !payload.newCustomerPhone?.trim()) {
        return { success: false, error: "اسم العميل ورقم الهاتف مطلوبان" };
      }

      const cleanPhone = payload.newCustomerPhone.trim();
      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("id")
        .eq("phone", cleanPhone)
        .maybeSingle();

      if (existingCustomer?.id) {
        targetCustomerId = existingCustomer.id;
        await supabase
          .from("customers")
          .update({
            name: payload.newCustomerName.trim(),
            email: payload.newCustomerEmail?.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", targetCustomerId);
      } else {
        const { data: createdCustomer, error: custErr } = await supabase
          .from("customers")
          .insert({
            name: payload.newCustomerName.trim(),
            phone: cleanPhone,
            email: payload.newCustomerEmail?.trim() || null,
          })
          .select("id")
          .single();

        if (custErr || !createdCustomer) {
          return { success: false, error: custErr?.message || "تعذر حفظ بيانات العميل" };
        }
        targetCustomerId = createdCustomer.id;
      }
    }

    if (!targetCustomerId) {
      return { success: false, error: "يجب تحديد عميل للعقد" };
    }

    const startDate = payload.startDate || new Date().toISOString().split("T")[0];
    const nextDueDate =
      payload.nextDueDate || (await calculateNextDueDate(payload.dueDayOfMonth, startDate));

    let finalStatus: InstallmentStatus = payload.status || "active";
    if (
      payload.paidInstallments >= payload.totalInstallments ||
      payload.paidAmount >= payload.totalAmount
    ) {
      finalStatus = "completed";
    }

    const installmentData = {
      customer_id: targetCustomerId,
      car_id: payload.carId || null,
      lead_id: payload.leadId || null,
      contract_title: payload.contractTitle.trim(),
      total_amount: Number(payload.totalAmount),
      down_payment: Number(payload.downPayment || 0),
      paid_amount: Number(payload.paidAmount || 0),
      monthly_amount: Number(payload.monthlyAmount),
      total_installments: Number(payload.totalInstallments),
      paid_installments: Number(payload.paidInstallments || 0),
      due_day_of_month: Number(payload.dueDayOfMonth),
      start_date: startDate,
      next_due_date: nextDueDate,
      status: finalStatus,
      notes: payload.notes?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    if (payload.id) {
      const { error } = await supabase
        .from("installments")
        .update(installmentData)
        .eq("id", payload.id);

      if (error) throw error;
    } else {
      const { data: created, error } = await supabase
        .from("installments")
        .insert(installmentData)
        .select("id")
        .single();

      if (error) throw error;
      payload.id = created?.id;
    }

    revalidatePath("/admin/installments");
    revalidatePath("/admin/customers");
    revalidatePath("/admin");

    return { success: true, id: payload.id };
  } catch (err: any) {
    console.error("Error saving installment contract:", err);
    return { success: false, error: err?.message || "فشل حفظ عقد القسط" };
  }
}

/**
 * Record a monthly payment against an installment contract
 */
export async function recordInstallmentPayment(payload: {
  installmentId: string;
  amount: number;
  paymentDate?: string;
  paymentMethod?: string;
  notes?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();

    const { data: contract, error: fetchErr } = await supabase
      .from("installments")
      .select("*")
      .eq("id", payload.installmentId)
      .single();

    if (fetchErr || !contract) {
      return { success: false, error: "العقد غير موجود" };
    }

    const payAmount = Number(payload.amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      return { success: false, error: "قيمة الدفعة غير صالحة" };
    }

    const newPaidAmount = Number(contract.paid_amount || 0) + payAmount;
    const newPaidCount = Math.min(
      contract.total_installments,
      Number(contract.paid_installments || 0) + 1
    );

    const isCompleted =
      newPaidCount >= contract.total_installments ||
      newPaidAmount >= Number(contract.total_amount);

    const nextDueDate = advanceOneMonth(
      contract.next_due_date,
      contract.due_day_of_month
    );

    // 1. Insert payment record
    const { error: payErr } = await supabase.from("installment_payments").insert({
      installment_id: contract.id,
      amount: payAmount,
      payment_date: payload.paymentDate || new Date().toISOString().split("T")[0],
      installment_number: newPaidCount,
      payment_method: payload.paymentMethod || "cash",
      notes: payload.notes?.trim() || null,
    });

    if (payErr) throw payErr;

    // 2. Update installment contract
    const { error: updateErr } = await supabase
      .from("installments")
      .update({
        paid_amount: newPaidAmount,
        paid_installments: newPaidCount,
        next_due_date: nextDueDate,
        status: isCompleted ? "completed" : "active",
        updated_at: new Date().toISOString(),
      })
      .eq("id", contract.id);

    if (updateErr) throw updateErr;

    revalidatePath("/admin/installments");
    revalidatePath("/admin/customers");
    revalidatePath("/admin");

    return { success: true };
  } catch (err: any) {
    console.error("Error recording payment:", err);
    return { success: false, error: err?.message || "فشل تسجيل الدفعة" };
  }
}

export interface ReminderCheckResult {
  success: boolean;
  checkedCount: number;
  sentInAppCount: number;
  sentEmailCount: number;
  recipientEmail: string;
  emailError: string | null;
  errors: string[];
}

/**
 * Check due-in-2-days, due-today, and overdue active installments.
 * Trigger in-app & email alerts with full Gmail delivery retry support.
 */
export async function checkAndSendInstallmentReminders(): Promise<ReminderCheckResult> {
  const errors: string[] = [];
  let sentInAppCount = 0;
  let sentEmailCount = 0;
  let emailErrorMsg: string | null = null;

  try {
    const supabase = await createServerClient();

    // 1. Fetch active and overdue contracts
    const { data: activeContracts, error } = await supabase
      .from("installments")
      .select(
        `
        *,
        customer:customers(id, name, phone, email),
        car:cars(id, title)
      `
      )
      .in("status", ["active", "overdue"]);

    if (error || !activeContracts) {
      return {
        success: false,
        checkedCount: 0,
        sentInAppCount: 0,
        sentEmailCount: 0,
        recipientEmail: "",
        emailError: error?.message || "فشل جلب عقود الأقساط",
        errors: [error?.message || "Error"],
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch existing admin user IDs from profiles for in-app notifications
    const { data: adminProfiles } = await supabase
      .from("profiles")
      .select("id")
      .limit(10);
    const adminUserIds = (adminProfiles || []).map((p: any) => p.id);

    // Resolve recipient email in order:
    // 1. Authenticated user email from Supabase Auth
    // 2. Notification settings in company_settings
    // 3. GMAIL_USER from environment
    // 4. Showroom info in company_settings (weladelam40@gmail.com)
    let adminEmail = "";
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email) {
        adminEmail = user.email.trim();
      }
    } catch {
      // ignore
    }

    if (!adminEmail) {
      try {
        const { data: notifSetting } = await supabase
          .from("company_settings")
          .select("value")
          .eq("key", "notification_settings")
          .maybeSingle();

        if (
          notifSetting?.value &&
          typeof notifSetting.value === "object" &&
          (notifSetting.value as any).admin_email
        ) {
          adminEmail = (notifSetting.value as any).admin_email.trim();
        }
      } catch {
        // ignore
      }
    }

    if (!adminEmail && process.env.GMAIL_USER) {
      adminEmail = process.env.GMAIL_USER.trim();
    }

    if (!adminEmail) {
      try {
        const { data: setRow } = await supabase
          .from("company_settings")
          .select("value")
          .eq("key", "showroom_info")
          .maybeSingle();
        if (
          setRow?.value &&
          typeof setRow.value === "object" &&
          (setRow.value as any).email
        ) {
          adminEmail = (setRow.value as any).email.trim();
        }
      } catch {
        // ignore
      }
    }

    if (!adminEmail) {
      adminEmail = "weladelam40@gmail.com";
    }

    for (const contract of activeContracts) {
      const dueDate = new Date(contract.next_due_date);
      dueDate.setHours(0, 0, 0, 0);

      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      // Trigger if due in <= 2 days (diffDays: -X overdue, 0 today, 1 tomorrow, 2 after 2 days)
      if (diffDays <= 2) {
        // Check previous reminder in this cycle
        const { data: existingReminder } = await supabase
          .from("installment_reminders")
          .select("id, sent_in_app, sent_email")
          .eq("installment_id", contract.id)
          .eq("target_due_date", contract.next_due_date)
          .eq("reminder_type", "2_days_before")
          .maybeSingle();

        // If reminder was already sent AND email was delivered, skip to avoid duplicate spam
        if (existingReminder && existingReminder.sent_email) {
          continue;
        }

        const remainingCount = Math.max(
          contract.total_installments - contract.paid_installments,
          0
        );
        const remainingAmount = Math.max(
          contract.total_amount - contract.paid_amount,
          0
        );
        const custName = contract.customer?.name || "عميل بدون اسم";
        const custPhone = contract.customer?.phone || "—";
        const assetTitle = contract.car?.title || contract.contract_title;

        const dueStatusText =
          diffDays < 0
            ? `متأخر منذ ${Math.abs(diffDays)} يوم`
            : diffDays === 0
            ? "مستحق اليوم"
            : diffDays === 1
            ? "مستحق غداً"
            : `مستحق بعد يومين (${contract.next_due_date})`;

        const notifTitle = `تنبيه قسط مستحق: ${custName}`;
        const notifMsg = `قسط بقيمة ${new Intl.NumberFormat("en-US").format(
          contract.monthly_amount
        )} ج.م (${dueStatusText}) لـ ${custName} (${custPhone}) - ${assetTitle}. الأقساط المتبقية: ${remainingCount}.`;

        // 1. In-App Notification (only if not already sent in-app)
        let sentInApp = existingReminder ? existingReminder.sent_in_app : false;
        if (!sentInApp && adminUserIds.length > 0) {
          for (const uid of adminUserIds) {
            await supabase.from("notifications").insert({
              user_id: uid,
              type: "reminder",
              title: notifTitle,
              message: notifMsg,
              is_read: false,
              data: {
                installment_id: contract.id,
                customer_id: contract.customer_id,
                due_date: contract.next_due_date,
              },
            });
          }
          sentInApp = true;
          sentInAppCount++;
        }

        // 2. Email Delivery via Gmail SMTP or Resend
        let sentEmail = false;
        try {
          const emailRes = await sendAdminEmail({
            to: adminEmail,
            subject: `🔔 ${notifTitle} (${dueStatusText})`,
            html: `
              <div dir="rtl" style="font-family: Arial, Tahoma, sans-serif; padding: 24px; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
                <div style="background-color: #0f172a; padding: 18px 24px; border-radius: 12px; margin-bottom: 20px; text-align: center;">
                  <h2 style="color: #f59e0b; margin: 0; font-size: 20px;">معرض ولاد العم للسيارات وأفلام الحماية</h2>
                  <p style="color: #94a3b8; font-size: 13px; margin: 5px 0 0 0;">تنبيه استحقاق قسط شهري</p>
                </div>
                
                <div style="background-color: #fef3c7; border: 1px solid #fde68a; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px;">
                  <p style="margin: 0; font-weight: bold; color: #b45309; font-size: 14px;">
                    ⚠️ حالة الاستحقاق: ${dueStatusText}
                  </p>
                </div>

                <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px;">
                  <tr><td style="padding: 10px; border-bottom: 1px solid #f1f5f9; color: #64748b;"><strong>اسم العميل:</strong></td><td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #0f172a;">${custName}</td></tr>
                  <tr><td style="padding: 10px; border-bottom: 1px solid #f1f5f9; color: #64748b;"><strong>رقم الهاتف:</strong></td><td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: bold; font-family: monospace;">${custPhone}</td></tr>
                  <tr><td style="padding: 10px; border-bottom: 1px solid #f1f5f9; color: #64748b;"><strong>السيارة / العقد:</strong></td><td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: bold;">${assetTitle}</td></tr>
                  <tr><td style="padding: 10px; border-bottom: 1px solid #f1f5f9; color: #64748b;"><strong>قيمة القسط الشهري:</strong></td><td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #b45309; font-size: 16px;">${new Intl.NumberFormat("en-US").format(contract.monthly_amount)} ج.م</td></tr>
                  <tr><td style="padding: 10px; border-bottom: 1px solid #f1f5f9; color: #64748b;"><strong>تاريخ الاستحقاق:</strong></td><td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: bold; font-family: monospace;">${contract.next_due_date}</td></tr>
                  <tr><td style="padding: 10px; color: #64748b;"><strong>الأقساط المتبقية:</strong></td><td style="padding: 10px; font-weight: bold;">${remainingCount} قسط (المتبقي: ${new Intl.NumberFormat("en-US").format(remainingAmount)} ج.م)</td></tr>
                </table>

                <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
                  تم إرسال هذا التنبيه آلياً من لوحة تحكم ولاد العم للسيارات • منوف، المنوفية
                </div>
              </div>
            `,
          });

          if (emailRes.success) {
            sentEmail = true;
            sentEmailCount++;
          } else {
            emailErrorMsg = emailRes.error || "تعذر تسليم الإيميل";
            if (emailErrorMsg) errors.push(emailErrorMsg);
          }
        } catch (e: any) {
          emailErrorMsg = e?.message || "خطأ في الاتصال بالبريد";
          if (emailErrorMsg) errors.push(emailErrorMsg);
        }

        // 3. Upsert reminder log
        if (existingReminder) {
          await supabase
            .from("installment_reminders")
            .update({
              sent_in_app: sentInApp,
              sent_email: sentEmail,
              recipient_email: adminEmail,
            })
            .eq("id", existingReminder.id);
        } else {
          await supabase.from("installment_reminders").insert({
            installment_id: contract.id,
            target_due_date: contract.next_due_date,
            reminder_type: "2_days_before",
            sent_in_app: sentInApp,
            sent_email: sentEmail,
            recipient_email: adminEmail,
          });
        }
      }
    }

    revalidatePath("/admin/installments");
    revalidatePath("/admin");

    return {
      success: true,
      checkedCount: activeContracts.length,
      sentInAppCount,
      sentEmailCount,
      recipientEmail: adminEmail,
      emailError: emailErrorMsg,
      errors,
    };
  } catch (err: any) {
    console.error("Error checking installment reminders:", err);
    return {
      success: false,
      checkedCount: 0,
      sentInAppCount: 0,
      sentEmailCount: 0,
      recipientEmail: "",
      emailError: err?.message || "حدث خطأ غير متوقع",
      errors: [err?.message || "Failed"],
    };
  }
}
