"use server";

import { createServerClient } from "@/modules/shared/lib/supabase/server";
import { CarWithRelations } from "@/modules/admin/cars/types/car.types";

/**
 * Fetch a single car by ID (UUID) or slug.
 * Tries UUID match first, falls back to slug lookup.
 */
export async function getCarByIdOrSlug(identifier: string): Promise<{
  data: CarWithRelations | null;
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();

    let decodedId = identifier;
    try {
      decodedId = decodeURIComponent(identifier);
    } catch {}

    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        decodedId
      );

    const selectQuery = `
      *,
      brand:brands(*),
      car_models(*),
      car_images(*),
      car_features(
        feature_id,
        features(*)
      )
    `;

    const { data, error } = await supabase
      .from("cars")
      .select(selectQuery)
      .is("deleted_at", null)
      .or(`id.eq.${decodedId},slug.eq.${decodedId}`)
      .single();

    if (error) {
      console.warn(
        `Notice fetching car by ${isUuid ? "ID" : "slug"} ${identifier}:`,
        error.message
      );
      return { data: null, error: error.message };
    }

    const formattedFeatures = (data.car_features || [])
      .map((cf: any) => cf.features)
      .filter(Boolean);

    const car: CarWithRelations = {
      ...data,
      features: formattedFeatures,
    };

    return { data: car, error: null };
  } catch (err: any) {
    return { data: null, error: err?.message || "Failed to fetch car" };
  }
}

/**
 * Fetch public car listings with Supabase (available status only)
 */
export async function getPublicCars(filters: {
  search?: string;
  brand_id?: string;
  condition?: string;
  page?: number;
  limit?: number;
} = {}) {
  try {
    const supabase = await createServerClient();

    const {
      search,
      brand_id,
      condition,
      page = 1,
      limit = 12,
    } = filters;

    let query = supabase
      .from("cars")
      .select(
        `
        *,
        brand:brands(*),
        car_models(*),
        car_images(*)
      `,
        { count: "exact" }
      )
      .is("deleted_at", null)
      .in("status", ["available", "reserved"]);

    if (search && search.trim() !== "") {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%`
      );
    }
    if (brand_id) query = query.eq("brand_id", brand_id);
    if (condition) query = query.eq("condition", condition);

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query
      .order("created_at", { ascending: false })
      .range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.warn("Notice when fetching public cars:", error.message);
      return { data: [], total: 0, error: null };
    }

    return {
      data: (data || []) as CarWithRelations[],
      total: count || 0,
      error: null,
    };
  } catch (err: any) {
    console.warn("Handled exception in getPublicCars:", err?.message || err);
    return { data: [], total: 0, error: null };
  }
}
