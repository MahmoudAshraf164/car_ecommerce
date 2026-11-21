"use server";

import { createServerClient } from "@/modules/shared/lib/supabase/server";

export interface FleetStatusBreakdown {
  total: number;
  available: number;
  reserved: number;
  sold: number;
  draftOrArchived: number;
}

export interface PipelineBreakdown {
  totalLeads: number;
  activePipelineLeads: number; // all non-cancelled/non-lost
  newCount: number;
  contactedCount: number;
  negotiatingCount: number;
  wonCount: number;
  lostOrCancelledCount: number;
  totalWonDealsValue: number;
}

export interface ExecutiveDashboardStats {
  availableCarsCount: number;
  protectionFilmsCount: number;
  newLeadsCount: number;
  activePipelineLeadsCount: number;
  contractedCustomersCount: number;
  fleetBreakdown: FleetStatusBreakdown;
  pipelineBreakdown: PipelineBreakdown;
}

export interface DashboardRecentActivityItem {
  id: string;
  leadType: string;
  status: string;
  statusArabic: string;
  customerName: string;
  customerPhone: string;
  assetTitle: string;
  assetType: "car" | "film" | "general";
  createdAt: string;
  formattedTime: string;
}

export interface DashboardLatestCarItem {
  id: string;
  title: string;
  price: number;
  year: number;
  status: string;
  primaryImageUrl: string | null;
  brandName: string;
  condition: string;
}

export interface SidebarCounts {
  cars: number;
  brands: number;
  films: number;
  orders: number;
  customers: number;
  installments?: number;
}

/**
 * Fetch executive dashboard KPIs, fleet breakdown, and deals pipeline completely from Supabase.
 */
export async function getExecutiveDashboardData(): Promise<ExecutiveDashboardStats> {
  try {
    const supabase = await createServerClient();

    const [carsRes, filmsRes, leadsRes, customersRes] = await Promise.all([
      // 1. All non-deleted cars with their statuses
      supabase
        .from("cars")
        .select("id, status")
        .is("deleted_at", null),

      // 2. Active protection films
      supabase
        .from("protection_films")
        .select("id", { count: "exact", head: true })
        .eq("status", "available"),

      // 3. All non-deleted leads with car & film prices for won deals valuation
      supabase
        .from("leads")
        .select("id, status, cars(price), protection_films(price)")
        .is("deleted_at", null),

      // 4. Distinct customers who have at least one won deal
      supabase
        .from("customers")
        .select("id, leads!inner(id, status)")
        .eq("leads.status", "won"),
    ]);

    // Compute Fleet Breakdown
    const allCars = carsRes.data || [];
    let availableCars = 0;
    let reservedCars = 0;
    let soldCars = 0;
    let otherCars = 0;

    for (const car of allCars) {
      if (car.status === "available") availableCars++;
      else if (car.status === "reserved") reservedCars++;
      else if (car.status === "sold") soldCars++;
      else otherCars++;
    }

    const fleetBreakdown: FleetStatusBreakdown = {
      total: allCars.length,
      available: availableCars,
      reserved: reservedCars,
      sold: soldCars,
      draftOrArchived: otherCars,
    };

    // Compute Pipeline Breakdown & Won Deals Value
    const allLeads = (leadsRes.data || []) as any[];
    let newCount = 0;
    let contactedCount = 0;
    let negotiatingCount = 0;
    let wonCount = 0;
    let lostOrCancelledCount = 0;
    let totalWonDealsValue = 0;

    for (const lead of allLeads) {
      const status = lead.status;
      if (status === "new") {
        newCount++;
      } else if (status === "contacted" || status === "following_up") {
        contactedCount++;
      } else if (status === "qualified" || status === "negotiating") {
        negotiatingCount++;
      } else if (status === "won") {
        wonCount++;
        const carPrice = Number(lead.cars?.price) || 0;
        const filmPrice = Number(lead.protection_films?.price) || 0;
        totalWonDealsValue += carPrice || filmPrice || 0;
      } else if (status === "lost" || status === "cancelled") {
        lostOrCancelledCount++;
      }
    }

    const activePipelineLeads = newCount + contactedCount + negotiatingCount;

    const pipelineBreakdown: PipelineBreakdown = {
      totalLeads: allLeads.length,
      activePipelineLeads,
      newCount,
      contactedCount,
      negotiatingCount,
      wonCount,
      lostOrCancelledCount,
      totalWonDealsValue,
    };

    // Contracted Customers Count (Unique customers with won leads)
    const uniqueContractedCustomerIds = new Set(
      (customersRes.data || []).map((c: any) => c.id)
    );

    return {
      availableCarsCount: availableCars,
      protectionFilmsCount: filmsRes.count || 0,
      newLeadsCount: newCount,
      activePipelineLeadsCount: activePipelineLeads,
      contractedCustomersCount: uniqueContractedCustomerIds.size,
      fleetBreakdown,
      pipelineBreakdown,
    };
  } catch (error) {
    console.error("Error in getExecutiveDashboardData:", error);
    return {
      availableCarsCount: 0,
      protectionFilmsCount: 0,
      newLeadsCount: 0,
      activePipelineLeadsCount: 0,
      contractedCustomersCount: 0,
      fleetBreakdown: {
        total: 0,
        available: 0,
        reserved: 0,
        sold: 0,
        draftOrArchived: 0,
      },
      pipelineBreakdown: {
        totalLeads: 0,
        activePipelineLeads: 0,
        newCount: 0,
        contactedCount: 0,
        negotiatingCount: 0,
        wonCount: 0,
        lostOrCancelledCount: 0,
        totalWonDealsValue: 0,
      },
    };
  }
}

