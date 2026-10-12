"use server";

import { createServerClient } from "@/modules/shared/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  LeadType,
  LeadSource,
  ContactMethod,
} from "@/modules/shared/types/database.types";

// ─── Strictly supported lead columns only — no scooter_id / property_id ──────
export interface LeadFormPayload {
  name: string;
  phone: string;
  email?: string;
  preferred_contact_method?: ContactMethod;
  notes?: string;
  lead_type: LeadType;
  car_id?: string;
  film_id?: string;
}

export interface LeadSubmitResult {
  success: boolean;
  leadId?: string;
  customerId?: string;
  /** The car price to reveal after a successful submission */
  carPrice?: number | null;
  error?: string;
}

export async function submitVehicleLead(
  payload: LeadFormPayload
): Promise<LeadSubmitResult> {
  try {
    const supabase = await createServerClient();

    // 1. Upsert customer by phone number
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("phone", payload.phone)
      .is("deleted_at", null)
      .maybeSingle();

    let customerId: string;

    if (existingCustomer) {
      const updates: Record<string, string> = {};
      if (payload.name) updates.name = payload.name;
      if (payload.email) updates.email = payload.email;
      updates.updated_at = new Date().toISOString();

      await supabase
        .from("customers")
        .update(updates)
        .eq("id", existingCustomer.id);

      customerId = existingCustomer.id;
    } else {
      const { data: newCustomer, error: customerError } = await supabase
        .from("customers")
        .insert({
          name: payload.name,
          phone: payload.phone,
          email: payload.email || null,
        })
        .select("id")
        .single();

      if (customerError || !newCustomer) {
        console.error("Error creating customer:", customerError);
        return {
          success: false,
          error: customerError?.message || "فشل في حفظ بيانات العميل",
        };
      }
      customerId = newCustomer.id;
    }

    // 2. Insert lead — ONLY supported columns, no scooter_id / property_id
    const leadInsert: Record<string, unknown> = {
      customer_id: customerId,
      lead_type: payload.lead_type,
      source: "website" as LeadSource,
      status: "new",
      preferred_contact_method: payload.preferred_contact_method || "whatsapp",
      notes: payload.notes || null,
    };
    if (payload.car_id) leadInsert.car_id = payload.car_id;
    if (payload.film_id) leadInsert.film_id = payload.film_id;

    const { data: newLead, error: leadError } = await supabase
      .from("leads")
      .insert(leadInsert)
      .select("id")
      .single();

    if (leadError || !newLead) {
      console.error("Error creating lead:", leadError);
      return {
        success: false,
        error: leadError?.message || "فشل في حفظ طلب الاستفسار",
      };
    }

    // 3. If car_id given, fetch price to reveal it on the frontend
    let carPrice: number | null = null;
    if (payload.car_id) {
      const { data: carData } = await supabase
        .from("cars")
        .select("price")
        .eq("id", payload.car_id)
        .maybeSingle();
      carPrice = carData?.price ?? null;
    }

    // 4. Revalidate admin pages
    try {
      revalidatePath("/admin/leads");
      revalidatePath("/admin/orders");
      revalidatePath("/admin/customers");
    } catch {
      // ignore during render
    }

    return { success: true, leadId: newLead.id, customerId, carPrice };
  } catch (err: any) {
    console.error("Unhandled error in submitVehicleLead:", err);
    return {
      success: false,
      error:
        err?.message || "حدث خطأ أثناء إرسال الطلب. يرجى المحاولة لاحقاً.",
    };
  }
}
