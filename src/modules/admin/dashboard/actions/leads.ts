"use server";

import { createServerClient } from "@/modules/shared/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { LeadStatus } from "@/modules/shared/types/database.types";

export interface AdminLead {
  id: string;
  status: LeadStatus;
  lead_type: string;
  source: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  car_id: string | null;
  customer: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
  } | null;
  car: {
    id: string;
    title: string;
    car_images?: { image_url: string; is_primary: boolean }[];
  } | null;
  lead_notes: {
    id: string;
    note: string;
    created_at: string;
    created_by: string | null;
  }[];
}

/**
 * Fetch all leads for admin with customer, car, and notes relations.
 */
export async function getAdminLeads(filters: {
  status?: string;
  lead_type?: string;
  search?: string;
} = {}): Promise<{ data: AdminLead[]; error: string | null }> {
  try {
    const supabase = await createServerClient();

    let query = supabase
      .from("leads")
      .select(
        `
        id,
        status,
        lead_type,
        source,
        notes,
        car_id,
        created_at,
        updated_at,
        customers(id, name, phone, email),
        cars(id, title, car_images(image_url, is_primary)),
        lead_notes(id, note, created_at, created_by)
      `
      )
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }
    if (filters.lead_type && filters.lead_type !== "all") {
      query = query.eq("lead_type", filters.lead_type);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching admin leads:", error.message);
      return { data: [], error: error.message };
    }

    const leads = (data || []).map((lead: any) => ({
      id: lead.id,
      status: lead.status,
      lead_type: lead.lead_type,
      source: lead.source,
      notes: lead.notes,
      car_id: lead.car_id,
      created_at: lead.created_at,
      updated_at: lead.updated_at,
      customer: lead.customers || null,
      car: lead.cars || null,
      lead_notes: (lead.lead_notes || []).sort(
        (a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    })) as AdminLead[];

    // Apply search client-side after DB fetch for simplicity
    if (filters.search && filters.search.trim() !== "") {
      const searchLower = filters.search.toLowerCase();
      return {
        data: leads.filter(
          (l) =>
            l.customer?.name?.toLowerCase().includes(searchLower) ||
            l.customer?.phone?.toLowerCase().includes(searchLower) ||
            l.car?.title?.toLowerCase().includes(searchLower) ||
            l.id.toLowerCase().includes(searchLower)
        ),
        error: null,
      };
    }

    return { data: leads, error: null };
  } catch (err: any) {
    console.error("Exception in getAdminLeads:", err);
    return { data: [], error: err?.message || "Failed to fetch leads" };
  }
}

/**
 * Update a lead's status and log to lead_status_history.
 */
export async function updateLeadStatus(
  leadId: string,
  newStatus: LeadStatus,
  note?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();

    // Get current status for history
    const { data: currentLead } = await supabase
      .from("leads")
      .select("status, customer_id")
      .eq("id", leadId)
      .single();

    const oldStatus = currentLead?.status as LeadStatus | null;
    const customerId = currentLead?.customer_id;

    // Update lead status
    const { error: updateError } = await supabase
      .from("leads")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", leadId);

    if (updateError) {
      throw updateError;
    }

    // Log status history safely
    await supabase.from("lead_status_history").insert({
      lead_id: leadId,
      old_status: oldStatus,
      new_status: newStatus,
      notes: note || "تم تغيير حالة الصفقة",
      changed_by: null, // Avoid invalid user UUID references
    });

    // Add system note if provided
    if (note && note.trim()) {
      await supabase.from("lead_notes").insert({
        lead_id: leadId,
        note: note.trim(),
        created_by: null,
      });
    }

    // Update customer status if won (to "converted" / contracted)
    if (newStatus === "won" && customerId) {
       await supabase
         .from("customers")
         .update({ updated_at: new Date().toISOString() }) // We can update a flag if it exists, or just updated_at.
         .eq("id", customerId);
    }

    revalidatePath("/admin/orders");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to update lead status" };
  }
}

/**
 * Add a note to a lead.
 */
export async function addLeadNote(
  leadId: string,
  note: string
): Promise<{ success: boolean; error?: string; noteId?: string }> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from("lead_notes")
      .insert({ lead_id: leadId, note: note.trim(), created_by: null })
      .select("id")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/orders");
    return { success: true, noteId: data?.id };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to add note" };
  }
}