/**
 * Fetch latest 6 live leads for the recent activity feed.
 */
export async function getDashboardRecentLeads(): Promise<DashboardRecentActivityItem[]> {
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
        cars(title),
        protection_films(title)
      `
      )
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(6);

    if (error || !data) {
      console.warn("Notice fetching recent activity:", error?.message);
      return [];
    }

    const statusMap: Record<string, string> = {
      new: "طلب استفسار جديد",
      contacted: "قيد التواصل والمعاينة",
      following_up: "متابعة مع العميل",
      qualified: "عميل مؤهل",
      negotiating: "مرحلة التفاوض",
      won: "تم التعاقد بنجاح 🎉",
      lost: "صفقة ملغاة / خسارة",
      cancelled: "ملغي",
    };

    return data.map((item: any) => {
      const customerName = item.customers?.name || "عميل غير مسمى";
      const customerPhone = item.customers?.phone || "";
      let assetTitle = "طلب عام";
      let assetType: "car" | "film" | "general" = "general";

      if (item.cars?.title) {
        assetTitle = item.cars.title;
        assetType = "car";
      } else if (item.protection_films?.title) {
        assetTitle = item.protection_films.title;
        assetType = "film";
      }

      // Format time deterministically
      const d = new Date(item.created_at);
      const hours = d.getHours().toString().padStart(2, "0");
      const minutes = d.getMinutes().toString().padStart(2, "0");
      const formattedTime = `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getDate().toString().padStart(2, "0")} ${hours}:${minutes}`;

      return {
        id: item.id,
        leadType: item.lead_type,
        status: item.status,
        statusArabic: statusMap[item.status] || "نشاط حديث",
        customerName,
        customerPhone,
        assetTitle,
        assetType,
        createdAt: item.created_at,
        formattedTime,
      };
    });
  } catch (error) {
    console.error("Error in getDashboardRecentLeads:", error);
    return [];
  }
}

/**
 * Fetch latest 4 live cars for the dashboard showcase widget.
 */
export async function getDashboardLatestCars(): Promise<DashboardLatestCarItem[]> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from("cars")
      .select(
        `
        id,
        title,
        price,
        year,
        status,
        condition,
        brand:brands(name),
        car_images(image_url, is_primary, display_order)
      `
      )
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(4);

    if (error || !data) {
      console.warn("Notice fetching dashboard latest cars:", error?.message);
      return [];
    }

    return data.map((car: any) => {
      const sortedImgs = [...(car.car_images || [])].sort((a: any, b: any) => {
        if (a.is_primary && !b.is_primary) return -1;
        if (!a.is_primary && b.is_primary) return 1;
        return (a.display_order ?? 0) - (b.display_order ?? 0);
      });

      return {
        id: car.id,
        title: car.title,
        price: Number(car.price) || 0,
        year: car.year,
        status: car.status,
        condition: car.condition,
        brandName: car.brand?.name || "",
        primaryImageUrl: sortedImgs[0]?.image_url || null,
      };
    });
  } catch (error) {
    console.error("Error in getDashboardLatestCars:", error);
    return [];
  }
}

/**
 * Fetch live sidebar badge counts directly from Supabase.
 */
export async function getAdminSidebarCounts(): Promise<SidebarCounts> {
  try {
    const supabase = await createServerClient();

    const [carsRes, brandsRes, filmsRes, ordersRes, customersRes, installmentsRes] =
      await Promise.all([
        supabase
          .from("cars")
          .select("id", { count: "exact", head: true })
          .is("deleted_at", null),

        supabase
          .from("brands")
          .select("id", { count: "exact", head: true }),

        supabase
          .from("protection_films")
          .select("id", { count: "exact", head: true })
          .eq("status", "available"),

        supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .is("deleted_at", null)
          .eq("status", "new"),

        supabase
          .from("customers")
          .select("id, leads!inner(id)", { count: "exact", head: true })
          .eq("leads.status", "won"),

        supabase
          .from("installments")
          .select("id", { count: "exact", head: true })
          .in("status", ["active", "overdue"]),
      ]);

    return {
      cars: carsRes.count || 0,
      brands: brandsRes.count || 0,
      films: filmsRes.count || 0,
      orders: ordersRes.count || 0,
      customers: customersRes.count || 0,
      installments: installmentsRes.count || 0,
    };
  } catch (error) {
    console.error("Error in getAdminSidebarCounts:", error);
    return {
      cars: 0,
      brands: 0,
      films: 0,
      orders: 0,
      customers: 0,
    };
  }
}
