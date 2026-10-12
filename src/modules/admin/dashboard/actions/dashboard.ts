"use server";

import { createServerClient } from "@/modules/shared/lib/supabase/server";

export interface DashboardStats {
  totalAvailableCars: number;
  totalProtectionFilms: number;
  totalNewLeads: number;
  totalCustomers: number;
}

export interface RecentLeadActivity {
  id: string;
  action: string;
  subject: string;
  time: string;
  type: "car" | "order" | "user" | "brand";
  created_at: string;
}

/**
 * Fetch live dashboard stats from Supabase.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const supabase = await createServerClient();

    const [carsResult, filmsResult, leadsResult, customersResult] =
      await Promise.allSettled([
        supabase
          .from("cars")
          .select("id", { count: "exact", head: true })
          .is("deleted_at", null)
          .eq("status", "available"),
        supabase
          .from("protection_films")
          .select("id", { count: "exact", head: true })
          .is("deleted_at", null),
        supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .is("deleted_at", null)
          .eq("status", "new"),
        supabase
          .from("customers")
          .select("id", { count: "exact", head: true })
          .is("deleted_at", null),
      ]);

    return {
      totalAvailableCars:
        carsResult.status === "fulfilled" ? (carsResult.value.count ?? 0) : 0,
      totalProtectionFilms:
        filmsResult.status === "fulfilled" ? (filmsResult.value.count ?? 0) : 0,
      totalNewLeads:
        leadsResult.status === "fulfilled" ? (leadsResult.value.count ?? 0) : 0,
      totalCustomers:
        customersResult.status === "fulfilled"
          ? (customersResult.value.count ?? 0)
          : 0,
    };
  } catch {
    return {
      totalAvailableCars: 0,
      totalProtectionFilms: 0,
      totalNewLeads: 0,
      totalCustomers: 0,
    };
  }
}

/**
 * Fetch recent lead activity from Supabase.
 */
export async function getRecentActivity(): Promise<RecentLeadActivity[]> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from("leads")
      .select(
        `
        id,
        lead_type,
        status,
        created_at,
        customers(name, phone),
        cars(title)
      `
      )
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(8);

    if (error) {
      console.warn("Notice fetching recent activity:", error.message);
      return [];
    }

    return (data || []).map((lead: any) => {
      const customerName = lead.customers?.name || "عميل مجهول";
      const isCarLead = lead.lead_type === "car_inquiry";
      const assetName = lead.cars?.title || "استفسار عام";

      const actionMap: Record<string, string> = {
        new: "طلب استفسار جديد",
        contacted: "قيد التواصل",
        qualified: "عميل مؤهل",
        following_up: "متابعة",
        negotiating: "تفاوض",
        won: "تم التعاقد",
        lost: "خسارة",
        cancelled: "إلغاء",
      };

      return {
        id: lead.id,
        action: actionMap[lead.status] || "نشاط جديد",
        subject: isCarLead ? `${customerName} - ${assetName}` : customerName,
        time: lead.created_at,
        type: isCarLead ? "order" : "user",
        created_at: lead.created_at,
      } as RecentLeadActivity;
    });
  } catch {
    return [];
  }
}

/**
 * Fetch featured cars for the dashboard sidebar
 */
export async function getDashboardTopCars() {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from("cars")
      .select(`*, brand:brands(name), car_images(image_url, is_primary)`)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(4);

    if (error) {
      console.warn("Notice fetching dashboard top cars:", error.message);
      return [];
    }

    return (data || []).map((car: any) => ({
      id: car.id,
      title: car.title,
      price: car.price,
      status: car.status,
      image:
        car.car_images?.find((img: any) => img.is_primary)?.image_url ||
        car.car_images?.[0]?.image_url ||
        null,
      brand: car.brand?.name || "",
    }));
  } catch {
    return [];
  }
}
